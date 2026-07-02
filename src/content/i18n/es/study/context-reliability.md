La gestión del contexto es la disciplina de decidir qué ve el modelo en cada solicitud, y la fiabilidad es la disciplina de saber cuándo se puede confiar en la salida del modelo sin que una persona la revise. Juntas cubren el 15% del examen Foundations y aparecen en casi todas las preguntas de escenario sobre agentes de larga duración.

## El modelo no tiene estado

La API de Claude no tiene memoria entre llamadas. Cada solicitud es independiente: no hay sesión del lado del servidor, ni estado de conversación oculto, ni nada que el modelo «recuerde» de un turno anterior. Para continuar una conversación, el cliente debe reenviar el historial de mensajes **completo** en cada solicitud: el prompt del sistema, cada turno previo de usuario/asistente, cada llamada a herramienta y cada resultado de herramienta.

```json
{
  "model": "claude-opus-4-8",
  "system": "You are a support agent...",
  "messages": [
    { "role": "user", "content": "My order hasn't shipped." },
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "lookup_order", "input": { "order_id": "ORD-67890" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "tool_use_id": "toolu_01", "content": "{...order json...}" }] },
    { "role": "assistant", "content": "I see your order ORD-67890 is delayed..." }
  ]
}
```

Esto tiene dos consecuencias que condicionan todo lo demás en este dominio:

1. **El coste y la latencia escalan con la longitud del historial.** Cada turno reenvía y vuelve a procesar todo lo anterior, y por eso existe el almacenamiento en caché de prompts (véase el dominio de la API) y por eso el crecimiento ilimitado del historial es un problema real de producción, no uno teórico.
2. **La «memoria» es una ilusión de la capa de aplicación.** Cualquier cosa que parezca memoria persistente —un expediente, un perfil de usuario, un resumen acumulado— es algo que la *aplicación* vuelve a inyectar en el prompt en cada llamada. El modelo no está recordando; el arnés se lo vuelve a contar.

### Qué llena la ventana de contexto

La ventana de contexto es un presupuesto fijo de tokens compartido por todo lo que se envía en una sola solicitud:

| Componente | Notas |
|---|---|
| Prompt del sistema | Instrucciones, persona, política: se envía en cada turno |
| Definiciones de herramientas | Esquema JSON completo de cada herramienta que el modelo *podría* llamar, se use o no en este turno |
| Historial de mensajes | Cada turno de usuario/asistente hasta ahora |
| Resultados de herramientas | Respuestas en bruto de la API o la base de datos devueltas a la conversación: a menudo el contribuyente más grande y menos controlado |

Los resultados de herramientas son el culpable habitual de la hinchazón del contexto: una sola llamada a la API puede devolver un blob JSON de varios KB cuando solo importan dos campos, y si ese blob nunca se recorta permanece en cada solicitud posterior durante el resto de la conversación.

### Repaso de `stop_reason`

Cada respuesta lleva un `stop_reason` que le indica al llamador por qué se detuvo la generación: `end_turn` (finalización natural), `max_tokens` (truncada: la respuesta se cortó a mitad de generación, no terminó), `stop_sequence`, `tool_use` (el modelo quiere llamar a una herramienta y se pausa a la espera del resultado) y `pause_turn` (uso de herramienta de larga duración del lado del servidor, p. ej. búsqueda web, pausado para continuar). Tratar un corte por `max_tokens` como una respuesta completa es un error de fiabilidad común y evitable: el llamador debe comprobar `stop_reason` antes de confiar en que una respuesta ha terminado.

## Modos de fallo de un contexto creciente

### Pérdida en el medio

Los modelos procesan la información del principio y del final de una entrada larga de forma más fiable que la información enterrada en el medio. Esto no es un fallo de entrenamiento que se pueda sortear con un prompt ingenioso: es una propiedad estructural de la atención en contextos largos, y significa que **dónde** colocas un dato importa tanto como **si** lo incluyes. Una restricción crítica mencionada una sola vez, en la línea 400 de un resultado de herramienta de 900 líneas, corre un riesgo real de ser ignorada aunque técnicamente esté «en el contexto».

### Acumulación de resultados de herramientas

Sin gestión, los resultados de herramientas son la parte que crece más rápido en una conversación larga. Un agente de descubrimiento que llama a una API de búsqueda diez veces y pega cada respuesta en bruto en el historial puede consumir la mayor parte del presupuesto de contexto en datos que solo se necesitaban por un momento. Sin control, esto desperdicia presupuesto y, además, agrava el riesgo de pérdida en el medio, ya que empuja datos anteriores todavía relevantes más hacia el «medio».

### El resumen degrada la precisión

Cuando el historial se compacta para ahorrar espacio (ya sea por el propio modelo o por un paso de resumen en el arnés), la narrativa cualitativa sobrevive bien, pero **la precisión numérica no**. Una cifra exacta como «42.3%» o una fecha concreta como «2024-06-15» tiende a degradarse hasta «alrededor del 42%» o «en algún momento del año pasado» tras una o dos rondas de resumen. Esto es peligroso precisamente porque el valor degradado sigue *pareciendo* lo bastante seguro y específico como para fiarse de él: la vaguedad no se señala, simplemente se introduce sin más. Cualquier flujo de trabajo que dependa de que números, ID o fechas exactos sobrevivan a una sesión larga necesita protegerlos para que nunca entren en la parte resumida y comprimida del historial (véase los bloques de extracción de hechos, más abajo).

### Degradación en sesiones prolongadas

Más allá de cualquier modo de fallo concreto, una sesión muy larga se degrada de una forma más sutil: el modelo empieza a dar **respuestas inconsistentes** y a derivar hacia **«patrones típicos»** genéricos en lugar de las clases, funciones y hechos específicos que realmente descubrió antes en la sesión. La señal delatora es un agente que era preciso en el turno 10 y responde en el turno 60 como si razonara a partir de sus sesgos de entrenamiento en vez de a partir de lo que encontró. Esto es exactamente lo que contrarrestan las técnicas de persistencia de más abajo: vuelven a anclar el modelo en hallazgos concretos en lugar de confiar en que esos hallazgos sobrevivan intactos en el contexto en vivo.

## Técnicas de gestión del contexto

### 1. Extracción de hechos / bloque persistente de «hechos del caso»

La solución fundamental para la pérdida de precisión provocada por el resumen: extrae el puñado de hechos que nunca deben degradarse a un bloque pequeño y estructurado que **no** forme parte del historial resumido; se regenera o se arrastra literalmente y se inyecta en cada prompt, sin importar cuánto se compacte la conversación circundante.

```
=== CASE FACTS (updated whenever a new fact appears; never summarized) ===
Customer ID: CUST-12345
Order ID: ORD-67890
Order Date: 2025-01-15
Refund requested: $89.99
Policy reference: RETURNS-14D
===
```

Como este bloque vive fuera de la ruta de resumen, «$89.99» sigue siendo «$89.99» tanto en el turno 50 como en el turno 1: nunca tiene la oportunidad de convertirse en «unos $90».

### 2. Recorte de resultados de herramientas

Un hook `PostToolUse` (véase el dominio del Ciclo de Vida de Desarrollo para conocer la mecánica de los hooks) intercepta la salida en bruto de una herramienta antes de que se añada al contexto y conserva solo los campos que importan, descartando el resto.

```python
# PostToolUse hook: trim a verbose order-lookup response
def trim_order_lookup(tool_result: dict) -> dict:
    return {
        "order_id": tool_result["order_id"],
        "status": tool_result["status"],
        "total": tool_result["total"],
        "items": [i["sku"] for i in tool_result["items"]],
        # dropped: internal warehouse routing, carrier metadata,
        # audit trail, 40+ other fields the agent never needs
    }
```

Esto ataca directamente la acumulación de resultados de herramientas: la respuesta en bruto de la API podría ocupar 5 KB; la versión recortada que el modelo ve en realidad podría ocupar 200 bytes, y ese ahorro se acumula en cada turno posterior porque lo que se reenvía es el resultado recortado, no el original.

### 3. Colocación consciente de la posición

Dada la pérdida en el medio, estructura deliberadamente lo que inyectas en lugar de volcarlo en el orden en que lo encuentras:

- **Arriba**: los hallazgos clave / la respuesta hasta ahora, para que sobreviva aunque no se lea con atención nada más.
- **En medio**: todo el detalle de apoyo, la evidencia, los datos en bruto.
- **Abajo**: los elementos de acción / los próximos pasos, ya que la cercanía reciente también favorece la recuperación.

```
## KEY FINDING
Root cause: expired API credential, rotated 2025-06-30. Fix confirmed working.

## SUPPORTING DETAIL
[...longer investigation log, logs, stack traces...]

## NEXT ACTIONS
1. Notify customer fix is deployed.
2. Monitor error rate for 24h.
```

Esto contrarresta la pérdida en el medio por diseño: las partes que con más probabilidad se leen por encima o se pasan por alto (el medio) son precisamente las que menos importan para la decisión inmediata.

### 4. Archivos scratchpad para la persistencia entre sesiones

Para trabajo que abarca varias sesiones o excede una sola ventana de contexto, escribe los hallazgos clave en un archivo en disco en lugar de confiar en que permanezcan en la conversación en vivo. Una sesión nueva (o un subagente) puede entonces leer el scratchpad en vez de necesitar que se reenvíe la transcripción previa completa, cambiando una gran cantidad de historial de conversación por una lectura de archivo pequeña y específica.

### 5. Delegación en subagentes para aislar el descubrimiento verboso

Deriva la exploración abierta y de mucha salida (búsqueda en logs, investigación web de varios pasos, búsqueda amplia de código) a un subagente en lugar de hacerla en línea. El subagente consume su *propio* presupuesto de contexto en el proceso de descubrimiento ruidoso y en bruto, y devuelve al padre solo un resumen destilado. El contexto del padre —y la conversación final de cara al usuario— nunca llega a ver los volcados en bruto, lo que esquiva a la vez la hinchazón del contexto y la pérdida en el medio.

```
Parent: "Find why the nightly job failed last night."
  → Subagent: greps 3 log files, checks 2 API statuses, reads 400 lines of stack trace
  → Subagent returns: "Root cause: DB connection pool exhausted at 02:14 UTC after
     a deploy bumped max_connections down. Fix: revert config, restart pool."
Parent context gains: ~2 sentences, not 400 lines.
```

### 6. Persistencia de estado estructurada para la recuperación ante caídas

Para flujos de trabajo de larga duración o multiagente, persiste el estado en una **ubicación conocida** en disco en lugar de solo en memoria: un archivo de estado por agente más un manifiesto que los indexa a todos.

```json
// state/agent-3.json
{
  "status": "in_progress",
  "phase": "data_extraction",
  "completed_phases": ["discovery", "planning"],
  "key_findings": ["Source API rate-limits at 100 req/min"],
  "coverage_gaps": ["No data for region EU-WEST after 2025-06-20"]
}
```

```json
// state/manifest.json
{ "agents": ["agent-1", "agent-2", "agent-3"], "updated_at": "2025-06-30T14:02:00Z" }
```

Si el proceso se cae o la sesión se interrumpe, un agente nuevo puede leer el manifiesto, cargar el archivo de estado de cada agente y reanudar desde `completed_phases` en lugar de reiniciar todo el flujo de trabajo; y el campo `coverage_gaps` es lo que después alimenta informes honestos y con salvedades en vez de fingir en silencio que el trabajo estaba completo.

## Escalado y humano en el bucle

Decidir *cuándo* ceder el control a una persona es en sí mismo un problema de fiabilidad: las señales que resultan intuitivas (el tono, la confianza autoinformada) suelen ser las equivocadas para confiar en ellas.

### Disparadores fiables

| Disparador | Por qué es fiable |
|---|---|
| Solicitud humana explícita | Intención inequívoca del cliente: escalar de inmediato, sin más intentos |
| La política no dice nada sobre la solicitud | El agente no tiene ninguna acción autorizada que tomar; adivinar es peor que preguntar |
| Sin progreso tras N intentos | Evidencia concreta y medible de que el enfoque actual no funciona |
| Operación financiera por encima de un umbral de política | Límite objetivo y pactado de antemano en dinero/riesgo, no una cuestión de criterio |
| Múltiples coincidencias en la búsqueda | La ambigüedad debe resolverse primero con una pregunta aclaratoria, y solo escalarse si la propia aclaración falla |

### Disparadores poco fiables

- **Análisis de sentimiento.** El estado de ánimo del cliente no se correlaciona con la complejidad del caso: un cliente furioso puede tener una solución trivial de una línea, y uno perfectamente tranquilo puede estar frente a un caso límite genuinamente irresoluble.
- **La confianza autoevaluada del modelo.** Un modelo puede equivocarse con total seguridad; la confianza autoinformada no es una probabilidad calibrada y no debería tratarse como tal.
- **Un clasificador automático de complejidad.** Sin un conjunto de entrenamiento etiquetado que coincida con tu distribución real de casos, un clasificador de complejidad también está adivinando: solo esconde esa adivinación detrás de un número que parece objetivo.

Ninguno de estos rastrea lo que de verdad te importa (¿es este caso resoluble por política, ahora mismo, por este agente?), así que construir la lógica de escalado en torno a ellos produce escalados que no se correlacionan con la necesidad real.

### Patrones de escalado

- **Inmediato**: disparado por una solicitud humana explícita. Sin intentar resolver primero; escalar en el acto.
- **Intentar y luego escalar**: para un problema plausiblemente resoluble: prueba la solución, verifícala y escala solo si no resuelve el caso.
- **Reconocer → ofrecer una resolución concreta → escalar solo ante la insistencia reiterada**: para la frustración o las objeciones: reconoce el problema, propón una solución específica y escala solo si el cliente insiste *de nuevo* tras esa oferta, no a la primera señal de fastidio. Escalar al primer indicio de frustración sobrecarga las colas de atención humana y además enseña a los clientes que la frustración es la vía más rápida para llegar a una persona, lo cual es un mal incentivo para incorporar a un sistema de soporte.

### Traspaso estructurado y autocontenido

Una persona que recoge un escalado debería poder actuar **sin leer la transcripción completa**. Eso significa que el propio traspaso es una carga útil estructurada, no un «aquí tienes la conversación, buena suerte»:

```json
{
  "customer_id": "CUST-12345",
  "customer_name": "Jordan Lee",
  "order_id": "ORD-67890",
  "issue_summary": "Refund requested for damaged item outside the 14-day policy window.",
  "actions_taken": ["Verified order and delivery date", "Checked return policy RETURNS-14D", "Offered store credit as an alternative"],
  "root_cause": "Item arrived damaged; customer reported it 21 days post-delivery, 7 days past policy window.",
  "recommended_action": "Approve one-time policy exception given documented shipping damage.",
  "escalation_reason": "Refund exceeds automated approval threshold and requires policy exception."
}
```

Cada campo aquí responde a una pregunta que, de otro modo, la persona tendría que reconstruir leyendo la transcripción: qué pasó, qué se ha intentado ya, por qué no fue suficiente y qué hacer a continuación.

### Calibración de confianza y muestreo estratificado

La exactitud agregada oculta fallos específicos de un patrón. Un sistema que reporta un **97% de exactitud global** puede estar fallando aun así el **40% de las veces en un tipo de documento raro o caso límite** si ese tipo representa una fracción del total lo bastante pequeña como para no mover la cifra agregada. Por eso las métricas de exactitud mezcladas son, por sí solas, una señal débil para las decisiones de fiabilidad.

La solución es el **muestreo estratificado**: audita la exactitud por segmento (tipo de documento, campo, nivel de cliente, idioma) en lugar de solo en agregado, para que una bolsa oculta de fallos aflore en vez de diluirse en la media. Combinado con **puntuaciones de confianza a nivel de campo**, esto te permite fijar umbrales por segmento para qué se procesa automáticamente frente a qué se deriva a revisión humana: un segmento con un rendimiento históricamente débil recibe un umbral más estricto aunque la cifra global de todo el sistema parezca saludable.

## Preservar la procedencia

Cuando un agente sintetiza hallazgos de múltiples fuentes (investigación, RAG, agregación multiagente), perder el vínculo con el lugar *de donde* provino una afirmación es un fallo silencioso de fiabilidad: la salida puede parecer igual de segura tanto si está bien fundamentada como si está inventada.

### Mapeo de afirmación a fuente

Preserva la atribución como datos estructurados junto a la afirmación, no solo como una nota al pie en prosa:

```json
{
  "claim": "The AI music generation market is estimated at $3.2B.",
  "source_url": "https://example.com/market-report-2024",
  "source_name": "Example Market Research",
  "publication_date": "2024-06-15",
  "confidence": 0.9
}
```

`source_url`, `source_name`, `publication_date` y `confidence` juntos permiten que un consumidor posterior (humano o agente) juzgue cuánto peso dar a la afirmación sin rehacer la investigación.

### Datos en conflicto: preservar, no promediar

Cuando dos fuentes discrepan, **no** promedies los números ni elijas uno en silencio: eso destruye información y puede producir un valor que ninguna de las fuentes reportó en realidad. En su lugar, preserva ambos valores con su atribución y señala el conflicto de forma explícita:

```json
{
  "metric": "market_size_usd_billions",
  "values": [
    { "value": 3.2, "source_name": "Example Market Research", "publication_date": "2024-06-15" },
    { "value": 4.8, "source_name": "Other Analyst Firm", "publication_date": "2025-01-10" }
  ],
  "conflict_detected": true
}
```

Una bandera `conflict_detected` empuja la decisión sobre qué valor (o ambos) creer hacia quien tenga más contexto —el agente coordinador o el usuario final— en lugar de que el paso de agregación tome esa decisión en silencio.

### Las fechas importan para la interpretación

Preservar `publication_date` no es mero papeleo: cambia lo que realmente significan los valores «en conflicto». Una fuente de 2023 que reporta un 10% y una fuente de 2024 que reporta un 15% para la misma métrica es muy probablemente **crecimiento a lo largo del tiempo**, no una contradicción, pero solo si las fechas se conservan el tiempo suficiente para poder comprobarlas. Elimina las fechas durante la agregación y esos mismos dos números parecen una inconsistencia inexplicable en lugar de una tendencia.

### Representar según el tipo de contenido

Ajusta el formato de salida al tipo de información: tablas para datos numéricos/comparables, prosa para la explicación narrativa, listas para los elementos de acción. Forzar todo a prosa entierra los números justo donde la pérdida en el medio y la degradación por resumen hacen más daño; forzar la narrativa a una tabla despoja del matiz que un lector necesita para interpretarla correctamente.

## Enfoque para el examen

- Ten claro que la API es **sin estado**: el historial completo (prompt del sistema + mensajes + definiciones de herramientas + resultados de herramientas) se reenvía en cada llamada, y que la «memoria» es una ilusión de la capa de aplicación construida encima de esto.
- Sé capaz de identificar por su nombre los tres modos de fallo de contexto principales: **pérdida en el medio**, **acumulación de resultados de herramientas** y **pérdida de precisión provocada por el resumen** (números/fechas que se vuelven vagos).
- Las sesiones largas también se **degradan**: el modelo deriva hacia «patrones típicos» genéricos en lugar de las clases/hechos específicos que encontró antes; los archivos scratchpad y el estado estructurado lo vuelven a anclar en hallazgos concretos.
- Reconoce las seis técnicas de gestión y qué contrarresta cada una específicamente: bloque de hechos del caso (pérdida de precisión), hooks de recorte (hinchazón de resultados de herramientas), colocación consciente de la posición (pérdida en el medio), scratchpads (persistencia entre sesiones), delegación en subagentes (aislar el descubrimiento verboso), estado estructurado + manifiesto (recuperación ante caídas).
- Sé capaz de separar los disparadores de escalado **fiables** (solicitud explícita, política que calla, sin progreso tras N intentos, umbral financiero, múltiples coincidencias) de los **poco fiables** (sentimiento, confianza autoevaluada, clasificadores de complejidad): espera preguntas de escenario que presenten como distractor un disparador que suena plausible pero es poco fiable.
- Conoce los tres patrones de escalado (inmediato / intentar y luego escalar / reconocer-ofrecer-escalar-ante-la-reiteración) y que escalar a la *primera* señal de frustración es el patrón equivocado.
- Ten claro qué debe incluir un traspaso autocontenido para que una persona pueda actuar sin leer la transcripción: los datos de cliente/pedido, `actions_taken`, `root_cause`, `recommended_action`, `escalation_reason`.
- Recuerda que la exactitud agregada puede ocultar fallos específicos de un segmento (el escenario del 97% global / 40% en un solo tipo) y que el muestreo estratificado —no un umbral global más alto— es la solución.
- En preguntas de procedencia: los datos en conflicto se preservan con su atribución y una bandera `conflict_detected`, nunca se promedian ni se resuelven en silencio; `publication_date` es lo que distingue las contradicciones reales de las tendencias temporales.
