Una referencia rápida de las tecnologías y conceptos en los que se basa el examen — úsala para verificar que un término te resulte familiar antes de adentrarte en las páginas de cada dominio.

## Tecnologías y conceptos
| Tecnología | Aspectos clave |
|---|---|
| **Claude Agent SDK** | `AgentDefinition`, bucles de agente, `stop_reason`, hooks (PostToolUse, interceptación de llamadas a herramientas), creación de subagentes mediante `Task`, `allowedTools` |
| **Model Context Protocol (MCP)** | servidores MCP, herramientas, recursos, `isError`, descripciones de herramientas, distribución de herramientas, `.mcp.json`, variables de entorno |
| **Claude Code** | jerarquía de CLAUDE.md, `.claude/rules/` con patrones glob, `.claude/commands/`, `.claude/skills/` con frontmatter de SKILL.md (`context: fork`, `allowed-tools`, `argument-hint`), modo plan vs. ejecución directa, `/memory`, `/compact`, `--resume`, `fork_session`, subagente Explore |
| **Claude Code CLI** | `-p` / `--print` (no interactivo), `--output-format json`, `--json-schema` |
| **Claude API** | `tool_use` con esquemas JSON, `tool_choice` (`auto`/`any`/forzado), `stop_reason`, `max_tokens`, prompts de sistema |
| **Message Batches API** | ~50% de ahorro, ventana de hasta 24 horas, `custom_id`, sondeo (polling) hasta completarse, sin llamadas a herramientas multiturno |
| **JSON Schema** | Obligatorio vs. opcional, campos anulables, tipos enum, `"other"` + detalle, modo estricto |
| **Pydantic** | Validación de esquemas, errores semánticos, bucles de validación/reintento |
| **Herramientas integradas** | Read, Write, Edit, Bash, Grep, Glob — propósito y criterios de selección |
| **Few-shot prompting** | Ejemplos específicos para situaciones ambiguas, generalización a nuevos patrones |
| **Prompt chaining** | Descomposición secuencial en pasadas enfocadas |
| **Context window** | Presupuestos de tokens, resumen progresivo, "lost in the middle", archivos de scratchpad |
| **Gestión de sesiones** | Reanudación, `fork_session`, sesiones con nombre, aislamiento de contexto |
| **Calibración de confianza** | Puntuación a nivel de campo, calibración sobre conjuntos etiquetados, muestreo estratificado |
