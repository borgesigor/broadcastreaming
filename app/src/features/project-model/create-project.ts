import { DEFAULT_FRAME_RATE, type FrameRate, type ProjectDocument } from "./types";

export type CreateProjectInput = {
  id: string;
  name: string;
  frameRate?: FrameRate;
};

export function createProjectDocument({
  id,
  name,
  frameRate = DEFAULT_FRAME_RATE,
}: CreateProjectInput): ProjectDocument {
  return {
    schemaVersion: 1,
    id,
    name,
    frameRate,
    assets: [],
    compositions: [],
  };
}
