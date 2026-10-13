import { describe, expect, expectTypeOf, it } from "vitest";
import {
  createProjectDocument,
  DEFAULT_FRAME_RATE,
  deserializeProject,
  ProjectDocumentError,
  serializeProject,
  SUPPORTED_FRAME_RATES,
  validateProjectDocument,
  type AnimationKeyframe,
  type AnimationProperty,
  type FrameRate,
  type ProjectDocument,
} from ".";

function makeProject(): ProjectDocument {
  return {
    schemaVersion: 1,
    id: "project-1",
    name: "Broadcast package",
    frameRate: 30,
    assets: [{ id: "asset-logo", type: "image", relativePath: "assets/logo.png" }],
    compositions: [
      {
        id: "composition-lower-third",
        name: "Presenter lower third",
        fields: [
          { id: "field-name", label: "Name", defaultValue: "Avery Stone" },
          { id: "field-social", label: "Instagram", defaultValue: "@avery" },
        ],
        layers: [
          {
            id: "group-main",
            name: "Main graphic",
            type: "group",
            visible: true,
            locked: false,
            opacity: 1,
            transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            children: [
              {
                id: "text-name",
                name: "Presenter name",
                type: "text",
                visible: true,
                locked: false,
                opacity: 1,
                transform: { x: 48, y: 32, rotation: 0, scaleX: 1, scaleY: 1 },
                fieldId: "field-name",
                style: {
                  fontFamily: "Arial",
                  fontSize: 42,
                  fontWeight: 700,
                  color: "#ffffff",
                  alignment: "left",
                },
              },
              {
                id: "shape-background",
                name: "Background bar",
                type: "shape",
                visible: true,
                locked: false,
                opacity: 1,
                transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
                shape: {
                  kind: "rectangle",
                  width: 640,
                  height: 112,
                  fill: "#14324a",
                  stroke: null,
                  strokeWidth: 0,
                },
              },
              {
                id: "image-logo",
                name: "Station logo",
                type: "image",
                visible: true,
                locked: false,
                opacity: 1,
                transform: { x: 600, y: 16, rotation: 0, scaleX: 1, scaleY: 1 },
                assetId: "asset-logo",
                width: 48,
                height: 48,
              },
            ],
          },
        ],
        keyframes: [
          {
            id: "keyframe-intro",
            targetLayerId: "group-main",
            property: "transform.x",
            frame: 0,
            value: -640,
            interpolation: "ease-out",
          },
        ],
      },
    ],
  };
}

describe("project model contracts", () => {
  it("uses the configured project frame rates and frame-based keyframe values", () => {
    expectTypeOf<FrameRate>().toEqualTypeOf<25 | 29.97 | 30 | 50 | 59.94 | 60>();
    expectTypeOf<AnimationKeyframe["frame"]>().toEqualTypeOf<number>();
    expectTypeOf<AnimationProperty>().toEqualTypeOf<
      "transform.x" | "transform.y" | "transform.rotation" | "transform.scaleX" | "transform.scaleY" | "opacity"
    >();
  });

  it("creates new projects at 30 fps unless the operator chooses another rate", () => {
    expect(SUPPORTED_FRAME_RATES).toEqual([25, 29.97, 30, 50, 59.94, 60]);
    expect(DEFAULT_FRAME_RATE).toBe(30);
    expect(createProjectDocument({ id: "new-project", name: "New graphics" }).frameRate).toBe(30);
    expect(createProjectDocument({ id: "sports-project", name: "Sports", frameRate: 59.94 }).frameRate).toBe(59.94);
  });
});

describe("validateProjectDocument", () => {
  it("accepts a valid project with text, vector and image layers", () => {
    expect(validateProjectDocument(makeProject())).toEqual({
      success: true,
      data: makeProject(),
    });
  });

  it("reports duplicate project-wide IDs with an actionable path", () => {
    const project = makeProject();
    project.compositions[0].fields[1].id = "field-name";

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "compositions[0].fields[1].id",
        message: "ID 'field-name' is already used elsewhere in this project.",
      });
    }
  });

  it("rejects a text layer that refers to an undefined field", () => {
    const project = makeProject();
    const group = project.compositions[0].layers[0];
    if (group.type !== "group") throw new Error("Fixture group expected");
    const text = group.children[0];
    if (text.type !== "text") throw new Error("Fixture text expected");
    text.fieldId = "missing-field";

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "compositions[0].layers[0].children[0].fieldId",
        message: "Text layer refers to unknown field 'missing-field'.",
      });
    }
  });

  it("rejects duplicate layer IDs anywhere in a composition", () => {
    const project = makeProject();
    const group = project.compositions[0].layers[0];
    if (group.type !== "group") throw new Error("Fixture group expected");
    group.children[0].id = group.id;

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "compositions[0].layers[0].children[0].id",
        message: "ID 'group-main' is already used elsewhere in this project.",
      });
    }
  });

  it("rejects image layers that refer to an unknown project asset", () => {
    const project = makeProject();
    const group = project.compositions[0].layers[0];
    if (group.type !== "group") throw new Error("Fixture group expected");
    const image = group.children[2];
    if (image.type !== "image") throw new Error("Fixture image expected");
    image.assetId = "missing-logo";

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "compositions[0].layers[0].children[2].assetId",
        message: "Image layer refers to unknown asset 'missing-logo'.",
      });
    }
  });

  it("rejects image assets outside the project folder", () => {
    const project = makeProject();
    project.assets[0].relativePath = "../shared/logo.png";

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "assets[0].relativePath",
        message: "Asset path must stay inside the project folder and use forward slashes.",
      });
    }
  });

  it("rejects duplicate keyframes on one layer property and frame", () => {
    const project = makeProject();
    project.compositions[0].keyframes.push({
      id: "keyframe-duplicate",
      targetLayerId: "group-main",
      property: "transform.x",
      frame: 0,
      value: 120,
      interpolation: "linear",
    });

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "compositions[0].keyframes[1]",
        message: "A layer property can have only one keyframe at each frame.",
      });
    }
  });

  it("rejects cyclic group hierarchies without overflowing", () => {
    const project = makeProject();
    const group = project.compositions[0].layers[0];
    if (group.type !== "group") throw new Error("Fixture group expected");
    group.children.push(group);

    const result = validateProjectDocument(project);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual({
        path: "compositions[0].layers[0].children[3]",
        message: "Layer hierarchy cannot contain a cycle.",
      });
    }
  });

  it("keeps numeric-looking live text defaults as strings", () => {
    const project = makeProject();
    project.compositions[0].fields[0].defaultValue = "42–17";

    const result = validateProjectDocument(project);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.compositions[0].fields[0].defaultValue).toBe("42–17");
      expect(project.compositions[0].fields[0].defaultValue).toBe("42–17");
    }
  });
});

describe("project serialization", () => {
  it("round-trips a project without losing layer order, IDs or field defaults", () => {
    const project = makeProject();

    const restored = deserializeProject(serializeProject(project));

    expect(restored).toEqual(project);
    expect(restored.compositions[0].layers[0].id).toBe("group-main");
    const restoredGroup = restored.compositions[0].layers[0];
    expect(restoredGroup.type).toBe("group");
    if (restoredGroup.type === "group") {
      expect(restoredGroup.children.map((layer) => layer.id)).toEqual([
        "text-name",
        "shape-background",
        "image-logo",
      ]);
    }
    expect(restored.compositions[0].fields[0].defaultValue).toBe("Avery Stone");
  });

  it("does not persist runtime live-control state or change authored defaults", () => {
    const project = makeProject();
    const projectWithRuntimeState = {
      ...project,
      liveState: {
        drafts: { "composition-lower-third": { "field-name": "Changed but not sent" } },
        onAir: {},
      },
    } as ProjectDocument;

    const stored = JSON.parse(serializeProject(projectWithRuntimeState)) as Record<string, unknown>;
    const restored = deserializeProject(JSON.stringify(stored));

    expect(stored).not.toHaveProperty("liveState");
    expect(restored.compositions[0].fields[0].defaultValue).toBe("Avery Stone");
  });

  it("rejects malformed JSON and unsupported schema versions clearly", () => {
    expect(() => deserializeProject("{broken json")).toThrow(ProjectDocumentError);

    const unsupported = makeProject();
    const rawDocument = JSON.stringify({ ...unsupported, schemaVersion: 2 });
    expect(() => deserializeProject(rawDocument)).toThrow("Unsupported project schema version.");
  });
});
