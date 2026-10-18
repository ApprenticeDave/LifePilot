# Copilot project setup

This repository separates human-readable project documentation from VS Code-discoverable Copilot customizations:

- `docs/` contains the product reference and this guide.
- `.github/copilot-instructions.md` provides concise, always-on project guidance.
- `.github/agents/` contains focused agents. The LifePilot coordinator can delegate to the product planner, implementation engineer, and quality reviewer.
- `.github/skills/` contains on-demand workflows for feature discovery, neurodivergent-friendly UX, property-management workflows, and privacy-sensitive personal data.

## Suggested workflow

1. Start with the LifePilot coordinator for work spanning product definition, implementation, and review.
2. Use the product planner to clarify user needs and acceptance criteria before implementing an underspecified feature.
3. Use the implementation engineer for scoped changes that fit established repository conventions.
4. Use the quality reviewer for a read-only review of behavior, tests, accessibility/usability concerns, and personal-data handling.
5. Invoke a skill when its domain workflow is relevant; skills complement rather than replace project instructions or code review.

## Boundaries

- The agents and skills are starting points based on the initial README, not a substitute for user validation.
- The current local test bed uses Node.js built-ins (`node:http`, `node:sqlite`) and plain HTML/CSS/JavaScript, without npm dependencies. Run with `npm start` and validate with `npm test`. Keep subsequent implementation scoped and avoid adding a framework, package, external service, or network binding without authorization.
- Use synthetic information for examples and tests. Do not request or reproduce real personal, property, or financial records unnecessarily.
- Financial-tracking features are for user-directed organization and recordkeeping, not personalized financial advice.

## Customization files

- [Project-wide instructions](../.github/copilot-instructions.md)
- [LifePilot coordinator](../.github/agents/lifepilot-coordinator.agent.md)
- [Product planner](../.github/agents/product-planner.agent.md)
- [Implementation engineer](../.github/agents/implementation-engineer.agent.md)
- [Quality reviewer](../.github/agents/quality-reviewer.agent.md)
- [Feature discovery skill](../.github/skills/feature-discovery/SKILL.md)
- [Neurodivergent-friendly UX skill](../.github/skills/neurodivergent-friendly-ux/SKILL.md)
- [Property-management workflows skill](../.github/skills/property-management-workflows/SKILL.md)
- [Personal-data privacy skill](../.github/skills/personal-data-privacy/SKILL.md)
