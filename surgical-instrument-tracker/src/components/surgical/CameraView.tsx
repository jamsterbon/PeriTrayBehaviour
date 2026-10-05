import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectedInstrument } from '@/types/surgical';
import { Camera, Hand } from 'lucide-react';

interface CameraViewProps {
  instruments: DetectedInstrument[];
  onMatClick: (x: number, y: number, width: number, height: number) => void;
  onRemoveInstrument: (id: string) => void;
  handBlockActive: boolean;
}

export function CameraView({ 
  instruments, 
  onMatClick, 
  onRemoveInstrument,
  handBlockActive 
}: CameraViewProps) {
  const matRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!matRef.current) return;
    
    const rect = matRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onMatClick(x, y, rect.width, rect.height);
  }, [onMatClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent, instrument: { id: string; status: string }) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow right-click removal for correct items
    if (instrument.status === 'correct') {
      onRemoveInstrument(instrument.id);
    }
  }, [onRemoveInstrument]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Camera className="w-4 h-4 text-muted-foreground" />
        <h2 className="panel-header mb-0">Camera View</h2>
      </div>
      
      {/* Fill remaining height */}
      <div className="relative flex-1 min-h-0">
        <div 
          ref={matRef}
          onClick={handleClick}
          className="absolute inset-0 surgical-mat cursor-crosshair overflow-hidden shadow-lg rounded-lg"
        >
        {/* Grid overlay for surgical mat effect */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Hand block overlay */}
        <AnimatePresence>
          {handBlockActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-secondary/40 backdrop-blur-[2px] flex items-center justify-center z-20"
            >
              <div className="flex flex-col items-center gap-2 text-primary-foreground">
                <Hand className="w-12 h-12 animate-pulse" />
                <span className="text-sm font-medium">Hand Occlusion Active</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bounding boxes */}
        <AnimatePresence>
          {instruments.map((instrument) => (
            <motion.div
              key={instrument.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`bounding-box ${
                instrument.status === 'correct' 
                  ? 'bounding-box-correct' 
                  : instrument.status === 'uncertain'
                    ? 'bounding-box-uncertain'
                    : 'bounding-box-incorrect'
              }`}
              style={{
                left: instrument.boundingBox.x,
                top: instrument.boundingBox.y,
                width: instrument.boundingBox.width,
                height: instrument.boundingBox.height,
                cursor: instrument.status === 'correct' ? 'context-menu' : 'default',
              }}
              onContextMenu={(e) => handleContextMenu(e, instrument)}
              title={instrument.status === 'correct' ? "Right-click to remove" : undefined}
            >
              {/* Rank badge */}
              <div 
                className={`rank-badge ${
                  instrument.status === 'correct' 
                    ? 'bg-success' 
                    : instrument.status === 'uncertain'
                      ? 'bg-warning'
                      : 'bg-error'
                }`}
              >
                #{instrument.rank}
              </div>
              
              {/* Instrument label */}
              <div 
                className={`absolute -bottom-6 left-0 text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${
                  instrument.status === 'correct' 
                    ? 'bg-success text-success-foreground' 
                    : instrument.status === 'uncertain'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-error text-error-foreground'
                }`}
              >
                {instrument.name}
              </div>

              {/* Confidence indicator */}
              <div className="absolute -top-2 -right-2 text-[10px] font-mono bg-secondary text-secondary-foreground px-1 rounded">
                {(instrument.confidence * 100).toFixed(0)}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Click instruction */}
        {instruments.length === 0 && !handBlockActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-primary-foreground/60 text-sm text-center">
              <p className="font-medium">Click anywhere to detect instruments</p>
              <p className="text-xs mt-1">Right-click on boxes to remove</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
