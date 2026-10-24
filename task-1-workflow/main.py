import hashlib
import os
import secrets
from datetime import UTC, datetime, timedelta
from typing import Literal

import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

load_dotenv()

app = FastAPI(title="GreenCampus API", version="1.0.0")
origins = [item.strip() for item in os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000",
).split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

password_hasher = PasswordHash.recommended()
COOKIE_NAME = "greencampus_session"
SESSION_TTL_HOURS = max(1, int(os.getenv("SESSION_TTL_HOURS", "24")))
COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "greencampus_app"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "greencampus_db"),
        autocommit=False,
    )


class RegisterInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=30)
    campus_id: str = Field(min_length=2, max_length=80)
    role: Literal["student", "faculty", "maintenance", "admin"]
    department: str | None = Field(default=None, max_length=120)
    program: str | None = Field(default=None, max_length=80)
    year_of_study: str | None = Field(default=None, max_length=40)
    designation: str | None = Field(default=None, max_length=120)
    campus_area: str | None = Field(default=None, max_length=120)
    shift: str | None = Field(default=None, max_length=40)
    password: str = Field(min_length=8, max_length=128)
    consent: bool

    @field_validator("full_name", "phone", "campus_id")
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required.")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @model_validator(mode="after")
    def validate_role_fields_and_consent(self):
        if not self.consent:
            raise ValueError("Consent is required to create an account.")
        if len("".join(ch for ch in self.phone if ch.isdigit())) < 8 or len("".join(ch for ch in self.phone if ch.isdigit())) > 15:
            raise ValueError("Phone number must contain 8 to 15 digits.")
        if self.role == "student" and not all([self.department, self.program, self.year_of_study]):
            raise ValueError("Students must provide department, program, and current year of study.")
        if self.role == "faculty" and not all([self.department, self.designation]):
            raise ValueError("Faculty must provide department and designation.")
        if self.role == "maintenance" and not self.department:
            raise ValueError("Maintenance staff must provide a department or work team.")
        return self


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class IssueReportInput(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    category: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=5)
    priority: Literal["Low", "Medium", "High"] = "Medium"

    @field_validator("title", "category", "location", "description")
    @classmethod
    def clean_text_fields(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required.")
        return cleaned

class AssignReportInput(BaseModel):
    assigned_to: int = Field(gt=0)

def public_user(row: dict) -> dict:
    return {
        "id": row["id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "phone": row["phone"],
        "campus_id": row["campus_id"],
        "role": row["role"],
        "department": row["department"],
        "program": row["program"],
        "year_of_study": row["year_of_study"],
        "designation": row["designation"],
        "campus_area": row["campus_area"],
        "shift": row["shift"],
    }


def issue_session(cursor, user_id: int, response: Response):
    raw_token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    now = datetime.now(UTC).replace(tzinfo=None)
    expires_at = now + timedelta(hours=SESSION_TTL_HOURS)

    cursor.execute(
        """
        INSERT INTO user_sessions
        (user_id, token_hash, expires_at, login_time, logout_time)
        VALUES (%s, %s, %s, %s, NULL)
        """,
        (user_id, token_hash, expires_at, now),
    )

    response.set_cookie(
        key=COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=SESSION_TTL_HOURS * 3600,
        path="/",
    )


def find_session_user(raw_token: str | None):
    if not raw_token:
        return None
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT u.* FROM user_sessions s
   JOIN users u ON u.id = s.user_id
   WHERE s.token_hash = %s
     AND s.expires_at > UTC_TIMESTAMP()
     AND s.logout_time IS NULL
     AND u.is_active = TRUE
   LIMIT 1""",
            (token_hash,),
        )
        return cursor.fetchone()
    finally:
        conn.close()


@app.get("/api/health")
def health():
    try:
        conn = get_connection()
        conn.close()
        return {"status": "ok", "database": "connected"}
    except mysql.connector.Error:
        raise HTTPException(status_code=503, detail="Database connection failed.")


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterInput, response: Response):
    # Public self-registration must never grant administrator privileges.
    if payload.role == "admin":
        raise HTTPException(status_code=403, detail="Administrator accounts must be created by an authorized administrator.")

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email=%s OR campus_id=%s LIMIT 1", (payload.email, payload.campus_id.strip()))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="An account already exists with this email or campus ID.")

        password_hash = password_hasher.hash(payload.password)
        consent_at = datetime.now(UTC).replace(tzinfo=None)
        cursor.execute(
            """INSERT INTO users
            (full_name,email,phone,campus_id,role,department,program,year_of_study,designation,campus_area,shift,password_hash,consent_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (payload.full_name.strip(), payload.email, payload.phone.strip(), payload.campus_id.strip(), payload.role,
             payload.department, payload.program, payload.year_of_study, payload.designation, payload.campus_area,
             payload.shift, password_hash, consent_at),
        )
        user_id = cursor.lastrowid
        cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        issue_session(cursor, user_id, response)
        conn.commit()
        return {"message": "Account created successfully.", "user": public_user(user)}
    except mysql.connector.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=409, detail="An account already exists with this email or campus ID.")
    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error:
        conn.rollback()
        raise HTTPException(status_code=503, detail="Could not save the account. Check the MySQL configuration and try again.")
    finally:
        conn.close()


@app.post("/api/auth/login")
def login(payload: LoginInput, response: Response):
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email=%s AND is_active=TRUE LIMIT 1", (str(payload.email),))
        user = cursor.fetchone()
        if not user or not password_hasher.verify(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        issue_session(cursor, user["id"], response)
        conn.commit()
        return {"message": "Signed in successfully.", "user": public_user(user)}
    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error:
        conn.rollback()
        raise HTTPException(status_code=503, detail="Could not sign in. Check the database connection.")
    finally:
        conn.close()


@app.get("/api/auth/me")
def me(request: Request):
    user = find_session_user(request.cookies.get(COOKIE_NAME))
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in.")
    return {"user": public_user(user)}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    raw_token = request.cookies.get(COOKIE_NAME)

    if raw_token:
        token_hash = hashlib.sha256(
            raw_token.encode("utf-8")
        ).hexdigest()

        conn = get_connection()
        try:
            cursor = conn.cursor()

            cursor.execute(
                """
                UPDATE user_sessions
                SET logout_time = UTC_TIMESTAMP()
                WHERE token_hash = %s
                  AND logout_time IS NULL
                """,
                (token_hash,),
            )

            conn.commit()

        except mysql.connector.Error:
            conn.rollback()
            raise HTTPException(
                status_code=503,
                detail="Could not record logout time."
            )
        finally:
            conn.close()

    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
    )

    return {"message": "Signed out."}


@app.post("/api/reports", status_code=status.HTTP_201_CREATED)
def create_report(payload: IssueReportInput, request: Request):
    # Identify the reporter using the authenticated session.
    user = find_session_user(request.cookies.get(COOKIE_NAME))

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Please sign in before submitting a report.",
        )

    # Only students and faculty can report issues.
    if user["role"] not in ("student", "faculty"):
        raise HTTPException(
            status_code=403,
            detail="Only students and faculty can submit reports.",
        )

    conn = get_connection()

    try:
        cursor = conn.cursor(dictionary=True)

        # Generate a unique-looking report reference.
        report_code = f"GC-{secrets.token_hex(6).upper()}"

        cursor.execute(
            """
            INSERT INTO issue_reports
            (
                report_code,
                title,
                category,
                location,
                description,
                priority,
                status,
                reporter_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, 'Reported', %s)
            """,
            (
                report_code,
                payload.title,
                payload.category,
                payload.location,
                payload.description,
                payload.priority,
                user["id"],
            ),
        )

        report_id = cursor.lastrowid

        conn.commit()

        return {
            "message": "Issue reported successfully.",
            "report": {
                "id": report_id,
                "report_code": report_code,
                "title": payload.title,
                "category": payload.category,
                "location": payload.location,
                "description": payload.description,
                "priority": payload.priority,
                "status": "Reported",
                "reporter_id": user["id"],
            },
        }

    except mysql.connector.Error:
        conn.rollback()
        raise HTTPException(
            status_code=503,
            detail="Could not save the report. Please try again.",
        )

    finally:
        conn.close()


@app.get("/api/reports")
def get_reports(request: Request):
    # Identify the signed-in user from the session cookie.
    user = find_session_user(request.cookies.get(COOKIE_NAME))

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Please sign in to view reports.",
        )

    role = user["role"]
    user_id = user["id"]

    # Select reports according to the signed-in user's role.
    if role == "admin":
        role_filter = ""
        params = ()

    elif role in ("student", "faculty"):
        role_filter = "WHERE r.reporter_id = %s"
        params = (user_id,)

    elif role == "maintenance":
        role_filter = "WHERE r.assigned_to = %s"
        params = (user_id,)

    else:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view reports.",
        )

    conn = get_connection()

    try:
        cursor = conn.cursor(dictionary=True)

        query = f"""
            SELECT
                r.id,
                r.report_code,
                r.title,
                r.category,
                r.location,
                r.description,
                r.priority,
                r.status,
                r.reporter_id,
                r.assigned_to,
                r.photo_path,
                r.resolution_notes,
                r.created_at,
                r.updated_at,

                reporter.full_name AS reporter_name,
                reporter.email AS reporter_email,
                reporter.phone AS reporter_phone,
                reporter.role AS reporter_role,
                reporter.campus_id AS reporter_campus_id,

                assigned.full_name AS assigned_to_name,
                assigned.email AS assigned_to_email

            FROM issue_reports AS r

            JOIN users AS reporter
                ON r.reporter_id = reporter.id

            LEFT JOIN users AS assigned
                ON r.assigned_to = assigned.id

            {role_filter}

            ORDER BY r.created_at DESC
        """

        cursor.execute(query, params)
        reports = cursor.fetchall()

        return {
            "reports": reports,
            "count": len(reports),
        }

    except mysql.connector.Error:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve reports from the database.",
        )

    finally:
        conn.close()


@app.get("/api/maintenance-team")
def get_maintenance_team(request: Request):
    user = find_session_user(request.cookies.get(COOKIE_NAME))

    if not user:
        raise HTTPException(status_code=401, detail="Please sign in.")

    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin can view the maintenance team."
        )

    conn = get_connection()

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, full_name, email, campus_id,
                   department, campus_area, shift
            FROM users
            WHERE role = 'maintenance'
              AND is_active = TRUE
            ORDER BY full_name
        """)

        team = cursor.fetchall()
        return {"team": team, "count": len(team)}

    except mysql.connector.Error:
        raise HTTPException(
            status_code=503,
            detail="Could not retrieve the maintenance team."
        )

    finally:
        conn.close()


@app.post("/api/reports/{report_id}/assign")
def assign_report(
    report_id: int,
    payload: AssignReportInput,
    request: Request
):
    user = find_session_user(request.cookies.get(COOKIE_NAME))

    if not user:
        raise HTTPException(status_code=401, detail="Please sign in.")

    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin can assign reports."
        )

    conn = get_connection()

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM issue_reports WHERE id = %s",
            (report_id,)
        )
        report = cursor.fetchone()

        if not report:
            raise HTTPException(
                status_code=404,
                detail="Issue report not found."
            )

        cursor.execute("""
            SELECT id, full_name, email
            FROM users
            WHERE id = %s
              AND role = 'maintenance'
              AND is_active = TRUE
        """, (payload.assigned_to,))

        staff = cursor.fetchone()

        if not staff:
            raise HTTPException(
                status_code=400,
                detail="Select an active maintenance team member."
            )

        cursor.execute("""
            UPDATE issue_reports
            SET assigned_to = %s,
                status = 'Assigned'
            WHERE id = %s
        """, (staff["id"], report_id))

        conn.commit()

        return {
            "message": "Issue assigned successfully.",
            "report_id": report_id,
            "assigned_to": staff["id"],
            "assigned_to_name": staff["full_name"],
            "assigned_to_email": staff["email"],
            "status": "Assigned"
        }

    except HTTPException:
        conn.rollback()
        raise

    except mysql.connector.Error:
        conn.rollback()
        raise HTTPException(
            status_code=503,
            detail="Could not assign the issue."
        )

    finally:
        conn.close()
