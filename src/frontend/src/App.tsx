import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import AiChatPanel from "./components/AiChatPanel";
import BottomNav from "./components/BottomNav";
import { useActor } from "./hooks/useActor";
import { useSeedDemoData } from "./hooks/useQueries";
import BaggageScreen from "./screens/BaggageScreen";
import DisruptionsScreen from "./screens/DisruptionsScreen";
import HomeScreen from "./screens/HomeScreen";
import IdentityScreen from "./screens/IdentityScreen";
import NavigateScreen from "./screens/NavigateScreen";
import QueuesScreen from "./screens/QueuesScreen";
import RightsScreen from "./screens/RightsScreen";

export type TabId =
  | "home"
  | "navigate"
  | "queues"
  | "disruptions"
  | "baggage"
  | "rights"
  | "identity";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const { actor, isFetching } = useActor();
  const seedMutation = useSeedDemoData();
  const seededRef = useRef(false);

  useEffect(() => {
    if (actor && !isFetching && !seededRef.current) {
      seededRef.current = true;
      seedMutation.mutate();
    }
  }, [actor, isFetching, seedMutation]);

  return (
    <div className="relative flex items-center justify-center min-h-dvh bg-background">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.72 0.175 195) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-20 right-0 w-64 h-64 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.68 0.18 145) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* App frame */}
      <div className="relative w-full max-w-[430px] min-h-dvh flex flex-col overflow-hidden">
        {/* Screen content */}
        <main className="flex-1 overflow-y-auto scrollbar-none pb-20">
          {activeTab === "home" && (
            <HomeScreen onOpenAi={() => setAiPanelOpen(true)} />
          )}
          {activeTab === "navigate" && <NavigateScreen />}
          {activeTab === "queues" && <QueuesScreen />}
          {activeTab === "disruptions" && <DisruptionsScreen />}
          {activeTab === "baggage" && <BaggageScreen />}
          {activeTab === "rights" && <RightsScreen />}
          {activeTab === "identity" && <IdentityScreen />}
        </main>

        {/* Bottom navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* AI Chat Panel */}
        <AiChatPanel open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
