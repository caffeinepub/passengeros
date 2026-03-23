import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Plane,
  Scan,
  ShieldCheck,
  Tag,
} from "lucide-react";

interface Step {
  id: string;
  label: string;
  detail: string;
  estimatedTime: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "done" | "current" | "upcoming";
}

const steps: Step[] = [
  {
    id: "checkin",
    label: "Check-in",
    detail: "Terminal 5, Desks 10-20",
    estimatedTime: "5 min",
    icon: Tag,
    status: "done",
  },
  {
    id: "bagdrop",
    label: "Bag Drop",
    detail: "Self-service desks, Row C",
    estimatedTime: "8 min",
    icon: Tag,
    status: "done",
  },
  {
    id: "security",
    label: "Security",
    detail: "Zone A — Fast Track available",
    estimatedTime: "18 min",
    icon: ShieldCheck,
    status: "current",
  },
  {
    id: "passport",
    label: "Passport Control",
    detail: "e-Gates available",
    estimatedTime: "10 min",
    icon: Scan,
    status: "upcoming",
  },
  {
    id: "gate",
    label: "Gate B22",
    detail: "Level 3 · 12-min walk",
    estimatedTime: "Board 09:45",
    icon: Plane,
    status: "upcoming",
  },
];

export default function NavigateScreen() {
  return (
    <div className="min-h-full px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Step by step
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Airport Navigation
        </h1>
      </div>

      {steps
        .filter((s) => s.status === "current")
        .map((step) => (
          <div
            key={step.id}
            className="rounded-2xl p-4 mb-6"
            style={{
              background: "oklch(var(--primary) / 0.15)",
              border: "1px solid oklch(var(--primary) / 0.35)",
              boxShadow: "0 0 30px oklch(var(--primary) / 0.1)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs text-primary uppercase tracking-widest font-semibold">
                Current Step
              </p>
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {step.label}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step.detail}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-primary font-medium">
                ~{step.estimatedTime} wait
              </p>
            </div>
          </div>
        ))}

      <div className="relative">
        <div
          className="absolute left-5 top-3 bottom-3 w-px"
          style={{
            background:
              "linear-gradient(to bottom, oklch(var(--primary) / 0.6) 0%, oklch(var(--border) / 0.3) 60%, transparent 100%)",
          }}
        />

        <div className="space-y-0">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = step.status === "done";
            const isCurrent = step.status === "current";

            return (
              <div key={step.id} className="relative flex gap-4 pb-6">
                <div className="flex-shrink-0 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-success/20 border border-success/40"
                        : isCurrent
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted border border-border"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 rounded-xl p-3.5 ${
                    isCurrent
                      ? "opacity-100"
                      : isDone
                        ? "opacity-60"
                        : "opacity-75"
                  }`}
                  style={{
                    background: isCurrent
                      ? "oklch(var(--primary) / 0.08)"
                      : "oklch(var(--card) / 0.5)",
                    border: isCurrent
                      ? "1px solid oklch(var(--primary) / 0.2)"
                      : "1px solid oklch(var(--border) / 0.4)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-semibold text-sm ${
                        isDone
                          ? "line-through text-muted-foreground"
                          : isCurrent
                            ? "text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {step.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-2xl p-5 mt-2 flex flex-col items-center justify-center gap-2 min-h-[120px]"
        style={{
          background: "oklch(var(--card) / 0.5)",
          border: "1px solid oklch(var(--border) / 0.4)",
        }}
      >
        <MapPin className="w-8 h-8 text-primary/50" />
        <p className="text-sm text-muted-foreground">
          Terminal 5 — Interactive map
        </p>
        <p className="text-xs text-muted-foreground/60">
          Tap a step above to show directions
        </p>
      </div>
    </div>
  );
}
