# Task 1 — College Workflow Investigation

## 1. Project Overview

This investigation examines a campus maintenance issue-reporting and assignment workflow using the existing GreenCampus web application prototype.

The application includes issue reporting, an administrator dashboard, issue tracking, and maintenance assignment functionality. The purpose of this investigation is to identify workflow problems, propose a more reliable process, and evaluate the proposed process using synthetic test cases.

This is a student investigation of a prototype. The application findings do not, by themselves, establish how every official IFHE campus maintenance request is processed.

## 2. Problem Statement

A maintenance workflow needs to ensure that submitted issues can be reviewed, assigned to an authorized maintenance team, tracked through completion, and recovered when a step fails.

During testing of the existing prototype, a reported issue appeared in the administrator's Issue Tracker, but the attempted assignment did not save successfully. The status remained `Reported`, and the assignment fields remained empty.

This indicates a potential gap between issue visibility and successful assignment in the prototype. It can prevent the administrator from reliably tracking whether an issue has been assigned.

## 3. Existing Workflow

The intended workflow can be represented as follows:

1. A student or faculty member submits a maintenance issue.
2. The application records the report.
3. The administrator reviews the submitted issue.
4. The administrator assigns the issue to an appropriate maintenance team.
5. The assignment and status are saved.
6. The issue is tracked until the work is completed.

The prototype observation identified in this investigation concerns the transition from administrator review to successful assignment.

The actual official campus process, including its approvals, handoffs, and exception procedures, must be confirmed through permitted observation or reliable documentation. Prototype behavior is not treated as proof of official institutional practice.

## 4. Proposed Improved Workflow

The proposed workflow introduces explicit statuses, validation, authorization, and recovery procedures.

### Proposed statuses

- `Submitted` — The request has been received.
- `Needs Information` — Required information is missing.
- `Under Review` — An authorized administrator is reviewing the request.
- `Assigned` — An authorized maintenance team has been assigned successfully.
- `In Progress` — Maintenance work has started.
- `Resolved` — The reported issue has been addressed.
- `Closed` — The resolution has been checked and the request has been closed.
- `Assignment Failed` — An assignment attempt failed and requires recovery.

### Inputs and validation

A report should contain sufficient information to identify and understand the maintenance issue, such as a description, location or area, and relevant category.

The application should validate required fields before accepting a report. Duplicate submissions should be checked, and incomplete requests should be returned for additional information rather than silently discarded.

### Ownership and permissions

The reporter is responsible for submitting accurate information and responding to requests for clarification.

An authorized administrator is responsible for reviewing requests, deciding whether they are ready for assignment, and assigning an appropriate maintenance team.

Maintenance personnel are responsible for updating progress and reporting the outcome of the work.

Only authorized users should perform administrative assignments or change restricted workflow statuses.

### Assignment and recovery

An issue should move to `Assigned` only after the assignment has been saved successfully.

If saving fails, the application should preserve the existing report, show a clear error, and allow an authorized administrator to retry. The system should not display a successful assignment when the assignment has not been persisted.

Repeated submissions should not create unintended duplicate issues. Changes should be traceable, and unresolved failures should remain visible to the administrator.

## 5. Synthetic Testing

Five synthetic scenarios are required to evaluate the proposed workflow:

1. Normal report submission and assignment.
2. Missing required information.
3. Duplicate report submission.
4. Unauthorized assignment request.
5. Failed assignment or another failed workflow step.

The individual test cases, inputs, expected results, actual results, and recovery outcomes are documented in the accompanying test evidence. Those records should remain the source of truth; results must not be invented or changed simply to show that a test passed.

The main acceptance criteria are that valid requests progress correctly, invalid or unauthorized actions are rejected, duplicates are handled consistently, and failures do not falsely appear successful.

## 6. Scale and Time-Saving Evaluation

The potential impact should be estimated using permitted observations, synthetic measurements, or clearly identified assumptions.

The investigation should record the number of requests considered, the observation period, the estimated frequency of the problem, and the average handling time where evidence is available.

The net time-saving calculation should use:

**Net time saved = Gross time saved − Review effort − Support and recovery effort**

For a comparable number of requests:

**Gross time saved = Baseline handling time − Proposed handling time**

All time values must use the same unit and cover comparable work. The evaluation should account for administrator review, clarification requests, failed assignments, retries, and ongoing support.

No numerical saving should be reported without recorded measurements or an explicitly labelled estimate. If sufficient measurements are unavailable, the result should be reported as not yet quantified.

## 7. Evidence and Limitations

The supporting evidence for this investigation consists of the existing application source code, available screenshots, and the documented synthetic test cases.

The source code supports examination of the prototype's implementation. Screenshots support the specific interface states captured. Synthetic tests evaluate defined scenarios but do not establish the frequency of failures in a live campus environment.

The investigation does not use private student records, credentials, or confidential college communications.

Limitations include the distinction between prototype behavior and official campus practice, the limited scope of observed failures, and the need for sufficient timing and frequency data to quantify potential savings.

Any assumptions, estimates, and unverified aspects of the official workflow should be explicitly identified in the final evidence records.

## 8. Conclusion

The investigation identifies a potential reliability problem in the prototype: an issue can appear in the administrator's tracker without its assignment being successfully saved.

The proposed workflow addresses this gap through explicit statuses, required-field validation, role-based permissions, reliable assignment confirmation, duplicate handling, and failure recovery.

The synthetic tests and supporting evidence should be used to assess these changes before drawing conclusions about their effectiveness in a real campus environment.

This report presents a student-proposed workflow improvement, not an official IFHE policy or syllabus change.
