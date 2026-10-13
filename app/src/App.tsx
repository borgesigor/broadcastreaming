import { useState } from "react";
import { Button } from "@/components/ui/button";

type WorkspaceMode = "editor" | "live";

function App() {
  const [mode, setMode] = useState<WorkspaceMode>("editor");

  return (
    <main className="dark flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div className="flex items-center gap-5">
          <span className="text-sm font-semibold tracking-tight">Broadcastreaming</span>
          <nav aria-label="Workspace mode" className="flex items-center gap-1">
            <Button
              aria-pressed={mode === "editor"}
              onClick={() => setMode("editor")}
              size="sm"
              variant={mode === "editor" ? "secondary" : "ghost"}
            >
              Editor
            </Button>
            <Button
              aria-pressed={mode === "live"}
              onClick={() => setMode("live")}
              size="sm"
              variant={mode === "live" ? "secondary" : "ghost"}
            >
              Ao vivo
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Projeto sem título</span>
          <span aria-label="Salvo" className="size-2 rounded-full bg-emerald-500" />
          <span>Salvo</span>
        </div>
      </header>

      <section aria-label={mode === "editor" ? "Editor" : "Controles ao vivo"} className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r p-4 lg:block">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {mode === "editor" ? "Efeitos" : "Composições"}
          </p>
          <p className="text-sm text-muted-foreground">
            {mode === "editor" ? "Selecione um elemento para editar seus efeitos." : "As composições disponíveis aparecerão aqui."}
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-80 flex-1 items-center justify-center bg-muted/30 p-6">
            <div className="flex aspect-video w-full max-w-5xl items-center justify-center rounded-md border border-dashed bg-background text-sm text-muted-foreground">
              {mode === "editor" ? "Pré-visualização da composição" : "Saída ao vivo"}
            </div>
          </div>
          <section aria-label="Timeline" className="h-44 shrink-0 border-t p-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-sm font-medium">{mode === "editor" ? "Timeline" : "Fila ao vivo"}</h1>
              <Button size="sm" variant="outline">Reproduzir</Button>
            </div>
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              {mode === "editor" ? "Adicione elementos para começar" : "Nenhuma composição no ar"}
            </div>
          </section>
        </div>

        <aside className="hidden w-64 shrink-0 border-l p-4 xl:block">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {mode === "editor" ? "Buscar efeitos" : "Dados"}
          </p>
          <p className="text-sm text-muted-foreground">
            {mode === "editor" ? "Fade, zoom, rotate…" : "Selecione uma composição para ver os campos."}
          </p>
        </aside>
      </section>
    </main>
  );
}

export default App;
