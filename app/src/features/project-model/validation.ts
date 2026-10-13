import { SUPPORTED_FRAME_RATES } from "./types";
import type {
  AnimationProperty,
  KeyframeInterpolation,
  ProjectDocument,
  TextAlignment,
  VectorShapeKind,
} from "./types";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ProjectValidationResult =
  | { success: true; data: ProjectDocument }
  | { success: false; issues: ValidationIssue[] };

const ANIMATION_PROPERTIES: readonly AnimationProperty[] = [
  "transform.x",
  "transform.y",
  "transform.rotation",
  "transform.scaleX",
  "transform.scaleY",
  "opacity",
];
const INTERPOLATIONS: readonly KeyframeInterpolation[] = ["linear", "ease-in", "ease-out"];
const TEXT_ALIGNMENTS: readonly TextAlignment[] = ["left", "center", "right"];
const SHAPE_KINDS: readonly VectorShapeKind[] = ["rectangle", "ellipse", "line", "path"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasSafeRelativePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.includes("\\")) return false;
  if (value.startsWith("/") || /^[a-z]:/i.test(value)) return false;

  const segments = value.split("/");
  return segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

export function validateProjectDocument(input: unknown): ProjectValidationResult {
  const issues: ValidationIssue[] = [];
  const usedIds = new Set<string>();
  const assetIds = new Set<string>();

  const addIssue = (path: string, message: string) => issues.push({ path, message });

  const validateId = (value: unknown, path: string): value is string => {
    if (!isNonEmptyString(value)) {
      addIssue(path, "ID must be a non-empty string.");
      return false;
    }
    if (usedIds.has(value)) {
      addIssue(path, `ID '${value}' is already used elsewhere in this project.`);
      return false;
    }
    usedIds.add(value);
    return true;
  };

  const validateTransform = (value: unknown, path: string) => {
    if (!isRecord(value)) {
      addIssue(path, "Transform must be an object.");
      return;
    }
    for (const property of ["x", "y", "rotation", "scaleX", "scaleY"] as const) {
      if (!isFiniteNumber(value[property])) {
        addIssue(`${path}.${property}`, "Value must be a finite number.");
      }
    }
  };

  const validateLayer = (
    value: unknown,
    path: string,
    fieldIds: Set<string>,
    layerIds: Set<string>,
    activeObjects: WeakSet<object>,
  ) => {
    if (!isRecord(value)) {
      addIssue(path, "Layer must be an object.");
      return;
    }
    if (activeObjects.has(value)) {
      addIssue(path, "Layer hierarchy cannot contain a cycle.");
      return;
    }
    activeObjects.add(value);

    const idValid = validateId(value.id, `${path}.id`);
    if (idValid) layerIds.add(value.id as string);
    if (!isNonEmptyString(value.name)) addIssue(`${path}.name`, "Layer name must be a non-empty string.");
    if (typeof value.visible !== "boolean") addIssue(`${path}.visible`, "Value must be a boolean.");
    if (typeof value.locked !== "boolean") addIssue(`${path}.locked`, "Value must be a boolean.");
    if (!isFiniteNumber(value.opacity) || value.opacity < 0 || value.opacity > 1) {
      addIssue(`${path}.opacity`, "Opacity must be a finite number between 0 and 1.");
    }
    validateTransform(value.transform, `${path}.transform`);

    if (value.type === "group") {
      if (!Array.isArray(value.children)) {
        addIssue(`${path}.children`, "Group children must be an array.");
      } else {
        value.children.forEach((child, index) =>
          validateLayer(child, `${path}.children[${index}]`, fieldIds, layerIds, activeObjects),
        );
      }
    } else if (value.type === "text") {
      if (!isNonEmptyString(value.fieldId)) {
        addIssue(`${path}.fieldId`, "Text layer must reference a field ID.");
      } else if (!fieldIds.has(value.fieldId)) {
        addIssue(`${path}.fieldId`, `Text layer refers to unknown field '${value.fieldId}'.`);
      }
      if (!isRecord(value.style)) {
        addIssue(`${path}.style`, "Text style must be an object.");
      } else {
        if (!isNonEmptyString(value.style.fontFamily)) addIssue(`${path}.style.fontFamily`, "Font family must be a non-empty string.");
        if (!isFiniteNumber(value.style.fontSize) || value.style.fontSize <= 0) {
          addIssue(`${path}.style.fontSize`, "Font size must be a positive finite number.");
        }
        if (!Number.isInteger(value.style.fontWeight) || Number(value.style.fontWeight) < 100 || Number(value.style.fontWeight) > 900) {
          addIssue(`${path}.style.fontWeight`, "Font weight must be an integer between 100 and 900.");
        }
        if (!isNonEmptyString(value.style.color)) addIssue(`${path}.style.color`, "Text color must be a non-empty string.");
        if (!TEXT_ALIGNMENTS.includes(value.style.alignment as TextAlignment)) {
          addIssue(`${path}.style.alignment`, "Text alignment must be left, center or right.");
        }
      }
    } else if (value.type === "shape") {
      if (!isRecord(value.shape)) {
        addIssue(`${path}.shape`, "Shape geometry and style must be an object.");
      } else {
        if (!SHAPE_KINDS.includes(value.shape.kind as VectorShapeKind)) {
          addIssue(`${path}.shape.kind`, "Shape kind must be rectangle, ellipse, line or path.");
        }
        for (const dimension of ["width", "height"] as const) {
          if (!isFiniteNumber(value.shape[dimension]) || value.shape[dimension] <= 0) {
            addIssue(`${path}.shape.${dimension}`, "Shape dimensions must be positive finite numbers.");
          }
        }
        if (value.shape.kind === "path" && !isNonEmptyString(value.shape.pathData)) {
          addIssue(`${path}.shape.pathData`, "Path shapes require path data.");
        }
        if (value.shape.kind !== "path" && value.shape.pathData !== undefined) {
          addIssue(`${path}.shape.pathData`, "Only path shapes can include path data.");
        }
        if (value.shape.fill !== null && !isNonEmptyString(value.shape.fill)) {
          addIssue(`${path}.shape.fill`, "Fill must be a non-empty string or null.");
        }
        if (value.shape.stroke !== null && !isNonEmptyString(value.shape.stroke)) {
          addIssue(`${path}.shape.stroke`, "Stroke must be a non-empty string or null.");
        }
        if (!isFiniteNumber(value.shape.strokeWidth) || value.shape.strokeWidth < 0) {
          addIssue(`${path}.shape.strokeWidth`, "Stroke width must be a non-negative finite number.");
        }
      }
    } else if (value.type === "image") {
      if (!isNonEmptyString(value.assetId)) {
        addIssue(`${path}.assetId`, "Image layer must reference an asset ID.");
      } else if (!assetIds.has(value.assetId)) {
        addIssue(`${path}.assetId`, `Image layer refers to unknown asset '${value.assetId}'.`);
      }
      for (const dimension of ["width", "height"] as const) {
        if (!isFiniteNumber(value[dimension]) || value[dimension] <= 0) {
          addIssue(`${path}.${dimension}`, "Image dimensions must be positive finite numbers.");
        }
      }
    } else {
      addIssue(`${path}.type`, "Layer type must be group, text, shape or image.");
    }

    activeObjects.delete(value);
  };

  if (!isRecord(input)) {
    return { success: false, issues: [{ path: "$", message: "Project document must be an object." }] };
  }

  if (input.schemaVersion !== 1) addIssue("schemaVersion", "Unsupported project schema version.");
  validateId(input.id, "id");
  if (!isNonEmptyString(input.name)) addIssue("name", "Project name must be a non-empty string.");
  if (!SUPPORTED_FRAME_RATES.includes(input.frameRate as (typeof SUPPORTED_FRAME_RATES)[number])) {
    addIssue("frameRate", "Frame rate must be one of 25, 29.97, 30, 50, 59.94 or 60 fps.");
  }

  if (!Array.isArray(input.assets)) {
    addIssue("assets", "Assets must be an array.");
  } else {
    input.assets.forEach((asset, index) => {
      const path = `assets[${index}]`;
      if (!isRecord(asset)) {
        addIssue(path, "Asset must be an object.");
        return;
      }
      if (validateId(asset.id, `${path}.id`)) assetIds.add(asset.id as string);
      if (asset.type !== "image") addIssue(`${path}.type`, "Asset type must be image.");
      if (!hasSafeRelativePath(asset.relativePath)) {
        addIssue(`${path}.relativePath`, "Asset path must stay inside the project folder and use forward slashes.");
      }
    });
  }

  if (!Array.isArray(input.compositions)) {
    addIssue("compositions", "Compositions must be an array.");
  } else {
    input.compositions.forEach((composition, compositionIndex) => {
      const path = `compositions[${compositionIndex}]`;
      if (!isRecord(composition)) {
        addIssue(path, "Composition must be an object.");
        return;
      }
      validateId(composition.id, `${path}.id`);
      if (!isNonEmptyString(composition.name)) addIssue(`${path}.name`, "Composition name must be a non-empty string.");

      const fieldIds = new Set<string>();
      if (!Array.isArray(composition.fields)) {
        addIssue(`${path}.fields`, "Fields must be an array.");
      } else {
        composition.fields.forEach((field, fieldIndex) => {
          const fieldPath = `${path}.fields[${fieldIndex}]`;
          if (!isRecord(field)) {
            addIssue(fieldPath, "Field definition must be an object.");
            return;
          }
          if (validateId(field.id, `${fieldPath}.id`)) fieldIds.add(field.id as string);
          if (!isNonEmptyString(field.label)) addIssue(`${fieldPath}.label`, "Field label must be a non-empty string.");
          if (typeof field.defaultValue !== "string") addIssue(`${fieldPath}.defaultValue`, "Default value must be a string.");
        });
      }

      const layerIds = new Set<string>();
      if (!Array.isArray(composition.layers)) {
        addIssue(`${path}.layers`, "Layers must be an array.");
      } else {
        const activeObjects = new WeakSet<object>();
        composition.layers.forEach((layer, layerIndex) =>
          validateLayer(layer, `${path}.layers[${layerIndex}]`, fieldIds, layerIds, activeObjects),
        );
      }

      if (!Array.isArray(composition.keyframes)) {
        addIssue(`${path}.keyframes`, "Keyframes must be an array.");
      } else {
        const trackFrames = new Set<string>();
        composition.keyframes.forEach((keyframe, keyframeIndex) => {
          const keyframePath = `${path}.keyframes[${keyframeIndex}]`;
          if (!isRecord(keyframe)) {
            addIssue(keyframePath, "Keyframe must be an object.");
            return;
          }
          validateId(keyframe.id, `${keyframePath}.id`);
          if (!isNonEmptyString(keyframe.targetLayerId) || !layerIds.has(keyframe.targetLayerId)) {
            addIssue(`${keyframePath}.targetLayerId`, "Keyframe must target a layer in this composition.");
          }
          if (!ANIMATION_PROPERTIES.includes(keyframe.property as AnimationProperty)) {
            addIssue(`${keyframePath}.property`, "Keyframe property is not supported.");
          }
          if (!Number.isInteger(keyframe.frame) || Number(keyframe.frame) < 0) {
            addIssue(`${keyframePath}.frame`, "Keyframe frame must be a non-negative integer.");
          }
          if (!isFiniteNumber(keyframe.value)) addIssue(`${keyframePath}.value`, "Keyframe value must be a finite number.");
          if (keyframe.property === "opacity" && isFiniteNumber(keyframe.value) && (keyframe.value < 0 || keyframe.value > 1)) {
            addIssue(`${keyframePath}.value`, "Opacity keyframe values must be between 0 and 1.");
          }
          if (!INTERPOLATIONS.includes(keyframe.interpolation as KeyframeInterpolation)) {
            addIssue(`${keyframePath}.interpolation`, "Interpolation must be linear, ease-in or ease-out.");
          }
          if (isNonEmptyString(keyframe.targetLayerId) && Number.isInteger(keyframe.frame) && isNonEmptyString(keyframe.property)) {
            const trackFrame = `${keyframe.targetLayerId}:${keyframe.property}:${keyframe.frame}`;
            if (trackFrames.has(trackFrame)) {
              addIssue(keyframePath, "A layer property can have only one keyframe at each frame.");
            }
            trackFrames.add(trackFrame);
          }
        });
      }
    });
  }

  if (issues.length > 0) return { success: false, issues };
  return { success: true, data: input as unknown as ProjectDocument };
}
