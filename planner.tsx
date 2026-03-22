import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePlanMission, MissionRequestDestination } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Rocket, Target, Weight, DollarSign, Cpu, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Zod schema matching the MissionRequest API
const planSchema = z.object({
  destination: z.nativeEnum(MissionRequestDestination),
  payloadWeight: z.coerce.number().min(100).max(100000),
  budget: z.coerce.number().min(10).max(50000),
  missionName: z.string().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

const DESTINATIONS = [
  { id: MissionRequestDestination.Moon, label: "LUNAR SURFACE", dist: "384,400 km", img: "planet-moon.png" },
  { id: MissionRequestDestination.Mars, label: "MARS COLONY", dist: "225M km", img: "planet-mars.png" },
  { id: MissionRequestDestination.Asteroid, label: "ASTEROID BELT", dist: "450M km", img: "planet-asteroid.png" },
];

export default function Planner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const planMutation = usePlanMission();
  
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      destination: MissionRequestDestination.Moon,
      payloadWeight: 5000,
      budget: 500,
      missionName: "",
    },
  });

  const onSubmit = (data: PlanFormValues) => {
    planMutation.mutate({ data }, {
      onSuccess: (result) => {
        toast({
          title: "Mission Planned Successfully",
          description: "AI simulation complete. Initializing dashboard...",
        });
        setLocation(`/mission/${result.id}`);
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Planning Failed",
          description: err.message || "Failed to generate mission parameters.",
        });
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-display text-white mb-2">Initialize Mission</h1>
        <p className="text-muted-foreground font-mono">Configure payload parameters and allocate budget for AI pathfinding sequence.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="glass-panel p-8">
            <h2 className="font-display text-xl mb-6 flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              Primary Objective
            </h2>
            
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DESTINATIONS.map((dest) => (
                      <div
                        key={dest.id}
                        onClick={() => field.onChange(dest.id)}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 ${
                          field.value === dest.id 
                            ? 'border-primary bg-primary/10 box-glow' 
                            : 'border-border/50 bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="absolute top-0 right-0 p-2 z-10">
                          <div className={`w-3 h-3 rounded-full border border-black ${field.value === dest.id ? 'bg-primary' : 'bg-muted'}`} />
                        </div>
                        <div className="h-32 w-full bg-black/50 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={`${import.meta.env.BASE_URL}images/${dest.img}`} 
                            alt={dest.label}
                            className="absolute object-cover opacity-60 mix-blend-screen scale-150"
                          />
                        </div>
                        <div className="p-4 relative z-10 bg-gradient-to-t from-card to-card/80">
                          <div className="font-display font-bold tracking-wider text-sm mb-1">{dest.label}</div>
                          <div className="font-mono text-xs text-muted-foreground">Dist: {dest.dist}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-panel p-8">
               <h2 className="font-display text-xl mb-6 flex items-center gap-2 text-primary">
                <Weight className="w-5 h-5" />
                Payload Specs
              </h2>

              <FormField
                control={form.control}
                name="payloadWeight"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end mb-4">
                      <FormLabel className="font-mono text-muted-foreground uppercase tracking-widest">Total Mass</FormLabel>
                      <span className="font-mono text-2xl font-bold text-white text-glow">
                        {field.value.toLocaleString()} <span className="text-sm text-primary">KG</span>
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={100}
                        max={100000}
                        step={100}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription className="font-mono text-xs">
                      Affects required delta-v and launch vehicle selection.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="glass-panel p-8">
               <h2 className="font-display text-xl mb-6 flex items-center gap-2 text-emerald-500">
                <DollarSign className="w-5 h-5" />
                Financials
              </h2>

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end mb-4">
                      <FormLabel className="font-mono text-muted-foreground uppercase tracking-widest">Allocation</FormLabel>
                      <span className="font-mono text-2xl font-bold text-emerald-400 text-glow">
                        ${field.value.toLocaleString()} <span className="text-sm">M</span>
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={10}
                        max={50000}
                        step={10}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4 [&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-950 [&>.relative>.absolute]:bg-emerald-500"
                      />
                    </FormControl>
                    <FormDescription className="font-mono text-xs">
                      Maximum approved expenditure in millions USD.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </div>

          <Card className="glass-panel p-8 border-l-4 border-l-primary/50">
            <FormField
              control={form.control}
              name="missionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-muted-foreground uppercase tracking-widest">Designation (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. ARTEMIS-V" 
                      className="font-mono text-lg bg-black/20 border-white/10 focus-visible:ring-primary/50 h-14"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Button 
            type="submit" 
            disabled={planMutation.isPending}
            className="w-full h-16 text-lg font-display tracking-widest uppercase bg-primary hover:bg-primary/80 text-primary-foreground box-glow hover-elevate transition-all duration-300"
          >
            {planMutation.isPending ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Processing Telemetry...
              </>
            ) : (
              <>
                <Cpu className="mr-3 h-6 w-6" />
                Execute AI Planning Sequence
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
