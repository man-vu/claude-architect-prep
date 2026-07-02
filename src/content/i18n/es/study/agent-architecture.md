Los sistemas agénticos se construyen a partir de un pequeño número de primitivas fundamentales: un bucle de solicitud/respuesta sin estado, definiciones de agentes con alcance acotado, un coordinador que se hace cargo de la delegación y salvaguardas deterministas alrededor de todo aquello que no sea seguro dejar en manos de un prompt. Esta página cubre la mecánica del bucle, la orquestación hub-and-spoke, los hooks, las estrategias de descomposición de tareas y el manejo de errores: el material que la mayoría de las preguntas del examen sondean presentando una implementación defectuosa o ingenua y preguntando qué tiene de malo.

## El bucle agéntico

Todo sistema agéntico, por elaborada que sea su orquestación, se construye sobre un único bucle mecánico:

1. Envía una solicitud al modelo: el system prompt + el **historial de conversación completo** + las definiciones de herramientas.
2. Recibe una respuesta. Inspecciona `stop_reason`.
3. Si `stop_reason == "tool_use"`: ejecuta la(s) herramienta(s) solicitada(s), añade el/los bloque(s) `tool_result` al historial de conversación y vuelve al paso 1.
4. Si `stop_reason == "end_turn"`: el modelo no tiene nada más que hacer. Devuelve el resultado.

```python
messages = [{"role": "user", "content": user_input}]

while True:
    response = client.messages.create(
        model="claude-opus-4-8",
        system=system_prompt,
        messages=messages,
        tools=tool_definitions,
    )
    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "tool_use":
        tool_result = execute_tool(response.content)
        messages.append({"role": "user", "content": [tool_result]})
        continue

    if response.stop_reason == "end_turn":
        break
    # handle "max_tokens", "stop_sequence" etc. as application-specific cases
```

El bucle está **dirigido por el modelo**: Claude decide qué herramienta llamar a continuación razonando sobre el contexto actual, en lugar de seguir un árbol de decisión codificado a mano o una secuencia de herramientas fija y preescrita. Esa capacidad de adaptación es la razón de ser de un agente, y es por eso que la señal de control de más abajo (`stop_reason`) tiene tanto peso: no estás dictando cada paso, así que necesitas una forma fiable de saber cuándo el modelo ha terminado.

### El modelo no tiene estado

El modelo no conserva memoria entre llamadas. Cada solicitud reenvía el historial de mensajes completo: el system prompt, cada turno previo del usuario, cada turno previo del asistente, cada llamada a herramienta y su resultado. El «contexto» no es algo que el modelo recuerde; es algo que tu aplicación vuelve a enviar cada vez. Esto tiene consecuencias directas sobre el coste (los tokens se vuelven a facturar en cada turno, algo que mitiga el prompt caching) y sobre la arquitectura (todo lo que el modelo necesite «recordar» debe estar en el array de mensajes que envías).

### La única señal de parada fiable

`stop_reason == "end_turn"` es la **única** señal fiable de que el modelo ha terminado. Todo lo demás es un indicador indirecto que puede equivocarse:

| Enfoque | Por qué falla |
|---|---|
| Analizar el texto del asistente en busca de palabras como "done", "completed", "finished" | El modelo puede decir «He completado el paso 1 de 3»: la coincidencia de texto no puede distinguir la finalización de una subtarea de la finalización de la tarea, y la redacción varía de una ejecución a otra |
| Usar un `max_iterations` arbitrario como condición de parada principal | Corta demasiado pronto tareas legítimamente largas, o deja que bucles en cortocircuito se prolonguen innecesariamente; el número de iteraciones no tiene ninguna relación semántica con la finalización de la tarea |
| Detenerse cuando el modelo expresa alta confianza o sentimiento positivo | La confianza autoevaluada no está calibrada con respecto a la corrección real |

Un límite `max_iterations` sigue siendo una buena práctica, pero solo como **red de seguridad** frente a bucles descontrolados (por ejemplo, una herramienta que sigue devolviendo errores que el modelo sigue reintentando), nunca como criterio principal de finalización. El criterio principal siempre es `stop_reason`.

```python
MAX_ITERATIONS = 25  # backstop, not the completion signal

for i in range(MAX_ITERATIONS):
    response = client.messages.create(...)
    if response.stop_reason == "end_turn":
        return response
    if response.stop_reason == "tool_use":
        # execute + append, continue loop
        ...
# only reached if the backstop tripped — treat as an error condition, not success
raise RuntimeError("Loop exceeded max_iterations without end_turn")
```

## AgentDefinition

Un subagente (en un sistema hub-and-spoke, o un subagente de Claude Code) se configura con cuatro campos fundamentales:

```python
AgentDefinition(
    name="refund_processor",
    description="Handles refund requests: validates eligibility, checks order history, and processes approved refunds up to policy limits.",
    system_prompt="""You are a refund-processing agent. You only handle refund
requests. Verify order eligibility against the return policy before taking
action. Do not process refunds for orders older than 90 days or for
non-refundable categories.""",
    allowed_tools=["get_order", "check_return_policy", "process_refund"],
)
```

| Campo | Propósito |
|---|---|
| `name` | Identificador único usado para el enrutamiento/registro |
| `description` | **Lo usan los coordinadores para decidir si delegan en este agente.** Esto no es documentación: es la entrada que un modelo de enrutamiento lee para elegir entre subagentes, así que debe describir con precisión el alcance y los límites |
| `system_prompt` | El rol, las restricciones y las reglas de comportamiento del subagente. Se carga una vez por invocación del subagente; no se renegocia a mitad de la tarea |
| `allowed_tools` | La lista de herramientas permitidas; impone el mínimo privilegio |

### Mínimo privilegio en `allowed_tools`

Un subagente bien acotado suele tener **entre 4 y 6 herramientas**. No es un número arbitrario: la fiabilidad en la selección de herramientas se degrada a medida que crece la lista, porque el modelo tiene que discriminar entre más opciones con aplicabilidad solapada en cada turno. De ahí se derivan directamente dos modos de fallo:

- **Las listas de herramientas demasiado amplias** reducen la precisión de la selección. Un agente con 20 herramientas vagamente relacionadas elegirá con más frecuencia una que parece plausible pero es incorrecta que un agente con 5 herramientas bien acotadas.
- **La redacción del system prompt crea asociaciones de herramientas no deseadas.** Una instrucción como «verifica siempre la identidad del cliente antes de ayudarlo» puede hacer que el modelo llame a `get_customer` en absolutamente cada turno —incluidos aquellos en los que la identidad ya se había verificado— porque el prompt creó una asociación fuerte y repetida entre «ayudar» y «verificar». Las instrucciones precisas y acotadas («verifica la identidad una vez por conversación, antes de la primera acción que modifique la cuenta») evitan esto.

```python
# Too broad — invites wrong-tool selection and prompt/tool crosstalk
allowed_tools=["get_customer", "get_order", "get_order_history", "get_invoice",
               "get_shipping_status", "update_customer", "update_order",
               "process_refund", "process_exchange", "send_email",
               "create_ticket", "escalate_ticket", "search_kb", "get_product"]

# Scoped to the agent's actual job
allowed_tools=["get_order", "check_return_policy", "process_refund"]
```

## Orquestación hub-and-spoke

La topología multiagente dominante es la **hub-and-spoke** (una topología en estrella): un coordinador en el centro, múltiples subagentes especializados en los radios, sin aristas directas de radio a radio.

```
                 ┌───────────────┐
                 │  Coordinator   │  ← sole interface to the user
                 └───────┬───────┘
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
 │  Subagent A  │  │  Subagent B  │  │  Subagent C  │
 └─────────────┘  └─────────────┘  └─────────────┘
```

**Responsabilidades del coordinador:**
- Descomponer la solicitud entrante en subtareas
- Seleccionar qué subagente(s) se encarga(n) de cada subtarea (usando la `description` de cada subagente)
- Delegar el trabajo mediante la herramienta `Task` (la interfaz de Claude Code ahora la llama la herramienta `Agent`; el SDK y la mayoría de la documentación escrita todavía se refieren a ella como `Task`: espera cualquiera de los dos términos). Los propios `allowed_tools`/`allowedTools` del coordinador **deben incluir `Task`**, o no tendrá ningún mecanismo para generar subagentes
- Agregar los resultados de los subagentes en una respuesta coherente
- Manejar los errores que emergen de los subagentes
- Llevar el seguimiento del estado global de la tarea/conversación
- Servir como **única interfaz de cara al usuario**: el usuario nunca habla directamente con un subagente

### El aislamiento es la restricción que lo define

Los subagentes **no** heredan el historial de conversación del coordinador. Cada invocación de un subagente comienza con un contexto en blanco que contiene únicamente lo que el coordinador puso explícitamente en el prompt de `Task`. No hay memoria compartida entre subagentes, y ningún subagente puede enviar mensajes a otro subagente directamente: toda comunicación entre agentes está mediada por el coordinador.

Esto significa que **el diseño de prompts para la delegación es la habilidad de mayor impacto en los sistemas hub-and-spoke.** Un prompt de delegación vago produce un resultado vago, porque el subagente literalmente no tiene ningún otro contexto del que valerse.

```
BAD Task prompt:
  "Analyze the document."

GOOD Task prompt:
  "Analyze the following support ticket for refund eligibility.

   Ticket text: <full ticket text>
   Customer order history: <retrieved order records>
   Applicable return policy: <policy section 4.2, full text>

   Determine: (1) is this order within the 90-day return window,
   (2) is the item category refundable per policy, (3) has this
   customer already received a refund on this order.

   Output as JSON: {eligible: bool, reason: string, order_id: string}.

   If order history is missing or ambiguous, do not guess — return
   eligible: false with reason: 'insufficient data' rather than assuming
   eligibility."
```

Un prompt de `Task` bien formado especifica:

- **Objetivo explícito**: qué decisión o artefacto se está produciendo, no solo un tema
- **Contexto de datos completo**: todos los datos que el subagente necesita, incluidos en línea (el subagente no puede ir a buscar lo que el coordinador ya sabe)
- **Formato de salida**: un esquema o estructura que el coordinador pueda analizar de forma determinista
- **Manejo de casos límite**: qué hacer cuando los datos faltan, son ambiguos o son contradictorios
- **Criterios de calidad**: cómo es un resultado «bueno», para que el subagente no tenga que inferirlo

### Delegación en paralelo

Varias llamadas a `Task` emitidas en una única respuesta del coordinador se ejecutan **en paralelo**: los subagentes se ejecutan de forma concurrente y el coordinador recibe todos los resultados antes de continuar. Esta es la principal palanca para reducir la latencia en un sistema hub-and-spoke: las subtareas independientes (por ejemplo, «comprobar el inventario» y «comprobar el historial crediticio del cliente») deberían despacharse juntas en lugar de secuencialmente, siempre que ninguna dependa de la salida de la otra.

```python
# Two independent checks — dispatch both in one turn, not one after the other
Task(agent="inventory_checker", prompt="Check stock for SKU-4471...")
Task(agent="credit_checker", prompt="Check credit standing for customer C-9910...")
```

### Delegación dinámica y refinamiento iterativo

Un coordinador no debería ejecutar a ciegas todos los subagentes en cada solicitud. Tres habilidades relacionadas separan a un orquestador robusto de un pipeline ingenuo:

- **Selección dinámica**: analizar la solicitud e invocar solo los subagentes que realmente necesita, en lugar de enrutar siempre por el pipeline completo. Una simple consulta de un dato no debería despertar a toda la flota.
- **Partición del alcance**: al abrir en abanico, asignar a cada subagente una porción *distinta* (diferentes subtemas o tipos de fuente) para que su trabajo no se solape ni duplique esfuerzos.
- **Bucles de refinamiento iterativo**: tras la síntesis, el coordinador evalúa el resultado en busca de **lagunas de cobertura**, vuelve a delegar consultas de seguimiento específicas a los subagentes de búsqueda/análisis y vuelve a invocar la síntesis, repitiendo hasta que la cobertura sea suficiente. Una única pasada de descomposición a menudo pasa por alto subáreas enteras: el fallo clásico es descomponer «las industrias creativas» en subtareas únicamente de artes visuales (arte digital, diseño gráfico, fotografía) y no cubrir nunca la música, la escritura o el cine, mientras cada subagente sigue informando de éxito en la tarea acotada que realmente se le encomendó.

Enrutar toda la comunicación de los subagentes de vuelta a través del coordinador es lo que hace esto posible: el coordinador es el único punto con la **observabilidad** necesaria para detectar una laguna, aplicar un manejo de errores consistente y controlar qué información fluye hacia dónde.

## Estado de sesión, reanudación y bifurcación

El trabajo de los agentes a menudo abarca varias sesiones, y la forma en que se reanuda es importante para la fiabilidad.

- **`--resume <session-name>`** continúa una conversación previa concreta con nombre, recargando su historial para que el agente retome donde lo dejó. Nombra las sesiones de investigación de forma deliberada para poder volver más tarde a la correcta.
- **`fork_session`** bifurca desde una base de análisis compartida hacia líneas de trabajo independientes; por ejemplo, explorar dos estrategias de refactorización o de pruebas a partir del mismo análisis del código base sin que el contexto de ninguna de las ramas contamine al de la otra.
- **Reanudar vs. empezar de cero.** Reanudar es lo correcto cuando el contexto previo *sigue siendo mayormente válido*. Cuando los resultados de herramientas previos están **obsoletos** —los archivos han cambiado desde que se capturaron— iniciar una nueva sesión sembrada con un resumen estructurado y compacto es más fiable que reanudar sobre resultados desactualizados que el modelo podría seguir tratando como actuales.
- **Dile a una sesión reanudada qué cambió.** Si se modificaron archivos después del análisis de la sesión, informa explícitamente al agente de los cambios concretos para que reanalice solo esos, en lugar de confiar en lecturas obsoletas o verse obligado a reexplorar todo el código base.

## Hooks: aplicación determinista

Las instrucciones de un prompt son **probabilísticas**: una regla bien redactada en el system prompt la cumple *la mayoría* de las veces un modelo capaz, pero siempre conlleva una **tasa de fallo distinta de cero**, lo cual no es suficiente para nada en lo que equivocarse tenga consecuencias reales. Los **hooks** interceptan las llamadas a herramientas en puntos definidos del ciclo de vida e imponen reglas mediante código, dando un cumplimiento **100% determinista** independientemente de lo que el modelo haya decidido hacer.

| | Instrucciones de prompt | Hooks |
|---|---|---|
| Aplicación | Probabilística (tasa de fallo distinta de cero) | Determinista (100%) |
| Dónde reside | El texto del system prompt | El código de la aplicación, fuera del control del modelo |
| ¿Puede el modelo esquivarlo con palabras? | Sí, en principio (casos límite, entradas adversarias, deriva) | No: el hook se ejecuta al margen del razonamiento del modelo |
| Ideal para | Estilo, tono, preferencias, orientación blanda | Límites financieros, reglas legales/de cumplimiento, acciones críticas para la seguridad |
| Modo de fallo si se omite | Comportamiento inconsistente, violaciones ocasionales de las reglas | N/A: no es opcional |

**`PreToolUse`** se ejecuta antes de que se ejecute una llamada a herramienta. Puede inspeccionar la llamada propuesta y **bloquearla o redirigirla**:

```python
@hook("PreToolUse")
def enforce_refund_limit(tool_call):
    if tool_call.name == "process_refund" and tool_call.args["amount"] > 500:
        return redirect_to_escalation(tool_call)  # blocked; routed to a human/queue instead
    return allow(tool_call)
```

**`PostToolUse`** se ejecuta después de que una llamada a herramienta retorna, antes de que el resultado se añada al historial. Puede **normalizar o recortar** el resultado antes de que el modelo llegue a verlo:

```python
@hook("PostToolUse")
def normalize_dates(tool_result):
    # e.g. convert a raw Unix timestamp from the API into ISO 8601
    # before the model reasons over it
    return normalized_result
```

**La regla rectora:** si un error aquí es de tipo financiero, legal o crítico para la seguridad, pon un hook delante. Si es una cuestión de preferencia, tono o estilo, una instrucción en el prompt es suficiente y un hook sería excesivo. Un system prompt que diga «nunca apruebes reembolsos superiores a 500 $ sin la aprobación de un responsable» es buena higiene, pero no es un control: un hook `PreToolUse` que bloquee mecánicamente la llamada a `process_refund` sí es el control.

## Estrategias de descomposición de tareas

Hay dos estrategias generales para dividir una tarea grande en subtareas, y elegir la equivocada para la situación es un error de diseño frecuente.

### Pipeline fijo (encadenamiento de prompts)

Una secuencia de pasos predeterminada y ordenada, cada uno con una entrada y una salida claras, que se ejecuta en un orden fijo cada vez:

```
Extract metadata → Extract structured data → Validate → Enrich → Output
```

Úsalo cuando la forma de la tarea se conoce de antemano y es repetible. Ventajas: es predecible, es fácil probar cada etapa de forma aislada, es reproducible entre ejecuciones y es fácil razonar sobre los fallos (sabes exactamente qué etapa se rompió).

La **revisión de código en varias pasadas** es el ejemplo canónico: en lugar de entregar a un único subagente el diff completo y todos los archivos a la vez, divídelo en pasadas:

```
Pass 1 (per file): review each changed file independently for local issues
                    (style, obvious bugs, missing null checks)
Pass 2 (cross-file): review the changes as a whole for integration issues
                    (does file A's new function signature match how file B calls it?)
```

Esto evita la **dilución de la atención**: un único prompt gigante que contiene todos los archivos compite por la atención del modelo sobre todo su contenido a la vez, y los problemas sutiles se pasan por alto. Un pipeline fijo de dos pasadas fuerza una atención concentrada dentro de cada pasada, y luego una pasada dedicada a la preocupación transversal.

### Descomposición dinámica (adaptativa)

La estructura de las subtareas no se conoce de antemano: emerge de lo que descubren los pasos anteriores. Los resultados de cada paso determinan cuál debería ser siquiera el paso siguiente.

```
Investigate why production error rate spiked
  → step 1 result: errors cluster in the payment service
    → step 2 (now scoped based on step 1): check recent payment service deploys
      → step 2 result: a config change 3 hours ago
        → step 3 (now scoped based on step 2): diff the config change against
          the previous version and check for a causal link
```

Úsalo para investigación abierta, depuración o tareas de indagación en las que el alcance realmente no se puede predeterminar: un pipeline fijo sería, o bien demasiado rígido (forzando pasos que resultan irrelevantes), o bien tendría que enumerar de antemano cada rama posible, lo que frustra el propósito.

| | Pipeline fijo | Descomposición dinámica |
|---|---|---|
| Orden de los pasos | Predeterminado | Emerge durante la ejecución |
| Ideal para | Tareas repetibles y bien comprendidas | Investigación abierta |
| Reproducibilidad | Alta: los mismos pasos en cada ejecución | Menor: el camino depende de los hallazgos intermedios |
| Diagnóstico de fallos | Fácil (sabes qué etapa fija falló) | Más difícil (el propio camino puede ser el problema) |

## Manejo de errores en sistemas multiagente

Los errores en un sistema multiagente deben categorizarse, porque la respuesta correcta difiere marcadamente según la categoría: tratar todos los errores de forma idéntica (por ejemplo, reintentar siempre, o propagar siempre) es en sí mismo el antipatrón.

| Categoría | Ejemplo | ¿Reintentable? | Acción correcta |
|---|---|---|---|
| **Transitorio** | Timeout, HTTP 503, límite de tasa | Sí | Reintentar con retroceso exponencial |
| **Validación** | Entrada malformada o ausente | No | Corregir la entrada; reintentar a ciegas la misma entrada incorrecta volverá a fallar |
| **De negocio** | Violación de política, solicitud no elegible | No | Explicar por qué, proponer una vía alternativa |
| **De permisos** | Acceso denegado, alcance insuficiente | No | Escalar: el subagente no puede resolverlo por sí mismo |

### Recuperación local antes de la propagación

Un subagente debería intentar **primero la recuperación local** —normalmente 1 o 2 reintentos para fallos transitorios, con retroceso— antes de hacer emerger nada hacia el coordinador. Solo los errores que el subagente realmente no puede resolver por su cuenta deberían propagarse hacia arriba. Esto evita que el coordinador se vea inundado de ruido con el que no puede hacer nada, y evita que los contratiempos recuperables se conviertan en fallos a nivel de flujo de trabajo.

```python
def call_with_local_recovery(tool_fn, *args, max_retries=2):
    for attempt in range(max_retries + 1):
        try:
            return tool_fn(*args)
        except TransientError as e:
            if attempt == max_retries:
                # exhausted local recovery — now it's the coordinator's problem
                return structured_error(e, category="transient", attempts=attempt + 1)
            backoff_sleep(attempt)
        except (ValidationError, PermissionError) as e:
            # not retryable locally — propagate immediately with category
            return structured_error(e, category=type(e).__name__)
```

### Respuestas de error estructuradas

Un error devuelto al coordinador nunca debería ser una simple cadena de texto. Debería estar estructurado para que el coordinador pueda tomar una decisión informada sobre qué hacer a continuación:

```json
{
  "isError": true,
  "errorCategory": "transient",
  "attempted_query": "search: refund policy electronics category",
  "partial_results": [
    { "source": "policy_db", "section": "4.1", "status": "retrieved" },
    { "source": "policy_db", "section": "4.2", "status": "timeout" }
  ],
  "completion_rate": 0.5,
  "failed_sections": ["4.2"]
}
```

Campos clave que conviene destacar:

- **`isError` + `errorCategory`**: permite al coordinador ramificar según la categoría (reintentar vs. escalar vs. explicar) en lugar de hacer coincidencia de cadenas sobre el texto del error
- **`attempted_query`**: preserva lo que realmente se intentó, para que el coordinador (o una persona) pueda distinguir «esto genuinamente no devolvió nada» de «esto falló antes de poder buscar»
- **`partial_results`**: un subagente que completó 3 de 5 cosas debería devolver las 3, no descartarlas porque la tarea en su conjunto no tuvo pleno éxito
- **`completion_rate` / `failed_sections`**: anotaciones de cobertura que permiten al coordinador (o al consumidor posterior) saber exactamente cuánto fiarse del resultado y qué falta

### Antipatrones

- **Un genérico «operation failed»**: no le da al coordinador nada sobre lo que actuar; no puede distinguir un contratiempo transitorio de un problema de permisos o de una solicitud malformada
- **Supresión silenciosa**: tratar un resultado vacío como un «no se encontraron datos» exitoso cuando en realidad fue una llamada fallida. Este es el antipatrón más peligroso porque, aguas abajo, se ve idéntico al éxito
- **Abortar todo el flujo de trabajo ante el fallo de un solo subagente**: si 4 de 5 subtareas paralelas tuvieron éxito, el flujo de trabajo generalmente debería devolver las 4 con una laguna anotada, no descartarlo todo
- **Reintentos infinitos**: un subagente que sigue reintentando un error transitorio para siempre sin un límite convierte un contratiempo en un bloqueo
- **Ocultar errores al coordinador**: un subagente que captura una excepción y devuelve una respuesta de éxito de aspecto plausible pero fabricada le niega al coordinador la oportunidad de sortear el problema

### Escalado a personas

Relacionado con el manejo de errores, pero distinto: algunas situaciones deberían dirigirse a una persona con independencia de si algo «falló» técnicamente. Los desencadenantes legítimos incluyen una petición explícita del usuario («páseme con un responsable»), una laguna genuina en las políticas (la situación no está cubierta por ninguna regla que tenga el agente), intentos fallidos repetidos de resolución automática, o una operación financiera por encima de un umbral definido (esta es la misma clase de preocupación que un hook `PreToolUse` impone de forma determinista). El análisis de sentimiento, la confianza autoevaluada del modelo y los clasificadores genéricos **no** son desencadenantes de escalado fiables: son indicadores indirectos con las mismas debilidades que tienen al usarlos para terminar el bucle.

## Enfoque para el examen

- La única señal fiable de terminación del bucle es `stop_reason == "end_turn"`. `max_iterations` es una red de seguridad válida, nunca la condición de parada principal; analizar el texto del asistente en busca de palabras de finalización siempre es incorrecto.
- El modelo no tiene estado: el historial de mensajes completo (system prompt + cada turno previo + cada resultado de herramienta) se reenvía en absolutamente cada llamada a la API.
- `AgentDefinition.description` no es documentación: es el campo que la lógica de enrutamiento de un coordinador lee para decidir la delegación, así que debe indicar con precisión el alcance y los límites.
- Mantén `allowed_tools` en ~4–6 por subagente. Las listas de herramientas más grandes degradan de forma medible la fiabilidad de la selección de herramientas; una redacción imprecisa del system prompt («verifica siempre al cliente») también puede crear hábitos de llamada a herramientas no deseados.
- Hub-and-spoke: el coordinador es la única interfaz de cara al usuario, se hace cargo de la descomposición/delegación/agregación/manejo de errores y es la única vía para la comunicación entre agentes; los subagentes nunca hablan directamente entre sí.
- Los subagentes tienen **contexto aislado**: sin historial heredado, sin memoria compartida. Un prompt de `Task` vago («Analiza el documento») produce un resultado vago porque no hay nada más de lo que el subagente pueda valerse; un buen prompt incluye en línea el contexto de datos completo, expone el objetivo, especifica el formato de salida y cubre los casos límite.
- Varias llamadas a `Task`/`Agent` emitidas en el mismo turno del coordinador se ejecutan en **paralelo**: despacha las subtareas independientes juntas, no de forma secuencial.
- Un coordinador debe tener `Task` en sus propios `allowedTools` para generar subagentes; debería seleccionar los subagentes de forma dinámica (no siempre el pipeline completo), particionar el alcance para evitar trabajo duplicado y ejecutar **bucles de refinamiento iterativo**: volver a delegar y volver a sintetizar hasta que se cierren las lagunas de cobertura (el fallo de «solo artes visuales, nunca música/cine» es una descomposición demasiado estrecha, no un subagente roto).
- Control de sesión: `--resume <name>` continúa una sesión con nombre; `fork_session` bifurca desde una base compartida. Prefiere una sesión nueva sembrada con un resumen estructurado antes que reanudar sobre resultados de herramientas **obsoletos**, y dile a una sesión reanudada qué archivos cambiaron para que reanalice solo esos.
- Los hooks son deterministas (100%); los prompts son probabilísticos (una tasa de fallo distinta de cero, por muy bien redactados que estén). Enruta las reglas financieras, legales y críticas para la seguridad a través de hooks `PreToolUse`/`PostToolUse`, no de instrucciones en el prompt. `PreToolUse` puede bloquear/redirigir una llamada antes de que se ejecute; `PostToolUse` puede normalizar/recortar un resultado antes de que el modelo lo vea.
- Los pipelines fijos encajan con trabajo predecible, repetible y ordenado (por ejemplo, revisión de código por archivo y luego entre archivos, que evita la dilución de la atención); la descomposición dinámica encaja con tareas abiertas en las que el alcance de cada paso depende de los hallazgos del paso anterior.
- Las categorías de error dictan la respuesta: transitorio → reintentar con retroceso; validación → corregir la entrada, no reintentar a ciegas; de negocio → explicar y proponer una alternativa; de permisos → escalar. Intenta 1 o 2 reintentos locales dentro del subagente antes de propagar al coordinador.
- Las respuestas de error estructuradas (`isError`, `errorCategory`, `attempted_query`, `partial_results`, `completion_rate`, `failed_sections`) permiten al coordinador tomar una decisión de recuperación informada; una simple cadena «operation failed» no.
- Antipatrones que hay que señalar de inmediato: cadenas de error genéricas, tratar silenciosamente los resultados vacíos como éxito, abortar todo un flujo de trabajo porque una de varias subtareas falló, reintentos sin límite y usar el sentimiento/la autoconfianza como desencadenante de escalado o de terminación del bucle.
