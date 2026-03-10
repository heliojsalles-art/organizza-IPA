import { useState } from "react";
import { Plus, Trash2, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingList, ListItem } from "@/lib/types";
import { loadData, saveData } from "@/lib/storage";
import PageHeader from "@/components/PageHeader";

const STORAGE_KEY = "organizza-lists";

const ListsPage = () => {
  const [lists, setLists] = useState<ShoppingList[]>(() =>
    loadData(STORAGE_KEY, [])
  );
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newItemText, setNewItemText] = useState("");

  const persist = (data: ShoppingList[]) => {
    setLists(data);
    saveData(STORAGE_KEY, data);
  };

  const addList = () => {
    const name = newListName.trim();
    if (!name) return;
    const list: ShoppingList = {
      id: crypto.randomUUID(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
    };
    persist([list, ...lists]);
    setNewListName("");
  };

  const removeList = (id: string) => {
    persist(lists.filter((l) => l.id !== id));
    if (activeListId === id) setActiveListId(null);
  };

  const activeList = lists.find((l) => l.id === activeListId);

  const addItem = () => {
    if (!activeList || !newItemText.trim()) return;
    const item: ListItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      done: false,
    };
    persist(
      lists.map((l) =>
        l.id === activeList.id ? { ...l, items: [...l.items, item] } : l
      )
    );
    setNewItemText("");
  };

  const toggleItem = (itemId: string) => {
    if (!activeList) return;
    persist(
      lists.map((l) =>
        l.id === activeList.id
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId ? { ...i, done: !i.done } : i
              ),
            }
          : l
      )
    );
  };

  const removeItem = (itemId: string) => {
    if (!activeList) return;
    persist(
      lists.map((l) =>
        l.id === activeList.id
          ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
          : l
      )
    );
  };

  // Detail view
  if (activeList) {
    const pending = activeList.items.filter((i) => !i.done);
    const done = activeList.items.filter((i) => i.done);

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 safe-area-top pt-2 pb-2">
          <button
            onClick={() => setActiveListId(null)}
            className="p-2 rounded-xl text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">
            {activeList.name}
          </h1>
          <span className="text-xs text-muted-foreground">
            {pending.length}/{activeList.items.length}
          </span>
        </div>

        <div className="px-5 pb-3">
          <div className="glass-panel rounded-2xl flex items-center gap-2 p-2">
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Adicionar item..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground pl-2"
            />
            <button
              onClick={addItem}
              className="p-2 rounded-xl bg-primary text-primary-foreground"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
          <AnimatePresence mode="popLayout">
            {pending.map((item) => (
              <ListItemCard
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onRemove={removeItem}
              />
            ))}
          </AnimatePresence>
          {done.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground pt-4 pb-1 uppercase tracking-wider">
                Concluídos ({done.length})
              </p>
              <AnimatePresence mode="popLayout">
                {done.map((item) => (
                  <ListItemCard
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  }

  // Lists overview
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Listas"
        subtitle={`${lists.length} lista${lists.length !== 1 ? "s" : ""}`}
      />

      <div className="px-5 pb-3">
        <div className="glass-panel rounded-2xl flex items-center gap-2 p-2">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addList()}
            placeholder="Nova lista..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground pl-2"
          />
          <button
            onClick={addList}
            className="p-2 rounded-xl bg-primary text-primary-foreground"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
        <AnimatePresence mode="popLayout">
          {lists.map((list) => (
            <motion.div
              key={list.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -80 }}
              className="glass-panel rounded-2xl p-3.5 flex items-center gap-3"
            >
              <button
                onClick={() => setActiveListId(list.id)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {list.items.length}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {list.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {list.items.filter((i) => !i.done).length} pendente
                    {list.items.filter((i) => !i.done).length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/50" />
              </button>
              <button
                onClick={() => removeList(list.id)}
                className="p-1.5 text-muted-foreground/40"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {lists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">Nenhuma lista criada</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ListItemCardProps {
  item: ListItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

const ListItemCard = ({ item, onToggle, onRemove }: ListItemCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -80 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    className="glass-panel rounded-2xl p-3.5 flex items-center gap-3"
  >
    <button
      onClick={() => onToggle(item.id)}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        item.done ? "bg-primary border-primary" : "border-muted-foreground/40"
      }`}
    >
      {item.done && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
    <p
      className={`flex-1 text-sm ${
        item.done ? "line-through text-muted-foreground" : "text-foreground"
      }`}
    >
      {item.text}
    </p>
    <button onClick={() => onRemove(item.id)} className="p-1 text-muted-foreground/50">
      <Trash2 size={14} />
    </button>
  </motion.div>
);

export default ListsPage;
