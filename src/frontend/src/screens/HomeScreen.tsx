import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  ChevronRight,
  Clock,
  Luggage,
  MapPin,
  Plane,
  Wifi,
} from "lucide-react";
import { CongestionLevel, Status } from "../backend";
import {
  useBaggageItems,
  useFlightStatus,
  useLeaveTime,
  useQueueStatuses,
  useTrip,
} from "../hooks/useQueries";

function useCountdown(departureTs: bigint | undefined) {
  const now = Date.now();
  if (!departureTs) return null;
  const diff = Number(departureTs) - now;
  if (diff <= 0) return { hours: 0, minutes: 0, total: 0 };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { hours, minutes, total: diff };
}

function formatLeaveTime(ts: bigint | null | undefined) {
  if (!ts) return "--:--";
  const d = new Date(Number(ts));
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const statusConfig = {
  [Status.onTime]: {
    label: "On Time",
    className: "bg-success/15 text-success border-success/30",
  },
  [Status.delayed]: {
    label: "Delayed",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  [Status.gateChange]: {
    label: "Gate Change",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  [Status.cancelled]: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

const congestionConfig = {
  [CongestionLevel.low]: { label: "Low", color: "text-success" },
  [CongestionLevel.medium]: { label: "Med", color: "text-warning" },
  [CongestionLevel.high]: { label: "High", color: "text-destructive" },
};

interface Props {
  onOpenAi: () => void;
}

export default function HomeScreen({ onOpenAi }: Props) {
  const { data: trip, isLoading: tripLoading } = useTrip();
  const { data: flightStatus, isLoading: statusLoading } = useFlightStatus(
    trip?.flightNumber ?? "",
  );
  const { data: queues } = useQueueStatuses();
  const { data: baggage } = useBaggageItems();
  const { data: leaveTime, isLoading: leaveLoading } = useLeaveTime();

  const countdown = useCountdown(trip?.departureTimestamp);

  const securityQueue = queues?.find((q) => q.checkpoint === "security");
  const activeBaggage = baggage?.[0];

  const departureTime = trip
    ? new Date(Number(trip.departureTimestamp)).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const departureDate = trip
    ? new Date(Number(trip.departureTimestamp)).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-full px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {tripLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Good morning
              </p>
              <h1 className="font-display font-bold text-xl text-foreground leading-tight">
                {trip?.passengerName ?? "Passenger"}
              </h1>
            </>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Plane className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Hero Flight Card */}
      <div
        data-ocid="home.leave_time.card"
        className="rounded-2xl overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.03 220) 0%, oklch(0.14 0.02 260) 100%)",
          border: "1px solid oklch(var(--primary) / 0.3)",
          boxShadow:
            "0 8px 32px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(var(--primary) / 0.2)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url(/assets/generated/hero-bg.dim_430x200.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative p-5">
          {tripLoading ? (
            <Skeleton className="h-14 w-full mb-3" />
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="font-display font-black text-4xl text-foreground tracking-tight">
                  {trip?.departureAirport ?? "LHR"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {trip?.airline ?? "British Airways"}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-primary">
                  <div className="h-px w-8 bg-primary/50" />
                  <Plane className="w-4 h-4" />
                  <div className="h-px w-8 bg-primary/50" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {trip?.flightNumber ?? "BA178"}
                </p>
              </div>
              <div className="text-center">
                <p className="font-display font-black text-4xl text-foreground tracking-tight">
                  {trip?.arrivalAirport ?? "JFK"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {departureDate}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Departs</span>
            <span className="font-mono font-bold text-lg text-foreground">
              {departureTime}
            </span>
            {flightStatus && (
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 border ${
                  statusConfig[flightStatus.status as Status]?.className ?? ""
                }`}
              >
                {statusConfig[flightStatus.status as Status]?.label ??
                  flightStatus.status}
              </Badge>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">
              Time to departure
            </p>
            {countdown ? (
              <p className="countdown-display font-mono font-black text-5xl text-foreground leading-none">
                <span className="text-primary">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground text-3xl mx-1">h</span>
                <span>{String(countdown.minutes).padStart(2, "0")}</span>
                <span className="text-muted-foreground text-3xl mx-1">m</span>
              </p>
            ) : (
              <Skeleton className="h-12 w-40" />
            )}
          </div>
        </div>
      </div>

      {/* Leave Home Recommendation */}
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: "oklch(0.72 0.175 195 / 0.1)",
          border: "1px solid oklch(var(--primary) / 0.25)",
        }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            AI recommends leaving
          </p>
          {leaveLoading ? (
            <Skeleton className="h-6 w-24 mt-1" />
          ) : (
            <p className="font-display font-bold text-2xl text-primary">
              {formatLeaveTime(leaveTime)}
            </p>
          )}
        </div>
        <MapPin className="w-4 h-4 text-primary/50" />
      </div>

      {/* Quick Status Strip */}
      <div
        data-ocid="home.flight_status.card"
        className="grid grid-cols-3 gap-3"
      >
        <div className="glass-card rounded-xl p-3 text-center">
          <Plane className="w-5 h-5 mx-auto mb-1 text-primary" />
          {statusLoading ? (
            <Skeleton className="h-4 w-12 mx-auto" />
          ) : (
            <p
              className={`text-xs font-semibold ${
                statusConfig[flightStatus?.status as Status]?.className
                  .split(" ")
                  .find((c) => c.startsWith("text-")) ?? "text-foreground"
              }`}
            >
              {statusConfig[flightStatus?.status as Status]?.label ?? "Unknown"}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-0.5">Flight</p>
        </div>

        <div className="glass-card rounded-xl p-3 text-center">
          <Wifi className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p
            className={`text-xs font-semibold ${
              securityQueue
                ? congestionConfig[
                    securityQueue.congestionLevel as CongestionLevel
                  ]?.color
                : "text-muted-foreground"
            }`}
          >
            {securityQueue
              ? `${congestionConfig[securityQueue.congestionLevel as CongestionLevel]?.label ?? ""} · ${securityQueue.waitMinutes.toString()}m`
              : "--"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Security</p>
        </div>

        <div className="glass-card rounded-xl p-3 text-center">
          <Luggage className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-xs font-semibold text-foreground truncate">
            {activeBaggage
              ? activeBaggage.status.replace(/([A-Z])/g, " $1").trim()
              : "--"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Baggage</p>
        </div>
      </div>

      {flightStatus && (
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Terminal · Gate</p>
            <p className="font-display font-bold text-xl text-foreground">
              {flightStatus.terminal} · Gate {flightStatus.gate}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* AI Assistant FAB */}
      <button
        type="button"
        data-ocid="home.ai_assistant.button"
        onClick={onOpenAi}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg transition-all duration-200 active:scale-95"
        style={{
          background: "oklch(var(--primary))",
          boxShadow:
            "0 4px 20px oklch(var(--primary) / 0.4), 0 0 40px oklch(var(--primary) / 0.15)",
          right: "max(1rem, calc(50vw - 215px + 1rem))",
        }}
      >
        <Bot className="w-5 h-5 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">
          Ask AI Assistant
        </span>
      </button>
    </div>
  );
}
