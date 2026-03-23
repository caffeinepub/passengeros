import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Clock, Luggage } from "lucide-react";
import { Status__1 } from "../backend";
import { useBaggageItems } from "../hooks/useQueries";

const statusOrder: Status__1[] = [
  Status__1.checkedIn,
  Status__1.loaded,
  Status__1.inTransit,
  Status__1.arrived,
  Status__1.atCarousel,
  Status__1.collected,
];

const statusLabels: Record<Status__1, string> = {
  [Status__1.checkedIn]: "Checked In",
  [Status__1.loaded]: "Loaded",
  [Status__1.inTransit]: "In Transit",
  [Status__1.arrived]: "Arrived",
  [Status__1.atCarousel]: "At Carousel",
  [Status__1.collected]: "Collected",
};

function BaggageTimeline({ currentStatus }: { currentStatus: Status__1 }) {
  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {statusOrder.map((status, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={status} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-success/20 border-2 border-success"
                      : isCurrent
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted border border-border/40"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground/30" />
                  )}
                </div>
                <p
                  className={`text-[8px] mt-1 text-center leading-tight max-w-[42px] ${
                    isDone
                      ? "text-success/70"
                      : isCurrent
                        ? "text-primary font-semibold"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {statusLabels[status]}
                </p>
              </div>
              {i < statusOrder.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    i < currentIdx ? "bg-success/50" : "bg-border/30"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BaggageScreen() {
  const { data: bags, isLoading } = useBaggageItems();

  return (
    <div className="min-h-full px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Real-time tracking
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Baggage Tracker
        </h1>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))
        ) : bags && bags.length > 0 ? (
          bags.map((bag, i) => {
            const isActive = bag.status !== Status__1.collected;

            return (
              <div
                key={bag.tagNumber}
                data-ocid={`baggage.item.${i + 1}`}
                className="glass-card rounded-2xl p-4"
                style={{
                  boxShadow: isActive
                    ? "0 0 20px oklch(var(--primary) / 0.08)"
                    : undefined,
                  border: isActive
                    ? "1px solid oklch(var(--primary) / 0.2)"
                    : "1px solid oklch(var(--border) / 0.5)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Luggage className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {bag.description}
                      </p>
                      {isActive && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] text-primary">Live</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tag: {bag.tagNumber}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          bag.status === Status__1.collected
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {statusLabels[bag.status as Status__1] ?? bag.status}
                      </span>
                    </div>
                  </div>
                </div>

                <BaggageTimeline currentStatus={bag.status as Status__1} />

                <div className="flex items-center gap-1 mt-3">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    Updated{" "}
                    {new Date(Number(bag.lastUpdated)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div
            data-ocid="baggage.empty_state"
            className="rounded-2xl p-8 text-center glass-card"
          >
            <Luggage className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No baggage items found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Your bags will appear here once checked in
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
