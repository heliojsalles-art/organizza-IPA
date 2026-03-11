import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardWidget from "@/components/DashboardWidget";
import { loadData, saveData } from "@/lib/storage";

type WidgetId = "reminders" | "lists" | "finances" | "settings";

const ORDER_KEY = "organizza-widget-order";
const DEFAULT_ORDER: WidgetId[] = ["reminders", "lists", "finances", "settings"];

interface DashboardPageProps {
  onNavigate: (tab: WidgetId) => void;
}

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const [order, setOrder] = useState<WidgetId[]>(() =>
    loadData(ORDER_KEY, DEFAULT_ORDER)
  );
  const [draggingId, setDraggingId] = useState<WidgetId | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef(0);
  const isDraggingRef = useRef(false);

  const persist = (newOrder: WidgetId[]) => {
    setOrder(newOrder);
    saveData(ORDER_KEY, newOrder);
  };

  // Touch-based drag reorder
  const handleTouchStart = useCallback((id: WidgetId, idx: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      setDraggingId(id);
      isDraggingRef.current = true;
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(20);
    }, 400);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) {
      // Cancel long press if moved too much
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dy > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      return;
    }

    const touchY = e.touches[0].clientY;
    // Find which item we're over
    let closestIdx = 0;
    let closestDist = Infinity;
    itemRefs.current.forEach((el, key) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(touchY - center);
      const idx = order.indexOf(key as WidgetId);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    setDragOverIdx(closestIdx);
  }, [order]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isDraggingRef.current && draggingId !== null && dragOverIdx !== null) {
      const fromIdx = order.indexOf(draggingId);
      if (fromIdx !== dragOverIdx) {
        const newOrder = [...order];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(dragOverIdx, 0, draggingId);
        persist(newOrder);
      }
    }
    setDraggingId(null);
    setDragOverIdx(null);
    isDraggingRef.current = false;
  }, [draggingId, dragOverIdx, order]);

  // HTML5 drag (desktop fallback)
  const handleDragStart = (id: WidgetId) => {
    setDraggingId(id);
    isDraggingRef.current = true;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = () => {
    if (draggingId && dragOverIdx !== null) {
      const fromIdx = order.indexOf(draggingId);
      if (fromIdx !== dragOverIdx) {
        const newOrder = [...order];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(dragOverIdx, 0, draggingId);
        persist(newOrder);
      }
    }
    setDraggingId(null);
    setDragOverIdx(null);
    isDraggingRef.current = false;
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="safe-area-top px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-sm text-muted-foreground font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-0.5">
            Organizza
          </h1>
        </motion.div>
      </div>

      {/* Widgets */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <AnimatePresence>
            {order.map((id, idx) => (
              <motion.div
                key={id}
                ref={(el) => {
                  if (el) itemRefs.current.set(id, el);
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                draggable
                onDragStart={() => handleDragStart(id)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={() => {
                  setDraggingId(null);
                  isDraggingRef.current = false;
                }}
                onTouchStart={(e) => handleTouchStart(id, idx, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`transition-transform duration-200 ${
                  draggingId === id ? "opacity-60 z-50" : ""
                } ${dragOverIdx === idx && draggingId !== id ? "translate-y-2" : ""}`}
              >
                <DashboardWidget
                  id={id}
                  onTap={onNavigate}
                  isDragging={draggingId === id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[11px] text-muted-foreground/50 mt-6"
        >
          Segure e arraste para reorganizar
        </motion.p>
      </div>
    </div>
  );
};

export default DashboardPage;
