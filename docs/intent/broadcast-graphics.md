# Intenção do projeto: Broadcast Graphics

## Objetivo

Construir um aplicativo desktop Tauri para um operador criar gráficos broadcast para transmissões de qualquer nicho e controlar o que aparece no ar.

## Usuário e fluxo principal

- O operador monta composições no Editor, usando camadas, grupos e elementos posicionáveis.
- Cada composição pode conter campos de texto genéricos, animações com keyframes e efeitos.
- Na página Ao vivo, o operador edita os dados associados a cada componente em tabelas. Alterações ficam pendentes até selecionar o componente e acionar **Send-on-air**.
- O envio atualiza o componente correspondente que já está no ar, sem criar uma cópia. Componentes diferentes podem aparecer simultaneamente.
- Uma página HTML separada recebe as atualizações por WebSocket e serve como fonte de navegador no OBS ou vMix.

## Escopo inicial

- Um operador usando o aplicativo em um computador principal.
- Páginas separadas para Editor, Ao vivo e saída HTML.
- Criação flexível de gráficos pelo operador, sem restringir o fluxo a um nicho específico.
- A v1 permite elementos de texto, formas vetoriais e imagens; vídeo fica para depois.
- Projetos são arquivos JSON locais com autosave, e imagens ficam referenciadas dentro da pasta do projeto.
- Keyframes usam frames, com interpolação linear e presets ease-in/ease-out. O FPS é configurável por projeto, com padrão de 30 fps e opções 25, 29.97, 30, 50, 59.94 e 60 fps.
- Colaboração de vários operadores fica para uma etapa futura.

## Direção visual do Editor

O Editor deve seguir a organização de um editor de vídeo: preview acima da timeline, painel de edição de efeitos à esquerda e buscador de efeitos à direita. Fade, zoom e rotate são exemplos de efeitos desejados.

## Padronização da interface

Tailwind CSS e shadcn/ui serão usados para padronizar a interface do aplicativo, incluindo painéis, controles e navegação. Eles não definem nem limitam o visual dos gráficos criados pelo operador; os gráficos têm seu próprio modelo de composição, estilo e renderização.

## Stack aprovada

- Desktop: Tauri 2.
- Frontend: React, TypeScript e Vite.
- Interface do aplicativo: Tailwind CSS e shadcn/ui.
- As versões exatas estão no `app/package-lock.json`; Vitest é o executor de testes.

## Ainda não definido

Resolução e proporção da saída, biblioteca de renderização e protocolo detalhado de mensagens.
