import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  Globe,
  Heart,
  Hotel,
  IdCard,
  Plane,
  Plus,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { DocType } from "../backend";
import type { DigitalIdentityDocState } from "../backend";
import {
  useDigitalIdentityDocs,
  useUpdateIdentityDoc,
} from "../hooks/useQueries";

const docTypeConfig: Record<
  DocType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  [DocType.passport]: {
    label: "Passport",
    icon: Globe,
    description: "International travel document",
  },
  [DocType.boardingPass]: {
    label: "Boarding Pass",
    icon: Plane,
    description: "BA178 · LHR → JFK",
  },
  [DocType.visa]: {
    label: "Visa",
    icon: Shield,
    description: "Entry requirement",
  },
  [DocType.travelInsurance]: {
    label: "Travel Insurance",
    icon: Heart,
    description: "Coverage documentation",
  },
  [DocType.hotelBooking]: {
    label: "Hotel Booking",
    icon: Hotel,
    description: "Accommodation confirmation",
  },
};

function formatExpiry(ts: bigint) {
  if (!ts || ts === 0n) return null;
  const d = new Date(Number(ts));
  if (d.getFullYear() < 2000) return null;
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function IdentityScreen() {
  const { data: docs, isLoading } = useDigitalIdentityDocs();
  const updateDoc = useUpdateIdentityDoc();

  const readyCount = docs?.filter((d) => d.isReady).length ?? 0;
  const totalCount = docs?.length ?? 0;
  const progress = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;

  const handleToggle = async (
    doc: DigitalIdentityDocState,
    checked: boolean,
  ) => {
    try {
      await updateDoc.mutateAsync({ ...doc, isReady: checked });
      toast.success(
        `${docTypeConfig[doc.docType as DocType]?.label ?? doc.docType} marked as ${checked ? "ready" : "not ready"}`,
      );
    } catch {
      toast.error("Failed to update document");
    }
  };

  return (
    <div className="min-h-full px-4 pt-6 pb-4">
      <div className="mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Pre-flight checklist
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Digital Identity
        </h1>
      </div>

      {!isLoading && totalCount > 0 && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background:
              progress === 100
                ? "oklch(0.68 0.18 145 / 0.12)"
                : "oklch(var(--primary) / 0.1)",
            border:
              progress === 100
                ? "1px solid oklch(0.68 0.18 145 / 0.3)"
                : "1px solid oklch(var(--primary) / 0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">
              {readyCount} of {totalCount} documents ready
            </p>
            {progress === 100 && (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
          </div>
          <Progress value={progress} className="h-2" />
          {progress < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              {totalCount - readyCount} document
              {totalCount - readyCount !== 1 ? "s" : ""} still needed
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))
        ) : docs && docs.length > 0 ? (
          docs.map((doc, i) => {
            const config = docTypeConfig[doc.docType as DocType];
            const Icon = config?.icon ?? IdCard;
            const expiry = formatExpiry(doc.expiryDate);

            return (
              <div
                key={doc.docType}
                data-ocid={`identity.doc.item.${i + 1}`}
                className="glass-card rounded-2xl p-4 flex items-center gap-4"
                style={{
                  border: doc.isReady
                    ? "1px solid oklch(0.68 0.18 145 / 0.3)"
                    : "1px solid oklch(var(--border) / 0.5)",
                }}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.isReady ? "bg-success/15" : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${doc.isReady ? "text-success" : "text-muted-foreground"}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">
                      {config?.label ?? doc.docType}
                    </p>
                    {doc.isReady && (
                      <Badge className="bg-success/15 text-success border-success/30 text-[9px] px-1.5 py-0 border">
                        Ready
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {config?.description}
                  </p>
                  {expiry && (
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      Expires {expiry}
                    </p>
                  )}
                  {doc.notes && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 italic truncate">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <Switch
                  data-ocid={`identity.doc.toggle.${i + 1}`}
                  checked={doc.isReady}
                  onCheckedChange={(checked) => handleToggle(doc, checked)}
                  disabled={updateDoc.isPending}
                  aria-label={`Mark ${config?.label ?? doc.docType} as ready`}
                />
              </div>
            );
          })
        ) : (
          <div
            data-ocid="identity.empty_state"
            className="rounded-2xl p-8 text-center glass-card"
          >
            <IdCard className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full mt-4 gap-2 border-dashed border-border/60 hover:bg-muted/40 text-muted-foreground"
        onClick={() => toast.info("Document upload coming soon")}
      >
        <Plus className="w-4 h-4" />
        Add Document
      </Button>

      <p className="text-center text-xs text-muted-foreground/50 mt-6">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary/70 hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
