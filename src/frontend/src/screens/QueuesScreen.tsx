import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock, RefreshCw, Users } from "lucide-react";
import { Checkpoint, CongestionLevel } from "../backend";
import { useQueueStatuses } from "../hooks/useQueries";

const checkpointLabels: Record<string, string> = {
  [Checkpoint.checkin]: "Check-in",
  [Checkpoint.security]: "Security",
  [Checkpoint.boarding]: "Boarding Gate",
};

const checkpointDetails: Record<string, string> = {
  [Checkpoint.checkin]: "Terminal 5 · Desks 10-20",
  [Checkpoint.security]: "Zone A · Fast Track available",
  [Checkpoint.boarding]: "Gate B22 · Level 3",
};

const congestionColors = {
  [CongestionLevel.low]: {
    bar: "bg-success",
    text: "text-success",
    badge: "bg-success/15 text-success border-success/30",
    label: "Low",
    width: "w-1/4",
    glow: "0 0 15px oklch(0.68 0.18 145 / 0.4)",
  },
  [CongestionLevel.medium]: {
    bar: "bg-warning",
    text: "text-warning",
    badge: "bg-warning/15 text-warning border-warning/30",
    label: "Medium",
    width: "w-1/2",
    glow: "0 0 15px oklch(0.78 0.18 80 / 0.4)",
  },
  [CongestionLevel.high]: {
    bar: "bg-destructive",
    text: "text-destructive",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    label: "High",
    width: "w-full",
    glow: "0 0 15px oklch(0.60 0.22 25 / 0.4)",
  },
};

export default function QueuesScreen() {
  const { data: queues, isLoading, dataUpdatedAt } = useQueueStatuses();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["queueStatuses"] });
  };

  const updatedText = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-full px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Live data
          </p>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Queue Monitor
          </h1>
        </div>
        <Button
          type="button"
          data-ocid="queues.refresh.button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-1.5 border-border/50 bg-muted hover:bg-secondary"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {updatedText && (
        <p className="text-xs text-muted-foreground mb-4">
          Last updated {updatedText}
        </p>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : queues && queues.length > 0 ? (
          queues.map((queue) => {
            const config =
              congestionColors[queue.congestionLevel as CongestionLevel] ??
              congestionColors[CongestionLevel.medium];
            const label =
              checkpointLabels[queue.checkpoint] ?? queue.checkpoint;
            const detail = checkpointDetails[queue.checkpoint] ?? "";
            const lastUpdated = new Date(
              Number(queue.lastUpdated),
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={queue.checkpoint}
                className="rounded-2xl p-4 glass-card"
                style={{ boxShadow: config.glow }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-lg text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badge}`}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="flex items-end gap-1.5 mb-3">
                  <span
                    className={`font-mono font-black text-4xl ${config.text}`}
                  >
                    {queue.waitMinutes.toString()}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1.5">
                    min wait
                  </span>
                </div>

                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ background: "oklch(var(--muted))", height: "6px" }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${config.bar} ${config.width}`}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Updated {lastUpdated}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            data-ocid="queues.empty_state"
            className="rounded-2xl p-8 text-center glass-card"
          >
            <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No queue data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
