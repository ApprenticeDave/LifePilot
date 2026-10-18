---
name: personal-data-privacy
description: "Assess or design privacy-conscious handling of LifePilot personal, property, household, financial, reminder, and document data. Use for data models, storage, logging, integrations, examples, tests, or privacy reviews."
user-invocable: true
---

# Privacy-conscious personal data

LifePilot may handle sensitive personal, household, property, and financial information. Apply data minimization and user control throughout product planning and implementation.

## Procedure

1. Identify the data needed for the stated user goal and avoid collecting unrelated information.
2. Inspect where data is entered, stored, displayed, logged, exported, shared, and deleted; base conclusions on the actual implementation.
3. Make access, retention, sharing, and deletion behavior explicit where relevant, and ask the project owner about unresolved product or compliance requirements.
4. Use synthetic fixtures and examples. Never ask for real account credentials, identity documents, financial records, or private property documents to test a feature.
5. Report concrete exposure risks and recommend the smallest change that addresses them.
6. Keep any regulatory or jurisdiction-specific conclusions qualified and supported by authoritative project-approved sources.

## Boundaries

- Do not claim a feature is legally compliant or secure based only on this workflow.
- Do not reproduce sensitive user data in summaries, logs, or generated documentation.
- Financial features support user-directed recordkeeping and budgeting; do not turn data handling into personalized financial advice.
