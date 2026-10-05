import { useInstrumentTracking } from '@/hooks/useInstrumentTracking';
import { CameraView } from './CameraView';
import { LiveView } from './LiveView';
import { CountSheet } from './CountSheet';
import { ControlPanel } from './ControlPanel';
import { Stethoscope } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from '@/components/ui/sidebar';
export function SurgicalDashboard() {
  const {
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
    updateCountSheetItem
  } = useInstrumentTracking();
  return <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Collapsible Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarContent className="p-4">
            {/* Header - visible when expanded */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-sidebar-border group-data-[collapsible=icon]:hidden">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Assemble Tray</h1>
                <p className="text-xs text-sidebar-foreground/60">Sorting and Ordering Demo</p>
              </div>
            </div>
            
            {/* Control Panel - hidden when collapsed */}
            <div className="group-data-[collapsible=icon]:hidden">
              <ControlPanel onReset={resetSimulation} />
            </div>
            
            {/* Footer info - hidden when collapsed */}
            <div className="mt-auto pt-4 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
              <div className="text-xs text-sidebar-foreground/40 space-y-1">
                <p>Uncertain Threshold: 65-90%</p>
                <p>Certain (Correct / Correct): &lt; 90%</p>
                <p className="text-[10px] mt-2">Click mat to detect • Right-click to remove</p>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Sidebar Toggle - square icon in top corner */}
          <div className="mb-4">
            <SidebarTrigger className="h-10 w-10 p-0 flex items-center justify-center" />
          </div>
          
          <div className="grid gap-6 h-[calc(100vh-6rem)]" style={{
          gridTemplateColumns: 'calc(65% - 12px) calc(35% - 12px)'
        }}>
            {/* Left Column: Camera View + Live View stacked - 65% */}
            <div className="flex flex-col gap-6 min-w-0">
              {/* Camera View - takes remaining space */}
              <div className="flex-1 bg-card rounded-xl p-4 shadow-sm border min-h-0">
                <CameraView instruments={activeInstruments} onMatClick={handleMatClick} onRemoveInstrument={removeInstrument} handBlockActive={handBlockActive} />
              </div>
              
              {/* Live View - fixed height for 2 rows of square cards */}
              <div className="bg-card rounded-xl p-4 shadow-sm border" style={{
              height: 'calc((100% - 1.5rem) * 0.4)'
            }}>
                <LiveView instruments={activeInstruments} onRemoveInstrument={removeInstrument} onConfirmInstrument={confirmInstrument} />
              </div>
            </div>
            
            {/* Right Column: Count Sheet */}
            <div className="bg-card rounded-xl p-4 shadow-sm border">
              <CountSheet items={countSheet} highlightedInstrument={highlightedInstrument} activeInstruments={activeInstruments} onUpdateCount={updateCountSheetItem} />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>;
}