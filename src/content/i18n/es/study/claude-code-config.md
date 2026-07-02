Claude Code se configura mediante un conjunto de archivos y directorios organizados en capas, en lugar de un único bloque de configuración. Saber *en qué capa* pertenece una determinada configuración —usuario vs. proyecto vs. directorio, siempre cargada vs. bajo demanda— es la habilidad central que evalúa este dominio, ya que la mayoría de los escenarios del examen son de diagnóstico: «un compañero de equipo no está recibiendo X, ¿dónde se configuró mal?».

## Jerarquía de CLAUDE.md

Claude Code carga el contexto del proyecto desde archivos `CLAUDE.md` en tres niveles distintos. Cada nivel responde a una pregunta diferente: *quién* debe ver esto y *cuándo*.

| Nivel | Ubicación | Alcance | ¿Bajo control de versiones? |
|---|---|---|---|
| Usuario | `~/.claude/CLAUDE.md` | Solo ese usuario, en todos sus proyectos | No — personal, nunca se comparte mediante el VCS |
| Proyecto | `.claude/CLAUDE.md` o `CLAUDE.md` en la raíz | Todos los colaboradores del repositorio | Sí — incluido en el commit, para todo el equipo |
| Directorio | `CLAUDE.md` dentro de un subdirectorio | Solo se carga cuando Claude Code edita archivos en ese directorio | Sí (reside en el repositorio) |

La distinción que más importa para el examen: **la configuración a nivel de usuario es invisible para los nuevos compañeros de equipo.** Si colocas los estándares de código del equipo en `~/.claude/CLAUDE.md`, estos residen únicamente en tu máquina; un nuevo desarrollador que clona el repositorio y ejecuta Claude Code no recibe nada de eso, porque ese archivo nunca estuvo en el repositorio en primer lugar.

> **Escenario de diagnóstico clásico:** Las sesiones de Claude Code de un nuevo integrante del equipo no siguen las convenciones de la API del equipo, aunque «todos ya lo tienen funcionando». Causa raíz: las convenciones se escribieron en el `~/.claude/CLAUDE.md` del líder técnico en lugar del `.claude/CLAUDE.md` del proyecto. Solución: mover el contenido a un archivo a nivel de proyecto (bajo control de versiones) para que se distribuya con el repositorio.

El `CLAUDE.md` a nivel de directorio es aún más específico: solo se activa cuando Claude Code está trabajando activamente con archivos *en ese directorio*, lo que lo hace útil para convenciones específicas de un paquete o módulo en un monorepo sin sobrecargar el archivo raíz.

```
repo/
├── CLAUDE.md                 # project-wide, all contributors
├── packages/
│   ├── api/
│   │   └── CLAUDE.md         # loads only when editing files under packages/api/
│   └── web/
│       └── CLAUDE.md         # loads only when editing files under packages/web/
```

## Importaciones con @path

En lugar de escribir un único `CLAUDE.md` gigante, puedes dividir el contenido en archivos específicos e incorporarlos mediante referencias `@path`:

```markdown
Coding standards are described in @./standards/coding-style.md
Refer to @README.md for project overview.
```

Reglas:
- Sin espacio entre `@` y la ruta.
- Se admiten tanto rutas relativas (`@./standards/x.md`) como absolutas.
- Las importaciones pueden anidarse, pero solo hasta **5 niveles de profundidad**: una importación dentro de un archivo importado dentro de otro archivo importado, etc., con un límite de 5.

Esto evita la duplicación: un monorepo grande puede mantener un único `coding-style.md` canónico y referenciarlo desde el `CLAUDE.md` de cada paquete, de modo que cada paquete incorpore solo los estándares que le resultan relevantes en lugar de un único archivo monolítico por el que todos tienen que desplazarse.

## `.claude/rules/` — carga condicional en función de la ruta

El `CLAUDE.md` (en cualquier nivel) siempre se carga una vez que su directorio está dentro del alcance. `.claude/rules/` ofrece un eje diferente: reglas que se cargan en función de **qué archivo se está editando**, no de en qué directorio te encuentras.

```
.claude/rules/
├── testing.md
└── api-conventions.md
```

Cada archivo de regla lleva un frontmatter YAML con un glob `paths`:

```markdown
---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---

# Testing conventions

- Use `describe`/`it`, not `test()`.
- Mock network calls with MSW, never real fetch.
```

La regla se carga **únicamente** cuando Claude Code toca un archivo que coincide con ese glob, independientemente del directorio en el que resida el archivo. Este es el contraste clave con el `CLAUDE.md` a nivel de directorio:

| Mecanismo | Disparador | Ideal para |
|---|---|---|
| `CLAUDE.md` a nivel de directorio | Editar cualquier archivo en un directorio específico | Convenciones ligadas a un único lugar (p. ej. `packages/api/`) |
| `.claude/rules/*.md` con `paths` | Editar cualquier archivo que coincida con un glob, en cualquier parte del repositorio | Convenciones ligadas a un *tipo* de archivo, repartidas por todo el repositorio (p. ej. todos los `*.test.tsx`, todos los manejadores de rutas de la API) |

Dado que las reglas irrelevantes simplemente nunca se cargan, esto también **ahorra tokens de contexto**: una regla sobre convenciones de pruebas no se incorpora al contexto mientras editas un archivo de configuración.

## Comandos personalizados

Los comandos de barra (slash commands) personalizados residen en archivos Markdown y se pueden delimitar de la misma forma que CLAUDE.md:

| Ubicación | Alcance | ¿Bajo control de versiones? |
|---|---|---|
| `.claude/commands/` | Todo el equipo, disponible en el momento en que alguien clona el repositorio | Sí |
| `~/.claude/commands/` | Solo tú, en todos los proyectos | No |

```
.claude/commands/
└── review.md      # becomes the team-wide /review command
```

Si el examen pregunta «dónde colocas un comando `/review` para que todo el equipo lo obtenga al clonar», la respuesta es `.claude/commands/` en el repositorio, no el directorio de usuario, por el mismo razonamiento de control de versiones que CLAUDE.md.

## Skills

Las Skills empaquetan una capacidad reutilizable (un flujo de trabajo completo, no solo un fragmento de prompt) en `.claude/skills/<name>/SKILL.md`, con un frontmatter YAML que controla cómo se ejecutan:

```markdown
---
name: review
description: Reviews the current diff for correctness bugs and simplification opportunities.
context: fork
allowed-tools: ["Read", "Grep", "Glob", "Bash(git diff:*)"]
argument-hint: "[effort level: low|medium|high]"
---

# Review

1. Run `git diff` against the base branch.
2. ...
```

Campos clave del frontmatter:

- **`context: fork`** — ejecuta la skill en un subagente aislado. Su salida verbosa de herramientas (ruido de búsqueda, lecturas intermedias) nunca contamina la ventana de contexto de la sesión principal; solo regresa el resultado final.
- **`allowed-tools`** — restricción de herramientas de mínimo privilegio. Una skill de revisión de código que solo necesita `Read`/`Grep`/`Glob` no debería poder además `Write` ni `rm`; declarar `allowed-tools` lo impone incluso si las instrucciones de la skill nunca mencionan la escritura.
- **`argument-hint`** — se muestra al usuario cuando la skill se invoca sin argumentos, indicándole qué debe proporcionar (p. ej. `[effort level: low|medium|high]`).

**Skills vs. CLAUDE.md** es una distinción que se evalúa con frecuencia:

- **CLAUDE.md** — siempre cargado, pasivo, estándares generales («usamos sangría de 2 espacios», «las pruebas van en `__tests__/`»).
- **Skill** — bajo demanda, activa, invocada para una tarea específica (`/review`, `/analyze`, `/deploy`). Es un procedimiento, no un hecho.

Al igual que los comandos, las skills tienen variantes personales: `~/.claude/skills/<name>/SKILL.md` para una skill que usas en tus propios proyectos pero que no has confirmado (o no deberías confirmar) en el repositorio del equipo.

## Modo de planificación vs. ejecución directa

Claude Code puede operar en dos modos, y elegir el adecuado para cada situación es en sí mismo un juicio que el examen evalúa.

El **modo de planificación** es una exploración de solo lectura: el modelo utiliza `Read`/`Grep`/`Glob` (y similares) para investigar el código base y luego produce un plan para que el usuario lo apruebe — **cero efectos secundarios** hasta que esa aprobación ocurra. Úsalo cuando:

- El cambio abarca decenas de archivos.
- Existen múltiples enfoques de implementación plausibles y la elección importa.
- Estás migrando una biblioteca o tomando una decisión arquitectónica.
- El código base es desconocido y un primer movimiento erróneo resulta costoso.

La **ejecución directa** pasa directamente a la implementación. Úsala cuando:

- La corrección se limita a un único archivo.
- Hay un stack trace claro que señala el error.
- El cambio es bien comprendido e inequívoco: realmente solo hay una manera razonable de hacerlo.

Los dos se combinan en un flujo de trabajo estándar:

```
Planning mode (investigate + design)
        ↓
User reviews and approves the plan
        ↓
Direct execution (implement exactly what was approved)
```

Un patrón relacionado: despachar un **subagente Explore** para realizar el trabajo de descubrimiento intensivo en lecturas (buscar símbolos, mapear un árbol de directorios, encontrar sitios de llamada) aísla ese ir y venir verboso del contexto de la sesión principal; la sesión principal recibe una respuesta destilada en lugar de cada resultado intermedio de grep, el mismo beneficio que `context: fork` aporta a las skills.

## CLI para CI/CD

Ejecutar Claude Code dentro de una canalización (pipeline) requiere indicadores (flags) distintos de los del uso interactivo.

```bash
# Non-interactive: print the result and exit — never waits for a TTY.
# This is the ONLY correct way to invoke Claude Code from CI.
claude -p "Summarize the failing tests in this PR" 

# Structured output for machine parsing (e.g. posting inline PR comments)
claude -p "Review this diff for bugs" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"issues":{"type":"array"}}}'
```

- **`-p` / `--print`** — modo no interactivo. Procesa el prompt, escribe el resultado en stdout y sale. Cualquier otro modo espera un TTY y se quedará colgado en CI, razón por la cual este es el único indicador correcto para uso en canalizaciones.
- **`--output-format json`** combinado con **`--json-schema '{...}'`** — fuerza una salida estructurada y validada contra un esquema en lugar de prosa libre, de modo que un script de CI pueda analizarla directamente (p. ej. para publicar automáticamente comentarios de revisión en línea en el PR por cada hallazgo).
- **`--resume <session-name>`** — continúa una sesión guardada previamente con su contexto acumulado, útil para investigaciones largas repartidas en varias invocaciones. **Riesgo:** si los archivos cambiaron desde que se guardó la sesión, los resultados de herramientas en caché de la sesión (contenidos de archivos, coincidencias de grep) quedan obsoletos; la sesión reanudada no vuelve a leer automáticamente nada de lo que ya «vio».

### Higiene de las sesiones de revisión

Una buena práctica que vale la pena interiorizar: **revisa el código en una sesión independiente de la que lo escribió.** La sesión que generó un diff está sesgada hacia sus propias decisiones; está mal posicionada para detectar sus propios errores. Inicia una sesión nueva (contexto nuevo, sin `--resume`) específicamente para revisar.

Al volver a revisar después de subir las correcciones, proporciona a la nueva sesión los hallazgos previos de forma explícita y pídele que informe únicamente los problemas **nuevos o aún sin resolver**; de lo contrario, cada nueva revisión vuelve a enumerar los mismos problemas ya corregidos, ocultando lo que realmente cambió.

**CLAUDE.md es la forma en que un Claude Code invocado desde CI obtiene el contexto del proyecto.** Una ejecución de canalización no tiene a ningún humano que explique las convenciones, así que el CLAUDE.md incluido en el repositorio debe contenerlas: estándares de pruebas, convenciones de fixtures y criterios de revisión. Documentar cómo es una prueba *valiosa* y qué fixtures existen mejora de forma medible la calidad de las pruebas generadas y reduce la salida de bajo valor.

**Para la generación de pruebas, incluye los archivos de prueba existentes en el contexto.** Sin ellos, el generador no puede saber qué escenarios ya están cubiertos y propondrá alegremente duplicados de pruebas que la suite ya tiene; con ellos, apunta a comportamiento genuinamente sin cubrir.

```bash
# First pass — independent reviewer, structured output for tooling
claude -p "Review this PR diff" --output-format json --json-schema "$SCHEMA"

# Second pass — pass prior findings in, ask for delta only
claude -p "Here are the prior review findings: $PRIOR_JSON.
Re-review the current diff. Report ONLY new or unresolved issues."
```

## Referencia rápida: todos los mecanismos de un vistazo

| Mecanismo | Variante personal | Variante de equipo | Se carga cuando... |
|---|---|---|---|
| CLAUDE.md | `~/.claude/CLAUDE.md` | `.claude/CLAUDE.md` o `CLAUDE.md` en la raíz | Siempre (proyecto/usuario), o cuando estás en ese directorio (a nivel de directorio) |
| Reglas | — | `.claude/rules/*.md` | El archivo editado coincide con el glob `paths` de la regla |
| Comandos | `~/.claude/commands/` | `.claude/commands/` | Invocado explícitamente (`/command-name`) |
| Skills | `~/.claude/skills/<name>/` | `.claude/skills/<name>/` | Invocada explícitamente, opcionalmente bifurcada (fork) en un subagente |

El hilo común: todo lo que está bajo `~/.claude/` es tuyo únicamente e invisible para los colaboradores; todo lo que está bajo el `.claude/` del proyecto (o un `CLAUDE.md` en la raíz del repositorio) se distribuye con `git clone` y es lo que ve todo el equipo.

## Comandos de sesión y memoria

Dos comandos integrados de Claude Code gestionan el contexto y la memoria:

- **`/compact`** comprime el contexto actual: resume el historial previo para liberar la ventana de contexto durante sesiones largas de investigación que se llenan de salida verbosa de herramientas. Riesgo: los valores numéricos exactos, las fechas y los detalles específicos pueden perderse en el resumen, así que extrae los datos críticos a un bloque persistente o a un scratchpad antes de compactar.
- **`/memory`** abre el archivo `CLAUDE.md` para editarlo, de modo que puedas guardar notas, preferencias y contexto que persisten entre sesiones y se cargan automáticamente al inicio. Es la alternativa a volver a explicar las mismas convenciones del proyecto y el contexto del trabajo actual en cada sesión.

### Gestión de sesiones: `--resume` y `fork_session`

- **`--resume <session-name>`** continúa una sesión con nombre previa con su contexto guardado, útil para investigaciones largas que abarcan varias sesiones:
  ```bash
  claude --resume investigation-auth-bug
  ```
  Riesgo: si los archivos cambiaron desde esa sesión, sus resultados de herramientas pueden estar **obsoletos**.
- **`fork_session`** ramifica una sesión independiente a partir de un punto de contexto compartido. Ambos forks heredan el contexto hasta el punto de bifurcación y luego divergen, lo que resulta útil para comparar enfoques (p. ej. «Redux vs Context API») sin contaminación cruzada.
- **Cuándo empezar de cero en lugar de reanudar:** si los resultados de herramientas están obsoletos (los archivos cambiaron) o ha pasado mucho tiempo y el contexto se ha degradado, reinicia con un breve resumen («Esto es lo que encontramos: …») en lugar de reanudar con datos de herramientas antiguos.

## Refinamiento iterativo para la mejora progresiva

Un buen resultado suele ser iterativo, no de un solo intento:

- **Los ejemplos concretos de entrada/salida** son la forma más eficaz de comunicar las expectativas: proporciona 2–3 muestras (incluidos los casos límite) que muestren la transformación que deseas.
- **Iteración guiada por pruebas:** escribe primero las pruebas / el comportamiento esperado y luego itera en función de los fallos.
- **El patrón de entrevista:** deja que Claude haga preguntas aclaratorias para sacar a la luz consideraciones de diseño no evidentes (invalidación de caché, modos de fallo) antes de implementar; consulta la página de Ingeniería de prompts.
- **Retroalimentación por lotes vs. secuencial:** da **todos** los problemas en un solo mensaje cuando son **interdependientes**; dalos **de forma secuencial** cuando son independientes, para que cada corrección se evalúe de forma aislada.

## Enfoque del examen

- **Los diagnósticos de ubicación son el tipo de pregunta recurrente**: dado un síntoma («el nuevo empleado no tiene los estándares», «el comando no está disponible para el equipo», «la regla se carga en todas partes en lugar de solo en las pruebas»), identifica qué capa de configuración se usó incorrectamente. Domina a la perfección los cuatro ejes de ubicación: usuario (`~/.claude/`) vs. proyecto (`.claude/`) vs. `CLAUDE.md` a nivel de directorio vs. `.claude/rules/` delimitado por ruta.
- **`.claude/rules/` vs. `CLAUDE.md` a nivel de directorio**: ambos delimitan el contenido, pero en dimensiones diferentes: patrón de archivo (glob `paths`, en cualquier parte del repositorio) vs. directorio físico. Una regla para «todos los archivos de prueba» es `.claude/rules/` con un glob; una regla para «todo lo que está bajo `packages/api/`» es un `CLAUDE.md` a nivel de directorio.
- **Los campos del frontmatter de las skills y qué te aporta cada uno**: `context: fork` (aislamiento de contexto), `allowed-tools` (mínimo privilegio), `argument-hint` (UX para argumentos faltantes). Ten claro que las Skills son procedimientos bajo demanda y que CLAUDE.md son estándares siempre cargados.
- **`-p`/`--print` es el único modo de CI correcto**: memoriza este planteamiento; espera una pregunta formulada como «por qué se cuelga la canalización» cuya respuesta sea la falta del indicador `-p`.
- **Riesgo de obsolescencia de `--resume`**: los resultados de las llamadas a herramientas de una sesión reanudada no se actualizan automáticamente si los archivos subyacentes cambiaron; no asumas que una sesión reanudada tiene información actual.
- **Sesiones de revisión independientes**: revisar en la misma sesión que escribió el código es un antipatrón con nombre propio; espera una pregunta que evalúe si reutilizarías la sesión generadora (incorrecto) o si empezarías de cero (correcto), además de la técnica de informe de deltas para las nuevas revisiones.
- **El contexto de CI proviene de CLAUDE.md** (estándares de pruebas, fixtures, criterios de revisión), y **la generación de pruebas necesita los archivos de prueba existentes en el contexto** para no duplicar escenarios ya cubiertos.
