Las herramientas convierten a Claude de un generador de texto en un agente capaz de consultar información, ejecutar acciones e integrarse con sistemas reales. Este dominio abarca cómo diseñar herramientas que el modelo seleccione correctamente y use de forma segura, cómo MCP estandariza las integraciones entre servidores, y cómo las herramientas integradas de Claude Code respaldan una investigación incremental y basada en evidencia.

## Definición de herramientas: las tres partes que importan

Cada herramienta que Claude puede invocar se define con tres campos:

```json
{
  "name": "get_customer",
  "description": "Finds a customer by email or ID. Returns the customer profile, including name, email, order history, and account status. Use this tool BEFORE lookup_order to verify the customer's identity. Accepts an email (format: user@domain.com) or a numeric customer_id.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string", "description": "Customer email" },
      "customer_id": { "type": "integer", "description": "Numeric customer ID" }
    },
    "required": []
  }
}
```

- `name` — un identificador corto. Importa mucho menos de lo que la mayoría supone.
- `description` — el **mecanismo principal** que el modelo usa para *seleccionar* una herramienta. Claude lee las descripciones, no el código fuente, para decidir qué herramienta encaja en el paso actual.
- `input_schema` — un JSON Schema que describe la forma de los argumentos que Claude debe producir.

### Descripciones débiles frente a descripciones sólidas

Una descripción débil no le da al modelo nada con lo que desambiguar:

```json
{ "name": "get_customer", "description": "Retrieves customer information." }
```

Si una segunda herramienta (`lookup_order`) tiene una descripción igual de vaga, Claude no tiene ninguna señal para saber cuál aplica cuando ambas podrían plausiblemente devolver «información del cliente». Esta es la causa más común, con diferencia, de la selección incorrecta de herramientas en agentes en producción.

Una descripción sólida (como el ejemplo de `get_customer` anterior) indica:

1. **Qué hace y qué devuelve** — «Returns the customer profile, including name, email, order history, and account status.»
2. **Formatos de entrada, con ejemplos** — «Accepts an email (format: `user@domain.com`) or a numeric `customer_id`.»
3. **Cuándo usarla frente a una herramienta similar** — «Use this tool BEFORE `lookup_order` to verify the customer's identity.»

### Antipatrones en el diseño de herramientas

| Antipatrón | Por qué falla |
|---|---|
| Descripciones idénticas o casi idénticas entre herramientas | El modelo no puede distinguir `get_customer` de `find_customer` — selección arbitraria o incorrecta |
| Sin ejemplos de entrada | El modelo adivina el formato (p. ej., si `customer_id` es una cadena o un entero) y puede fabricar un valor |
| Sin un límite declarado frente a herramientas similares | El modelo no puede decidir entre herramientas que se solapan (`analyze_content` frente a un `extract_web_results` más específico) |
| Verbos vagos («process», «handle», «manage») | No le dice al modelo qué modifica el estado frente a qué solo lee |

Cuando dos herramientas realmente se solapan en función, la solución suele ser **renombrar y acotar el alcance** en lugar de escribir una descripción más larga — p. ej., renombrar `analyze_content` a `extract_web_results` elimina la ambigüedad a nivel del nombre, respaldado por una descripción que declara el propósito más acotado.

## input_schema: JSON Schema para los argumentos

El `input_schema` es un objeto JSON Schema. Sus decisiones de diseño controlan directamente si el modelo fabrica datos o si reporta la incertidumbre con honestidad.

### «Required» significa «siempre disponible», no «importante»

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string" },
    "customer_id": { "type": "integer" }
  },
  "required": []
}
```

Marca un campo como `required` **solo si la información siempre está disponible** en el momento de la llamada. Si un campo se marca como requerido pero los datos de entrada a veces carecen de él, Claude inventará un valor de apariencia plausible para satisfacer el esquema en lugar de fallar la llamada. Los campos requeridos son una promesa sobre la disponibilidad, no una declaración de importancia — un campo importante pero que a veces falta debe figurar en el esquema como opcional y nullable, no como requerido.

### Los campos nullable previenen las alucinaciones

```json
{
  "optional_field": {
    "type": ["string", "null"],
    "description": "Null if the information was not found in the source"
  }
}
```

Usar una unión de tipos como `["string", "null"]` le da al modelo una forma explícita y válida de decir «esto realmente no está» — devuelve `null` en lugar de alucinar un valor para rellenar el hueco. Cualquier campo que describa información que podría no existir en los datos subyacentes debería ser nullable.

### Los enums necesitan vías de escape

```json
{
  "category": {
    "type": "string",
    "enum": ["bug", "feature", "docs", "unclear", "other"]
  },
  "category_detail": {
    "type": ["string", "null"],
    "description": "Details if category = 'other' or 'unclear'"
  }
}
```

Un enum cerrado sin una vía de escape obliga al modelo a encajar cada caso del mundo real en uno de los cubos listados, incluso cuando ninguno encaja. Dos adiciones lo resuelven:

- **`"other"`** — acompañado de un campo de detalle de texto libre (`category_detail`), para que la información fuera de las categorías predefinidas no se descarte silenciosamente.
- **`"unclear"`** — para la ambigüedad genuina. Cuando el modelo no puede elegir una categoría con confianza, un honesto `"unclear"` es mejor que una respuesta incorrecta dada con confianza.

### Restricciones numéricas y de cadenas

Usa las palabras clave estándar de JSON Schema para acotar el espacio de valores válidos y detectar entradas malformadas antes de que lleguen a tu sistema:

```json
{
  "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
  "severity": { "type": "string", "enum": ["critical", "high", "medium", "low"] },
  "zip_code": { "type": "string", "pattern": "^[0-9]{5}$" }
}
```

`minimum` / `maximum` acotan rangos numéricos (p. ej., una puntuación de confianza no puede ser 1.5). `pattern` impone la forma de una cadena (p. ej., un código postal de 5 dígitos). Son barreras de protección baratas y deterministas — no pueden corregir un razonamiento defectuoso, pero eliminan toda una categoría de salida malformada antes de que llegue a ejecutarse.

### Ejemplo de esquema completo

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["bug", "feature", "docs", "unclear", "other"]
    },
    "category_detail": {
      "type": ["string", "null"],
      "description": "Details if category = 'other' or 'unclear'"
    },
    "severity": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "optional_field": {
      "type": ["string", "null"],
      "description": "Null if the information was not found in the source"
    }
  },
  "required": ["category", "severity"]
}
```

### Errores de sintaxis frente a errores semánticos

`tool_use` combinado con un JSON Schema es la forma **más fiable** de obtener salida estructurada de Claude, pero solo resuelve una clase de problema:

| Tipo de error | Ejemplo | Qué lo elimina |
|---|---|---|
| Sintaxis | Llave faltante, coma final, tipo de campo incorrecto, campo requerido faltante | `tool_use` + JSON Schema — la API impone un JSON válido que coincida con el esquema |
| Semántica | Los totales de las partidas no suman correctamente, un valor se coloca en el campo equivocado (aunque válido según el esquema) | **No** lo resuelve el esquema — necesita validación a nivel de aplicación y un bucle de reintento con retroalimentación |

Una respuesta puede ser perfectamente válida según el esquema y aun así estar *equivocada*. La validación del esquema garantiza la forma; no dice nada sobre la corrección. Los errores semánticos requieren tus propias comprobaciones (p. ej., recalcular un total y compararlo) y, en caso de fallo, devolver la discrepancia al modelo para un intento corregido.

## tool_choice

El parámetro `tool_choice` controla si Claude debe invocar una herramienta en un turno dado — y cuál.

| Valor | Comportamiento | Cuándo usarlo |
|---|---|---|
| `{"type": "auto"}` | El modelo decide si invoca una herramienta o responde en texto plano | Predeterminado para la mayoría del uso conversacional/agéntico — deja que el modelo razone sobre si se necesita una herramienta |
| `{"type": "any"}` | El modelo **debe** invocar alguna herramienta (cualquiera de las provistas) | Necesitas garantizar una salida estructurada/con forma de herramienta y no te importa cuál, siempre que se dispare una |
| `{"type": "tool", "name": "verify_customer"}` | El modelo **debe** invocar la herramienta nombrada | Necesitas forzar un primer paso específico o imponer el orden de ejecución |

Un patrón común: forzar una herramienta específica en el primer turno para garantizar que se ejecute una precondición requerida (p. ej., `{"type": "tool", "name": "verify_customer"}` para hacer que la verificación de identidad no sea opcional), y luego cambiar a `{"type": "auto"}` en el siguiente turno para que el modelo pueda razonar libremente una vez satisfecha esa precondición. Forzar una herramienta en cada turno le quita al modelo la capacidad de reconocer cuándo no corresponde ninguna llamada a herramienta, por lo que suele ser una técnica de un solo uso más que un ajuste permanente.

## El ciclo de tool_use

La invocación de herramientas es un bucle, no una sola petición. Claude no ejecuta las herramientas por sí mismo — emite una petición para invocar una, tu aplicación la ejecuta y tú devuelves el resultado.

1. **Envías** una petición con el historial de la conversación y las `tools` disponibles.
2. **Claude responde** con `stop_reason: "tool_use"` y uno o más bloques de contenido `tool_use`:

```json
{
  "stop_reason": "tool_use",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01A09q90qw90lq917835lq9",
      "name": "get_customer",
      "input": { "email": "user@domain.com" }
    }
  ]
}
```

3. **Tu aplicación ejecuta** la herramienta (invoca la API/BD/función real) usando `name` e `input`.
4. **Añades un bloque `tool_result`**, emparejado con la llamada mediante `tool_use_id`, como el *siguiente turno de usuario*:

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
      "content": "{\"name\":\"Jane Doe\",\"status\":\"active\",\"orders\":3}"
    }
  ]
}
```

5. **Envías de vuelta el historial completo y actualizado** a Claude. El modelo no tiene memoria entre peticiones — cada petición debe llevar la conversación completa hasta ese momento, incluyendo todas las llamadas a herramientas y sus resultados previos.
6. **Repite** hasta que `stop_reason` regrese como `"end_turn"` (tarea completa) en lugar de `"tool_use"`.

### Referencia de stop_reason

| Valor | Significado / acción |
|---|---|
| `"end_turn"` | Claude ha terminado — muestra el resultado al usuario |
| `"tool_use"` | Claude quiere invocar una herramienta — ejecútala y devuelve un `tool_result` |
| `"max_tokens"` | La respuesta se truncó — puede que necesites un límite de tokens más alto |
| `"stop_sequence"` | Se alcanzó una secuencia de parada configurada — gestiónala según la lógica de tu aplicación |

## Model Context Protocol (MCP)

MCP es un protocolo estándar para conectar Claude a sistemas externos — fuentes de datos, APIs y herramientas — sin escribir código de integración a medida para cada combinación de modelo y servicio.

### Tres primitivas

| Primitiva | Propósito | Ejemplo |
|---|---|---|
| **Tools** | Acciones que pueden modificar el estado o desencadenar efectos secundarios | Crear un ticket de Jira, enviar un mensaje de Slack, ejecutar una consulta que escribe datos |
| **Resources** | Contexto de solo lectura que el modelo puede incorporar | Un archivo, un esquema de base de datos, un catálogo de contenido, documentación |
| **Prompts** | Plantillas de prompt predefinidas expuestas por el servidor | Una plantilla de «resumir este ticket» con variables definidas por el servidor |

La distinción clave es que **las Tools actúan, los Resources informan**. Los Resources existen para que el modelo (o la aplicación) tenga un «mapa» inmediato de lo que está disponible — p. ej., un catálogo de todas las tareas del proyecto o un esquema de base de datos — sin necesidad de hacer llamadas exploratorias a herramientas solo para descubrir la estructura.

### Configuración del servidor: proyecto frente a usuario

**A nivel de proyecto — `.mcp.json`** (en la raíz del proyecto, versionado, compartido con el equipo):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

- Se incluye en el repositorio para que cada miembro del equipo obtenga la misma configuración del servidor.
- Los secretos se referencian mediante la sustitución de variables de entorno `${VAR}` — el **token en sí nunca se incluye en el control de versiones**, solo la referencia a una variable de entorno que proporciona la shell del desarrollador.

**A nivel de usuario — `~/.claude.json`** (en el directorio home del usuario, no versionado):

- Servidores personales, experimentos o credenciales específicas de un único desarrollador.
- No se comparte con el equipo — apropiado para probar un servidor antes de proponerlo a nivel de proyecto, o para integraciones puramente personales.

### Servidores comunitarios frente a personalizados

Para integraciones estándar — GitHub, Jira, Slack y sistemas similares de amplio uso — prefiere los **servidores MCP comunitarios** existentes antes que construir el tuyo propio. Ya están probados frente a las peculiaridades de la API objetivo y se mantienen de forma independiente a tu proyecto.

Construye un **servidor personalizado** solo para flujos de trabajo únicos y específicos de tu equipo que ningún servidor comunitario cubra — p. ej., un sistema interno propietario o un flujo de trabajo específico del modelo de datos de tu organización. Escribir un servidor personalizado se justifica por la singularidad, no por el deseo de tener un control adicional sobre una integración ya bien cubierta.

### Manejo estructurado de errores

Una herramienta o un servidor MCP que solo devuelve `"Operation failed"` ante un error no le da al agente que la invoca nada sobre lo que actuar — no puede saber si reintentar, ajustar su entrada, o rendirse e informar al usuario. Los errores estructurados resuelven esto.

**Genérico (malo):**

```json
{ "isError": true, "content": "Operation failed" }
```

**Estructurado (bueno):**

```json
{
  "isError": true,
  "content": {
    "errorCategory": "transient",
    "isRetryable": true,
    "message": "The service is temporarily unavailable.",
    "attempted_query": "order_id=12345",
    "partial_results": null
  }
}
```

Campos clave más allá de la bandera `isError`:

- `errorCategory` — clasifica el fallo para que quien la invoca (o el modelo) pueda decidir cómo reaccionar.
- `isRetryable` — un booleano explícito, no algo que haya que inferir a partir de la prosa.
- `attempted_query` — lo que se envió realmente, para que un reintento pueda ajustar el parámetro correcto en lugar de adivinar.
- `partial_results` — cualquier cosa utilizable que se recuperó antes del fallo, para que un fallo parcial no descarte todo.
- `message` — una explicación legible para humanos, pero como complemento de los campos estructurados, no como sustituto de ellos.

### Categoría de error → acción

| `errorCategory` | Ejemplo | Acción típica |
|---|---|---|
| `transient` | Timeout, 503, corte de red momentáneo | Reintentar (a menudo con backoff) |
| `validation` | Entrada malformada, parámetro requerido faltante | Corregir la entrada — no reintentar sin cambios |
| `business` | Violación de política, umbral excedido | No reintentar — informar al usuario o escalar |
| `permission` | Acceso denegado, alcance insuficiente | No reintentar — requiere credenciales distintas o intervención humana |

Antipatrones que hay que evitar del lado del servidor (o de la herramienta): cadenas de estado genéricas sin categoría; tratar silenciosamente un resultado vacío como éxito; abortar toda la operación ante el primer fallo en lugar de devolver resultados parciales; y reintentar indefinidamente sin un tope independientemente de la categoría.

## Herramientas integradas (Claude Code)

Claude Code expone un pequeño conjunto de herramientas integradas para interactuar con una base de código y una shell reales.

| Tarea | Herramienta | Ejemplo |
|---|---|---|
| Encontrar archivos por patrón de ruta/nombre | **Glob** | `**/*.test.tsx`, `src/components/**/*.ts` |
| Buscar en el *contenido* de los archivos | **Grep** | Un nombre de función, una cadena de error o una sentencia de importación |
| Leer un archivo completo | **Read** | Cargar un archivo para analizarlo antes de editarlo |
| Escribir un archivo nuevo | **Write** | Crear un archivo desde cero (o una reescritura completa) |
| Editar un archivo existente con precisión | **Edit** | Reemplazar un fragmento mediante una coincidencia de texto única |
| Ejecutar un comando de shell | **Bash** | `git`, comandos de gestor de paquetes, pruebas, compilaciones |

Nota la división entre **Glob** y **Grep**: Glob coincide con *rutas y nombres* de archivo (estructura), Grep coincide con el *contenido* de los archivos (el texto dentro de ellos). Recurrir a Grep cuando solo necesitas localizar archivos por patrón de nombre — o viceversa — desperdicia un paso.

### Investigación incremental

El patrón recomendado es construir la comprensión de forma incremental en lugar de leer todo de antemano:

1. **Glob/Grep** — encontrar puntos de entrada (archivos por nombre, o un símbolo/cadena por contenido).
2. **Read** — cargar los archivos que aparecieron.
3. **Grep** — encontrar los usos de lo que acabas de leer (invocadores, referencias, importaciones).
4. **Read** — cargar los archivos consumidores que lo referencian.
5. **Repite** hasta que el panorama esté completo.

Este ciclo Glob → Grep → Read → Grep → Read mantiene el contexto enfocado en lo que es relevante para la pregunta actual, en lugar de cargar toda la base de código en el contexto antes de saber qué importa.

### Alternativa de Edit ante una coincidencia no única

**Edit** funciona haciendo coincidir un fragmento único de texto existente y reemplazándolo. Si el fragmento objetivo aparece más de una vez en el archivo, Edit falla en lugar de adivinar qué aparición se pretendía. La secuencia alternativa es:

1. **Read** — cargar el contenido completo del archivo.
2. Modificar el contenido **programáticamente** (en memoria), desambiguando por el contexto circundante o la posición de la línea.
3. **Write** — escribir de vuelta el contenido completo actualizado en el archivo.

Esta alternativa cambia la precisión de Edit por la semántica de fuerza bruta de reemplazarlo-todo de Write, razón por la cual se prefiere Edit siempre que haya una coincidencia única disponible — Write corre el riesgo de arrasar con cambios no relacionados si la reconstrucción en memoria es incorrecta.

### Antipatrones

- **Leer todos los archivos de una vez** en lugar de seguir las pistas de forma incremental — consume contexto y diluye la atención entre archivos que no importan para la tarea.
- **Patrones Glob demasiado amplios** (p. ej., `**/*` a lo largo de todo un monorepo) que devuelven demasiados candidatos como para razonar sobre ellos.
- **Uso inseguro de Bash** — ejecutar comandos de shell destructivos o irreversibles sin confirmar antes el alcance (p. ej., borrados amplios, force-pushes, `rm` sin acotar).
- **Hallazgos sin una referencia precisa `file:line`** — «hay un bug en el módulo de autenticación» no es accionable; «falta la comprobación de null en `auth.ts:42`» sí lo es.

## Enfoque del examen

- **La descripción, no el nombre, guía la selección de herramientas.** Si Claude elige la herramienta equivocada entre dos opciones, la solución es casi siempre una `description` más precisa (qué devuelve, formatos de entrada, cuándo usarla frente a la alternativa) — no un `name` distinto.
- **`required` = siempre disponible, no «importante».** Un campo que a veces falta debería ser opcional y nullable (`["string", "null"]`), o el modelo fabricará un valor para satisfacer el esquema.
- **Los enums necesitan `"other"` + detalle y `"unclear"`.** Sin ellos, las entradas del mundo real que no encajan en las categorías predefinidas se fuerzan a un cubo equivocado, o un caso ambiguo recibe una respuesta falsamente segura.
- **Validación del esquema ≠ corrección.** `tool_use` + JSON Schema elimina los errores de *sintaxis* (JSON malformado, tipos incorrectos, campos requeridos faltantes) pero no puede detectar los errores *semánticos* (valores incorrectos pero válidos, totales que no cuadran). Los errores semánticos necesitan tu propia validación + un bucle de reintento.
- **`tool_choice: {"type": "tool", ...}` es una jugada de forzado de un solo uso**, empleada normalmente para garantizar que una precondición (p. ej., la verificación) se ejecute primero, seguida luego por un cambio de vuelta a `"auto"` — no se deja activada en cada turno.
- **El bucle requiere el historial completo cada vez.** Claude no tiene memoria entre llamadas a la API; cada petición reenvía toda la conversación, incluyendo los pares `tool_use`/`tool_result` previos. Empareja cada `tool_result` con su llamada mediante `tool_use_id`.
- **MCP: las Tools actúan, los Resources informan, los Prompts son plantillas.** No diseñes un «resource» que tenga efectos secundarios, ni una «tool» que en realidad sea solo datos de consulta de solo lectura que estarían mejor servidos como un resource.
- **`.mcp.json` es configuración de equipo con secretos en variables de entorno; `~/.claude.json` es personal.** Nunca incluyas un token real en el control de versiones — solo la referencia `${VAR}` — dentro de `.mcp.json`.
- **Prefiere los servidores MCP comunitarios para las integraciones estándar.** Construir un servidor personalizado se justifica solo cuando el flujo de trabajo es único de tu equipo, no como opción por defecto.
- **Los errores MCP estructurados necesitan `errorCategory` + `isRetryable`, no solo `isError: true` y un mensaje.** `transient` → reintentar; `validation`/`business`/`permission` → no reintentar a ciegas, en su lugar corregir la entrada o escalar.
- **Glob encuentra archivos por nombre/ruta; Grep busca en el contenido.** Confundir ambos, o leer toda una base de código de antemano en lugar de seguir Glob → Grep → Read de forma incremental, son los antipatrones clásicos.
- **Edit requiere una coincidencia única y falla en caso contrario.** La alternativa correcta es Read (contenido completo) → modificar programáticamente → Write — no reintentar Edit con un fragmento ligeramente distinto y confiar en la suerte.
