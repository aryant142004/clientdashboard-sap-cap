# ClientDashboard — SAP CAP + Fiori Milestone Approval System

A full-stack SAP enterprise application built to demonstrate real-world SAP Business Technology Platform (BTP) integration: a project milestone tracker with a live, multi-step approval workflow powered by SAP Build Process Automation.

Built as a portfolio project to demonstrate hands-on SAP CAP, Fiori, and BTP integration skills.

## What it does

- Tracks project milestones with completion percentage, criticality, and status
- Dynamic UI coloring based on milestone criticality and progress
- A "Submit for Approval" action on any milestone triggers a real SAP Build Process Automation workflow instance
- Approvers action the request in **My Inbox** (Approve/Reject)
- An automated callback updates the milestone's approval status back in the database once a decision is made

## Architecture

| Layer | Technology |
|---|---|
| Backend | SAP Cloud Application Programming Model (CAP), Node.js |
| Frontend | SAP Fiori Elements (List Report + Object Page) |
| Workflow engine | SAP Build Process Automation |
| Database (production) | SAP HANA Cloud |
| Database (local dev) | SQLite |
| Deployment | Cloud Foundry (SAP BTP trial), MTA packaging |

**Live deployed service:** `https://ff78f0dbtrial-dev-clientdashboard-srv.cfapps.ap21.hana.ondemand.com`

## The approval workflow

1. A milestone is created and edited in the Fiori UI.
2. Clicking **Submit for Approval** calls a CAP action that authenticates against the workflow-service (OAuth2 client-credentials) and starts a new instance of the `Milestone_Approval_Workflow` process.
3. The process routes a task to **My Inbox**, where an approver can Approve or Reject.
4. On decision, an automation (Custom Script → REST call) fires a callback to a dedicated CAP action, `updateApprovalStatus`, which updates the milestone's `ApprovalStatus` field in the live database.

The exported process definition is included in this repo at
[`Milestone_Approval_Workflow/Milestone_Approval_Workflow_1.1.1.mtar`](./Milestone_Approval_Workflow/Milestone_Approval_Workflow_1.1.1.mtar).

## Screenshots

See the [`screenshots/`](./screenshots) folder for the full set. Highlights:
- The Fiori milestone list with criticality-based coloring
- The Build Process Automation flow editor showing the Approve/Reject branches
- A successful Tester-tab run of the callback automation (Custom Script → Rest Call Web Service, both green)

## A note on the automated callback

The callback automations (Custom Script → Rest Call Web Service) are fully built, wired into the workflow's Approve/Reject branches, and **proven working** — verified via SAP Build Process Automation's Tester tab, with a live curl call confirming the target milestone's `ApprovalStatus` actually updates in HANA Cloud.

The one thing this trial tenant *can't* demonstrate is the fully hands-off version — clicking Approve in My Inbox and having the callback fire automatically with zero manual steps. That requires an **unattended automation execution quota**, which isn't available on SAP BTP's trial tier (confirmed via BTP Cockpit entitlements — the `automation-unattended` service plan doesn't exist in the trial catalog). This is a licensing limitation, not a design or implementation gap: the logic itself is fully built and verified.

## Local development

```bash
npm install
cds watch
```

Runs against a local SQLite database seeded from `db/data/*.csv`.

## Tech highlights worth noting

- Custom CAP action (`updateApprovalStatus`) with direct database writes, callable both by the automation and independently via REST/curl
- OAuth2 client-credentials integration with SAP Build Process Automation's workflow REST API
- MTA-based deployment to Cloud Foundry with HANA Cloud as the production persistence layer
- Debugged and resolved multiple real BTP platform issues along the way: HANA Cloud auto-suspend, Cloud Foundry app idling, Desktop Agent version mismatches, and automation output-type mismatches
