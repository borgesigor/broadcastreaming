import type {
  GraphicComposition,
  LayerItem,
  ProjectDocument,
} from "./types";
import { validateProjectDocument, type ValidationIssue } from "./validation";

export class ProjectDocumentError extends Error {
  readonly issues: readonly ValidationIssue[];

  constructor(message: string, issues: readonly ValidationIssue[] = []) {
    super(message);
    this.name = "ProjectDocumentError";
    this.issues = issues;
  }
}

function projectError(issues: readonly ValidationIssue[]): ProjectDocumentError {
  const message = issues.map(({ path, message: issueMessage }) => `${path}: ${issueMessage}`).join("\n");
  return new ProjectDocumentError(message, issues);
}

function copyLayer(layer: LayerItem): LayerItem {
  const base = {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    locked: layer.locked,
    opacity: layer.opacity,
    transform: {
      x: layer.transform.x,
      y: layer.transform.y,
      rotation: layer.transform.rotation,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
    },
  };

  if (layer.type === "group") {
    return { ...base, type: "group", children: layer.children.map(copyLayer) };
  }
  if (layer.type === "text") {
    return {
      ...base,
      type: "text",
      fieldId: layer.fieldId,
      style: {
        fontFamily: layer.style.fontFamily,
        fontSize: layer.style.fontSize,
        fontWeight: layer.style.fontWeight,
        color: layer.style.color,
        alignment: layer.style.alignment,
      },
    };
  }
  if (layer.type === "shape") {
    return {
      ...base,
      type: "shape",
      shape: {
        kind: layer.shape.kind,
        width: layer.shape.width,
        height: layer.shape.height,
        ...(layer.shape.pathData === undefined ? {} : { pathData: layer.shape.pathData }),
        fill: layer.shape.fill,
        stroke: layer.shape.stroke,
        strokeWidth: layer.shape.strokeWidth,
      },
    };
  }
  return {
    ...base,
    type: "image",
    assetId: layer.assetId,
    width: layer.width,
    height: layer.height,
  };
}

function copyComposition(composition: GraphicComposition): GraphicComposition {
  return {
    id: composition.id,
    name: composition.name,
    layers: composition.layers.map(copyLayer),
    fields: composition.fields.map((field) => ({
      id: field.id,
      label: field.label,
      defaultValue: field.defaultValue,
    })),
    keyframes: composition.keyframes.map((keyframe) => ({
      id: keyframe.id,
      targetLayerId: keyframe.targetLayerId,
      property: keyframe.property,
      frame: keyframe.frame,
      value: keyframe.value,
      interpolation: keyframe.interpolation,
    })),
  };
}

function copyProjectDocument(project: ProjectDocument): ProjectDocument {
  return {
    schemaVersion: project.schemaVersion,
    id: project.id,
    name: project.name,
    frameRate: project.frameRate,
    assets: project.assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      relativePath: asset.relativePath,
    })),
    compositions: project.compositions.map(copyComposition),
  };
}

export function serializeProject(project: ProjectDocument): string {
  const validation = validateProjectDocument(project);
  if (!validation.success) throw projectError(validation.issues);

  try {
    return JSON.stringify(copyProjectDocument(validation.data), null, 2);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown serialization error.";
    throw new ProjectDocumentError(`Could not serialize project document: ${message}`);
  }
}

export function deserializeProject(serialized: string): ProjectDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new ProjectDocumentError("Project file contains invalid JSON.");
  }

  const validation = validateProjectDocument(parsed);
  if (!validation.success) throw projectError(validation.issues);
  return copyProjectDocument(validation.data);
}
