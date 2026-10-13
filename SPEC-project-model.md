# Spec: `project-model` — Broadcast Graphics

**Status:** aprovada pelo usuário  
**Capability map:** [`CAPABILITY-MAP.md`](./CAPABILITY-MAP.md)

## 1. Objective

Definir o modelo serializável que representa um projeto de gráficos broadcast, suas composições, elementos, campos editáveis, grupos, camadas e dados de animação. Este é o contrato compartilhado pelo Editor, pela página Ao vivo e pela saída HTML.

Uma composição gráfica deve ter identidade estável. Seus campos de texto também precisam de identidade estável para que **Send-on-air** atualize o componente correto já exibido, sem criar outro. Diferentes composições podem permanecer ativas ao mesmo tempo.

### Acceptance criteria

- Um projeto representa composições independentes; cada composição mantém um ID estável.
- Uma composição representa grupos e elementos posicionáveis em uma ordem reproduzível.
- Texto é modelado como campos genéricos com IDs estáveis, rótulos e valores padrão. Números, nomes e placares são valores textuais.
- Elementos da v1: texto, formas vetoriais e imagens. Vídeo fica fora do escopo inicial.
- O modelo distingue os valores definidos no Editor dos valores preparados para envio ao ar.
- `ProjectDocument` contém somente dados editáveis e assets. Campos em rascunho e valores no ar pertencem a `LiveControlState`, indexados por ID estável da composição e do campo.
- Keyframes usam tempo em frames, com interpolação linear e presets ease-in/ease-out.
- Cada projeto define seu FPS, com padrão de 30 fps e opções 25, 29.97, 30, 50, 59.94 e 60 fps.
- Projetos são arquivos JSON locais com autosave. Imagens são referenciadas dentro da pasta do projeto.
- O modelo pode ser serializado e reconstruído sem perder IDs, hierarquia, ordem, campos ou dados de animação.
- IDs são únicos dentro do documento. Cada array `layers` é ordenado de trás para frente; itens posteriores são desenhados sobre os anteriores.
- Posições e dimensões são números no espaço do canvas de saída. Dimensões do canvas e âncora de transformação serão especificadas no módulo de saída/renderização.

## 2. Tech stack

- Desktop: Tauri 2.
- Frontend: React, TypeScript e Vite.
- UI do aplicativo: Tailwind CSS e shadcn/ui. Esta camada não define o estilo dos gráficos criados pelo operador.
- Este módulo deve permanecer como lógica e tipos TypeScript sem dependência de componentes React, Tailwind ou shadcn/ui.
- O scaffold em `app/` usa npm e contém Tauri 2, React 19, TypeScript 6, Vite 8.3, Tailwind 4.3 e Vitest 5.0. Versões exatas estão registradas no `app/package-lock.json`.

As documentações oficiais confirmam o caminho Tauri com template React, o uso recomendado de Vite para SPA e o suporte do shadcn/ui a projetos Vite.

## 3. Commands

Comandos disponíveis em `app/`:

- Instalar dependências (`npm install`).
- Executar a aplicação Tauri (`npm run tauri dev`).
- Construir a interface (`npm run build`).
- Executar testes unitários do modelo (`npm test`, Vitest).

O scaffold foi criado com `create-tauri-app`; `npm install`, `npm run build`, `npm test` e `npm run tauri dev` foram verificados.

## 4. Project structure

Estrutura proposta para este módulo:

```text
app/src/
  features/
    project-model/
      types.ts          # tipos do projeto, composição, grupos, elementos e campos
      create-project.ts # criação de documento com FPS padrão
      validation.ts     # validação de documentos e IDs
      serialization.ts  # serialização e reconstrução do modelo
      index.ts          # API pública do módulo
      project-model.test.ts
```

Editor, Ao vivo e saída HTML consomem o contrato deste módulo; componentes visuais não fazem parte de `project-model`.

## 5. Code style

Use nomes claros em inglês para tipos e propriedades de código, IDs opacos e valores textuais para os campos editáveis. Mantenha tipos e validação independentes da interface.

```ts
export type TextFieldDefinition = {
  id: string;
  label: string;
  defaultValue: string;
};
```

O exemplo mostra o contrato conceitual, não uma API final aprovada.

## 6. Testing strategy

Cobrir o modelo com testes unitários para:

- Validação de IDs únicos para composições, elementos e campos.
- Preservação da hierarquia de grupos e da ordem de camadas.
- Preservação dos valores padrão definidos no Editor, sem alterá-los ao preparar dados de Ao vivo.
- Serialização e reconstrução sem perda de conteúdo ou identidade.
- Atualização direcionada pelo ID do componente e do campo, sem duplicação de composição.

Local proposto: `app/src/features/project-model/project-model.test.ts`. Executor: Vitest.

A serialização persiste apenas os campos reconhecidos do contrato do projeto; o estado de Ao vivo não é parte do arquivo JSON. Autosave em disco e cópia de assets são responsabilidades da integração desktop.

## 7. Boundaries

- **Always:** manter IDs estáveis para componentes e campos; manter dados de composição independentes da UI; tratar nomes, números e placares como valores de texto nesta versão.
- **Ask first:** mudar o formato persistido, introduzir migrações incompatíveis, criar tipos de campo além de texto genérico ou adicionar dependências ao módulo.
- **Never:** usar tokens ou componentes shadcn para estilizar os gráficos do operador; identificar a atualização ao vivo apenas por posição ou rótulo; duplicar uma composição ao atualizar seus campos.

## Success criteria

- Os consumidores conseguem identificar e atualizar um componente e um campo por IDs estáveis.
- Composições e valores padrão do Editor permanecem distintos dos valores preparados para envio.
- A estrutura preserva grupos, ordem, posicionamento, campos e dados de keyframe numa ida e volta de serialização.
- O módulo não depende de React nem de componentes visuais.

## Open questions

1. A saída terá dimensões editáveis por projeto ou uma resolução padrão fixa? (Impacta também `broadcast-output`.)

## Sources

- [Tauri — Create a Project](https://v2.tauri.app/start/create-project/): templates, comandos de scaffold e comandos de desenvolvimento com npm.
- [Tauri — Frontend Configuration](https://v2.tauri.app/start/frontend/): recomendação de Vite para SPAs como React.
- [shadcn/ui — Vite](https://ui.shadcn.com/docs/installation/vite): configuração de Tailwind e shadcn/ui para Vite e seleção React + TypeScript.
