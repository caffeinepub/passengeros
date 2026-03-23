import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ExternalLink, Phone, Scale } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DisruptionType } from "../backend";
import { useTravelRightsInfo } from "../hooks/useQueries";

const disruptionTabs: { id: DisruptionType; label: string }[] = [
  { id: DisruptionType.delay, label: "Delay" },
  { id: DisruptionType.cancellation, label: "Cancellation" },
  { id: DisruptionType.overbooking, label: "Denied Boarding" },
  { id: DisruptionType.missedConnection, label: "Missed Connection" },
];

function RightsContent({ disruptionType }: { disruptionType: DisruptionType }) {
  const { data: rights, isLoading } = useTravelRightsInfo(disruptionType);

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!rights) {
    return (
      <div className="py-8 text-center">
        <Scale className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No rights info available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div
        className="rounded-2xl p-4"
        style={{
          background: "oklch(var(--primary) / 0.1)",
          border: "1px solid oklch(var(--primary) / 0.25)",
        }}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Potential Compensation
        </p>
        <p className="font-display font-black text-4xl text-primary">
          €{rights.compensationAmount.toString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Under {rights.applicableRegulation}
        </p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Your Rights
        </p>
        <div className="space-y-2">
          {rights.keyRights.map((right) => (
            <div
              key={right}
              className="flex items-start gap-3 p-3 rounded-xl glass-card"
            >
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{right}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Steps to Take
        </p>
        <div className="space-y-2">
          {rights.actionSteps.map((step) => (
            <div
              key={step}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: "oklch(var(--muted) / 0.3)",
                border: "1px solid oklch(var(--border) / 0.4)",
              }}
            >
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        data-ocid="rights.contact.button"
        className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={() => toast.success("Connecting to airline support...")}
      >
        <Phone className="w-4 h-4" />
        Contact Airline Support
        <ExternalLink className="w-3.5 h-3.5 ml-auto" />
      </Button>
    </div>
  );
}

export default function RightsScreen() {
  const [activeType, setActiveType] = useState<DisruptionType>(
    DisruptionType.delay,
  );

  return (
    <div className="min-h-full px-4 pt-6 pb-4">
      <div className="mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          EU261 · US DOT
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Know Your Rights
        </h1>
      </div>

      <Tabs
        value={activeType}
        onValueChange={(v) => setActiveType(v as DisruptionType)}
        data-ocid="rights.disruption.tab"
      >
        <TabsList className="w-full grid grid-cols-2 gap-1 bg-muted/40 p-1 rounded-xl h-auto mb-1">
          {disruptionTabs.slice(0, 2).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="w-full grid grid-cols-2 gap-1 bg-muted/40 p-1 rounded-xl h-auto">
          {disruptionTabs.slice(2).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {disruptionTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <RightsContent disruptionType={tab.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
