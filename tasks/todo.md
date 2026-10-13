# Task List: `project-model`

Scope follows [`SPEC-project-model.md`](../SPEC-project-model.md) and [`tasks/plan.md`](./plan.md). Tasks 1–6 are complete; the final human-review checkpoint remains before `desktop-foundation`.

## Task 1: Resolve the project-model open decisions

**Description:** Confirm the v1 element catalog, project save behavior, and keyframe time/interpolation requirements. Update the model spec so the document contract can be implemented without guessing.

**Acceptance criteria:**
- [x] The v1 non-text element types are explicitly listed.
- [x] Project persistence and save behavior are specified.
- [x] Keyframe timebase and interpolation scope are specified.
- [x] `SPEC-project-model.md` reflects the decisions and is approved.

**Verification:**
- [x] All three model-specific open questions are resolved in the spec.
- [x] Human supplied the decisions; the updated spec is ready for checkpoint review before schema implementation.

**Dependencies:** None.

**Files likely touched:**
- `SPEC-project-model.md`

**Estimated scope:** Small (1 file).

## Task 2: Scaffold the Tauri 2 React TypeScript application

**Description:** Create the minimum desktop application shell using Tauri 2, React, TypeScript, and Vite. Pin package versions from current official documentation and establish the app's package scripts and test runner.

**Acceptance criteria:**
- [x] The generated workspace uses the approved application stack.
- [x] Exact dependency versions and the package manager are recorded.
- [x] The Tauri desktop shell opens the minimal React view.
- [x] The frontend production build command works.
- [x] A focused unit-test command is available for later model tasks.

**Verification:**
- [x] Run the documented Tauri development command and confirm the window opens.
- [x] Run the documented frontend build command.
- [x] Run the test runner's empty/smoke command.

**Dependencies:** None. This workspace bootstrap can proceed independently of the model-specific product decisions.

**Files likely touched:**
- `package.json` and lockfile
- `vite.config.ts` and TypeScript configuration
- `src-tauri/` scaffold files
- minimal React entry files

**Estimated scope:** Large (scaffold generates multiple files; one cohesive CLI setup).

## Task 3: Configure Tailwind CSS and shadcn/ui for app chrome

**Description:** Add Tailwind CSS and initialize shadcn/ui for application panels and controls only. Keep the graphics composition/rendering model independent from those UI components and tokens.

**Acceptance criteria:**
- [x] Tailwind CSS is configured for the Vite frontend.
- [x] shadcn/ui project configuration is valid.
- [x] Application UI can import and render one base shadcn component.
- [x] No operator-authored graphic is routed through the shadcn design system.

**Verification:**
- [x] `npx shadcn@latest info --json` recognizes the project configuration.
- [x] Run the frontend build command.
- [x] Confirm the minimal app view still opens.

**Dependencies:** Task 2.

**Files likely touched:**
- `components.json`
- `vite.config.ts`
- `src/index.css`
- TypeScript alias configuration
- minimal React entry file

**Estimated scope:** Medium (3–5 files plus dependency manifest).

## Checkpoint: app foundation available

- [x] Tasks 2–3 are complete.
- [x] Tauri dev window and frontend build work.
- [x] Tailwind and shadcn/ui configuration is isolated to app chrome.
- [x] Review with the human before model implementation.

## Task 4: Define the project and composition contracts

**Description:** Add framework-independent TypeScript types for project documents, addressable graphic compositions, groups, ordered elements, editable text-field definitions, and keyframes as agreed in Task 1.

**Acceptance criteria:**
- [x] Project, composition, element, and field identities are explicit and stable.
- [x] Text fields have IDs, labels, and authored default values.
- [x] Groups and layer order are represented without relying on array indices as identity.
- [x] Keyframes capture the agreed timebase, target property, value, and interpolation data.
- [x] Editor-authored defaults are structurally separate from live draft values.

**Verification:**
- [x] TypeScript type-check/build succeeds.
- [x] Add focused type/model assertions according to the chosen test strategy.

**Dependencies:** Tasks 1 and 3.

**Files likely touched:**
- `src/features/project-model/types.ts`
- `src/features/project-model/project-model.test.ts`

**Estimated scope:** Small (2 files).

## Task 5: Validate project documents and field identities

**Description:** Implement boundary validation for required IDs, unique identities, hierarchy, ordering, editable text values, and the agreed keyframe shape.

**Acceptance criteria:**
- [x] Valid project documents pass validation.
- [x] Missing or duplicate IDs and malformed group relationships are rejected with actionable errors.
- [x] Text values remain strings, including numeric-looking values.
- [x] Invalid documents do not silently mutate authored defaults.

**Verification:**
- [x] Run focused model-validation tests.
- [x] Run the frontend build command.

**Dependencies:** Task 4.

**Files likely touched:**
- `src/features/project-model/validation.ts`
- `src/features/project-model/validation.test.ts`
- `src/features/project-model/types.ts`

**Estimated scope:** Small (2–3 files).

## Task 6: Implement document serialization and reconstruction

**Description:** Serialize and rebuild projects using the format and save behavior agreed in Task 1, preserving composition IDs, field IDs, group hierarchy, order, and keyframe data.

**Acceptance criteria:**
- [x] Round-tripping a valid project preserves all authored content and identities.
- [x] Draft/live field values do not overwrite Editor-authored defaults during serialization.
- [x] Unsupported or malformed document versions fail clearly rather than loading partially.

**Verification:**
- [x] Run focused serialization round-trip and invalid-document tests.
- [x] Run the frontend build command.
- [x] Inspect round-trip content, layer order and authored field defaults in the fixture assertions.

**Dependencies:** Tasks 1, 4, and 5.

**Files likely touched:**
- `src/features/project-model/serialization.ts`
- `src/features/project-model/serialization.test.ts`
- `src/features/project-model/types.ts`
- `src/features/project-model/validation.ts`

**Estimated scope:** Medium (3–4 files).

## Checkpoint: `project-model` ready for consumers

- [x] Tasks 1–6 are complete.
- [x] Focused tests and build pass.
- [x] Model contract documents how downstream Editor, live-control, and broadcast-output modules use stable IDs.
- [ ] Human reviews the completed module before work advances to `desktop-foundation`.
