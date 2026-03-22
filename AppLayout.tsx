import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useListMissions } from "@workspace/api-client-react";
import { Satellite, Rocket, History, Activity, AlertTriangle, CheckCircle2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: missions, isLoading } = useListMissions();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Decorative scanline effect */}
      <div className="pointer-events-none fixed inset-0 z-50 h-32 w-full bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-50 animate-scanline" />

      {/* Sidebar */}
      <aside className="w-80 border-r border-border/50 bg-card/50 backdrop-blur-md flex flex-col z-10">
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:box-glow transition-all duration-300">
              <Satellite className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider text-white">ORION</h1>
              <p className="font-mono text-xs text-primary/80 uppercase tracking-widest text-glow">Mission Control</p>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "outline"} 
              className={`w-full justify-start font-mono uppercase tracking-wider ${location === "/" ? "box-glow" : "border-white/10 hover:border-primary/50"}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Mission Plan
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-2 flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <History className="h-3 w-3" />
            <span>Mission Logs</span>
          </div>
          
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 pb-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                    <Skeleton className="h-4 w-3/4 mb-2 bg-muted/50" />
                    <Skeleton className="h-3 w-1/2 bg-muted/50" />
                  </div>
                ))
              ) : missions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-mono text-xs">
                  NO MISSIONS LOGGED
                </div>
              ) : (
                missions?.map((mission) => (
                  <Link key={mission.id} href={`/mission/${mission.id}`}>
                    <div className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 group hover-elevate active-elevate-2 ${
                      location === `/mission/${mission.id}` 
                        ? 'border-primary/50 bg-primary/10 box-glow' 
                        : 'border-border/50 bg-card hover:border-primary/30'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-sm text-white font-medium truncate pr-2 group-hover:text-primary transition-colors">
                          {mission.missionName || `M-${mission.id.toString().padStart(4, '0')}`}
                        </span>
                        {mission.feasible ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span>{mission.destination}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{mission.estimatedDurationDays}d</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="p-4 border-t border-border/50 bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Top gradient glow */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 min-h-full p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
