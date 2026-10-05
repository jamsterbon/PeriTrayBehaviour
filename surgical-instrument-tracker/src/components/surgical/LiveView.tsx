import { motion, AnimatePresence } from 'framer-motion';
import { DetectedInstrument } from '@/types/surgical';
import { Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveViewProps {
  instruments: DetectedInstrument[];
  onRemoveInstrument: (id: string) => void;
  onConfirmInstrument: (id: string) => void;
}

export function LiveView({ instruments, onRemoveInstrument, onConfirmInstrument }: LiveViewProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h2 className="panel-header mb-0">Live View</h2>
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {instruments.length} items
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {instruments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-32 text-muted-foreground text-sm"
            >
              No instruments detected
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {instruments.map((instrument) => (
                <motion.div
                  key={instrument.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 30,
                    layout: { duration: 0.3 }
                  }}
                  style={{ aspectRatio: '1 / 0.8' }}
                  className={`relative p-3 rounded-lg border-l-4 bg-card shadow-sm flex flex-col justify-between ${
                    instrument.status === 'correct' 
                      ? 'border-l-success' 
                      : instrument.status === 'uncertain'
                        ? 'border-l-warning'
                        : 'border-l-error'
                  }`}
                >
                  {/* Top section: Rank badge + name */}
                  <div>
                    <span 
                      className={`absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${
                        instrument.status === 'correct' 
                          ? 'bg-success text-success-foreground' 
                          : instrument.status === 'uncertain'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-error text-error-foreground'
                      }`}
                    >
                      {instrument.rank}
                    </span>
                    
                    {/* Instrument name */}
                    <span className="font-medium text-sm text-card-foreground leading-tight pr-6">
                      {instrument.name}
                    </span>
                  </div>
                  
                  {/* Bottom section: Details + button */}
                  <div className="mt-auto">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(instrument.lastSeen)}
                      </div>
                      <span className="font-mono">
                        {(instrument.confidence * 100).toFixed(1)}%
                      </span>
                      <span 
                        className={`block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase w-fit ${
                          instrument.status === 'correct'
                            ? 'bg-success/10 text-success'
                            : instrument.status === 'uncertain'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-error/10 text-error'
                        }`}
                      >
                        {instrument.status}
                      </span>
                    </div>
                    
                    {/* Action buttons based on status */}
                    {instrument.status === 'incorrect' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveInstrument(instrument.id)}
                        className="mt-2 h-7 px-2 text-xs text-error border-error/30 hover:text-error-foreground hover:bg-error w-full"
                      >
                        Remove
                      </Button>
                    ) : instrument.status === 'uncertain' ? (
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onConfirmInstrument(instrument.id)}
                          className="h-7 px-2 text-xs text-warning border-warning/30 hover:text-warning-foreground hover:bg-warning flex-1"
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveInstrument(instrument.id)}
                          className="h-7 px-2 text-xs text-error border-error/30 hover:text-error-foreground hover:bg-error flex-1"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2 h-7" />
                    )}
                  </div>

                  {instrument.isOccluded && (
                    <div className="absolute top-2 left-2 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      OCCLUDED
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
