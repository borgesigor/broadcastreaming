# Capability Map: Broadcast Graphics

O primeiro lançamento atende um operador. Colaboração em rede entre operadores está fora do escopo inicial.

| Module id | Responsabilidade | Depende de |
|---|---|---|
| `project-model` | Modelo de projeto, composições, elementos e campos de texto | — |
| `desktop-foundation` | Aplicativo Tauri, navegação entre Editor/Ao Vivo, hospedagem local e pontos de integração | `project-model` |
| `broadcast-output` | Página HTML para OBS/vMix, renderização das composições e recebimento de atualizações por WebSocket | `project-model`, `desktop-foundation` |
| `graphics-editor` | Criação de composições, camadas, grupos, elementos, preview, timeline, keyframes e efeitos | `project-model`, `desktop-foundation` |
| `live-control` | Tabelas de dados por componente, alterações pendentes e envio explícito com **Send-on-air** | `project-model`, `broadcast-output`, `desktop-foundation` |

## Ordem de construção proposta

`project-model` → `desktop-foundation` → (`broadcast-output` e `graphics-editor`) → `live-control`

O output e o editor podem ser especificados e implementados como módulos independentes após a fundação. `live-control` depende do contrato de atualização fornecido pelo output para alterar componentes ativos sem duplicá-los.
