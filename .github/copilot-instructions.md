# LifePilot project guidance

LifePilot is intended to reduce the cognitive load of managing everyday life. Read [the product vision](../docs/PRODUCT_VISION.md) before making product or design decisions, and [the Copilot setup guide](../docs/COPILOT_SETUP.md) for the available agents and skills.

## Working principles

- Preserve the user's intent and existing project conventions. The first local test bed uses Node.js built-ins (`node:http`, `node:sqlite`) with plain HTML/CSS/JavaScript and no dependencies. Do not add a framework, package, external service, or broader network binding without authorization.
- Prefer clear, predictable, low-friction experiences that help people organize and act without judgment. Keep users in control of reminders and personal information.
- Treat property, household, financial, and personal-organization data as sensitive. Minimize collection and exposure; use synthetic data in examples and tests.
- Financial features should support user-directed recordkeeping and budgeting. Do not present generated output as personalized financial advice.
- Make scoped changes, document decisions in `docs/` when they affect product behavior, and run the smallest relevant checks. Do not invent build or test commands when the project has not defined them.
- For the local application, use `npm start` and `npm test`; Node currently labels `node:sqlite` experimental.
