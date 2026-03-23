import {
  AlertTriangle,
  Home,
  IdCard,
  Luggage,
  Navigation,
  Scale,
  Users,
} from "lucide-react";
import type { TabId } from "../App";

const tabs: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "navigate", label: "Navigate", icon: Navigation },
  { id: "queues", label: "Queues", icon: Users },
  { id: "disruptions", label: "Alerts", icon: AlertTriangle },
  { id: "baggage", label: "Baggage", icon: Luggage },
  { id: "rights", label: "Rights", icon: Scale },
  { id: "identity", label: "Identity", icon: IdCard },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div
        className="flex items-center justify-around px-1 py-2 border-t border-border/40"
        style={{
          background: "oklch(0.13 0.016 260 / 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.tab`}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all duration-200 min-w-[44px] relative"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: "oklch(var(--primary))" }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[9px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
