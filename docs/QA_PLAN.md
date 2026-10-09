# Quality assurance and delivery plan

## Scope and order

1. Publish a sanitized baseline to public GitHub with this plan and a useful README. Preserve legacy GitLab history locally; do not publish credentials or runtime uploads.
2. Repair build, typing, lint, configuration, responsive, and accessibility defects.
3. Complete protected administration: tour/animal CRUD, images, visitor-facing page copy and branding, enquiry inbox, and a switch to the real visitor view with a return-to-admin control.
4. Preview admin and every public page at desktop and mobile sizes, fixing observed spacing, clipping, blank states, and interaction defects. A larger visual redesign is outside this iteration.
5. Add CI and a deployable release workflow. Custom-domain purchase/configuration is deferred at the owner's request.

## Acceptance criteria

- No credentials, local database, runtime uploads, virtual environments, or dependency/build directories in public Git history.
- Reproducible setup with pinned Python dependencies, a Node engine requirement, environment examples, and documented commands.
- Type check, zero-warning lint, frontend tests, API tests, and production build pass.
- Unauthenticated/expired sessions cannot mutate or read admin-only data. Errors never disclose credentials.
- Tour changes and animal associations save atomically. Invalid values do not partially update records. Deletion and image removal preserve relational integrity.
- Admin can edit public content, refresh the visitor page, see persisted changes, and return to editing. Forms show validation, saving, success, and failure states.
- Enquiries persist and are visible only in the protected inbox. No real message is sent during testing.
- Keyboard dialog dismissal and focus management work. Mobile navigation, filters, cards, hero content, galleries, forms, and admin navigation fit narrow screens.
- Error/empty/loading states stay usable. Images have sensible fallbacks. An unavailable API never masquerades as a successful save.
- CI tests pull requests and main; release is gated on tests and uses environment secrets.

## Test strategy

Use isolated temporary SQLite databases and upload directories for API tests; never delete or mutate the existing catalogue as a test. Cover authentication, validation, atomic updates, linked-record deletion, uploads, content persistence, and enquiry access. Use Vitest/Testing Library for frontend regressions. Browser checks must use the real API contract and document any unverified paths.

Capture desktop/mobile screenshots for admin and visitor pages. Recheck after fixes. Record final outcomes, coverage limits, and deployment status in `docs/QA_RESULTS.md`.

## Commit discipline

Commit coherent units with meaningful messages: sanitized baseline/documentation; API/auth/data integrity; admin CMS and visitor preview; frontend regressions/accessibility; CI/deployment; final QA evidence. Run relevant checks before marking a unit complete. Do not claim a deployment merely because a build or workflow exists.
