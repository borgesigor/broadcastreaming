export type ProjectId = string;
export type CompositionId = string;
export type LayerId = string;
export type TextFieldId = string;
export type AssetId = string;
export type KeyframeId = string;

export type FrameRate = 25 | 29.97 | 30 | 50 | 59.94 | 60;

export const SUPPORTED_FRAME_RATES = [25, 29.97, 30, 50, 59.94, 60] as const satisfies readonly FrameRate[];
export const DEFAULT_FRAME_RATE: FrameRate = 30;

export type Transform = {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

export type LayerBase = {
  id: LayerId;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
};

export type LayerGroup = LayerBase & {
  type: "group";
  children: LayerItem[];
};

export type TextAlignment = "left" | "center" | "right";

export type TextElement = LayerBase & {
  type: "text";
  fieldId: TextFieldId;
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    alignment: TextAlignment;
  };
};

export type VectorShapeKind = "rectangle" | "ellipse" | "line" | "path";

export type VectorShapeElement = LayerBase & {
  type: "shape";
  shape: {
    kind: VectorShapeKind;
    width: number;
    height: number;
    pathData?: string;
    fill: string | null;
    stroke: string | null;
    strokeWidth: number;
  };
};

export type ImageElement = LayerBase & {
  type: "image";
  assetId: AssetId;
  width: number;
  height: number;
};

export type GraphicElement = TextElement | VectorShapeElement | ImageElement;
export type LayerItem = LayerGroup | GraphicElement;

export type TextFieldDefinition = {
  id: TextFieldId;
  label: string;
  defaultValue: string;
};

export type AnimationProperty =
  | "transform.x"
  | "transform.y"
  | "transform.rotation"
  | "transform.scaleX"
  | "transform.scaleY"
  | "opacity";

export type KeyframeInterpolation = "linear" | "ease-in" | "ease-out";

export type AnimationKeyframe = {
  id: KeyframeId;
  targetLayerId: LayerId;
  property: AnimationProperty;
  frame: number;
  value: number;
  interpolation: KeyframeInterpolation;
};

export type ProjectAsset = {
  id: AssetId;
  type: "image";
  relativePath: string;
};

export type GraphicComposition = {
  id: CompositionId;
  name: string;
  layers: LayerItem[];
  fields: TextFieldDefinition[];
  keyframes: AnimationKeyframe[];
};

export type ProjectDocument = {
  schemaVersion: 1;
  id: ProjectId;
  name: string;
  frameRate: FrameRate;
  assets: ProjectAsset[];
  compositions: GraphicComposition[];
};

/** Runtime-only live state. It is deliberately excluded from ProjectDocument persistence. */
export type LiveControlState = {
  drafts: Record<CompositionId, Record<TextFieldId, string>>;
  onAir: Record<CompositionId, OnAirComposition>;
};

export type OnAirComposition = {
  compositionId: CompositionId;
  fieldValues: Record<TextFieldId, string>;
};
