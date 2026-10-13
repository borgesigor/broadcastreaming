# Implementation Plan: `project-model`

**Spec:** [`SPEC-project-model.md`](../SPEC-project-model.md)  
**Capability map:** [`CAPABILITY-MAP.md`](../CAPABILITY-MAP.md)  
**Status:** approved by user

## Overview

Implement the shared TypeScript document model for broadcast graphics. The model will provide stable identities for compositions and editable text fields, represent groups/layers/elements/keyframes, and keep Editor defaults separate from values prepared for on-air updates. This plan covers only the `project-model` capability; it does not implement the Tauri shell, editor UI, live controls, or HTML output.

## Architecture decisions

- Keep the domain model in framework-independent TypeScript. React, Tailwind, shadcn/ui, WebSocket transport, and broadcast rendering stay outside this module.
- Treat a graphic composition as the addressable on-air component; its nested elements and text-field definitions are part of that composition.
- Give compositions, elements, and editable fields stable IDs. On-air updates target those IDs rather than labels, display order, or array position.
- Keep authored defaults and draft/live values in separate model areas so editing data does not silently change the Editor-authored composition.
- Validate at the document boundary and make serialization/reconstruction preserve identity and hierarchy.
- Bootstrap only the package/tooling host needed to author and verify TypeScript. The application window, routes, and Tauri services remain in the later `desktop-foundation` capability.

## Dependency graph and build order

```text
Workspace bootstrap (Tauri 2 + React + TypeScript + Vite)
                         │
                         ▼
Project document and identity contracts
                         │
                         ▼
Validation and serialization
                         │
                         ▼
Editor, live-control, and broadcast-output consume the model
```

The bootstrap is a tooling prerequisite, not a change to the approved capability map. `project-model` remains the first product module; `desktop-foundation` still depends on it.

The product decisions in Task 1 and the mechanical workspace bootstrap can proceed independently. Model contracts must wait for both.

## Implementation phases

### Phase 1: Workspace bootstrap

- Create the minimum Tauri 2 / React / TypeScript / Vite workspace.
- Set up Tailwind CSS and shadcn/ui for the application's interface only.
- Pin package versions and select a test runner using the current official docs.
- Keep the initial app surface minimal; do not build Editor/Ao Vivo UI in this phase.

### Phase 2: Project contracts

- Resolve the initial element catalog and the time/keyframe representation before freezing the model.
- Define project, composition, group, element, text-field, and keyframe types with stable IDs.
- Define document and field-value validation rules.

### Phase 3: Serialization and consumer contract

- Add serialization and reconstruction that preserve IDs, hierarchy, layer order, fields, and keyframes.
- Verify authored defaults remain unchanged when live values are prepared or applied to a component.
- Document the model contract that future Editor, live-control, and broadcast-output modules consume.

## Verification checkpoints

- **After Phase 1:** the empty Tauri shell starts and the frontend builds with the selected package versions; the test command is available.
- **After Phase 2:** model validation accepts valid documents and rejects missing/duplicate identities and malformed hierarchy.
- **After Phase 3:** round-trip serialization preserves the model; targeted field updates resolve to the intended component without duplication.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Output canvas size and transform anchor are not set | Editor and output may interpret coordinates differently | Resolve them in the `broadcast-output` spec before rendering work |

## Decisions captured before implementation

1. v1 elements are text, vector shapes and images. Video is deferred.
2. Projects use local JSON files with autosave; image paths are relative to the project folder.
3. Keyframes use frame numbers with linear, ease-in and ease-out interpolation. FPS is per-project, defaulting to 30, with presets 25, 29.97, 30, 50, 59.94 and 60.
4. Vitest was selected as the test runner.
5. Output canvas dimensions and transform anchor remain for the `broadcast-output` spec.

## Task list

Detailed tasks and completion state are recorded in [`tasks/todo.md`](./todo.md). The user approved execution; work proceeds in dependency order and pauses at the human-review checkpoints.
