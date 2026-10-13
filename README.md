# Broadcast Graphics

Aplicativo desktop para criar gráficos de transmissão ao vivo, como lower thirds, nomes, placares e tabelas. O projeto usa Tauri 2, React, TypeScript e Vite. A interface do aplicativo é padronizada com Tailwind CSS e shadcn/ui; os gráficos criados pelo operador mantêm seu próprio sistema visual.

## Estado atual

O projeto contém o scaffold do aplicativo desktop e o modelo inicial de documentos, composições, camadas, elementos, campos editáveis e keyframes. O escopo e as decisões de arquitetura estão registrados em [`SPEC-project-model.md`](SPEC-project-model.md), [`CAPABILITY-MAP.md`](CAPABILITY-MAP.md) e [`docs/intent/broadcast-graphics.md`](docs/intent/broadcast-graphics.md).

## Requisitos

- Node.js e npm
- Rust e as dependências de sistema necessárias para Tauri 2

## Desenvolvimento

```powershell
cd app
npm install
npm run tauri dev
```

Para gerar a versão web do frontend, use `npm run build` dentro de `app/`. Para executar os testes do modelo, use `npm test`.

## Estrutura

- `app/` — aplicativo Tauri, frontend React e modelo TypeScript
- `docs/` — intenção e decisões do produto
- `tasks/` — plano e acompanhamento das tarefas
- `.agents/skills/` — skills locais do projeto
- `skills-lock.json` — registro das skills instaladas no projeto

## Abrir em outro computador

Clone este repositório em um computador autenticado na conta GitHub que tem acesso a ele e abra a pasta clonada no Codex. O checkout local não é sincronizado automaticamente entre computadores.
