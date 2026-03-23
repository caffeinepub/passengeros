import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Status } from "../backend";
import { useFlightStatus, useTrip } from "../hooks/useQueries";

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    bgClass: string;
    description: string;
    suggestions: string[];
  }
> = {
  [Status.onTime]: {
    label: "On Time",
    icon: CheckCircle,
    className: "text-success",
    bgClass: "border-success/30",
    description: "Your flight is running on schedule.",
    suggestions: [
      "Proceed to gate B22 by 09:30",
      "Security queue is moderate — allow 20 minutes",
      "Boarding begins 40 minutes before departure",
    ],
  },
  [Status.delayed]: {
    label: "Delayed",
    icon: Clock,
    className: "text-warning",
    bgClass: "border-warning/30",
    description: "Your flight has been delayed. New departure time updated.",
    suggestions: [
      "Wait in the gate area for further updates",
      "Visit the airline lounge if eligible",
      "EU261 compensation may apply if delay exceeds 3 hours",
      "Check the departure board for latest gate info",
    ],
  },
  [Status.gateChange]: {
    label: "Gate Changed",
    icon: AlertTriangle,
    className: "text-primary",
    bgClass: "border-primary/30",
    description: "Your departure gate has been changed.",
    suggestions: [
      "Head to new gate B22 immediately",
      "Allow 12 minutes for gate-to-gate walk",
      "Follow airport signage to Terminal B",
    ],
  },
  [Status.cancelled]: {
    label: "Cancelled",
    icon: AlertCircle,
    className: "text-destructive",
    bgClass: "border-destructive/30",
    description:
      "Your flight has been cancelled. You are entitled to rebooking or a full refund.",
    suggestions: [
      "Visit the airline customer service desk immediately",
      "Request a full refund or alternative flight",
      "You may be entitled to hotel accommodation",
      "EU261 compensation of up to €600 may apply",
    ],
  },
};

const alertHistory = [
  {
    time: "08:15",
    message: "Gate B22 confirmed for flight BA178",
    type: "info",
  },
  {
    time: "07:42",
    message: "Security queues at Zone A: Medium congestion",
    type: "warning",
  },
  { time: "07:10", message: "Check-in desks open for BA178", type: "info" },
];

export default function DisruptionsScreen() {
  const { data: trip, isLoading: tripLoading } = useTrip();
  const { data: flightStatus, isLoading: statusLoading } = useFlightStatus(
    trip?.flightNumber ?? "",
  );

  const config = flightStatus
    ? (statusConfig[flightStatus.status] ?? statusConfig[Status.onTime])
    : null;
  const StatusIcon = config?.icon ?? CheckCircle;

  return (
    <div className="min-h-full px-4 pt-6 pb-4 space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Flight alerts
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Disruptions
        </h1>
      </div>

      <div
        data-ocid="disruptions.flight_status.card"
        className={`rounded-2xl p-5 border ${config?.bgClass ?? "border-border/40"}`}
        style={{
          background: config
            ? "oklch(var(--card) / 0.8)"
            : "oklch(var(--muted) / 0.3)",
        }}
      >
        {statusLoading || tripLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : flightStatus ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <StatusIcon className={`w-8 h-8 ${config?.className}`} />
              <div>
                <p
                  className={`font-display font-black text-3xl leading-none ${config?.className ?? "text-foreground"}`}
                >
                  {config?.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {trip?.flightNumber} · {trip?.departureAirport} →{" "}
                  {trip?.arrivalAirport}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {config?.description}
            </p>

            {flightStatus.delayMinutes &&
              Number(flightStatus.delayMinutes) > 0 && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-warning/10 border border-warning/25">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning font-medium">
                    Delay: {flightStatus.delayMinutes.toString()} minutes
                  </span>
                </div>
              )}

            {flightStatus.message && (
              <p className="text-xs text-muted-foreground italic">
                "{flightStatus.message}"
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No flight status available
          </p>
        )}
      </div>

      {config && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Suggested Actions
          </p>
          <div className="space-y-2">
            {config.suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="flex items-start gap-3 p-3 rounded-xl glass-card"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <p className="text-sm text-foreground">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Alert History
        </p>
        <div className="space-y-2">
          {alertHistory.map((alert) => (
            <div
              key={`${alert.time}-${alert.message}`}
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "oklch(var(--muted) / 0.3)",
                border: "1px solid oklch(var(--border) / 0.4)",
              }}
            >
              <Bell
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  alert.type === "warning" ? "text-warning" : "text-primary"
                }`}
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{alert.time}</p>
                <p className="text-sm text-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
