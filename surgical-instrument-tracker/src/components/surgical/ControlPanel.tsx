import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  onReset: () => void;
}

export function ControlPanel({ onReset }: ControlPanelProps) {
  return (
    <div className="bg-sidebar text-sidebar-foreground rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-sidebar-border">
        <Sparkles className="w-4 h-4 text-sidebar-primary" />
        <h3 className="text-sm font-semibold">Simulation Controls</h3>
      </div>
      
      {/* Reset Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border-sidebar-border"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Simulation
        </Button>
      </div>
    </div>
  );
}
