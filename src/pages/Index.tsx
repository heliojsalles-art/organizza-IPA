import { useState } from "react";
import TabBar from "@/components/TabBar";
import DashboardPage from "@/pages/DashboardPage";
import RemindersPage from "@/pages/RemindersPage";
import ListsPage from "@/pages/ListsPage";
import FinancesPage from "@/pages/FinancesPage";
import SettingsPage from "@/pages/SettingsPage";
import { AnimatePresence, motion } from "framer-motion";

type Tab = "home" | "reminders" | "lists" | "finances" | "settings";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="min-h-screen max-w-lg mx-auto relative bg-background">
      {/* Decorative gradient blobs */}
      <div className="fixed top-0 left-0 right-0 h-80 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 h-screen flex flex-col"
        >
          {tab === "home" && <DashboardPage onNavigate={(t) => setTab(t)} />}
          {tab === "reminders" && <RemindersPage />}
          {tab === "lists" && <ListsPage />}
          {tab === "finances" && <FinancesPage />}
          {tab === "settings" && <SettingsPage />}
        </motion.div>
      </AnimatePresence>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
