import { useState } from "react";
import { Plus, Trash2, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reminder } from "@/lib/types";
import { loadData, saveData } from "@/lib/storage";
import PageHeader from "@/components/PageHeader";

const STORAGE_KEY = "organizza-reminders";

const RemindersPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() =>
    loadData(STORAGE_KEY, [])
  );
  const [input, setInput] = useState("");
  const [isNote, setIsNote] = useState(false);

  const persist = (data: Reminder[]) => {
    setReminders(data);
    saveData(STORAGE_KEY, data);
  };

  const add = () => {
    const text = input.trim();
    if (!text) return;
    const item: Reminder = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
      isNote,
    };
    persist([item, ...reminders]);
    setInput("");
  };

  const toggle = (id: string) => {
    persist(reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const remove = (id: string) => {
    persist(reminders.filter((r) => r.id !== id));
  };

  const clearDone = () => {
    persist(reminders.filter((r) => !r.done));
  };

  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Lembretes"
        subtitle={`${pending.length} pendente${pending.length !== 1 ? "s" : ""}`}
        action={
          done.length > 0 ? (
            <button
              onClick={clearDone}
              className="text-xs font-medium text-destructive"
            >
              Limpar concluídos
            </button>
          ) : undefined
        }
      />

      {/* Input */}
      <div className="px-5 pb-3">
        <div className="glass-panel rounded-2xl flex items-center gap-2 p-2">
          <button
            onClick={() => setIsNote(!isNote)}
            className={`p-2 rounded-xl transition-colors ${
              isNote ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            <StickyNote size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={isNote ? "Nova nota..." : "Novo lembrete..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={add}
            className="p-2 rounded-xl bg-primary text-primary-foreground"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
        <AnimatePresence mode="popLayout">
          {pending.map((r) => (
            <ReminderCard key={r.id} item={r} onToggle={toggle} onRemove={remove} />
          ))}
        </AnimatePresence>

        {done.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground pt-4 pb-1 uppercase tracking-wider">
              Concluídos
            </p>
            <AnimatePresence mode="popLayout">
              {done.map((r) => (
                <ReminderCard key={r.id} item={r} onToggle={toggle} onRemove={remove} />
              ))}
            </AnimatePresence>
          </>
        )}

        {reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <CheckCircleIcon />
            <p className="mt-3 text-sm">Nenhum lembrete ainda</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-muted-foreground/30">
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
    <path d="M16 24l6 6 10-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface ReminderCardProps {
  item: Reminder;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

const ReminderCard = ({ item, onToggle, onRemove }: ReminderCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -80 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    className="glass-panel rounded-2xl p-3.5 flex items-start gap-3"
  >
    <button
      onClick={() => onToggle(item.id)}
      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        item.done
          ? "bg-primary border-primary"
          : "border-muted-foreground/40"
      }`}
    >
      {item.done && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
    <div className="flex-1 min-w-0">
      {item.isNote && (
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
          Nota
        </span>
      )}
      <p
        className={`text-sm leading-relaxed ${
          item.done ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {item.text}
      </p>
    </div>
    <button onClick={() => onRemove(item.id)} className="p-1 text-muted-foreground/50">
      <Trash2 size={14} />
    </button>
  </motion.div>
);

export default RemindersPage;
