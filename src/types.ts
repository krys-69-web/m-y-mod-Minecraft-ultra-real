export interface BlockData {
  id: string;
  name: string;
  category: 'blocks' | 'items' | 'environment' | 'ui';
  description: string;
  resolution: string;
  hasNormal: boolean;
  hasMER: boolean;
  hasTextureSet: boolean;
  textures: {
    diffuse: string;
    normal?: string;
    mer?: string;
    top?: string;
    bottom?: string;
    side?: string;
  };
}

export interface PackMetadata {
  name: string;
  version: string;
  headerUUID: string;
  moduleUUID: string;
  minEngineVersion: string;
  targetPlatform: string;
  fileCount: number;
  packSizeKB: number;
}

export interface AddonFeature {
  id: string;
  name: string;
  type: 'item' | 'block';
  identifier: string;
  description: string;
  recipe: string;
  icon: string;
  specialEffect: string;
}
