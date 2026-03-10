import { useState, useMemo } from "react";
import { Plus, Trash2, Edit3, TrendingUp, TrendingDown, RefreshCw, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FinanceEntry, FinanceCategory, DEFAULT_CATEGORIES } from "@/lib/types";
import { loadData, saveData } from "@/lib/storage";
import PageHeader from "@/components/PageHeader";

const ENTRIES_KEY = "organizza-finances";
const CATEGORIES_KEY = "organizza-categories";

const FinancesPage = () => {
  const [entries, setEntries] = useState<FinanceEntry[]>(() =>
    loadData(ENTRIES_KEY, [])
  );
  const [categories, setCategories] = useState<FinanceCategory[]>(() =>
    loadData(CATEGORIES_KEY, DEFAULT_CATEGORIES)
  );
  const [showAdd, setShowAdd] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);

  // Form state
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formCat, setFormCat] = useState("");
  const [formRecurring, setFormRecurring] = useState<"monthly" | "weekly" | "">("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));

  // Category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"income" | "expense">("expense");
  const [editingCat, setEditingCat] = useState<FinanceCategory | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const persistEntries = (data: FinanceEntry[]) => {
    setEntries(data);
    saveData(ENTRIES_KEY, data);
  };

  const persistCategories = (data: FinanceCategory[]) => {
    setCategories(data);
    saveData(CATEGORIES_KEY, data);
  };

  const resetForm = () => {
    setFormDesc("");
    setFormAmount("");
    setFormType("expense");
    setFormCat("");
    setFormRecurring("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setEditingEntry(null);
  };

  const openAdd = () => {
    resetForm();
    setShowAdd(true);
  };

  const openEdit = (entry: FinanceEntry) => {
    setFormDesc(entry.description);
    setFormAmount(String(entry.amount));
    setFormType(entry.type);
    setFormCat(entry.categoryId);
    setFormRecurring(entry.recurring || "");
    setFormDate(entry.date);
    setEditingEntry(entry);
    setShowAdd(true);
  };

  const saveEntry = () => {
    const amount = parseFloat(formAmount);
    if (!formDesc.trim() || isNaN(amount) || amount <= 0) return;

    const entry: FinanceEntry = {
      id: editingEntry?.id || crypto.randomUUID(),
      description: formDesc.trim(),
      amount,
      type: formType,
      categoryId: formCat || (formType === "income" ? "other-income" : "other-expense"),
      date: formDate,
      recurring: formRecurring || null,
    };

    if (editingEntry) {
      persistEntries(entries.map((e) => (e.id === entry.id ? entry : e)));
    } else {
      persistEntries([entry, ...entries]);
    }
    setShowAdd(false);
    resetForm();
  };

  const removeEntry = (id: string) => {
    persistEntries(entries.filter((e) => e.id !== id));
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const cat: FinanceCategory = {
      id: crypto.randomUUID(),
      name: newCatName.trim(),
      type: newCatType,
    };
    persistCategories([...categories, cat]);
    setNewCatName("");
  };

  const removeCategory = (id: string) => {
    persistCategories(categories.filter((c) => c.id !== id));
  };

  const startEditCat = (cat: FinanceCategory) => {
    setEditingCat(cat);
    setEditCatName(cat.name);
  };

  const saveEditCat = () => {
    if (!editingCat || !editCatName.trim()) return;
    persistCategories(
      categories.map((c) =>
        c.id === editingCat.id ? { ...c, name: editCatName.trim() } : c
      )
    );
    setEditingCat(null);
    setEditCatName("");
  };

  const filteredCats = categories.filter((c) => c.type === formType);

  const { totalIncome, totalExpense } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let income = 0;
    let expense = 0;
    entries.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (e.type === "income") income += e.amount;
        else expense += e.amount;
      }
    });
    return { totalIncome: income, totalExpense: expense };
  }, [entries]);

  const balance = totalIncome - totalExpense;

  const getCatName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "—";

  // Categories panel
  if (showCategories) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 safe-area-top pt-2 pb-2">
          <button onClick={() => setShowCategories(false)} className="p-2 rounded-xl text-primary">
            <X size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">Categorias</h1>
        </div>

        <div className="px-5 pb-3">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setNewCatType("expense")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                newCatType === "expense" ? "bg-destructive/15 text-destructive" : "glass-panel text-muted-foreground"
              }`}
            >
              Saída
            </button>
            <button
              onClick={() => setNewCatType("income")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                newCatType === "income" ? "bg-primary/15 text-primary" : "glass-panel text-muted-foreground"
              }`}
            >
              Entrada
            </button>
          </div>
          <div className="glass-panel rounded-2xl flex items-center gap-2 p-2">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Nova categoria..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground pl-2"
            />
            <button onClick={addCategory} className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
          {["income", "expense"].map((type) => (
            <div key={type}>
              <p className="text-xs font-semibold text-muted-foreground pt-3 pb-2 uppercase tracking-wider">
                {type === "income" ? "Entradas" : "Saídas"}
              </p>
              {categories
                .filter((c) => c.type === type)
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="glass-panel rounded-2xl p-3 flex items-center justify-between mb-2"
                  >
                    {editingCat?.id === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEditCat()}
                          className="flex-1 bg-transparent text-sm outline-none border-b border-primary/30"
                          autoFocus
                        />
                        <button onClick={saveEditCat} className="p-1 text-primary">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingCat(null)} className="p-1 text-muted-foreground/50">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-foreground">{cat.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditCat(cat)} className="p-1 text-muted-foreground/50">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => removeCategory(cat.id)} className="p-1 text-muted-foreground/50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Add/Edit modal
  if (showAdd) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 safe-area-top pt-2 pb-2">
          <button onClick={() => { setShowAdd(false); resetForm(); }} className="p-2 rounded-xl text-primary">
            <X size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">
            {editingEntry ? "Editar" : "Nova"} transação
          </h1>
          <button onClick={saveEntry} className="p-2 rounded-xl text-primary">
            <Check size={20} />
          </button>
        </div>

        <div className="px-5 pb-24 space-y-4 overflow-y-auto">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setFormType("expense"); setFormCat(""); }}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                formType === "expense" ? "bg-destructive/15 text-destructive" : "glass-panel text-muted-foreground"
              }`}
            >
              <TrendingDown size={16} className="inline mr-1.5" />
              Saída
            </button>
            <button
              onClick={() => { setFormType("income"); setFormCat(""); }}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                formType === "income" ? "bg-primary/15 text-primary" : "glass-panel text-muted-foreground"
              }`}
            >
              <TrendingUp size={16} className="inline mr-1.5" />
              Entrada
            </button>
          </div>

          {/* Description */}
          <div className="glass-panel rounded-2xl p-3">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Descrição
            </label>
            <input
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Ex: Supermercado"
              className="w-full bg-transparent text-sm outline-none mt-1 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Amount */}
          <div className="glass-panel rounded-2xl p-3">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent text-sm outline-none mt-1 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Date */}
          <div className="glass-panel rounded-2xl p-3">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Data
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-transparent text-sm outline-none mt-1"
            />
          </div>

          {/* Category */}
          <div className="glass-panel rounded-2xl p-3">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Categoria
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {filteredCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormCat(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    formCat === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="glass-panel rounded-2xl p-3">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Recorrência
            </label>
            <div className="flex gap-2 mt-2">
              {[
                { value: "", label: "Nenhuma" },
                { value: "weekly", label: "Semanal" },
                { value: "monthly", label: "Mensal" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormRecurring(opt.value as typeof formRecurring)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                    formRecurring === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Finanças"
        action={
          <button onClick={() => setShowCategories(true)} className="text-xs font-medium text-primary">
            Categorias
          </button>
        }
      />

      {/* Summary cards */}
      <div className="px-5 pb-4 space-y-3">
        <div className="glass-panel-solid rounded-3xl p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saldo do mês</p>
          <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 glass-panel rounded-2xl p-3.5">
            <TrendingUp size={16} className="text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-lg font-bold text-primary">R$ {totalIncome.toFixed(2)}</p>
          </div>
          <div className="flex-1 glass-panel rounded-2xl p-3.5">
            <TrendingDown size={16} className="text-destructive mb-1" />
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="text-lg font-bold text-destructive">R$ {totalExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-2">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Transações
          </p>
          <button onClick={openAdd} className="p-2 rounded-xl bg-primary text-primary-foreground">
            <Plus size={16} />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -80 }}
              className="glass-panel rounded-2xl p-3.5 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  entry.type === "income" ? "bg-primary/10" : "bg-destructive/10"
                }`}
              >
                {entry.type === "income" ? (
                  <TrendingUp size={16} className="text-primary" />
                ) : (
                  <TrendingDown size={16} className="text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {entry.description}
                  </p>
                  {entry.recurring && (
                    <RefreshCw size={10} className="text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {getCatName(entry.categoryId)} · {new Date(entry.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${
                  entry.type === "income" ? "text-primary" : "text-destructive"
                }`}
              >
                {entry.type === "income" ? "+" : "-"}R$ {entry.amount.toFixed(2)}
              </p>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(entry)} className="p-1 text-muted-foreground/50">
                  <Edit3 size={12} />
                </button>
                <button onClick={() => removeEntry(entry.id)} className="p-1 text-muted-foreground/50">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">Nenhuma transação registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancesPage;
