export interface BoundingBox {
  bottom: number;
  right: number;
  left: number;
  top: number;
}

export interface IgnoreBoxes extends BoundingBox {}

export interface InstanceData {
  app?: string;
  browser?: { name: string; version: string };
  deviceName?: string;
  platform: { name: string; version: string };
}

export interface MethodData {
  description: string;
  test: string;
  tag: string;
  instanceData: {
    app?: string;
    browser?: { name: string; version: string };
    deviceName?: string;
    platform: { name: string; version: string };
  };
  commandName: string;
  framework: string;
  boundingBoxes: {
    diffBoundingBoxes: BoundingBox[];
    ignoredBoxes: IgnoreBoxes[];
  };
  fileData: {
    actualFilePath: string;
    baselineFilePath: string;
    diffFilePath: string;
    fileName: string;
    size: {
      actual: { width: number; height: number };
      baseline: { width: number; height: number };
      diff?: { width: number; height: number };
    };
  };
  misMatchPercentage: string;
  rawMisMatchPercentage: number;
}

export interface TestData {
  test: string;
  data: MethodData[];
}

export interface DescriptionData {
  description: string;
  data: TestData[];
}

export interface SnapshotInstanceData {
  app?: string[];
  browser?: { name: string; version: string }[];
  deviceName?: string[];
  platform: { name: string; version: string }[];
}

export interface SnapshotData {
  descriptionData: DescriptionData[];
  instanceData: SnapshotInstanceData;
}

export type StatusFilter = "all" | "passed" | "failed";

export interface SelectedOptions {
  app: string[];
  browser: string[];
  device: string[];
  platform: string[];
  status: StatusFilter;
}
