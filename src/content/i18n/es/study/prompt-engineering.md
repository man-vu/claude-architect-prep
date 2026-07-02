La ingeniería de prompts para agentes en producción tiene menos que ver con formulaciones ingeniosas y más con darle a Claude *evidencia*: ejemplos concretos, criterios de éxito explícitos y un bucle de retroalimentación sobre el que pueda actuar. Esta página cubre el prompting con pocos ejemplos (few-shot), el encadenamiento, los bucles de validación/reintento, la autocorrección, la salida estructurada y la Message Batches API.

## Prompting con pocos ejemplos (few-shot)

Una instrucción vaga como "sé más preciso" o "sé conservador" puede interpretarse de muchas maneras distintas. Un ejemplo muestra sin ambigüedad el formato esperado *y* la lógica de decisión que hay detrás; por eso 2–4 ejemplos bien elegidos suelen superar a otro párrafo de descripción. El enfoque few-shot es especialmente potente cuando las entradas son informales o muy variadas (tickets de texto libre, mediciones escritas a mano, formatos de documento mixtos), porque una regla no puede enumerar cada variante, pero un puñado de ejemplos representativos permite que el modelo generalice.

Mantén la cantidad de ejemplos pequeña y bien enfocada (2–4). Más ejemplos añaden tokens sin añadir nuevas fronteras de decisión; elige ejemplos que enseñen cada uno un caso límite *distinto* en lugar de repetir el mismo.

Cinco tipos de ejemplo que consistentemente justifican sus tokens:

**1. Selección ambigua de herramienta.** Muestra el razonamiento, no solo la llamada:

```
User: "My order is broken, it says delivered but I don't have it."
→ get_customer_context → lookup_order (routine investigation)

User: "Get me a manager right now."
→ escalate_to_human immediately (no lookup first — explicit escalation request)
```

**2. Formato de salida.** Un ejemplo completo y desarrollado supera a la sola descripción de un esquema:

```json
{
  "location": "src/auth/session.ts:142",
  "issue": "Session token compared with == instead of ===",
  "severity": "HIGH",
  "suggested_fix": "Use strict equality to avoid type-coercion bypass"
}
```

**3. Código aceptable vs. problemático.** Empareja un caso marcado con uno limpio para que el modelo aprenda la frontera, no solo el patrón incorrecto:

```
// Flag:
if (session.token == true) { ... }        // loose equality, coercion risk

// Do not flag:
if (session.token === true) { ... }        // strict equality
```

**4. Extracción entre distintos formatos de documento.** El mismo dato aparece de forma diferente según la forma de la fuente:

```
Inline citation:  "...as shown in prior work (Smith, 2020)."
Bibliography entry: Smith, J. (2020). Title. Journal, 12(3), 45-67.
```
Ambos deben resolverse al mismo registro normalizado `{"author": "Smith", "year": 2020}`: el ejemplo le enseña al modelo a extraer más allá del formato superficial.

**5. Mediciones informales.** Las cantidades en texto libre necesitan un ejemplo de conversión, no solo una lista de unidades:

```
"two handfuls of rice" → {"amount": 100, "unit": "g"}   (~50g per handful)
```

## Criterios de éxito explícitos

Sustituye los calificativos vagos ("sé conservador", "marca los problemas importantes") por una lista enumerada de permitidos/denegados. La ambigüedad en la instrucción se convierte en ambigüedad —y deriva— en la salida.

```
Flag ONLY if:
  1. The issue causes a runtime failure or incorrect result for some input.
  2. The issue is a security vulnerability (injection, auth bypass, secret leak).
  3. The issue silently corrupts data or state.

Do NOT flag:
  - Style preferences (naming, formatting, import order)
  - Missing tests, unless the change is untestable as written
  - Pre-existing issues outside the diff
```

Combinar los criterios con una rúbrica de severidad elimina el margen de interpretación restante: cada nivel recibe un ejemplo concreto, no solo una etiqueta:

| Severidad | Definición | Ejemplo |
|---|---|---|
| `CRITICAL` | Fallo en tiempo de ejecución para los usuarios | Puntero nulo / excepción no gestionada durante el pago |
| `HIGH` | Vulnerabilidad de seguridad | Inyección SQL, XSS, falta de comprobación de autorización |
| `MEDIUM` | Error de lógica, sin caída inmediata | Orden de clasificación incorrecto, error por uno (off-by-one) |
| `LOW` | Solo calidad de código | Duplicación, algoritmo subóptimo, nomenclatura |

Los criterios explícitos junto con una rúbrica como esta reducen de forma medible tanto la deriva (que el modelo se invente su propio listón a lo largo de una ejecución larga) como los falsos positivos (marcar el estilo como si fuera un defecto).

Cuando una categoría entera genera demasiados falsos positivos como para confiar en ella, lo pragmático es **desactivar temporalmente esa categoría** —dejar de reportarla— mientras iteras sus criterios por separado. Una categoría que se dispara mal la mayor parte del tiempo no solo desperdicia atención: erosiona la confianza en las categorías *precisas* que tiene al lado, así que silenciarla protege la señal del resto hasta que se corrija su prompt.

## Encadenamiento de prompts (pasos secuenciales enfocados)

El encadenamiento divide una tarea en una secuencia fija de prompts enfocados, cada uno con una función acotada, en lugar de pedirle a un solo prompt que lo haga todo de una vez:

```
Document → metadata extraction → data extraction → validation → enrichment
```

Para la revisión de código en concreto: ejecuta primero una **pasada por archivo** (solo problemas locales, cada archivo recibe toda la atención) y luego una **pasada de integración entre archivos** aparte, que solo observa cómo interactúan las piezas ya identificadas (flujo de datos entre archivos, incompatibilidades de contrato, lógica duplicada entre módulos).

Por qué una única pasada multiarchivo tiende a fallar:

- **Dilución de la atención**: cuantos más archivos y preocupaciones se meten en un solo contexto, menos escrutinio recibe cualquier línea individual.
- **Marcado inconsistente**: el mismo patrón de error se detecta en el archivo A pero se pasa por alto en el archivo D porque el listón interno del modelo se desplaza a lo largo de una respuesta larga.
- **Errores obvios que se escapan**: problemas que se detectarían al instante de forma aislada se pierden entre el volumen.

El encadenamiento encaja bien cuando la tarea es **predecible y repetible**: los pasos y su orden se conocen de antemano sin importar la entrada (p. ej., extraer → validar → enriquecer, siempre). Cuando la tarea es **abierta** —el alcance solo queda claro una vez que has visto los resultados intermedios (p. ej., una investigación que se ramifica según lo que revela la primera consulta)— usa en su lugar la descomposición dinámica: deja que el modelo (o un orquestador) genere la siguiente subtarea a partir de los hallazgos actuales en vez de seguir una tubería fija.

## Bucles de validación y reintento con retroalimentación

El bucle central: **extraer → validar → reintentar con retroalimentación en caso de fallo.**

1. **Extrae** datos estructurados del documento fuente.
2. **Valida** contra un JSON Schema (o un modelo de Pydantic) y las reglas de negocio.
3. **En caso de fallo**, vuelve a hacer el prompt, pero no con un simple "inténtalo de nuevo". Incluye:
   - el **documento fuente original**
   - la **extracción anterior (incorrecta)**
   - el **error específico**, expresado de forma concreta

```
Field 'total' = 150, but sum(line_items) = 145. Re-check the line items
and the total against the source document.
```

Un mensaje de error específico permite que el modelo localice el fallo en lugar de volver a derivar toda la extracción desde cero.

**Cuándo funciona el reintento:** violaciones de formato/estructura (tipo incorrecto, campo obligatorio ausente) y errores de aritmética/consistencia (un total que no cuadra con sus partes); estos se pueden comprobar contra el documento y el modelo puede volver a derivar el valor correcto.

**Cuándo falla el reintento:** información que sencillamente **está ausente en la fuente** (por mucho que insistas con el prompt, no se inventará un número que nunca estuvo en el documento) y **alucinaciones** de las que el modelo está seguro: repetir "vuelve a comprobarlo" no sirve de nada si el modelo no es consciente de que fabricó el valor en primer lugar. En ambos casos, la solución es exponer el campo como `null`/`unclear` y derivarlo a una persona, no seguir reintentando.

### Los tres roles de Pydantic en el bucle

1. **Validación estructural**: tipos, campos obligatorios, pertenencia a un enum. Esto es lo que una simple comprobación de JSON Schema te da gratis.
2. **Validadores personalizados para la lógica de negocio**: reglas que un esquema por sí solo no puede expresar: `sum(line_items) == total`, `end_date > start_date`, consistencia entre campos.
3. **Generación de esquema para `tool_use`**: el mismo modelo de Pydantic que valida la salida puede generar el JSON Schema que se pasa a la definición de herramienta `tool_use`, de modo que el contrato de validación y el de generación nunca se desalinean.

```python
from pydantic import BaseModel, model_validator

class Invoice(BaseModel):
    stated_total: float
    line_items: list[float]

    @model_validator(mode="after")
    def check_total(self):
        if abs(sum(self.line_items) - self.stated_total) > 0.01:
            raise ValueError(
                f"total={self.stated_total} but sum(line_items)="
                f"{sum(self.line_items)}"
            )
        return self
```

Ante un `ValidationError`, pasa `str(error)` directamente al prompt de reintento como el "error específico": es el mismo mensaje que querría un revisor humano.

## Autocorrección

En lugar de validar solo a posteriori, algunos errores pueden detectarse *dentro* de una sola extracción pidiendo dos valores derivados de forma independiente en vez de uno:

```json
{
  "stated_total": 150.00,
  "calculated_total": 145.00,
  "conflict_detected": true
}
```

`stated_total` se lee directamente del documento; `calculated_total` se deriva sumando las partidas. Si no coinciden, `conflict_detected` pasa a `true`: la discrepancia sale a la luz de inmediato, sin un segundo viaje de ida y vuelta. Esto es más barato que un bucle de reintento completo para el caso concreto de "¿el documento concuerda consigo mismo?", y se combina con el reintento con retroalimentación: usa la extracción de doble valor para los campos donde es posible una comprobación interna, y recurre a validar → reintentar para los errores entre documentos o de reglas de negocio que requieren contexto externo.

### Rastrear por qué se disparan los hallazgos

Para mejorar un prompt de revisión con el tiempo, haz que cada hallazgo lleve un campo **`detected_pattern`** que nombre la construcción de código que lo activó. Cuando una persona desarrolladora descarta un hallazgo, ese campo te permite agregar *qué* patrones producen falsos positivos, convirtiendo descartes dispersos en una señal sistemática sobre qué criterios ajustar, en lugar de adivinar.

## Fundamentos de la salida estructurada

`tool_use` con un JSON Schema es la forma fiable de obtener una salida conforme al esquema: garantiza una **sintaxis** válida (nada de JSON malformado ni de corchetes faltantes) pero no la **semántica** (una respuesta válida según el esquema todavía puede ser incorrecta, incompleta o alucinada). Las garantías de sintaxis son un piso, no un sustituto del bucle de validación anterior. Consulta el dominio de diseño de herramientas para conocer toda la mecánica de `tool_use` y `tool_choice`; los hábitos de creación de esquemas que vale la pena destacar aquí:

- **Campos anulables (nullable)** para información que puede estar genuinamente ausente —`{"type": ["string", "null"]}`— en lugar de obligar al modelo a fabricar un valor para satisfacer una cadena obligatoria.
- **`enum` más una vía de escape** —`"enum": ["bug", "feature", "docs", "unclear", "other"]`— para que el modelo tenga una manera legítima de decir "no encaja en las categorías" en vez de adivinar la más cercana. Empareja `"other"` con un campo de texto libre `*_detail` para los detalles.
- **`required` solo para los campos que siempre están presentes.** Marcar como obligatorio un campo que a veces está ausente solo fuerza a meter datos incorrectos en él; usa en su lugar un campo anulable y trata `null` como una respuesta real y válida.

```json
{
  "category": {
    "type": "string",
    "enum": ["bug", "feature", "docs", "unclear", "other"]
  },
  "category_detail": {
    "type": ["string", "null"],
    "description": "Free-text detail when category = 'other'"
  }
}
```

Las reglas de normalización pertenecen al prompt, no solo al esquema: un esquema puede restringir la forma pero no, por ejemplo, qué formato de calendario usa una cadena de fecha:

| Tipo | Regla | Ejemplo |
|---|---|---|
| Fechas | ISO 8601 (`YYYY-MM-DD`); resuelve las fechas relativas a absolutas | "next Friday" → `2026-07-10` |
| Moneda | Importe numérico + código de moneda ISO | "five bucks" → `{"amount": 5, "currency": "USD"}` |
| Porcentajes | Fracción decimal | "half" → `0.5` |

## Message Batches API

La Batches API cambia latencia por coste: procesamiento **asíncrono**, aproximadamente un **50% más barato** que la Messages API síncrona, con una ventana de procesamiento de **hasta 24 horas** (sin garantía de terminar antes). Cada solicitud de un lote lleva un `custom_id` que la correlaciona con su respuesta; dado que las respuestas de un lote pueden llegar en desorden y por separado del envío, `custom_id` es la única clave de unión fiable. Un lote es **una solicitud → una respuesta** por elemento: no hay conversación de varios turnos ni bucle de uso de herramientas dentro de una entrada del lote; si el flujo de trabajo necesita que Claude llame a una herramienta y vea el resultado antes de responder, eso no encaja en el modelo de lotes.

**Usa la Batches API para** trabajo masivo no bloqueante donde nadie está esperando de forma síncrona: generación de informes nocturnos, procesamiento de más de 10,000 documentos, barridos de auditoría semanales.

**Usa la Messages API síncrona para** cualquier cosa bloqueante o interactiva: una comprobación de PR previa a la fusión que un desarrollador está esperando, una respuesta de chat, cualquier ruta donde quien llama no puede continuar hasta que llega la respuesta.

**Cálculo del SLA:** trabaja hacia atrás desde la fecha límite. Si los resultados vencen en 30 horas y el lote puede tardar hasta 24 horas en procesarse, el lote debe *enviarse* dentro de las primeras 6 horas de esa ventana; es decir, `submission_deadline = final_deadline - 24h`. Apurar más que el techo de 24 horas arriesga incumplir la fecha límite sin remedio, ya que la Batches API no ofrece ninguna garantía de latencia.

**Gestión de fallos parciales:** los lotes no fallan de forma atómica: algunos elementos tienen éxito y otros dan error. Recorre los resultados, identifica las entradas fallidas por su `custom_id` y reenvía solo esas como un lote nuevo (mucho más pequeño) en lugar de reenviar todo el conjunto original.

**Refina primero con una muestra.** Antes de enviar decenas de miles de documentos, ejecuta el prompt contra una muestra representativa pequeña e itera hasta que sea fiable. Un fallo del prompt descubierto *después* de un lote de 10,000 documentos implica volver a pagar y volver a esperar toda la ejecución; detectarlo con 50 documentos es casi gratis: maximizar el éxito en la primera pasada es lo que hace que la economía de los lotes realmente compense.

## El patrón de entrevista

Antes de comprometerte con una implementación, haz que Claude formule preguntas aclaratorias en lugar de adivinar, sacando a la luz temprano las decisiones de diseño no obvias:

```
Claude: "Before implementing caching for the API, a few questions:
1. Which cache-invalidation strategy do you prefer — TTL or event-based?
2. Is stale data acceptable when the cache is unavailable?
3. Should caching be per-user or global?
4. What is the expected data volume to cache?"
```

**Cuándo vale la pena:**
- Dominio poco familiar (fintech, sanidad, legal)
- Tareas con implicaciones no obvias (estrategias de caché, modos de fallo)
- Múltiples enfoques viables donde la mejor elección depende de un contexto que no te dieron

Preguntar primero es más barato que construir lo equivocado y rehacerlo, y las preguntas en sí mismas documentan los supuestos que hay detrás del diseño.

## Enfoque para el examen

- Reconoce *por qué* funciona un ejemplo: codifica tanto el formato como la lógica de decisión que una regla no puede detallar por completo; espera preguntas de escenario donde la "mejor" solución de prompt es añadir 2–4 ejemplos, no más prosa.
- Ante un criterio vago ("sé conservador", "marca los errores importantes"), elige la respuesta que lo sustituye por una lista enumerada de permitidos/denegados más una rúbrica de severidad con ejemplos concretos.
- Distingue el encadenamiento de prompts (tubería fija y predecible) de la descomposición dinámica (el alcance emerge en tiempo de ejecución), y conoce *por qué* la revisión multiarchivo de una sola pasada rinde peor (dilución de la atención, marcado inconsistente, errores obvios que se escapan).
- Domina de memoria la receta del reintento con retroalimentación: documento original + extracción anterior + error específico, y sé distinguir "el reintento arreglará esto" (formato, aritmética) de "el reintento no puede arreglar esto" (datos ausentes en la fuente, alucinación segura).
- Conoce las tres funciones de Pydantic: validación estructural, validadores personalizados de lógica de negocio y generación de JSON Schema para `tool_use`.
- La autocorrección mediante extracción de doble valor (`stated_total` / `calculated_total` / `conflict_detected`) detecta la inconsistencia interna sin un viaje de reintento; no la confundas con el bucle de validar y luego reintentar, que gestiona errores que necesitan comprobación externa.
- `tool_use` garantiza una sintaxis JSON válida, nunca la corrección semántica: una respuesta conforme al esquema todavía puede ser incorrecta.
- Batches API: asíncrona, ~50% más barata, hasta 24h de procesamiento, `custom_id` para la correlación, una solicitud → una respuesta (sin bucles de herramientas), y el cálculo del SLA que resta el techo de 24h a la fecha límite para obtener la ventana de envío. Elige síncrono en vez de lote siempre que algo esté bloqueado esperando el resultado, y refina el prompt con una muestra pequeña antes de comprometer un lote grande.
- Para reducir los falsos positivos, sustituye el filtrado basado en confianza por criterios explícitos de permitidos/denegados; cuando una categoría siga siendo demasiado ruidosa, desactívala temporalmente en lugar de dejar que erosione la confianza en las precisas, y añade un campo `detected_pattern` para que los hallazgos descartados revelen qué criterios ajustar.
