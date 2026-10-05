import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CountSheetItem, DetectedInstrument } from '@/types/surgical';
import { ClipboardList, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CountSheetProps {
  items: CountSheetItem[];
  highlightedInstrument: string | null;
  activeInstruments: DetectedInstrument[];
  onUpdateCount?: (itemId: string, delta: number) => void;
}

export function CountSheet({ items, highlightedInstrument, activeInstruments, onUpdateCount }: CountSheetProps) {
  const totalRequired = items.reduce((sum, item) => sum + item.required, 0);
  const totalCurrent = items.reduce((sum, item) => sum + item.current, 0);
  const isComplete = items.every(item => item.current >= item.required);

  // Get map of active instrument names to their rank and status (correct and uncertain ones)
  const activeInstrumentData = useMemo(() => {
    const data = new Map<string, { rank: number; status: 'correct' | 'uncertain' }>();
    activeInstruments
      .filter((i): i is DetectedInstrument & { status: 'correct' | 'uncertain' } => 
        i.status === 'correct' || i.status === 'uncertain'
      )
      .forEach(i => {
        const existing = data.get(i.name);
        // Keep the lowest rank (first detected) for each instrument name
        if (existing === undefined || i.rank < existing.rank) {
          data.set(i.name, { rank: i.rank, status: i.status });
        }
      });
    return data;
  }, [activeInstruments]);

  // Sort items: active by rank order at top (correct first, then uncertain), then inactive, completed at bottom (in original order)
  const sortedItems = useMemo(() => {
    // Create a map of original indices for preserving order of completed items
    const originalIndexMap = new Map(items.map((item, index) => [item.id, index]));
    
    return [...items].sort((a, b) => {
      const aComplete = a.current >= a.required;
      const bComplete = b.current >= b.required;
      const aData = activeInstrumentData.get(a.name);
      const bData = activeInstrumentData.get(b.name);
      const aActive = aData !== undefined;
      const bActive = bData !== undefined;

      // Completed items go to bottom
      if (aComplete && !bComplete) return 1;
      if (!aComplete && bComplete) return -1;

      // Among completed items, maintain original count sheet order
      if (aComplete && bComplete) {
        return originalIndexMap.get(a.id)! - originalIndexMap.get(b.id)!;
      }

      // Active items go to top (among non-completed)
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // Among active items, sort by status (correct before uncertain) then by rank
      if (aActive && bActive) {
        // Correct items come before uncertain items
        if (aData!.status === 'correct' && bData!.status === 'uncertain') return -1;
        if (aData!.status === 'uncertain' && bData!.status === 'correct') return 1;
        // Same status, sort by rank (lower rank first)
        return aData!.rank - bData!.rank;
      }

      return 0;
    });
  }, [items, activeInstrumentData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-muted-foreground" />
        <h2 className="panel-header mb-0">Count Sheet</h2>
      </div>
      
      {/* Summary Card */}
      <div className={`mb-4 p-3 rounded-lg border ${
        isComplete 
          ? 'bg-success/5 border-success/20' 
          : 'bg-muted border-border'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`font-bold ${isComplete ? 'text-success' : ''}`}>
              {totalCurrent} / {totalRequired}
            </span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-success rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalCurrent / totalRequired) * 100, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedItems.map((item) => {
          const activeData = activeInstrumentData.get(item.name);
          const isActive = activeData !== undefined;
          const isUncertain = activeData?.status === 'uncertain';
          const isItemComplete = item.current >= item.required;
          
          return (
            <motion.div
              key={item.id}
              layout
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isItemComplete 
                  ? 'bg-muted/30 border-border opacity-50' 
                  : isActive 
                    ? isUncertain
                      ? 'bg-warning/10 border-warning/30 border-l-4 border-l-warning'
                      : 'bg-success/10 border-success/30 border-l-4 border-l-success' 
                    : 'bg-card border-border hover:bg-muted/50'
              }`}
            >
              {/* Instrument name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isItemComplete && (
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`font-medium text-sm truncate ${isItemComplete ? 'text-muted-foreground' : ''}`}>
                  {item.name}
                </span>
              </div>
              
              {/* Increment/Decrement control */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateCount?.(item.id, -1)}
                  disabled={item.current <= 0 || isActive}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <motion.div
                  key={item.current}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`min-w-[3.5rem] text-center font-mono text-sm font-semibold ${
                    isItemComplete 
                      ? 'text-muted-foreground' 
                      : isActive 
                        ? isUncertain
                          ? 'text-warning'
                          : 'text-success' 
                        : ''
                  }`}
                >
                  {item.current}/{item.required}
                </motion.div>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateCount?.(item.id, 1)}
                  disabled={isActive || isItemComplete}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}