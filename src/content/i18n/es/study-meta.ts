import type { StudyPageMeta } from "../types";

export const esStudyMeta: Record<string, StudyPageMeta> = {
  "agent-architecture": {
    title: "Arquitectura y orquestación de agentes",
    blurb:
      "Bucles agénticos, orquestación coordinador/subagente, hooks, descomposición de tareas y manejo de errores multiagente.",
  },
  "claude-code-config": {
    title: "Configuración y flujos de trabajo de Claude Code",
    blurb:
      "Jerarquía de CLAUDE.md, reglas, skills y comandos, modo de planificación, comandos de sesión/memoria y la CLI para CI/CD.",
  },
  "prompt-engineering": {
    title: "Ingeniería de prompts y salida estructurada",
    blurb:
      "Few-shot, criterios explícitos, encadenamiento, el patrón de entrevista, bucles de validación, autocorrección y lotes.",
  },
  "tool-mcp-design": {
    title: "Diseño de herramientas e integración con MCP",
    blurb:
      "Descripciones de herramientas, diseño de esquemas JSON, tool_choice, servidores MCP y las herramientas integradas.",
  },
  "context-reliability": {
    title: "Gestión del contexto y fiabilidad",
    blurb:
      "Ausencia de estado, gestión del contexto, escalado y supervisión humana (human-in-the-loop), y procedencia.",
  },
  "exam-overview": {
    title: "Formato del examen y escenarios",
    blurb:
      "Formato, puntuación, los 5 dominios ponderados, los 6 escenarios, recomendaciones de preparación y la documentación oficial.",
  },
  glossary: {
    title: "Tecnologías y conceptos (glosario)",
    blurb:
      "Referencia rápida de los conceptos del SDK, MCP, Claude Code, la API y la ingeniería de prompts.",
  },
  "out-of-scope": {
    title: "Temas fuera del alcance",
    blurb: "Lo que el examen NO cubre, para que no estudies de más.",
  },
};
