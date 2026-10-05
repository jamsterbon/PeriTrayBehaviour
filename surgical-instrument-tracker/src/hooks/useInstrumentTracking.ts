import { useState, useCallback } from 'react';
import { DetectedInstrument, CountSheetItem, InferenceResult } from '@/types/surgical';

const INITIAL_COUNT_SHEET: CountSheetItem[] = [
  { id: '1', name: 'Scalpel #10', required: 2, current: 0 },
  { id: '2', name: 'Forceps', required: 3, current: 0 },
  { id: '3', name: 'Scissors', required: 2, current: 0 },
  { id: '4', name: 'Hemostats', required: 4, current: 0 },
  { id: '5', name: 'Retractor', required: 2, current: 0 },
  { id: '6', name: 'Needle Holder', required: 2, current: 0 },
  { id: '7', name: 'Suture Kit', required: 1, current: 0 },
];

const INSTRUMENT_NAMES = [
  'Scalpel #10',
  'Forceps',
  'Scissors',
  'Hemostats',
  'Retractor',
  'Needle Holder',
  'Suture Kit',
  'Unknown Tool',
  'Sponge',
  'Clamp',
];

const CONFIDENCE_HIGH_THRESHOLD = 0.85;
const CONFIDENCE_LOW_THRESHOLD = 0.65;
const OVERLAP_THRESHOLD = 0.9;

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function calculateOverlap(box1: { x: number; y: number; width: number; height: number }, box2: { x: number; y: number; width: number; height: number }): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  if (x2 < x1 || y2 < y1) return 0;

  const intersection = (x2 - x1) * (y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;

  return intersection / union;
}

export function useInstrumentTracking() {
  const [activeInstruments, setActiveInstruments] = useState<DetectedInstrument[]>([]);
  const [countSheet, setCountSheet] = useState<CountSheetItem[]>(INITIAL_COUNT_SHEET);
  const [lowConfidenceMode, setLowConfidenceMode] = useState(false);
  const [handBlockActive, setHandBlockActive] = useState(false);
  const [highlightedInstrument, setHighlightedInstrument] = useState<string | null>(null);

  const simulateInference = useCallback((clickX: number, clickY: number, matWidth: number, matHeight: number): InferenceResult => {
    const randomInstrument = INSTRUMENT_NAMES[Math.floor(Math.random() * INSTRUMENT_NAMES.length)];
    const confidence = lowConfidenceMode 
      ? 0.5 + Math.random() * 0.4 // 50-90% in low confidence mode
      : 0.8 + Math.random() * 0.2; // 80-100% in normal mode
    
    const boxWidth = 60 + Math.random() * 40;
    const boxHeight = 40 + Math.random() * 30;
    
    // Center the box around the click point
    const x = Math.max(0, Math.min(clickX - boxWidth / 2, matWidth - boxWidth));
    const y = Math.max(0, Math.min(clickY - boxHeight / 2, matHeight - boxHeight));

    return {
      instrumentName: randomInstrument,
      confidence,
      x,
      y,
      width: boxWidth,
      height: boxHeight,
    };
  }, [lowConfidenceMode]);

  const processDetection = useCallback((inference: InferenceResult) => {
    // Confidence filter - reject below low threshold
    if (inference.confidence < CONFIDENCE_LOW_THRESHOLD) {
      console.log(`Ignored: ${inference.instrumentName} (confidence: ${(inference.confidence * 100).toFixed(1)}%)`);
      return null;
    }

    const boundingBox = {
      x: inference.x,
      y: inference.y,
      width: inference.width,
      height: inference.height,
    };

    // Check for overlap with existing instruments
    const now = Date.now();
    let matchedIndex = -1;

    for (let i = 0; i < activeInstruments.length; i++) {
      const overlap = calculateOverlap(boundingBox, activeInstruments[i].boundingBox);
      if (overlap > OVERLAP_THRESHOLD) {
        matchedIndex = i;
        break;
      }
    }

    // Check if instrument is in count sheet
    const isInCountSheet = countSheet.some(item => item.name === inference.instrumentName);
    
    // Determine status based on confidence and count sheet match
    let status: 'correct' | 'incorrect' | 'uncertain';
    if (!isInCountSheet) {
      status = 'incorrect';
    } else if (inference.confidence >= CONFIDENCE_HIGH_THRESHOLD) {
      status = 'correct';
    } else {
      // Between low and high threshold, and matches count sheet = uncertain
      status = 'uncertain';
    }

    if (matchedIndex >= 0) {
      // Update existing instrument
      setActiveInstruments(prev => {
        const updated = [...prev];
        updated[matchedIndex] = {
          ...updated[matchedIndex],
          lastSeen: now,
          name: inference.instrumentName,
          confidence: inference.confidence,
          status,
        };
        return updated;
      });
      setHighlightedInstrument(inference.instrumentName);
    } else {
      // Calculate next rank based on highest current rank + 1
      const maxRank = activeInstruments.length > 0 
        ? Math.max(...activeInstruments.map(i => i.rank)) 
        : 0;
      
      // Add new instrument with next rank
      const newInstrument: DetectedInstrument = {
        id: generateId(),
        name: inference.instrumentName,
        confidence: inference.confidence,
        boundingBox,
        rank: maxRank + 1,
        status,
        lastSeen: now,
        isOccluded: false,
      };

      setActiveInstruments(prev => [...prev, newInstrument]);
      setHighlightedInstrument(inference.instrumentName);
    }

    return status;
  }, [activeInstruments, countSheet]);

  const handleMatClick = useCallback((clickX: number, clickY: number, matWidth: number, matHeight: number) => {
    const inference = simulateInference(clickX, clickY, matWidth, matHeight);
    return processDetection(inference);
  }, [simulateInference, processDetection]);

  const removeInstrument = useCallback((instrumentId: string) => {
    const instrument = activeInstruments.find(i => i.id === instrumentId);
    if (!instrument) return;

    // Simulate blue mat detection (always detected when instrument is removed)
    const blueMatDetected = true;

    if (blueMatDetected) {
      if (instrument.status === 'correct') {
        // Increment count sheet
        setCountSheet(prev => prev.map(item => 
          item.name === instrument.name 
            ? { ...item, current: item.current + 1 }
            : item
        ));
      }
      // Remove from active list and re-sequence ranks
      setActiveInstruments(prev => {
        const removedRank = instrument.rank;
        return prev
          .filter(i => i.id !== instrumentId)
          .map(i => ({
            ...i,
            // Decrement rank for items that were after the removed one
            rank: i.rank > removedRank ? i.rank - 1 : i.rank
          }));
      });
    }
  }, [activeInstruments]);

  const toggleHandBlock = useCallback(() => {
    setHandBlockActive(prev => !prev);
    if (!handBlockActive) {
      // When activating, mark all instruments as potentially occluded
      setActiveInstruments(prev => prev.map(i => ({ ...i, isOccluded: true })));
    } else {
      // When deactivating, reset occlusion state
      setActiveInstruments(prev => prev.map(i => ({ ...i, isOccluded: false })));
    }
  }, [handBlockActive]);

  const resetSimulation = useCallback(() => {
    setActiveInstruments([]);
    setCountSheet(INITIAL_COUNT_SHEET);
    setHighlightedInstrument(null);
    setHandBlockActive(false);
    setLowConfidenceMode(false);
  }, []);

  const updateCountSheetItem = useCallback((itemId: string, delta: number) => {
    setCountSheet(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, current: Math.max(0, item.current + delta) }
        : item
    ));
  }, []);

  const confirmInstrument = useCallback((instrumentId: string) => {
    setActiveInstruments(prev => prev.map(i => 
      i.id === instrumentId && i.status === 'uncertain'
        ? { ...i, status: 'correct' as const }
        : i
    ));
  }, []);

  return {
    activeInstruments,
    countSheet,
    lowConfidenceMode,
    setLowConfidenceMode,
    handBlockActive,
    toggleHandBlock,
    highlightedInstrument,
    handleMatClick,
    removeInstrument,
    confirmInstrument,
    resetSimulation,
    updateCountSheetItem,
  };
}
