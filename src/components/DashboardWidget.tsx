import { motion } from "framer-motion";
import { CheckSquare, List, Wallet, Settings, GripVertical } from "lucide-react";
import { Reminder } from "@/lib/types";
import { loadData } from "@/lib/storage";

type WidgetId = "reminders" | "lists" | "finances" | "settings";

interface DashboardWidgetProps {
  id: WidgetId;
  onTap: (id: WidgetId) => void;
  isDragging?: boolean;
}

const widgetConfig: Record<WidgetId, { label: string; icon: typeof CheckSquare; gradient: string }> = {
  reminders: {
    label: "Lembretes",
    icon: CheckSquare,
    gradient: "from-primary/20 to-primary/5",
  },
  lists: {
    label: "Listas",
    icon: List,
    gradient: "from-info/20 to-info/5",
  },
  finances: {
    label: "Finanças",
    icon: Wallet,
    gradient: "from-warning/20 to-warning/5",
  },
  settings: {
    label: "Ajustes",
    icon: Settings,
    gradient: "from-muted-foreground/15 to-muted-foreground/5",
  },
};

function getWidgetPreview(id: WidgetId): string {
  if (id === "reminders") {
    const items: Reminder[] = loadData("organizza-reminders", []);
    const pending = items.filter((r) => !r.done).length;
    return pending > 0 ? `${pending} pendente${pending !== 1 ? "s" : ""}` : "Tudo em dia ✓";
  }
  if (id === "lists") {
    const lists = loadData<{ items: { done: boolean }[] }[]>("organizza-lists", []);
    return `${lists.length} lista${lists.length !== 1 ? "s" : ""}`;
  }
  if (id === "finances") {
    const entries = loadData<{ amount: number; type: string }[]>("organizza-finances", []);
    const balance = entries.reduce((s, e) => s + (e.type === "income" ? e.amount : -e.amount), 0);
    return `Saldo: R$ ${balance.toFixed(2)}`;
  }
  return "Backup & Preferências";
}

const DashboardWidget = ({ id, onTap, isDragging }: DashboardWidgetProps) => {
  const config = widgetConfig[id];
  const Icon = config.icon;
  const preview = getWidgetPreview(id);

  return (
    <motion.div
      layout
      layoutId={`widget-${id}`}
      onClick={() => !isDragging && onTap(id)}
      className={`
        relative overflow-hidden rounded-3xl p-5 cursor-pointer
        bg-gradient-to-br ${config.gradient}
        backdrop-blur-xl border border-white/30
        shadow-[0_8px_32px_hsla(155,30%,20%,0.06),inset_0_1px_0_hsla(0,0%,100%,0.4)]
        transition-shadow duration-300
        ${isDragging ? "shadow-[0_20px_60px_hsla(155,30%,20%,0.15)] scale-[1.03]" : "hover:shadow-[0_12px_40px_hsla(155,30%,20%,0.1)]"}
      `}
      style={{
        background: isDragging
          ? "hsla(155, 30%, 98%, 0.75)"
          : "hsla(155, 30%, 98%, 0.45)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Glass highlight overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent pointer-events-none rounded-3xl" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <Icon size={22} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">{config.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{preview}</p>
        </div>
        <div className="text-muted-foreground/30 touch-none" data-drag-handle>
          <GripVertical size={20} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardWidget;
