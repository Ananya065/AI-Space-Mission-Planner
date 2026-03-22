import { useParams, Link } from "wouter";
import { useGetMission } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, DollarSign, Weight, Activity, 
  ShieldAlert, Target, Info, Flame, Navigation, Clock 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Circular Progress Component for Feasibility Score
function ScoreGauge({ score, feasible }: { score: number, feasible: boolean }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color = score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted/30"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(var(--color),0.5)]"
          style={{ '--color': color } as React.CSSProperties}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Score</span>
      </div>
    </div>
  );
}

export default function MissionDashboard() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: mission, isLoading, isError, error } = useGetMission(id, {
    query: {
      enabled: id > 0,
      retry: false
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-40 col-span-1 md:col-span-3 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !mission) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-display">Mission Data Unavailable</h2>
        <p className="text-muted-foreground font-mono">{error?.message || "Could not retrieve mission parameters."}</p>
        <Link href="/">
          <Button variant="outline" className="mt-4 font-mono">Return to Planner</Button>
        </Link>
      </div>
    );
  }

  const fuelData = [
    { name: 'Launch', value: mission.fuelEstimate.launchFuelKg, color: '#06b6d4' },
    { name: 'Transit', value: mission.fuelEstimate.transitionFuelKg, color: '#3b82f6' },
    { name: 'Landing', value: mission.fuelEstimate.landingFuelKg, color: '#8b5cf6' },
    { name: 'Return', value: mission.fuelEstimate.returnFuelKg, color: '#d946ef' },
  ].filter(d => d.value > 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Badge variant="outline" className="font-mono tracking-widest border-primary/50 text-primary bg-primary/10">
              MISSION #{mission.id.toString().padStart(4, '0')}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {new Date(mission.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-wider">
            {mission.missionName || `OP-${mission.destination.toUpperCase()}`}
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
          <ScoreGauge score={mission.feasibilityScore} feasible={mission.feasible} />
          <div>
            {mission.feasible ? (
              <div className="text-emerald-400 font-display text-xl uppercase text-glow tracking-widest mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Feasible
              </div>
            ) : (
              <div className="text-destructive font-display text-xl uppercase text-glow-destructive tracking-widest mb-1 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Critical Risk
              </div>
            )}
            <p className="font-mono text-xs text-muted-foreground max-w-[200px]">
              Based on payload mass and available budget parameters.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel p-5 border-l-2 border-l-primary flex flex-col justify-between">
          <div className="text-muted-foreground font-mono text-xs uppercase flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" /> Destination
          </div>
          <div className="font-display text-2xl text-white">{mission.destination}</div>
        </Card>
        
        <Card className="glass-panel p-5 border-l-2 border-l-amber-500 flex flex-col justify-between">
          <div className="text-muted-foreground font-mono text-xs uppercase flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" /> Duration
          </div>
          <div className="font-mono text-2xl text-white">
            {mission.estimatedDurationDays.toLocaleString()} <span className="text-sm text-muted-foreground">days</span>
          </div>
        </Card>

        <Card className={`glass-panel p-5 border-l-2 flex flex-col justify-between ${mission.estimatedCostMillions > mission.budget ? 'border-l-destructive' : 'border-l-emerald-500'}`}>
          <div className="text-muted-foreground font-mono text-xs uppercase flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4" /> Est. Cost
          </div>
          <div className={`font-mono text-2xl ${mission.estimatedCostMillions > mission.budget ? 'text-destructive text-glow-destructive' : 'text-emerald-400'}`}>
            ${mission.estimatedCostMillions.toLocaleString()} <span className="text-sm">M</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground mt-1">Budget: ${mission.budget}M</div>
        </Card>

        <Card className="glass-panel p-5 border-l-2 border-l-purple-500 flex flex-col justify-between">
          <div className="text-muted-foreground font-mono text-xs uppercase flex items-center gap-2 mb-2">
            <Weight className="w-4 h-4" /> Payload
          </div>
          <div className="font-mono text-2xl text-white">
            {mission.payloadWeight.toLocaleString()} <span className="text-sm text-muted-foreground">kg</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trajectory & Fuel */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trajectory Timeline */}
          <Card className="glass-panel overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-display text-lg flex items-center gap-2 text-primary">
                <Navigation className="w-5 h-5" /> Orbital Trajectory
              </h3>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-accent before:to-transparent">
                {mission.trajectory.map((point, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Marker */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary bg-background absolute left-0 md:left-1/2 -translate-x-1/2 group-hover:scale-125 group-hover:bg-primary transition-all duration-300 z-10 box-glow">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors ml-auto md:ml-0 group-hover:border-primary/50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="font-mono bg-black/50 text-primary border-primary/30">Day {point.day}</Badge>
                        <span className="font-display text-sm tracking-wider text-white">{point.phase}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{point.description}</p>
                      <div className="flex gap-4 font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground/60">Distance</span>
                          <span className="text-accent">{point.distanceKm.toLocaleString()} km</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground/60">Velocity</span>
                          <span className="text-accent">{point.velocityKmS} km/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Fuel Chart */}
          <Card className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg flex items-center gap-2 text-orange-400">
                <Flame className="w-5 h-5" /> Propellant Mass Distribution
              </h3>
              <div className="text-right">
                <div className="font-mono text-2xl text-white">{mission.fuelEstimate.totalFuelKg.toLocaleString()}</div>
                <div className="font-mono text-xs text-muted-foreground uppercase">Total KG ({mission.fuelEstimate.fuelType})</div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#ffffff40" tick={{ fill: '#ffffff80', fontFamily: 'monospace', fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#ffffff40" tick={{ fill: '#ffffff80', fontFamily: 'monospace', fontSize: 12 }} width={80} />
                  <RechartsTooltip 
                    cursor={{ fill: '#ffffff10' }}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', fontFamily: 'monospace', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {fuelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

        {/* Right Column: Risks & AI Recommendations */}
        <div className="space-y-8">
          
          <Card className="glass-panel p-6">
            <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-white">
              <ShieldAlert className="w-5 h-5" /> Risk Matrix
            </h3>
            <div className="space-y-4">
              {mission.risks.map((risk, idx) => {
                const colors = {
                  high: 'border-destructive/50 bg-destructive/10 text-destructive',
                  medium: 'border-amber-500/50 bg-amber-500/10 text-amber-500',
                  low: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500'
                };
                const bgColors = {
                  high: 'bg-destructive/20',
                  medium: 'bg-amber-500/20',
                  low: 'bg-emerald-500/20'
                };

                return (
                  <div key={idx} className={`p-4 rounded-xl border ${colors[risk.severity]}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display text-sm font-bold tracking-wide">{risk.factor}</h4>
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-wider border-current ${bgColors[risk.severity]}`}>
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-80 mt-2">
                      <span className="font-mono text-xs uppercase block mb-1 opacity-60">Mitigation Protocol:</span>
                      {risk.mitigation}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="glass-panel p-6 border-t-4 border-t-primary">
            <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-primary">
              <Activity className="w-5 h-5" /> AI Recommendations
            </h3>
            <ul className="space-y-4">
              {mission.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-muted-foreground bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}
