export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedInstrument {
  id: string;
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
  rank: number;
  status: 'correct' | 'incorrect' | 'uncertain';
  lastSeen: number;
  isOccluded: boolean;
}

export interface CountSheetItem {
  id: string;
  name: string;
  required: number;
  current: number;
}

export interface InferenceResult {
  instrumentName: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
