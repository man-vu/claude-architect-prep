La certificación **Claude Certified Architect — Foundations** valida que sabes tomar decisiones acertadas de trade-off al construir soluciones reales con Claude sobre cuatro tecnologías fundamentales: **Claude Code, el Claude Agent SDK, la Claude API y el Model Context Protocol (MCP)**.

## Para quién es
Un **arquitecto de soluciones** con ~6+ meses de experiencia práctica en producción con Claude: orquestación multiagente y delegación en subagentes (Agent SDK); CLAUDE.md, MCP, skills y modo de planificación (Claude Code); herramientas y recursos (MCP); esquemas JSON y few-shot (ingeniería de prompts); manejo de contexto en documentos largos y multiagente; automatización de CI/CD; y manejo de errores / human-in-the-loop.

## Formato
| Parámetro | Valor |
|---|---|
| Preguntas | 60 |
| Límite de tiempo | 120 minutos |
| Tipo de pregunta | Opción múltiple — 1 correcta de 4 |
| Estructura del examen | 4 escenarios seleccionados de un banco de 6 |
| Puntuación | Escala de 100–1000; **aprobado = 720** |
| Resultado | Aprobado o reprobado |
| Penalización por adivinar | Ninguna — responde todas las preguntas |
| Modalidad | Supervisado en línea o en un centro de examen |
| Costo | $125 USD |
| Vigencia | 12 meses desde la fecha de obtención |

## Los cinco dominios (por peso)
| Dominio | Peso |
|---|---|
| Arquitectura y Orquestación Agéntica | **27%** |
| Configuración y Flujos de Trabajo de Claude Code | **20%** |
| Ingeniería de Prompts y Salida Estructurada | **20%** |
| Diseño de Herramientas e Integración con MCP | **18%** |
| Gestión de Contexto y Fiabilidad | **15%** |

## Los seis escenarios
Cada examen selecciona al azar 4 de estos 6:
1. **Agente de Resolución de Soporte al Cliente** — problemas de devoluciones/facturación/cuenta mediante el Agent SDK con herramientas MCP (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`); objetivo de 80%+ de resolución en el primer contacto con escalamiento adecuado.
2. **Generación de Código con Claude Code** — generación, refactorización, depuración y documentación con comandos slash personalizados, CLAUDE.md y modo de planificación.
3. **Sistema de Investigación Multiagente** — un coordinador delega en subagentes de investigación web, análisis de documentos, síntesis y generación de informes; los informes deben incluir citas.
4. **Productividad del Desarrollador con Claude** — explorar bases de código desconocidas, código repetitivo (boilerplate) y automatización con herramientas integradas (Read/Write/Bash/Grep/Glob) y servidores MCP.
5. **Claude Code para Integración Continua** — revisiones automatizadas, generación de pruebas y feedback en PRs; prompts ajustados para minimizar los falsos positivos.
6. **Extracción de Datos Estructurados** — extraer de documentos no estructurados, validar con esquemas JSON y manejar casos límite.

## Cómo prepararse
1. Construye un bucle de agente completo con el Agent SDK (herramientas, manejo de errores, gestión de sesiones, subagentes con paso explícito de contexto).
2. Configura Claude Code para un proyecto real (jerarquía de CLAUDE.md, `.claude/rules/`, skills con `context: fork`/`allowed-tools`, MCP).
3. Diseña herramientas MCP con descripciones diferenciadoras y errores estructurados y categorizados.
4. Construye una canalización de extracción (`tool_use` + esquemas JSON, validación/reintentos, campos anulables, lotes).
5. Practica la ingeniería de prompts (few-shot, criterios explícitos, revisión en múltiples pasadas).
6. Estudia la gestión de contexto (extracción de hechos, scratchpads, delegación en subagentes).
7. Comprende el escalamiento y el human-in-the-loop (vacíos de política, solicitudes explícitas, falta de progreso; enrutamiento por confianza).
8. Realiza un examen de práctica con el mismo formato.

## Documentación oficial
La guía original enlaza la documentación oficial: Claude API (Messages, Tool Use, Message Batches); Agent SDK (Overview, Hooks, Subagents, Sessions); MCP (sitio, Tools, Resources, Servers); Claude Code (Overview, Memory, Skills, Hooks, Sub-agents, MCP, CI/CD de GitHub/GitLab, Headless); Prompt Engineering; Extended Thinking; y el Anthropic Cookbook.
