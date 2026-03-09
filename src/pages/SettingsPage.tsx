import { Download, Upload, Info } from "lucide-react";
import { exportAllData, importAllData } from "@/lib/storage";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

const SettingsPage = () => {
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organizza-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados com sucesso!");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const ok = importAllData(text);
      if (ok) {
        toast.success("Dados importados! Recarregando...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Arquivo inválido");
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Ajustes" />

      <div className="px-5 pb-24 space-y-3">
        <div className="glass-panel-solid rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Info size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Organizza</p>
              <p className="text-xs text-muted-foreground">v1.0.0 · Seu organizador pessoal</p>
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
          Dados
        </p>

        <button
          onClick={handleExport}
          className="glass-panel rounded-2xl p-4 flex items-center gap-3 w-full text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Download size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Exportar dados</p>
            <p className="text-xs text-muted-foreground">Salvar backup em JSON</p>
          </div>
        </button>

        <button
          onClick={handleImport}
          className="glass-panel rounded-2xl p-4 flex items-center gap-3 w-full text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Importar dados</p>
            <p className="text-xs text-muted-foreground">Restaurar backup de arquivo JSON</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
