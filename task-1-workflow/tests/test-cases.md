# Task 1 — GreenCampus Workflow Test Cases

## 1. Purpose

This document evaluates the proposed maintenance issue-reporting and assignment workflow for the GreenCampus application prototype.

Five synthetic scenarios are used to examine normal operation, missing information, duplicate reports, unauthorized actions, and workflow failure.

All test data is fictional. The expected outcomes describe the intended behavior of the proposed workflow. Actual results must reflect what was observed when each test was performed.

## 2. Test Environment

- **Application:** GreenCampus college maintenance workflow prototype
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python and FastAPI
- **Database:** MySQL
- **Test data:** Synthetic issue reports and fictional user roles
- **Testing approach:** Manual scenario-based testing

Record the actual test date, application version or commit, and environment used when executing these tests.

## 3. Test Status Definitions

- **PASS:** The observed result matches the expected result.
- **FAIL:** The observed result does not match the expected result.
- **NOT RUN:** The test has not been executed.
- **BLOCKED:** The test could not be completed because of an environment or setup issue.

Do not mark a test as passed based only on its expected outcome.

## 4. Test Case 1 — Normal Issue Submission and Assignment

**Test ID:** TC-01

**Objective:** Verify that a valid maintenance issue can be submitted, reviewed, assigned, and tracked.

**Preconditions:**
- The application is available.
- A synthetic reporter account and authorized administrator account are available.
- The relevant maintenance category and team are configured, where required.

**Synthetic input:**
- Location: Block A, Corridor 2
- Category: Electrical
- Description: Corridor light is not working.

**Steps:**
1. Sign in as the permitted reporter.
2. Submit the synthetic issue with all required information.
3. Open the administrator's issue tracker.
4. Locate the submitted issue.
5. Attempt to assign it to an authorized maintenance team.
6. Verify the saved assignment and status.

**Expected result:**
- The issue is recorded and visible to the authorized administrator.
- The administrator can assign the issue to an authorized team.
- The assignment is confirmed only after it has been saved successfully.
- The status reflects the actual workflow stage.

**Actual result:** Record the behavior observed during execution.

**Status:** NOT RUN until tested.

**Recovery:** If submission or assignment fails, record the error, preserve the existing issue, and retry after resolving the cause.

## 5. Test Case 2 — Missing Required Information

**Test ID:** TC-02

**Objective:** Verify that an incomplete issue report is handled clearly and safely.

**Preconditions:** The application is available and its required report fields are identified.

**Synthetic input:**
- Location: Block B, Room 105
- Category: Plumbing
- Description: Left blank.

**Steps:**
1. Open the issue-reporting form.
2. Enter the synthetic location and category.
3. Leave the description blank.
4. Submit the form.
5. Observe the validation message and check whether an incomplete issue was created.

**Expected result:**
- The application identifies the missing required information.
- The user receives a clear explanation of what must be corrected.
- The application does not accept an invalid report as complete.
- Existing valid reports remain unchanged.

**Actual result:** Record the behavior observed during execution.

**Status:** NOT RUN until tested.

**Recovery:** Complete the missing information and resubmit. If incomplete reports are accepted unexpectedly, document the issue as a validation defect.

## 6. Test Case 3 — Duplicate Issue Submission

**Test ID:** TC-03

**Objective:** Evaluate how the application handles repeated submissions of the same synthetic issue.

**Preconditions:** The application is available and the initial synthetic issue can be submitted.

**Synthetic input:**
- Location: Block C, Staircase 1
- Category: Electrical
- Description: Staircase light is not working.

**Steps:**
1. Submit the synthetic issue.
2. Submit the same issue again using the same details.
3. Inspect the issue tracker for duplicate records.
4. Observe any warning, duplicate handling, or separate issue creation.

**Expected result:**
- The application handles repeated submissions consistently.
- Duplicate detection, if implemented, identifies a likely duplicate and informs the user.
- If a second report is retained, it should not cause unintended duplicate maintenance assignments.

**Actual result:** Record whether the application detects the duplicate, creates a second record, or behaves differently.

**Status:** NOT RUN until tested.

**Recovery:** If duplicate records are created unintentionally, flag them for authorized review and prevent duplicate assignment where possible. Do not delete valid reports automatically without a defined policy.

## 7. Test Case 4 — Unauthorized Assignment Attempt

**Test ID:** TC-04

**Objective:** Verify that only authorized users can assign maintenance issues.

**Preconditions:**
- A synthetic maintenance issue exists.
- A user without administrator or assignment permissions is available for testing.

**Synthetic input:**
- Issue: Synthetic plumbing issue in Block D.
- Action: Attempt to assign the issue to a maintenance team using an unauthorized account.

**Steps:**
1. Sign in as the unauthorized user.
2. Attempt the assignment through the user interface, if available.
3. Where safe and permitted, verify that the backend also rejects an unauthorized assignment request.
4. Check whether the existing assignment and issue status remain unchanged.

**Expected result:**
- The unauthorized action is rejected.
- The backend enforces authorization rather than relying only on hidden interface controls.
- The existing issue and assignment data are not changed by the rejected request.
- The application provides an appropriate error response.

**Actual result:** Record the observed behavior. Do not claim backend authorization was verified unless the backend was actually tested.

**Status:** NOT RUN until tested.

**Recovery:** Preserve the issue state, review authorization rules, correct any permission defect, and repeat the test using an authorized test environment.

## 8. Test Case 5 — Assignment Save Failure

**Test ID:** TC-05

**Objective:** Verify that a failed assignment operation does not appear successful and that the issue can be recovered safely.

**Preconditions:**
- A synthetic issue exists.
- An authorized administrator is signed in.
- A safe way to observe or simulate a save failure is available.

**Synthetic input:**
- Issue: Synthetic electrical issue in Block E.
- Action: Assign the issue to an authorized maintenance team while the save operation fails.

**Steps:**
1. Open the administrator's issue tracker.
2. Select the synthetic issue.
3. Attempt to assign a maintenance team.
4. Observe the result if the save operation fails.
5. Refresh the page or reload the issue record to verify persisted state.
6. Retry after the cause of failure has been resolved.

**Expected result:**
- The application communicates that the assignment failed.
- The issue is not falsely presented as successfully assigned.
- The persisted state remains consistent with the actual database state.
- An authorized administrator can retry the operation.
- A successful retry updates the assignment and status correctly.

**Actual result:** Record the observed behavior, including any error message and whether the assignment persisted.

**Status:** NOT RUN until tested.

**Recovery:** Identify the failure cause, preserve the original issue, retry the assignment after correction, and verify the saved state. Avoid creating duplicate assignments during recovery.

## 9. Results Summary

Complete this table after executing the tests.

| Test ID | Scenario | Expected outcome | Actual outcome | Status |
|---|---|---|---|---|
| TC-01 | Normal submission and assignment | Valid issue progresses correctly | Record after testing | NOT RUN |
| TC-02 | Missing information | Invalid submission is handled clearly | Record after testing | NOT RUN |
| TC-03 | Duplicate submission | Duplicate is handled consistently | Record after testing | NOT RUN |
| TC-04 | Unauthorized assignment | Unauthorized action is rejected | Record after testing | NOT RUN |
| TC-05 | Assignment save failure | Failure is visible and recoverable | Record after testing | NOT RUN |

Update each status and actual outcome based on the test evidence. If a scenario cannot safely be executed, mark it BLOCKED and explain why.

## 10. Limitations

These scenarios use synthetic data and evaluate the prototype, not a live institutional maintenance system.

Expected results describe proposed behavior and do not prove that the current application implements every control. Tests involving backend authorization, duplicate detection, or database failure require direct verification.

The results should not be generalized to all campus maintenance operations without additional permitted evidence.

## 11. Conclusion

The five scenarios provide a structured way to assess the reliability, validation, authorization, and recovery behavior of the proposed maintenance workflow.

The completed test results should be considered alongside the workflow investigation report, application source code, and supporting screenshots.
