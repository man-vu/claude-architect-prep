import type { TheoryOverlay } from "../types";

export const esTheory: Record<string, TheoryOverlay> = {
  "t-aa-01": {
    question: "En el bucle agéntico, ¿qué significa `stop_reason: \"end_turn\"`?",
    options: [
      "El modelo alcanzó su límite de `max_tokens` y la respuesta se truncó",
      "El modelo no tiene nada más que hacer y el bucle debe devolver el resultado",
      "El modelo está solicitando que se ejecuten una o más herramientas",
      "Se ha alcanzado el tope de seguridad `max_iterations`",
    ],
    explanation:
      "`end_turn` significa que el modelo no tiene nada más que hacer y que se debe devolver el resultado. Es la única señal de finalización fiable; en cambio, las solicitudes de herramientas se señalan mediante `stop_reason == \"tool_use\"`.",
  },
  "t-aa-02": {
    question: "¿Por qué una aplicación agéntica debe reenviar todo el historial de mensajes en cada llamada a la API?",
    options: [
      "En realidad solo se necesita el último turno del usuario; el historial completo se envía únicamente para mejorar la tasa de aciertos de la caché de prompts",
      "El modelo conserva memoria entre llamadas, pero solo para el system prompt",
      "El modelo no tiene estado y no conserva memoria entre llamadas: el contexto solo existe en lo que la aplicación reenvía cada vez",
      "El SDK exige el array de mensajes, pero el modelo lo ignora después de la primera llamada",
    ],
    explanation:
      "El modelo no conserva memoria entre llamadas, así que cada solicitud reenvía el system prompt, cada turno anterior y cada resultado de herramienta. Todo lo que el modelo necesite \"recordar\" debe estar en el array de mensajes que envías.",
  },
  "t-aa-03": {
    question: "¿Cuál es el papel correcto de un límite `max_iterations` en un bucle agéntico?",
    options: [
      "Un tope de seguridad contra bucles descontrolados (por ejemplo, reintentos infinitos ante errores de herramientas); nunca el criterio principal de finalización",
      "La condición de parada principal, ya que `stop_reason` puede no ser fiable",
      "Una forma de garantizar que el modelo emita `end_turn` en un número fijo de turnos",
      "Innecesario una vez que `stop_reason == \"end_turn\"` se gestiona correctamente",
    ],
    explanation:
      "Un límite `max_iterations` es una buena práctica, pero solo como tope de seguridad contra bucles descontrolados: el número de iteraciones no guarda ninguna relación semántica con la finalización de la tarea. Activar ese tope debe tratarse como una condición de error, no como un éxito.",
  },
  "t-aa-04": {
    question: "¿Cuál es la función principal del campo `description` en una `AgentDefinition`?",
    options: [
      "Documentación legible para las personas que mantienen el código del agente",
      "Texto que se añade al system prompt del subagente en el momento de la invocación",
      "Un identificador único usado para el enrutamiento y el registro (logging)",
      "La entrada que lee el modelo de enrutamiento de un coordinador para decidir si delega en este subagente",
    ],
    explanation:
      "El `description` no es documentación: es lo que lee un coordinador para elegir entre subagentes, así que debe describir con precisión el alcance y los límites. El identificador único de enrutamiento/registro es `name`, no `description`.",
  },
  "t-aa-05": {
    question: "¿Cuántas herramientas suele tener normalmente en `allowed_tools` un subagente con un alcance bien definido, y por qué?",
    options: [
      "1-2, porque más generaría interferencias entre prompt y herramientas",
      "4-6, porque la fiabilidad en la selección de herramientas se degrada a medida que crece la lista",
      "10-15, para asegurarse de que al subagente nunca le falte una capacidad",
      "No hay un rango recomendado: el número de herramientas no afecta la precisión de la selección",
    ],
    explanation:
      "Un subagente con un alcance bien definido suele tener entre 4 y 6 herramientas. Las listas demasiado amplias reducen la precisión de la selección: un agente con 20 herramientas poco relacionadas elige una opción plausible pero equivocada con más frecuencia que uno con 5 herramientas bien acotadas.",
  },
  "t-aa-06": {
    question: "Cuando un coordinador invoca a un subagente mediante la herramienta `Task`, ¿con qué contexto empieza el subagente?",
    options: [
      "Un contexto en blanco que contiene únicamente lo que el coordinador incluyó explícitamente en el prompt de `Task`",
      "El historial de conversación completo del coordinador, heredado automáticamente",
      "Un espacio de memoria compartida visible para todos los subagentes del sistema",
      "El system prompt del coordinador más el mensaje más reciente del usuario",
    ],
    explanation:
      "Los subagentes no heredan el historial de conversación del coordinador y no tienen memoria compartida: cada invocación empieza en blanco, solo con el contenido del prompt de `Task`. Por eso un prompt de delegación vago produce un resultado vago.",
  },
  "t-aa-07": {
    question: "¿Qué ocurre cuando un coordinador emite varias llamadas a `Task` en una sola respuesta?",
    options: [
      "Se ejecutan secuencialmente en el orden indicado",
      "Solo se atiende la primera llamada; el resto se descarta",
      "Se ponen en cola y se ejecutan una por cada turno posterior del coordinador",
      "Los subagentes se ejecutan en paralelo y el coordinador recibe todos los resultados antes de continuar",
    ],
    explanation:
      "Varias llamadas a `Task` en una misma respuesta del coordinador se ejecutan en paralelo, y el coordinador obtiene todos los resultados antes de continuar. Despachar juntas las subtareas independientes es la principal palanca para reducir la latencia en los sistemas de tipo hub-and-spoke.",
  },
  "t-aa-08": {
    question: "¿Qué debe incluir el propio `allowed_tools`/`allowedTools` de un coordinador para poder generar subagentes?",
    options: [
      "`fork_session`",
      "Todas las herramientas que usan sus subagentes",
      "La herramienta `Task` (que la interfaz de Claude Code ahora llama herramienta `Agent`)",
      "Un indicador de permiso `delegate` establecido en cada `AgentDefinition`",
    ],
    explanation:
      "La delegación ocurre a través de la herramienta `Task` (llamada `Agent` en la interfaz de Claude Code), así que el coordinador debe tener `Task` en su propia lista de herramientas o no tendrá ningún mecanismo para generar subagentes. No necesita las herramientas propias de los subagentes.",
  },
  "t-aa-09": {
    question: "Cuando los resultados de herramientas previos de una sesión han quedado obsoletos porque los archivos cambiaron desde que se capturaron, ¿cuál es el enfoque recomendado?",
    options: [
      "Usar `--resume` en la sesión y dejar que el agente detecte los cambios por sí mismo",
      "Iniciar una nueva sesión sembrada con un resumen estructurado y compacto en lugar de reanudar",
      "Usar `fork_session` para que el contexto obsoleto quede aislado en la otra rama",
      "Reanudar la sesión pero aumentar `max_iterations` para que pueda volver a explorar todo el código",
    ],
    explanation:
      "Reanudar sobre resultados de herramientas obsoletos corre el riesgo de que el modelo trate lecturas desactualizadas como actuales, así que una sesión nueva sembrada con un resumen estructurado y compacto es más fiable. `--resume` solo es apropiado cuando el contexto previo sigue siendo válido en su mayor parte; `fork_session` sirve para ramificar líneas de trabajo independientes a partir de una base común.",
  },
  "t-aa-10": {
    question: "¿Qué hook se ejecuta antes de que se ejecute una llamada a una herramienta, y qué puede hacer?",
    options: [
      "`PreToolUse`: puede inspeccionar la llamada propuesta y bloquearla o redirigirla",
      "`PostToolUse`: puede vetar la llamada antes de que se despache",
      "`PreToolUse`: solo puede registrar la llamada, no alterarla",
      "`PostToolUse`: normaliza los argumentos de la herramienta antes de que esta se ejecute",
    ],
    explanation:
      "`PreToolUse` intercepta una llamada a una herramienta antes de su ejecución y puede bloquearla o redirigirla (por ejemplo, derivando a escalado un reembolso que excede el límite). `PostToolUse` se ejecuta después de que la herramienta devuelve un resultado y puede normalizarlo o recortarlo antes de que el modelo lo vea.",
  },
  "t-aa-11": {
    question: "Según la regla rectora de la página, ¿qué clase de reglas debe aplicarse con hooks en lugar de con instrucciones en el prompt?",
    options: [
      "Preferencias de tono y estilo",
      "Cualquier cosa que el system prompt ya indique con claridad",
      "Reglas que el modelo ha incumplido al menos una vez",
      "Reglas financieras, legales y críticas para la seguridad",
    ],
    explanation:
      "Las instrucciones en el prompt son probabilísticas y tienen una tasa de fallo distinta de cero, mientras que los hooks aplican reglas en código con un cumplimiento 100% determinista. Si un error es financiero, legal o crítico para la seguridad, pon un hook por delante; las preferencias, el tono y el estilo pueden quedarse como instrucciones en el prompt.",
  },
  "t-aa-12": {
    question: "¿Para qué tipo de tarea es la descomposición dinámica (adaptativa) la estrategia correcta?",
    options: [
      "Tareas de extracción repetibles con una forma conocida y fija",
      "Cualquier tarea que requiera más de tres pasos",
      "Investigación abierta en la que el alcance de cada paso surge de los hallazgos del paso anterior",
      "Tareas en las que la reproducibilidad entre ejecuciones es la máxima prioridad",
    ],
    explanation:
      "La descomposición dinámica es adecuada para investigación abierta, depuración o research donde la estructura de las subtareas no puede predeterminarse: los resultados de cada paso determinan cuál debe ser el siguiente. Las tareas de forma conocida y repetible y la alta reproducibilidad son el terreno de las canalizaciones (pipelines) fijas.",
  },
  "t-aa-13": {
    question: "¿Qué problema evita dividir la revisión de código en una pasada por archivo seguida de una pasada entre archivos?",
    options: [
      "El aislamiento de contexto entre subagentes",
      "La dilución de la atención: un único prompt gigante hace que todos los archivos compitan simultáneamente por la atención del modelo, de modo que los problemas sutiles se pasan por alto",
      "Las interferencias entre prompt y herramientas debidas a una redacción imprecisa del system prompt",
      "Las lagunas de cobertura causadas por una descomposición demasiado estrecha",
    ],
    explanation:
      "La revisión de código en varias pasadas es la canalización fija canónica: un único prompt que contiene todos los archivos diluye la atención del modelo sobre todos ellos a la vez. La división en dos pasadas obliga a una atención centrada por archivo y, después, a una pasada dedicada a los problemas de integración transversales.",
  },
  "t-aa-14": {
    question: "¿Qué categoría de error es reintentable y cuál es la respuesta correcta ante ella?",
    options: [
      "Transitorio (por ejemplo, tiempo de espera agotado, HTTP 503, límite de tasa): reintentar con retroceso exponencial",
      "Validación: reintentar con la misma entrada un número acotado de veces",
      "De negocio: reintentar tras escalar a una persona",
      "Permiso: reintentar con retroceso hasta que se conceda el acceso",
    ],
    explanation:
      "Solo los errores transitorios son reintentables, con retroceso exponencial (normalmente 1-2 reintentos locales dentro del subagente antes de propagar). Los errores de validación requieren corregir la entrada, los de negocio requieren una explicación y una vía alternativa, y los de permiso deben escalarse.",
  },
  "t-aa-15": {
    question: "¿Qué antipatrón de gestión de errores identifica la página como el más peligroso, y por qué?",
    options: [
      "Los reintentos infinitos, porque convierten un fallo transitorio en un bloqueo",
      "Las cadenas genéricas de tipo `operation failed`, porque el coordinador no puede ramificar en función de ellas",
      "La supresión silenciosa: tratar el resultado vacío de una llamada fallida como un `no data found` correcto, porque aguas abajo resulta idéntico a un éxito",
      "Abortar todo el flujo de trabajo ante el fallo de una sola subtarea, porque se descartan los resultados parciales",
    ],
    explanation:
      "La supresión silenciosa se considera el antipatrón más peligroso porque una llamada fallida disfrazada de resultado vacío pero correcto es indistinguible de un éxito real aguas abajo. Las demás opciones también son antipatrones, pero solo la supresión silenciosa recibe la etiqueta de \"la más peligrosa\".",
  },
  "t-aa-16": {
    question: "¿Qué significa que el bucle agéntico esté \"guiado por el modelo\"?",
    options: [
      "La aplicación selecciona la siguiente herramienta y el modelo solo da formato a los argumentos",
      "El bucle sigue una secuencia de herramientas fija y predefinida establecida en tiempo de diseño",
      "Claude decide qué herramienta llamar a continuación razonando sobre el contexto actual, en lugar de seguir un árbol de decisión codificado de forma rígida",
      "El modelo gestiona internamente el número de iteraciones del bucle, así que no hace falta ningún tope de seguridad",
    ],
    explanation:
      "El modelo razona sobre el contexto actual para elegir cada paso siguiente en lugar de seguir un árbol de decisión fijo; esa adaptabilidad es la esencia misma de un agente. También es la razón por la que `stop_reason` tiene tanto peso: como no dictas cada paso, necesitas una señal fiable de que el modelo ha terminado.",
  },
  "t-aa-17": {
    question: "En el bucle agéntico, ¿qué debe hacer la aplicación cuando llega una respuesta con `stop_reason: \"tool_use\"`?",
    options: [
      "Ejecutar la(s) herramienta(s) solicitada(s), añadir el/los bloque(s) `tool_result` al historial de conversación y enviar la siguiente solicitud",
      "Devolver la solicitud de herramienta al usuario y terminar el bucle",
      "Gestionarlo como un caso límite específico de la aplicación, igual que `max_tokens` o `stop_sequence`",
      "Reenviar la misma solicitud sin cambios hasta que el modelo emita `end_turn`",
    ],
    explanation:
      "`tool_use` significa que el modelo está solicitando la ejecución de herramientas: ejecuta la(s) herramienta(s), añade el/los bloque(s) `tool_result` al historial y vuelve al paso 1 del bucle. Otros valores como `max_tokens` y `stop_sequence` son los que se gestionan como casos específicos de la aplicación.",
  },
  "t-aa-18": {
    question: "¿Por qué analizar el texto del asistente en busca de palabras como \"done\" o \"completed\" falla como comprobación de terminación del bucle?",
    options: [
      "El modelo nunca usa esas palabras en sus respuestas",
      "El análisis de texto funciona de forma fiable, pero es más lento que comprobar `stop_reason`",
      "Esas palabras solo aparecen cuando `stop_reason` ya es `end_turn`",
      "El modelo puede decir \"He completado el paso 1 de 3\": la coincidencia de texto no puede distinguir la finalización de una subtarea de la finalización de la tarea, y la formulación varía entre ejecuciones",
    ],
    explanation:
      "La coincidencia de palabras de finalización no puede distinguir la finalización de una subtarea de la de la tarea completa, y la formulación no es estable entre ejecuciones. Detenerse ante la confianza expresada o un sentimiento positivo falla por la misma razón: la confianza autoevaluada no está calibrada respecto a la corrección real.",
  },
  "t-aa-19": {
    question: "En una `AgentDefinition`, ¿qué es cierto respecto al campo `system_prompt`?",
    options: [
      "Se renegocia con el coordinador en cada turno de la tarea del subagente",
      "Establece el rol, las restricciones y las reglas de comportamiento del subagente, y se carga una vez por invocación del subagente, sin renegociarse a mitad de la tarea",
      "Es el campo que lee la lógica de enrutamiento de un coordinador para decidir si delega",
      "Sirve además como identificador único usado para el enrutamiento y el registro",
    ],
    explanation:
      "`system_prompt` contiene el rol, las restricciones y las reglas de comportamiento del subagente y se carga una vez por invocación. La entrada de enrutamiento que lee un coordinador es `description`, y el identificador único de enrutamiento/registro es `name`.",
  },
  "t-aa-20": {
    question: "¿Qué modo de fallo puede provocar una instrucción del system prompt como \"verifica siempre la identidad del cliente antes de ayudarlo\"?",
    options: [
      "Crea una asociación de herramientas no deseada, que hace que el modelo llame a `get_customer` en cada turno, incluso en aquellos en los que la identidad ya se había verificado",
      "Deshabilita la herramienta `get_customer` durante el resto de la conversación",
      "Obliga al coordinador a enrutar cada solicitud a un subagente de identidad",
      "Ninguno: solo `allowed_tools` influye en qué herramientas se llaman",
    ],
    explanation:
      "Una redacción imprecisa crea una asociación fuerte y repetida entre \"ayudar\" y \"verificar\", lo que produce llamadas redundantes a `get_customer`. Las instrucciones precisas y acotadas —\"verifica la identidad una vez por conversación, antes de la primera acción que modifique la cuenta\"— evitan esa interferencia.",
  },
  "t-aa-21": {
    question: "En la orquestación de tipo hub-and-spoke, ¿qué afirmación describe correctamente el papel del coordinador?",
    options: [
      "Ejecuta él mismo todas las herramientas y usa los subagentes solo para el registro",
      "Deriva al usuario al subagente más relevante, que luego conversa directamente con el usuario",
      "Descompone las solicitudes, selecciona y delega en subagentes, agrega los resultados, gestiona los errores que emergen, hace seguimiento del estado y actúa como única interfaz de cara al usuario",
      "Supervisa a subagentes que intercambian resultados entre sí directamente a través de conexiones de radio a radio (spoke-to-spoke)",
    ],
    explanation:
      "La topología en estrella no tiene conexiones de radio a radio: el usuario nunca habla con un subagente y ningún subagente envía mensajes a otro directamente. Enrutar toda la comunicación a través del coordinador le da la observabilidad necesaria para detectar lagunas, aplicar una gestión de errores coherente y controlar qué información fluye a dónde.",
  },
  "t-aa-22": {
    question: "¿Qué conjunto de elementos especifica un prompt de `Task` bien formado?",
    options: [
      "Una frase temática más un puntero al lugar donde el subagente puede obtener el historial de conversación del coordinador",
      "Un objetivo explícito, el contexto de datos completo incorporado en línea, el formato de salida, la gestión de casos límite y los criterios de calidad",
      "La lista `allowed_tools` del subagente y su tope de seguridad `max_iterations`",
      "Solo el objetivo: el contexto adicional diluye la atención del subagente",
    ],
    explanation:
      "Como el subagente no puede ir a buscar lo que el coordinador ya sabe, cada dato necesario debe incorporarse en línea junto con un objetivo explícito, un formato de salida analizable de forma determinista, la gestión de casos límite (por ejemplo, \"si faltan datos, no adivines\") y criterios de calidad, para que el subagente no tenga que inferir qué significa un buen resultado.",
  },
  "t-aa-23": {
    question: "¿Qué significa \"selección dinámica\" para un coordinador que gestiona una solicitud entrante?",
    options: [
      "Aleatorizar qué subagente gestiona cada subtarea para equilibrar la carga",
      "Dejar que cada subagente decida en tiempo de ejecución si la solicitud es relevante para él",
      "Elegir dinámicamente las herramientas de los subagentes en función de la solicitud",
      "Analizar la solicitud e invocar solo los subagentes que realmente necesita, en lugar de enrutar siempre a través de toda la canalización",
    ],
    explanation:
      "Un coordinador no debe ejecutar ciegamente todos los subagentes en cada solicitud: una simple consulta de un dato no debería despertar a toda la flota. La selección dinámica es una de las tres habilidades que separan a un orquestador robusto de una canalización ingenua, junto con la partición del alcance y el refinamiento iterativo.",
  },
  "t-aa-24": {
    question: "Cuando un coordinador reparte una tarea entre varios subagentes, ¿qué exige la partición del alcance?",
    options: [
      "Asignar a cada subagente una porción distinta —diferentes subtemas o tipos de fuente— para que su trabajo no se solape ni duplique esfuerzos",
      "Dar a cada subagente el mismo prompt idéntico para poder validar sus resultados de forma cruzada",
      "Repartir el presupuesto de tokens de forma equitativa entre todos los subagentes",
      "Particionar `allowed_tools` de modo que no haya dos subagentes que compartan una herramienta",
    ],
    explanation:
      "La partición del alcance significa que cada subagente al que se reparte la tarea recibe una porción distinta del trabajo —diferentes subtemas o tipos de fuente— para que no se dupliquen esfuerzos en asignaciones que se solapan.",
  },
  "t-aa-25": {
    question: "En un bucle de refinamiento iterativo, ¿qué hace el coordinador después del paso de síntesis?",
    options: [
      "Devuelve la síntesis de inmediato: volver a invocar a los subagentes contaminaría sus contextos aislados",
      "Evalúa el resultado en busca de lagunas de cobertura, vuelve a delegar consultas de seguimiento específicas y vuelve a invocar la síntesis, repitiendo hasta que la cobertura sea suficiente",
      "Pide a cada subagente que autoevalúe su confianza y reintenta con los que puntúen por debajo de un umbral",
      "Reinicia toda la canalización desde cero con una flota de subagentes más grande",
    ],
    explanation:
      "Una sola pasada de descomposición suele pasar por alto subáreas enteras: el fallo clásico descompone \"industrias creativas\" en subtareas exclusivamente de artes visuales y nunca cubre la música, la escritura ni el cine, mientras cada subagente sigue informando de éxito en su tarea acotada. El coordinador debe comprobar si hay lagunas de cobertura, volver a delegar y volver a sintetizar hasta cerrarlas.",
  },
  "t-aa-26": {
    question: "¿Para qué sirve `fork_session`?",
    options: [
      "Continuar una conversación previa concreta y con nombre donde se dejó",
      "Comprimir una sesión larga en un resumen estructurado y compacto",
      "Ramificar desde una base de análisis compartida hacia líneas de trabajo independientes, sin que el contexto de una rama contamine el de la otra",
      "Ejecutar dos subagentes en paralelo dentro del mismo contexto de sesión",
    ],
    explanation:
      "`fork_session` ramifica a partir de una base compartida —por ejemplo, explorar dos estrategias de refactorización o de pruebas a partir del mismo análisis del código— sin que ninguna rama contamine a la otra. Continuar una conversación previa concreta es `--resume <session-name>`, por lo que conviene nombrar las sesiones de investigación de forma deliberada.",
  },
  "t-aa-27": {
    question: "Si se modificaron archivos después del análisis de una sesión, ¿qué deberías hacer al reanudar esa sesión?",
    options: [
      "Nada: el agente vuelve a leer automáticamente todos los archivos al reanudar",
      "Eliminar los resultados de herramientas previos de la sesión para que no quede nada obsoleto en el contexto",
      "Aumentar la ventana de contexto para que quepan las versiones antiguas y nuevas de los archivos",
      "Informar explícitamente al agente de los cambios concretos para que vuelva a analizar solo esos archivos",
    ],
    explanation:
      "Decirle a la sesión reanudada exactamente qué cambió le permite volver a analizar solo los archivos afectados. De lo contrario, o bien confía en lecturas obsoletas como si fueran actuales, o bien se ve obligada a volver a explorar todo el código.",
  },
  "t-aa-28": {
    question: "¿Cuál es la diferencia fundamental de aplicación entre las instrucciones del prompt y los hooks?",
    options: [
      "Las instrucciones del prompt son deterministas, mientras que los hooks dependen de que el modelo decida cumplir",
      "Las instrucciones del prompt son probabilísticas y tienen una tasa de fallo distinta de cero por bien redactadas que estén; los hooks residen en el código de la aplicación, fuera del control del modelo, y aplican las reglas con un determinismo del 100%",
      "Los hooks solo son más fiables en modelos por debajo de cierto nivel de capacidad",
      "No hay ninguna diferencia de aplicación: los hooks son simplemente más fáciles de mantener que el texto del prompt",
    ],
    explanation:
      "En principio, un modelo puede eludir una regla del prompt mediante casos límite, entradas adversarias o deriva, pero un hook se ejecuta al margen del razonamiento del modelo. Un system prompt que diga \"nunca apruebes reembolsos superiores a 500 $\" es buena higiene, no un control; el control es el hook `PreToolUse` que bloquea la llamada de forma mecánica.",
  },
  "t-aa-29": {
    question: "¿Cuándo se ejecuta el hook `PostToolUse` y para qué sirve?",
    options: [
      "Después de que una llamada a una herramienta devuelve un resultado, antes de que este se añada al historial: puede normalizar o recortar el resultado antes de que el modelo lo vea",
      "Después de la respuesta final del modelo, para auditar toda la conversación",
      "Antes de que se ejecute una llamada a una herramienta, para bloquearla o redirigirla",
      "Después de cada turno del usuario, para inyectar reglas actualizadas del system prompt",
    ],
    explanation:
      "`PostToolUse` intercepta el resultado de la herramienta antes de que llegue al historial de conversación; por ejemplo, convirtiendo una marca de tiempo Unix en bruto a ISO 8601 antes de que el modelo razone sobre ella. Bloquear o redirigir una llamada antes de su ejecución es tarea de `PreToolUse`.",
  },
  "t-aa-30": {
    question: "¿Qué ventajas atribuye la página a una canalización fija (encadenamiento de prompts)?",
    options: [
      "El orden de sus pasos se adapta a lo que descubren los pasos anteriores",
      "Elimina la necesidad de gestionar errores entre etapas",
      "Gestiona la investigación abierta mejor que la descomposición dinámica",
      "Es predecible, cada etapa se puede probar de forma aislada, las ejecuciones son reproducibles y el diagnóstico de fallos es sencillo porque sabes exactamente qué etapa falló",
    ],
    explanation:
      "Las canalizaciones fijas son adecuadas para tareas cuya forma se conoce de antemano y es repetible, cambiando adaptabilidad por previsibilidad, capacidad de prueba por etapa, reproducibilidad y un diagnóstico de fallos sencillo. La descomposición dinámica tiene menor reproducibilidad y un diagnóstico más difícil porque el propio camino puede ser el problema.",
  },
  "t-aa-31": {
    question: "¿Cuál es la respuesta correcta ante un error de permiso (por ejemplo, acceso denegado, alcance insuficiente) dentro de un subagente?",
    options: [
      "Reintentar con retroceso exponencial hasta que se conceda el acceso",
      "Corregir la entrada y reenviar la llamada",
      "Escalar: el subagente no puede resolverlo por sí mismo",
      "Explicar por qué la solicitud no es admisible y proponer una vía alternativa",
    ],
    explanation:
      "Los errores de permiso no son reintentables y deben escalarse. Corregir la entrada es la respuesta a los errores de validación (reintentar ciegamente con la misma entrada defectuosa fallará de nuevo), y explicar más proponer una alternativa es la respuesta a los errores de negocio, como las infracciones de una política.",
  },
  "t-aa-32": {
    question: "¿Cómo debe gestionar un subagente un fallo transitorio antes de involucrar al coordinador?",
    options: [
      "Propagarlo de inmediato: solo el coordinador tiene el contexto para decidir sobre los reintentos",
      "Intentar primero una recuperación local —normalmente 1-2 reintentos con retroceso— y propagar solo los errores que realmente no puede resolver por sí mismo",
      "Reintentar indefinidamente hasta que la llamada acabe teniendo éxito",
      "Registrarlo y devolver un resultado vacío para que el flujo de trabajo continúe",
    ],
    explanation:
      "La recuperación local (1-2 reintentos con retroceso) evita inundar al coordinador con ruido sobre el que no puede actuar y evita que fallos recuperables se conviertan en fallos a nivel de flujo de trabajo. Los errores de validación y de permiso, en cambio, no son reintentables localmente y se propagan de inmediato con su categoría.",
  },
  "t-aa-33": {
    question: "¿Qué preserva el campo `attempted_query` en una respuesta de error estructurada?",
    options: [
      "Lo que realmente se intentó, para que el coordinador o una persona pueda distinguir entre \"esto de verdad no devolvió nada\" y \"esto falló antes de poder buscar\"",
      "El calendario de reintentos que seguirá a continuación el subagente",
      "El system prompt del subagente en el momento del fallo",
      "Una clave de caché para deduplicar consultas repetidas",
    ],
    explanation:
      "`attempted_query` registra lo que realmente se intentó, separando un resultado vacío pero real de una llamada que falló antes de poder ejecutarse. Junto a él, `isError` y `errorCategory` permiten al coordinador ramificar según la categoría (reintentar, escalar o explicar) en lugar de hacer coincidencias de cadenas sobre el texto del error.",
  },
  "t-aa-34": {
    question: "¿Por qué un subagente que falla debe incluir `partial_results`, `completion_rate` y `failed_sections` en su respuesta de error?",
    options: [
      "Para que el coordinador pueda facturar solo la parte completada de la tarea",
      "Porque el SDK rechaza las respuestas de error que los omiten",
      "Para que los reintentos puedan omitir el paso de clasificación de errores transitorios",
      "Un subagente que completó 3 de 5 cosas debe devolver esas 3, no descartarlas: las anotaciones de cobertura indican al coordinador exactamente cuánto puede confiar en el resultado y qué falta",
    ],
    explanation:
      "Los resultados parciales nunca deben desecharse solo porque la tarea en su conjunto no tuvo pleno éxito. `completion_rate` y `failed_sections` indican al coordinador o al consumidor aguas abajo con precisión cuánto puede confiar en el resultado y qué queda sin cubrir.",
  },
  "t-aa-35": {
    question: "Si 4 de 5 subtareas en paralelo tienen éxito, ¿qué debe hacer generalmente el flujo de trabajo?",
    options: [
      "Abortar por completo: los resultados parciales no son fiables por definición",
      "Reintentar las 5 subtareas para que los resultados sigan siendo coherentes entre sí",
      "Devolver los 4 resultados correctos con una laguna anotada para el que falló",
      "Hacer que el subagente que falló devuelva una respuesta de éxito de aspecto plausible para que los consumidores aguas abajo vean un resultado completo",
    ],
    explanation:
      "Abortar todo un flujo de trabajo porque una de varias subtareas falló es un antipatrón: devuelve los éxitos con una laguna anotada. Fabricar un éxito plausible es el antipatrón de \"ocultar errores al coordinador\": le niega al coordinador la oportunidad de esquivar el problema.",
  },
  "t-aa-36": {
    question: "¿Cuál de los siguientes es un desencadenante legítimo para escalar a una persona?",
    options: [
      "Que la confianza autoevaluada del modelo caiga por debajo de un umbral",
      "Un vacío real en la política: la situación no está cubierta por ninguna regla que tenga el agente",
      "Que un clasificador de sentimiento detecte la frustración del usuario",
      "Que un clasificador genérico marque la conversación como inusual",
    ],
    explanation:
      "Los desencadenantes legítimos son una petición explícita del usuario (\"páseme con un responsable\"), un vacío real en la política, varios intentos fallidos de resolución automatizada y una operación financiera por encima de un umbral definido: la misma clase de preocupación que un hook `PreToolUse` aplica de forma determinista. El sentimiento, la confianza autoevaluada y los clasificadores genéricos son indicadores poco fiables, igual que lo son para la terminación del bucle.",
  },
  "t-cc-01": {
    question: "¿Por qué los estándares de codificación del equipo escritos en `~/.claude/CLAUDE.md` no llegan a un desarrollador nuevo que clona el repositorio?",
    options: [
      "El CLAUDE.md de nivel de usuario solo se carga al editar archivos en el directorio de inicio (home)",
      "El `.claude/CLAUDE.md` de nivel de proyecto siempre anula el contenido de nivel de usuario",
      "El archivo reside solo en la máquina del autor y nunca está bajo control de versiones, así que nunca estuvo en el repositorio",
      "Los desarrolladores nuevos deben ejecutar `/memory` una vez antes de que los archivos de nivel de usuario empiecen a cargarse",
    ],
    explanation:
      "La configuración de nivel de usuario (`~/.claude/CLAUDE.md`) es personal y nunca se comparte mediante el control de versiones, así que es invisible para los compañeros nuevos. Los estándares del equipo deben ir en un archivo de nivel de proyecto (`.claude/CLAUDE.md` o el `CLAUDE.md` de la raíz) que se distribuye con el repositorio.",
  },
  "t-cc-02": {
    question: "¿Cuándo se carga un archivo `CLAUDE.md` situado dentro de un subdirectorio (por ejemplo, `packages/api/CLAUDE.md`)?",
    options: [
      "Siempre, en cuanto se inicia cualquier sesión de Claude Code en el repositorio",
      "Solo cuando Claude Code está trabajando activamente con archivos de ese directorio",
      "Solo cuando el archivo se referencia desde `.claude/rules/`",
      "Solo cuando se importa explícitamente con `@path` desde el `CLAUDE.md` de la raíz",
    ],
    explanation:
      "El `CLAUDE.md` de nivel de directorio se activa solo cuando Claude Code edita archivos de ese directorio, lo que lo hace útil para convenciones específicas de un paquete o módulo en un monorepo sin sobrecargar el archivo de la raíz.",
  },
  "t-cc-03": {
    question: "¿Hasta qué profundidad pueden anidarse las importaciones `@path` dentro de los archivos CLAUDE.md?",
    options: [
      "No pueden anidarse: solo el CLAUDE.md de nivel superior puede contener importaciones",
      "Hasta 3 niveles de profundidad",
      "Profundidad ilimitada",
      "Hasta 5 niveles de profundidad",
    ],
    explanation:
      "Las importaciones pueden anidarse —una importación dentro de un archivo importado, etc.— pero solo hasta 5 niveles de profundidad. Ten en cuenta también que no debe haber ningún espacio entre `@` y la ruta, y que se admiten tanto rutas relativas como absolutas.",
  },
  "t-cc-04": {
    question: "¿Qué hace que un archivo de reglas de `.claude/rules/` se cargue en el contexto?",
    options: [
      "Que Claude Code entre en el directorio donde reside el archivo de reglas",
      "Que el archivo editado coincida con el glob `paths` del frontmatter YAML de la regla, en cualquier lugar del repositorio",
      "Que el usuario invoque explícitamente la regla con un comando de barra (slash command)",
      "Que la regla se importe mediante `@path` desde el `CLAUDE.md` de la raíz",
    ],
    explanation:
      "Las reglas se cargan en función de qué archivo se está editando, no de en qué directorio te encuentras: la regla se carga solo cuando el archivo tocado coincide con su glob `paths`. Las reglas irrelevantes nunca se cargan, lo que ahorra tokens de contexto: el contraste clave con el `CLAUDE.md` de nivel de directorio.",
  },
  "t-cc-05": {
    question: "¿Dónde debe residir un comando de barra `/review` para que todos los compañeros lo tengan en el momento en que clonan el repositorio?",
    options: [
      "`.claude/commands/` en el repositorio",
      "`~/.claude/commands/`",
      "`.claude/skills/review/`",
      "El archivo `CLAUDE.md` de la raíz",
    ],
    explanation:
      "Los comandos de ámbito de proyecto en `.claude/commands/` están bajo control de versiones y quedan disponibles para todo el equipo al clonar; `~/.claude/commands/` es solo personal. Un `review.md` ahí se convierte en el comando `/review` para todo el equipo.",
  },
  "t-cc-06": {
    question: "¿Qué campo del frontmatter de SKILL.md ejecuta la skill en un subagente aislado para que su prolija salida de herramientas nunca contamine el contexto de la sesión principal?",
    options: [
      "`allowed-tools`",
      "`argument-hint`",
      "`context: fork`",
      "`isolated: true`",
    ],
    explanation:
      "`context: fork` ejecuta la skill en un subagente aislado: el ruido de las búsquedas y las lecturas intermedias se quedan fuera de la ventana de contexto de la sesión principal, y solo regresa el resultado final.",
  },
  "t-cc-07": {
    question: "¿Qué impone el campo `allowed-tools` del frontmatter de SKILL.md?",
    options: [
      "Qué argumentos debe proporcionar el usuario al invocar la skill",
      "Una restricción de mínimo privilegio sobre qué herramientas puede usar la skill, aunque sus instrucciones nunca mencionen otras",
      "Qué subagentes puede generar la skill",
      "Qué globs de archivo hacen que la skill se cargue automáticamente",
    ],
    explanation:
      "`allowed-tools` es una restricción de herramientas de mínimo privilegio: una skill de revisión de código que solo necesita `Read`/`Grep`/`Glob` no debería poder además usar `Write` ni `rm`. Solicitar los argumentos que faltan es, en cambio, tarea de `argument-hint`.",
  },
  "t-cc-08": {
    question: "¿Qué caracteriza al modo de planificación de Claude Code?",
    options: [
      "Implementa los cambios de inmediato, pero pide confirmación antes de cada escritura",
      "Ejecuta cada edición dentro de un subagente bifurcado (forked)",
      "Ejecuta únicamente comandos de shell, nunca ediciones de archivos",
      "Investigación de solo lectura (`Read`/`Grep`/`Glob`) que produce un plan, con cero efectos secundarios hasta que el usuario lo aprueba",
    ],
    explanation:
      "El modo de planificación es una exploración de solo lectura que termina en un plan para su aprobación: nada cambia hasta entonces. Es adecuado para cambios en varios archivos, decisiones de arquitectura y bases de código desconocidas; la ejecución directa conviene para correcciones de un solo archivo, inequívocas y con un rastro de pila (stack trace) claro.",
  },
  "t-cc-09": {
    question: "¿Qué beneficio aporta a la sesión principal despachar un subagente Explore para el trabajo de descubrimiento con muchas lecturas?",
    options: [
      "La sesión principal puede seguir editando archivos mientras las búsquedas se ejecutan con acceso de escritura",
      "El prolijo ir y venir de las búsquedas queda aislado; la sesión principal recibe solo una respuesta destilada",
      "Cambia automáticamente la sesión principal al modo de planificación",
      "Refresca los resultados de herramientas obsoletos que dejó una sesión reanudada",
    ],
    explanation:
      "Un subagente Explore se encarga de las búsquedas de símbolos, el mapeo de directorios y la localización de puntos de llamada, de modo que la sesión principal obtiene una respuesta destilada en lugar de cada resultado intermedio de grep: el mismo beneficio de aislamiento de contexto que `context: fork` da a las skills.",
  },
  "t-cc-10": {
    question: "¿Qué opción (flag) de la CLI hace que Claude Code sea no interactivo —imprimiendo el resultado en stdout y saliendo— tal como se requiere en CI?",
    options: [
      "`--output-format json`",
      "`--headless`",
      "`-p` / `--print`",
      "`--resume`",
    ],
    explanation:
      "`-p`/`--print` procesa el prompt, escribe en stdout y sale: la única forma correcta de invocar Claude Code desde una canalización, ya que cualquier otro modo espera un TTY y se cuelga. Combínalo con `--output-format json` y `--json-schema` cuando CI necesite una salida estructurada y analizable por máquina.",
  },
  "t-cc-11": {
    question: "¿Cuál es la forma recomendada de revisar un diff que una sesión de Claude Code acaba de generar?",
    options: [
      "Iniciar una sesión nueva e independiente (sin `--resume`) dedicada a la revisión",
      "Preguntar a la misma sesión que escribió el código, ya que tiene el mayor contexto",
      "Usar `--resume` en la sesión que escribió el código para que el revisor vea su razonamiento acumulado",
      "Ejecutar `/compact` en la sesión que escribió el código y revisar ahí",
    ],
    explanation:
      "La sesión que generó un diff está sesgada a favor de sus propias decisiones, así que revisarlo en ella es un antipatrón con nombre propio: pon en marcha una sesión nueva con contexto fresco. En una nueva revisión tras las correcciones, aporta los hallazgos previos y pide solo los problemas nuevos o sin resolver (el delta).",
  },
  "t-cc-12": {
    question: "Según la tabla de referencia rápida, ¿qué mecanismo de configuración no tiene variante personal (`~/.claude/`)?",
    options: [
      "CLAUDE.md",
      "Comandos",
      "Skills",
      "Reglas",
    ],
    explanation:
      "Las reglas solo existen como archivos de nivel de equipo `.claude/rules/*.md`, mientras que CLAUDE.md, los comandos y las skills tienen cada uno una variante personal `~/.claude/`. El hilo común: todo lo que está bajo `~/.claude/` es solo tuyo; todo lo que está bajo el `.claude/` del proyecto se distribuye con `git clone`.",
  },
  "t-cc-13": {
    question: "¿Qué comando integrado abre el archivo `CLAUDE.md` para editarlo, de modo que las notas persistan entre sesiones y se carguen automáticamente al arrancar?",
    options: [
      "`/compact`",
      "`/resume`",
      "`/rules`",
      "`/memory`",
    ],
    explanation:
      "`/memory` abre `CLAUDE.md` para editarlo, la alternativa a volver a explicar las convenciones en cada sesión. `/compact`, en cambio, comprime el contexto actual resumiendo el historial, con el riesgo de que se pierdan números, fechas y detalles exactos, así que extrae primero los datos críticos.",
  },
  "t-cc-14": {
    question: "¿Qué riesgo conlleva reanudar una sesión guardada mediante `--resume <session-name>`?",
    options: [
      "Las restricciones de `allowed-tools` de la sesión se descartan al reanudar",
      "El contexto previo se compacta automáticamente, perdiendo detalles numéricos",
      "Sus resultados de herramientas en caché (contenido de archivos, coincidencias de grep) pueden estar obsoletos si los archivos cambiaron: no se vuelve a leer nada automáticamente",
      "Bifurca la sesión, de modo que el trabajo posterior diverge del original",
    ],
    explanation:
      "Una sesión reanudada no vuelve a leer nada que ya \"vio\", así que si los archivos cambiaron sus resultados de herramientas quedan obsoletos; en ese caso, empieza de cero con un breve resumen. Ramificar desde un punto de contexto compartido para comparar enfoques es `fork_session`, un mecanismo distinto.",
  },
  "t-cc-15": {
    question: "Al iterar sobre la salida, ¿cuándo se debe agrupar la retroalimentación en un solo mensaje frente a darla de forma secuencial?",
    options: [
      "Agrupar todos los problemas cuando son interdependientes; darlos de forma secuencial cuando son independientes, para que cada corrección se evalúe de forma aislada",
      "Agrupar siempre: la retroalimentación secuencial desperdicia tokens de contexto",
      "Agrupar cuando los problemas son independientes; ir de forma secuencial cuando son interdependientes",
      "Dar siempre la retroalimentación de forma secuencial, un problema por mensaje",
    ],
    explanation:
      "Los problemas interdependientes van en un único mensaje agrupado; los independientes se dan de uno en uno para que cada corrección se juzgue de forma aislada. La página combina esto con dar 2-3 ejemplos concretos de entrada/salida y la iteración guiada por pruebas como las otras claves de la mejora progresiva.",
  },
  "t-cc-16": {
    question: "¿Qué hace el campo `argument-hint` del frontmatter de SKILL.md?",
    options: [
      "Restringe qué valores de argumento aceptará la skill en la invocación",
      "Se muestra al usuario cuando la skill se invoca sin argumentos, indicándole qué debe proporcionar",
      "Proporciona automáticamente un argumento por defecto cuando no se da ninguno",
      "Documenta los argumentos para otros desarrolladores, pero nunca se muestra",
    ],
    explanation:
      "`argument-hint` se muestra cuando la skill se invoca sin argumentos, indicando al usuario qué debe proporcionar; por ejemplo, `[effort level: low|medium|high]`. La restricción de herramientas es `allowed-tools`; el aislamiento es `context: fork`.",
  },
  "t-cc-17": {
    question: "¿Cómo distingue la página una Skill del contenido de CLAUDE.md?",
    options: [
      "Las skills están siempre cargadas; el contenido de CLAUDE.md se carga solo bajo demanda",
      "CLAUDE.md contiene procedimientos activos; las skills contienen estándares pasivos",
      "CLAUDE.md son estándares generales, pasivos y siempre cargados; una skill es un procedimiento activo, bajo demanda, que se invoca para una tarea concreta",
      "Las skills son solo personales, mientras que CLAUDE.md es solo de equipo",
    ],
    explanation:
      "CLAUDE.md contiene estándares siempre cargados como \"usamos sangría de 2 espacios\"; una skill empaqueta todo un flujo de trabajo reutilizable que se invoca para una tarea concreta (`/review`, `/deploy`): \"es un procedimiento, no un hecho\".",
  },
  "t-cc-18": {
    question: "¿Dónde reside una skill personal, una que usas en tus propios proyectos pero que no has confirmado (commit) en el repositorio del equipo?",
    options: [
      "`~/.claude/skills/<name>/SKILL.md`",
      "`.claude/skills/<name>/SKILL.md`",
      "`~/.claude/commands/<name>.md`",
      "Una sección de skills dentro de `~/.claude/CLAUDE.md`",
    ],
    explanation:
      "Al igual que los comandos, las skills tienen variantes personales: `~/.claude/skills/<name>/SKILL.md` es solo tuya en todos tus proyectos, mientras que `.claude/skills/<name>/` en el repositorio es la variante de equipo que se distribuye con `git clone`.",
  },
  "t-cc-19": {
    question: "¿Cuál de los siguientes figura como desencadenante de la ejecución directa en lugar del modo de planificación?",
    options: [
      "El cambio abarca decenas de archivos",
      "Existen varios enfoques de implementación plausibles y la elección importa",
      "La base de código es desconocida y un primer movimiento equivocado sale caro",
      "La corrección se limita a un solo archivo con un rastro de pila (stack trace) claro que apunta al error",
    ],
    explanation:
      "La ejecución directa conviene para cambios de un solo archivo, bien comprendidos e inequívocos, sobre todo con un rastro de pila claro. Las otras tres opciones son, en cambio, los desencadenantes que la página asigna al modo de planificación.",
  },
  "t-cc-20": {
    question: "En el flujo de trabajo estándar que combina los dos modos, ¿qué ocurre entre el modo de planificación y la ejecución directa?",
    options: [
      "Se ejecuta `/compact` para comprimir el plan en el contexto",
      "El usuario revisa y aprueba el plan; a continuación, la ejecución directa implementa exactamente lo aprobado",
      "Un subagente Explore verifica el plan de forma independiente",
      "La sesión se bifurca para que ambos modos avancen en paralelo",
    ],
    explanation:
      "La composición es: modo de planificación (investigar + diseñar) → el usuario revisa y aprueba el plan → ejecución directa (implementar exactamente lo aprobado). La aprobación es la barrera: el modo de planificación tiene cero efectos secundarios hasta que se produce.",
  },
  "t-cc-21": {
    question: "¿Qué se consigue al combinar `--output-format json` con `--json-schema '{...}'`?",
    options: [
      "Hace que la CLI sea no interactiva para que nunca espere un TTY",
      "Reanuda la sesión anterior con su contexto serializado como JSON",
      "Comprime la respuesta para ahorrar tokens de salida",
      "Fuerza una salida estructurada y validada por esquema en lugar de prosa libre, de modo que un script de CI pueda analizarla directamente",
    ],
    explanation:
      "La combinación produce una salida analizable por máquina y validada por esquema; por ejemplo, para que CI pueda publicar automáticamente comentarios de revisión en línea en el PR por cada hallazgo. La no interactividad es la tarea aparte de `-p`/`--print`.",
  },
  "t-cc-22": {
    question: "Al volver a revisar después de subir (push) las correcciones, ¿qué se debe proporcionar a la nueva sesión de revisión y qué se le debe pedir que haga?",
    options: [
      "Proporcionarle explícitamente los hallazgos previos y pedirle que informe solo de los problemas nuevos o aún sin resolver",
      "Darle solo el diff original para que la revisión siga siendo imparcial",
      "Usar `--resume` en la primera sesión de revisión para que recuerde sus hallazgos",
      "Darle un resumen de `/compact` de la sesión que escribió el código",
    ],
    explanation:
      "Sin los hallazgos previos y una instrucción de solo el delta, cada nueva revisión vuelve a enumerar los mismos problemas ya corregidos, ahogando lo que realmente cambió.",
  },
  "t-cc-23": {
    question: "¿Qué hace `/compact` y cuál es su riesgo documentado?",
    options: [
      "Guarda la sesión con un nombre para reanudarla más tarde; riesgo: resultados de herramientas obsoletos",
      "Borra el contexto por completo; riesgo: perder toda la conversación",
      "Resume el historial previo para liberar la ventana de contexto; riesgo: se pueden perder valores numéricos exactos, fechas y detalles concretos",
      "Abre CLAUDE.md para editarlo; riesgo: sobrescribir los estándares del equipo",
    ],
    explanation:
      "`/compact` comprime el contexto actual durante sesiones largas llenas de prolija salida de herramientas. Como los detalles pueden perderse en el resumen, extrae los datos críticos a un bloque persistente o a un scratchpad antes de compactar.",
  },
  "t-cc-24": {
    question: "¿Qué hace `fork_session`?",
    options: [
      "Reanuda la sesión más reciente con sus resultados de herramientas refrescados",
      "Ramifica una sesión independiente a partir de un punto de contexto compartido: ambas bifurcaciones heredan el contexto hasta la ramificación y luego divergen",
      "Ejecuta una skill dentro de un subagente aislado",
      "Divide la ventana de contexto entre dos prompts concurrentes",
    ],
    explanation:
      "`fork_session` ramifica desde un punto de contexto compartido para que dos sesiones puedan divergir, útil para comparar enfoques (por ejemplo, \"Redux frente a Context API\") sin contaminación cruzada. El aislamiento de skills es `context: fork`, un mecanismo distinto.",
  },
  "t-cc-25": {
    question: "Cuando los resultados de herramientas de una sesión guardada están obsoletos o el contexto se ha degradado, ¿qué recomienda la página en lugar de `--resume`?",
    options: [
      "Iniciar una sesión nueva con un breve resumen de los hallazgos previos (\"Esto es lo que encontramos: …\")",
      "Reanudar de todos modos y ejecutar `/compact` de inmediato",
      "Reanudar e indicar a la sesión que vuelva a leer todos los archivos que vio anteriormente",
      "Bifurcar la sesión obsoleta para que la bifurcación refresque sus resultados de herramientas",
    ],
    explanation:
      "Si los archivos cambiaron o ha pasado mucho tiempo, reinicia con un breve resumen en lugar de reanudar con datos de herramientas antiguos: una sesión reanudada nunca vuelve a leer automáticamente lo que ya \"vio\".",
  },
  "t-cc-26": {
    question: "¿Qué señala la página como la forma más eficaz de comunicar las expectativas de salida durante el refinamiento iterativo?",
    options: [
      "Una especificación detallada en prosa que cubra todos los requisitos",
      "Dejar que Claude te entreviste antes de empezar",
      "Agrupar toda la retroalimentación en un solo mensaje",
      "2-3 ejemplos concretos de entrada/salida, incluidos casos límite, que muestren la transformación que quieres",
    ],
    explanation:
      "Los ejemplos concretos de entrada/salida se consideran la forma más eficaz de comunicar las expectativas: proporciona 2-3 muestras, incluidos casos límite. El patrón de entrevista y las reglas de agrupación son técnicas distintas de la misma página.",
  },
  "t-cc-27": {
    question: "¿Qué es el \"patrón de entrevista\" en el refinamiento iterativo?",
    options: [
      "Hacer que una segunda sesión entreviste a la primera sobre su diff",
      "Pedir al usuario que califique cada iteración con una rúbrica",
      "Dejar que Claude haga preguntas aclaratorias para sacar a la luz consideraciones de diseño no evidentes antes de implementar",
      "Aportar transcripciones de preguntas y respuestas al estilo entrevista como ejemplos few-shot",
    ],
    explanation:
      "El patrón de entrevista deja que Claude haga primero preguntas aclaratorias, sacando a la luz consideraciones de diseño no evidentes, como la invalidación de la caché y los modos de fallo, antes de cualquier implementación.",
  },
  "t-cc-28": {
    question: "¿Qué afirmación sobre la sintaxis de importación `@path` en CLAUDE.md es correcta?",
    options: [
      "Se requiere un espacio entre `@` y la ruta",
      "No se permite ningún espacio entre `@` y la ruta, y se admiten tanto rutas relativas como absolutas",
      "Solo se admiten rutas absolutas",
      "Las importaciones solo pueden aparecer en el CLAUDE.md de la raíz",
    ],
    explanation:
      "Las reglas son: ningún espacio entre `@` y la ruta, y se admiten tanto rutas relativas (`@./standards/x.md`) como absolutas. Esto permite que un monorepo mantenga un único `coding-style.md` canónico referenciado desde el CLAUDE.md de cada paquete en lugar de duplicarlo.",
  },
  "t-cc-29": {
    question: "Según la regla de selección de la página, ¿dónde van las convenciones para un tipo de archivo repartido por todo el repositorio (por ejemplo, todos los `*.test.tsx`), frente a las convenciones para todo lo que hay bajo un directorio (por ejemplo, `packages/api/`)?",
    options: [
      "Tipo de archivo: `.claude/rules/` con un glob `paths`; directorio: un `CLAUDE.md` de nivel de directorio",
      "Tipo de archivo: un `CLAUDE.md` de nivel de directorio; directorio: `.claude/rules/` con un glob `paths`",
      "Ambos van en el `CLAUDE.md` de la raíz mediante importaciones `@path`",
      "Ambos van en `.claude/rules/`; el CLAUDE.md de nivel de directorio está obsoleto",
    ],
    explanation:
      "Ambos mecanismos acotan el contenido, pero en dimensiones distintas: `.claude/rules/` se activa mediante un glob de patrón de archivo en cualquier lugar del repositorio, mientras que el `CLAUDE.md` de nivel de directorio se activa por la ubicación física. \"Todos los archivos de prueba\" es una regla de glob; \"todo lo que hay bajo `packages/api/`\" es un CLAUDE.md de directorio.",
  },
  "t-cc-30": {
    question: "¿Qué ubicaciones cuentan como CLAUDE.md de nivel de proyecto y cuál es su alcance?",
    options: [
      "`~/.claude/CLAUDE.md` o el `CLAUDE.md` de la raíz; visible solo para el propietario del repositorio",
      "Solo `.claude/rules/CLAUDE.md`; todos los colaboradores",
      "`.claude/CLAUDE.md` o un `CLAUDE.md` de la raíz; bajo control de versiones y aplicable a todos los colaboradores del repositorio",
      "Solo el `CLAUDE.md` de la raíz, y únicamente para los colaboradores que hayan ejecutado `/memory`",
    ],
    explanation:
      "El nivel de proyecto significa `.claude/CLAUDE.md` o un `CLAUDE.md` en la raíz del repositorio, confirmado en el control de versiones para que se distribuya con `git clone` y llegue a todos los colaboradores, a diferencia del `~/.claude/CLAUDE.md` personal.",
  },
  "t-cc-31": {
    question: "¿En qué consiste la técnica de \"iteración guiada por pruebas\" de la página?",
    options: [
      "Ejecutar toda la batería de pruebas e2e después de cada prompt",
      "Pedir a Claude que genere pruebas una vez completada la implementación",
      "Iterar sobre las pruebas hasta que coincidan con lo que haga la implementación",
      "Escribir primero las pruebas / el comportamiento esperado y luego iterar en función de los fallos",
    ],
    explanation:
      "La iteración guiada por pruebas significa especificar el comportamiento esperado como pruebas de antemano y dejar que los fallos impulsen cada pasada de refinamiento: una de las técnicas fundamentales de refinamiento iterativo de la página, junto con los ejemplos concretos de entrada/salida.",
  },
  "t-cc-32": {
    question: "En una canalización de CI, ¿cómo aprende una ejecución automatizada de Claude Code los estándares de pruebas del proyecto, las convenciones de fixtures y los criterios de revisión?",
    options: [
      "A partir de los argumentos de línea de comandos que se pasan en cada invocación de `claude -p`",
      "A partir del CLAUDE.md confirmado en el repositorio, que aporta el contexto del proyecto ya que no hay ninguna persona presente para explicar las convenciones",
      "Los infiere automáticamente escaneando el historial de git del repositorio",
      "A partir de una opción `--conventions` que apunta a un archivo de configuración YAML",
    ],
    explanation:
      "CLAUDE.md es el mecanismo que da a un Claude Code invocado desde CI su contexto de proyecto: documentar ahí los estándares de pruebas, los fixtures disponibles y los criterios de revisión mejora de forma medible la calidad de las pruebas generadas y reduce la salida de bajo valor.",
  },
  "t-cc-33": {
    question: "Al usar Claude Code para generar pruebas en CI, ¿por qué deberían incluirse en su contexto los archivos de prueba existentes?",
    options: [
      "Para que el generador pueda copiar exactamente su estilo de formato",
      "Porque la generación de pruebas falla por completo sin al menos una prueba de ejemplo",
      "Para que sepa qué escenarios ya están cubiertos y apunte al comportamiento no cubierto en lugar de proponer duplicados",
      "Para permitir que el generador elimine pruebas obsoletas en la misma pasada",
    ],
    explanation:
      "Sin la batería de pruebas existente en el contexto, el generador no puede saber qué ya está probado y propondrá escenarios duplicados; con ella, la generación apunta a comportamiento realmente no cubierto.",
  },
  "t-pe-01": {
    question: "¿Cuántos ejemplos few-shot recomienda la página incluir en un prompt?",
    options: [
      "Exactamente 1, para mantener el prompt lo más corto posible",
      "2-4 ejemplos específicos, cada uno enseñando un caso límite distinto",
      "5-10, uno por cada campo de salida",
      "Tantos como permita la ventana de contexto, ya que más ejemplos siempre mejoran la precisión",
    ],
    explanation:
      "Más ejemplos añaden tokens sin añadir nuevas fronteras de decisión. La página recomienda 2-4 ejemplos específicos, eligiendo unos que cada uno enseñe un caso límite distinto en lugar de repetir el mismo.",
  },
  "t-pe-02": {
    question: "¿Cuál de los siguientes NO es uno de los cinco tipos de ejemplo que, según la página, rentabilizan sus tokens de forma consistente?",
    options: [
      "Selección de herramienta ambigua, mostrando el razonamiento detrás de la llamada",
      "Pares de código aceptable frente a problemático que enseñan dónde está el límite",
      "Medidas informales con un ejemplo de conversión",
      "Recorridos de cadena de pensamiento sobre aritmética de varios pasos",
    ],
    explanation:
      "Los cinco tipos son: selección de herramienta ambigua, formato de salida, código aceptable frente a problemático, extracción a través de distintos formatos de documento y medidas informales. Los recorridos de cadena de pensamiento sobre aritmética no están en la lista.",
  },
  "t-pe-03": {
    question: "Según la página, ¿qué debería reemplazar a calificadores vagos como \"sé conservador\" o \"marca los problemas importantes\"?",
    options: [
      "Una lista enumerada de lo que se permite y lo que no, junto con una rúbrica de severidad que da a cada nivel un ejemplo concreto",
      "Un umbral de confianza que el modelo debe superar antes de marcar algo",
      "Un párrafo más largo en lenguaje natural que describa la actitud deseada",
      "Una temperatura más baja para que el modelo interprete las instrucciones de forma más literal",
    ],
    explanation:
      "La ambigüedad en la instrucción se convierte en ambigüedad y deriva en la salida. Unos criterios explícitos de \"Marca SOLO si / NO marques\" más una rúbrica de severidad con un ejemplo concreto por nivel reducen de forma medible tanto la deriva como los falsos positivos.",
  },
  "t-pe-04": {
    question: "¿Qué recomienda la página cuando una categoría de hallazgos genera demasiados falsos positivos como para confiar en ella?",
    options: [
      "Bajar su severidad a `LOW` para que sea más fácil de ignorar",
      "Pedir al modelo que verifique dos veces esa categoría antes de informarla",
      "Deshabilitar temporalmente la categoría mientras se itera por separado sobre sus criterios",
      "Seguir informándola, ya que eliminar una categoría reduce la exhaustividad (recall)",
    ],
    explanation:
      "Una categoría que se dispara equivocadamente la mayor parte del tiempo erosiona la confianza en las categorías precisas que la acompañan. Silenciarla protege la señal de las demás hasta que se corrija su prompt.",
  },
  "t-pe-05": {
    question: "Para la revisión de código, ¿qué estructura de encadenamiento recomienda la página?",
    options: [
      "Una única pasada de varios archivos para no pasar por alto nunca los errores entre archivos",
      "Primero una pasada por archivo para los problemas locales y luego una pasada de integración entre archivos aparte",
      "Primero una pasada entre archivos para establecer el contexto y luego una limpieza por archivo",
      "Pasadas en paralelo sobre subconjuntos aleatorios de archivos, combinadas mediante un paso de votación",
    ],
    explanation:
      "Cada archivo recibe atención plena en la pasada por archivo; después, la pasada entre archivos solo examina cómo interactúan las piezas ya identificadas. Una única pasada de varios archivos sufre dilución de la atención, marcado inconsistente y errores obvios que se pasan por alto.",
  },
  "t-pe-06": {
    question: "¿Qué tres cosas debe incluir un prompt de reintento tras un fallo de validación?",
    options: [
      "El JSON Schema, la temperatura del modelo y una petición de volver a intentarlo",
      "La extracción fallida, una instrucción de \"ten cuidado\" y una versión abreviada del documento",
      "El documento fuente original, la extracción anterior (incorrecta) y el error específico enunciado de forma concreta",
      "El código de validación, el rastro de pila (stack trace) y la definición del modelo de Pydantic",
    ],
    explanation:
      "Un simple \"vuelve a intentarlo\" no basta. Un error específico como \"El campo 'total' = 150, pero sum(line_items) = 145\" permite al modelo localizar el fallo en lugar de volver a derivar toda la extracción desde cero.",
  },
  "t-pe-07": {
    question: "¿Cuándo es ineficaz el reintento con retroalimentación?",
    options: [
      "Cuando el error es un tipo incorrecto o un campo obligatorio que falta",
      "Cuando un total declarado no coincide con la suma de sus líneas de detalle",
      "Cuando la validación se hace con Pydantic en lugar de con un JSON Schema simple",
      "Cuando la información está ausente en la fuente, o el modelo está alucinando un valor con seguridad",
    ],
    explanation:
      "Ningún reintento inventa un número que nunca estuvo en el documento, y \"vuelve a comprobarlo\" no ayuda a un modelo que no es consciente de que fabricó el valor. La solución es exponer el campo como `null`/`unclear` y derivarlo a una persona.",
  },
  "t-pe-08": {
    question: "¿Cuáles son los tres papeles de Pydantic en el bucle de validación?",
    options: [
      "Plantillas de prompt, caché de respuestas y conteo de tokens",
      "Validación estructural, validadores personalizados para la lógica de negocio y generación de JSON Schema para `tool_use`",
      "Inferencia de tipos, persistencia en base de datos y enrutamiento de API",
      "Orquestación de reintentos, registro de errores y migración de esquemas",
    ],
    explanation:
      "Pydantic comprueba los tipos, los campos obligatorios y los enums; expresa reglas de negocio que un esquema no puede (como `sum(line_items) == total`); y genera el JSON Schema para la definición de `tool_use`, de modo que los contratos de validación y de generación nunca se desincronizan.",
  },
  "t-pe-09": {
    question: "¿Qué campos extrae, para una factura, el ejemplo de autocorrección de doble valor de la página?",
    options: [
      "`stated_total`, `calculated_total` y `conflict_detected`",
      "`total`, `retry_count` e `is_valid`",
      "`line_items`, `subtotal` y `tax`",
      "`stated_total`, `expected_total` y `error_message`",
    ],
    explanation:
      "`stated_total` se lee directamente del documento, `calculated_total` se deriva sumando las líneas de detalle, y `conflict_detected` cambia a `true` cuando no coinciden, exponiendo la discrepancia sin un segundo viaje de ida y vuelta.",
  },
  "t-pe-10": {
    question: "¿Cuál es el propósito del campo `detected_pattern` en cada hallazgo de la revisión?",
    options: [
      "Permitir que el modelo omita archivos que coinciden con patrones que se saben seguros",
      "Almacenar la expresión regular usada para localizar el problema en el diff",
      "Registrar el nivel de la rúbrica de severidad asignado al hallazgo",
      "Nombrar la construcción de código que desencadenó el hallazgo, para que los descartes revelen qué patrones producen falsos positivos",
    ],
    explanation:
      "Cuando un desarrollador descarta un hallazgo, agregar `detected_pattern` a lo largo de los descartes convierte la retroalimentación dispersa en una señal sistemática sobre qué criterios endurecer, en lugar de adivinar.",
  },
  "t-pe-11": {
    question: "¿Por qué recomienda la página añadir \"other\" o \"unclear\" a un `enum` en un esquema de salida?",
    options: [
      "Le da al modelo una forma legítima de decir que un valor no encaja en las categorías, en lugar de adivinar la más cercana",
      "Reduce el uso de tokens al acortar la lista del enum",
      "JSON Schema exige que todo enum incluya un valor de reserva",
      "Permite que el validador de esquema autocorrija los valores mal categorizados",
    ],
    explanation:
      "La vía de escape evita las conjeturas forzadas; combina \"other\" con un campo `*_detail` de texto libre para los detalles. De forma similar, los campos anulables permiten que la información realmente ausente sea `null` en lugar de fabricarse para satisfacer una cadena obligatoria.",
  },
  "t-pe-12": {
    question: "¿Qué garantiza `tool_use` con un JSON Schema respecto a la salida?",
    options: [
      "Tanto una sintaxis JSON válida como la corrección semántica de los valores",
      "Sintaxis válida más la normalización automática de fechas y monedas",
      "Solo una sintaxis JSON válida: una respuesta válida según el esquema aún puede ser incorrecta, incompleta o alucinada",
      "Nada exigible; el esquema es puramente orientativo",
    ],
    explanation:
      "Las garantías de sintaxis son un suelo, no un sustituto del bucle de validación. Las reglas de normalización (fechas ISO 8601, importe numérico más código de moneda ISO, fracciones decimales) van en el prompt, ya que un esquema restringe la forma pero no las convenciones de contenido.",
  },
  "t-pe-13": {
    question: "¿Qué afirmación sobre la API de Message Batches es correcta?",
    options: [
      "Garantiza resultados en menos de una hora para lotes de menos de 1000 elementos",
      "Es asíncrona, aproximadamente un 50% más barata que la API síncrona de Messages, y puede tardar hasta 24 horas sin garantía de terminar antes",
      "Admite bucles de uso de herramientas de varios turnos dentro de cada entrada del lote",
      "Un lote falla de forma atómica: si un elemento da error, hay que reenviar todo el lote",
    ],
    explanation:
      "Cada entrada es una única solicitud -> una única respuesta, correlacionada con su resultado mediante `custom_id` (la única clave de unión fiable). Los fallos parciales se gestionan reenviando solo las entradas fallidas como un lote más pequeño, y los prompts deben refinarse sobre una muestra pequeña antes de comprometerse a una ejecución grande.",
  },
  "t-pe-14": {
    question: "Si los resultados deben estar en 30 horas y un lote puede tardar hasta 24 horas en procesarse, ¿cuándo debe enviarse el lote?",
    options: [
      "Dentro de las primeras 6 horas: `submission_deadline = final_deadline - 24h`",
      "En cualquier momento dentro de las primeras 24 horas, ya que los lotes suelen terminar antes",
      "Dentro de las primeras 12 horas, para dejar margen para un reintento completo",
      "De inmediato, en la hora cero; cualquier envío posterior incumple el SLA",
    ],
    explanation:
      "Calcula hacia atrás desde la fecha límite restando el techo de procesamiento de 24 horas. La API de Batches no ofrece ninguna garantía de latencia por debajo de ese techo, así que apurar más arriesga incumplir la fecha límite sin remedio.",
  },
  "t-pe-15": {
    question: "Según el patrón de entrevista, ¿qué debe hacer Claude antes de comprometerse con una implementación?",
    options: [
      "Generar tres implementaciones alternativas y dejar que el usuario elija una",
      "Escribir primero las pruebas para que los requisitos emerjan de la batería de pruebas",
      "Proceder con el valor por defecto más habitual del sector y enumerar las suposiciones al final",
      "Hacer preguntas aclaratorias para sacar a la luz decisiones de diseño no evidentes antes de construir",
    ],
    explanation:
      "Preguntar primero sale más barato que construir lo equivocado y rehacerlo, y las preguntas documentan las suposiciones del diseño. Vale la pena en dominios desconocidos, en tareas con implicaciones no evidentes y cuando varios enfoques viables dependen de un contexto que no se ha dado.",
  },
  "t-pe-16": {
    question: "¿Por qué 2-4 ejemplos específicos suelen superar a otro párrafo de descripción?",
    options: [
      "Los ejemplos siempre consumen menos tokens que la prosa equivalente",
      "Los modelos están entrenados para dar más peso a los ejemplos que a las instrucciones",
      "Un ejemplo muestra de forma inequívoca tanto el formato esperado como la lógica de decisión que hay detrás, mientras que una instrucción vaga puede interpretarse de muchas maneras distintas",
      "Los ejemplos permiten al modelo saltarse la lectura del resto del system prompt",
    ],
    explanation:
      "Una instrucción vaga como \"sé más preciso\" o \"sé conservador\" puede interpretarse de muchas maneras distintas. Un ejemplo codifica el formato y la lógica de decisión que una regla no puede detallar por completo.",
  },
  "t-pe-17": {
    question: "¿Para qué tipos de entrada dice la página que el prompting few-shot es especialmente potente?",
    options: [
      "Entradas informales o muy variadas, como tickets de texto libre, medidas escritas a mano y formatos de documento mixtos",
      "Registros generados por máquina con formato estricto y una gramática fija",
      "Tareas de clasificación cortas de sí/no con respuestas binarias",
      "Entradas que ya se han validado frente a un JSON Schema",
    ],
    explanation:
      "Una regla no puede enumerar todas las variantes de una entrada informal, pero un puñado de ejemplos representativos permite al modelo generalizar más allá de la variación superficial.",
  },
  "t-pe-18": {
    question: "En el tipo de ejemplo de selección de herramienta ambigua, ¿qué debe mostrar cada ejemplo?",
    options: [
      "La firma JSON completa de cada herramienta disponible",
      "La misma herramienta llamada con varios conjuntos de argumentos distintos",
      "Solo llamadas a herramientas fallidas, para que el modelo aprenda qué evitar",
      "El razonamiento detrás de la elección, no solo la llamada; por ejemplo, una petición de escalado explícita va directa a escalate_to_human sin ninguna consulta previa",
    ],
    explanation:
      "La página empareja una investigación rutinaria (get_customer_context y luego lookup_order) con una petición de escalado explícita que se salta la consulta por completo: los ejemplos enseñan la lógica de decisión, no solo qué herramientas existen.",
  },
  "t-pe-19": {
    question: "Según el tipo de ejemplo de formato de salida, ¿cuál es la mejor manera de enseñar un formato de salida?",
    options: [
      "Un JSON Schema en el prompt sin ningún ejemplo",
      "Un ejemplo completo y desarrollado de la salida, que supera a una descripción de esquema por sí sola",
      "Una descripción en prosa de lo que significa cada campo",
      "Una expresión regular con la que la salida debe coincidir",
    ],
    explanation:
      "La página muestra un objeto de hallazgo completamente relleno (location, issue, severity, suggested_fix) y afirma que un ejemplo completo y desarrollado supera a una descripción de esquema por sí sola.",
  },
  "t-pe-20": {
    question: "¿Por qué el tipo de ejemplo de código aceptable frente a problemático empareja un caso marcado con uno limpio?",
    options: [
      "Para que el modelo aprenda el límite entre ambos, no solo el patrón malo",
      "Para duplicar el número de ejemplos sin añadir tokens",
      "Porque los JSON Schema requieren tanto casos positivos como negativos",
      "Para que el modelo pueda autogenerar correcciones comparando (diff) las dos versiones",
    ],
    explanation:
      "La página marca la igualdad no estricta (==) pero muestra explícitamente la igualdad estricta (===) como \"no marcar\": el par enseña dónde está la línea en lugar de solo cómo es el código malo.",
  },
  "t-pe-21": {
    question: "¿Qué le enseña al modelo el tipo de ejemplo de extracción a través de distintos formatos de documento?",
    options: [
      "A preservar el formato original de cada fuente en la salida",
      "A preferir las entradas de la bibliografía frente a las citas en línea cuando entran en conflicto",
      "Que el mismo dato que aparece con distintas formas superficiales —una cita en línea y una entrada de bibliografía— debe resolverse en el mismo registro normalizado",
      "A omitir los documentos cuyo formato no se mostró en un ejemplo",
    ],
    explanation:
      "\"(Smith, 2020)\" en línea y \"Smith, J. (2020)...\" en una bibliografía se resuelven ambos en el mismo registro {\"author\": \"Smith\", \"year\": 2020}: el ejemplo enseña al modelo a extraer más allá del formato superficial.",
  },
  "t-pe-22": {
    question: "¿Cómo recomienda la página gestionar cantidades en texto libre como \"dos puñados de arroz\"?",
    options: [
      "Con un glosario solo de unidades añadido al system prompt",
      "Con un ejemplo de conversión que asigne la frase a un importe y una unidad normalizados, no solo una lista de unidades",
      "Rechazando las cantidades informales por considerarlas no analizables",
      "Pasándolas sin cambios y convirtiéndolas aguas abajo",
    ],
    explanation:
      "Las medidas informales necesitan un ejemplo de conversión: \"dos puñados de arroz\" se asigna a {\"amount\": 100, \"unit\": \"g\"} a razón de unos 50 g por puñado. Una lista de unidades por sí sola no enseña la conversión.",
  },
  "t-pe-23": {
    question: "En la rúbrica de severidad de la página, ¿qué emparejamiento de nivel y ejemplo es correcto?",
    options: [
      "CRITICAL: orden de clasificación incorrecto en un informe",
      "HIGH: código duplicado",
      "MEDIUM: un error de lógica sin una caída inmediata, como un error de desfase por uno (off-by-one)",
      "LOW: inyección SQL",
    ],
    explanation:
      "CRITICAL es un fallo en tiempo de ejecución para los usuarios (por ejemplo, una excepción no controlada durante un pago), HIGH es una vulnerabilidad de seguridad (inyección SQL, XSS, falta de autorización), MEDIUM es un error de lógica sin una caída inmediata, y LOW es solo calidad del código.",
  },
  "t-pe-24": {
    question: "¿Qué tres modos de fallo atribuye la página a una única pasada de revisión de varios archivos?",
    options: [
      "Dilución de la atención, marcado inconsistente y errores obvios que se pasan por alto",
      "Desbordamiento de tokens, limitación de tasa y diffs truncados",
      "Mayor coste, latencia más lenta y hallazgos duplicados",
      "Infracciones de esquema, rutas de archivo alucinadas y etiquetas de severidad omitidas",
    ],
    explanation:
      "Cuantos más archivos se meten en un solo contexto, menos escrutinio recibe cualquier línea concreta; el listón interno del modelo se desplaza, de modo que el mismo patrón se detecta en el archivo A pero se pasa por alto en el archivo D; y los problemas que en aislamiento serían detecciones inmediatas se pierden en el volumen.",
  },
  "t-pe-25": {
    question: "¿Cuándo debe usarse el encadenamiento de prompts en lugar de la descomposición dinámica?",
    options: [
      "Cuando el alcance solo queda claro después de ver los resultados intermedios",
      "Siempre que haya más de tres archivos o documentos involucrados",
      "Cuando el modelo debe generar la siguiente subtarea a partir de sus hallazgos actuales",
      "Cuando la tarea es predecible y repetible, con los pasos y su orden conocidos de antemano independientemente de la entrada",
    ],
    explanation:
      "El encadenamiento encaja con canalizaciones fijas como extraer -> validar -> enriquecer que se ejecutan igual cada vez. Las tareas abiertas cuyo alcance surge en tiempo de ejecución requieren descomposición dinámica, donde el modelo o un orquestador genera la siguiente subtarea a partir de los hallazgos actuales.",
  },
  "t-pe-26": {
    question: "¿Para qué clases de error dice la página que funciona el reintento con retroalimentación?",
    options: [
      "Información que falta en el documento fuente",
      "Infracciones de formato/estructura y errores de aritmética o de coherencia",
      "Alucinaciones seguras de las que el modelo no es consciente",
      "Cualquier clase de error, siempre que el número de reintentos sea suficientemente alto",
    ],
    explanation:
      "Los tipos incorrectos, los campos obligatorios que faltan y los totales que no coinciden con sus partes se pueden comprobar frente al documento, así que el modelo puede volver a derivar el valor correcto. Los datos ausentes y las alucinaciones seguras son los casos que el reintento no puede corregir.",
  },
  "t-pe-27": {
    question: "Cuando se lanza un ValidationError de Pydantic en el bucle de reintento, ¿qué dice la página que hay que devolver al modelo?",
    options: [
      "str(error) directamente, como el \"error específico\" en el prompt de reintento",
      "Solo un indicador booleano de que la validación falló",
      "El rastro de pila (stack trace) completo de Python, incluidos los marcos de las librerías",
      "Un JSON Schema regenerado con restricciones más estrictas",
    ],
    explanation:
      "Ante un ValidationError, str(error) vuelve directamente al prompt de reintento como el error específico: la página señala que es el mismo mensaje que querría un revisor humano.",
  },
  "t-pe-28": {
    question: "¿Cómo se relaciona la autocorrección de doble valor con el bucle de validar-y-luego-reintentar?",
    options: [
      "Reemplaza por completo el bucle de reintento una vez que conflict_detected está en el esquema",
      "Duplica el coste, porque cada campo requiere dos viajes de ida y vuelta",
      "Es una comprobación más barata, dentro de la propia extracción, de si el documento concuerda consigo mismo, y se combina con validar-y-luego-reintentar para los errores que necesitan contexto externo",
      "Solo funciona cuando la salida estructurada de tool_use está deshabilitada",
    ],
    explanation:
      "La discrepancia entre stated_total y calculated_total emerge de inmediato dentro de una sola extracción, sin un segundo viaje de ida y vuelta. Los errores entre documentos o de reglas de negocio que requieren una comprobación externa siguen recurriendo al bucle de validar-y-luego-reintentar.",
  },
  "t-pe-29": {
    question: "Según la página, ¿cuándo debe marcarse un campo del esquema como `required`?",
    options: [
      "Siempre que el campo sea importante para los consumidores aguas abajo",
      "Para todos los campos, para que el modelo nunca omita datos",
      "Nunca: los campos obligatorios se desaconsejan para la salida del modelo",
      "Solo cuando el campo siempre está presente; los campos que a veces están ausentes deben ser anulables, tratando null como una respuesta real y válida",
    ],
    explanation:
      "Marcar como obligatorio un campo que a veces está ausente solo fuerza a meter datos malos en él: el modelo fabrica un valor para satisfacer una cadena obligatoria. La información realmente ausente recibe un tipo anulable como {\"type\": [\"string\", \"null\"]}.",
  },
  "t-pe-30": {
    question: "¿Qué reglas de normalización pone la página en el prompt en lugar de en el esquema?",
    options: [
      "Fechas como marcas de tiempo Unix, moneda como cadenas con formato, porcentajes como enteros de 0 a 100",
      "Fechas en ISO 8601 con las fechas relativas resueltas a absolutas, moneda como un importe numérico más un código de moneda ISO, y porcentajes como fracciones decimales",
      "Formatos de fecha específicos de la configuración regional elegidos por cada documento fuente",
      "Ninguna: la normalización la impone por completo el JSON Schema",
    ],
    explanation:
      "Un esquema restringe la forma pero no convenciones como el formato de calendario, así que las reglas de normalización van en el prompt: \"el próximo viernes\" se convierte en 2026-07-10, \"cinco pavos\" en {\"amount\": 5, \"currency\": \"USD\"}, y \"la mitad\" en 0.5.",
  },
  "t-pe-31": {
    question: "¿Por qué cada solicitud de un lote lleva un `custom_id`?",
    options: [
      "Las respuestas de un lote pueden llegar en desorden y por separado del envío, así que custom_id es la única clave fiable que une una respuesta con su solicitud",
      "Establece la prioridad de procesamiento del elemento dentro del lote",
      "Factura cada elemento a un proyecto o centro de costes distinto",
      "Habilita conversaciones de varios turnos dentro de una entrada del lote",
    ],
    explanation:
      "El custom_id correlaciona cada solicitud con su respuesta. Como los resultados pueden regresar en desorden y desligados del envío, es la única clave de unión fiable.",
  },
  "t-pe-32": {
    question: "¿Qué dice la página sobre el uso de herramientas dentro de una entrada de Message Batches?",
    options: [
      "Los bucles de herramientas se admiten, pero se facturan a la tarifa síncrona",
      "Cada entrada permite exactamente una llamada a herramienta y un turno de seguimiento",
      "El uso de herramientas funciona en los lotes siempre que tool_choice se configure adecuadamente",
      "Una entrada de lote es una única solicitud con una única respuesta, así que un flujo de trabajo en el que Claude debe llamar a una herramienta y ver su resultado antes de responder no encaja en el modelo de lotes",
    ],
    explanation:
      "No hay conversación de varios turnos ni bucle de uso de herramientas dentro de una entrada del lote. Los flujos de trabajo que necesitan que Claude llame a una herramienta y observe el resultado antes de responder pertenecen a la API síncrona.",
  },
  "t-pe-33": {
    question: "¿Cómo recomienda la página gestionar un lote en el que algunos elementos fallaron?",
    options: [
      "Reenviar todo el lote original, ya que los lotes fallan de forma atómica",
      "Cambiar de inmediato los elementos fallidos a la API síncrona",
      "Recorrer los resultados, identificar las entradas fallidas por su custom_id y reenviar solo esas como un lote nuevo y mucho más pequeño",
      "Descartar los fallos, ya que la API de Batches los reintenta internamente",
    ],
    explanation:
      "Los lotes no fallan de forma atómica: algunos elementos tienen éxito mientras otros dan error. Solo las entradas fallidas, encontradas por su custom_id, necesitan ir en el lote de seguimiento.",
  },
  "t-pe-34": {
    question: "¿Qué recomienda hacer la página antes de enviar decenas de miles de documentos como un lote?",
    options: [
      "Dividir el lote en sublotes por horas para repartir el riesgo",
      "Ejecutar el prompt sobre una muestra representativa pequeña e iterar hasta que sea fiable",
      "Enviar el lote completo una vez con la temperatura elevada para sacar a la luz los modos de fallo",
      "Duplicar cada documento para poder verificar los fallos de forma cruzada",
    ],
    explanation:
      "Un error en el prompt descubierto después de un lote de 10 000 documentos significa volver a pagar y volver a esperar toda la ejecución; detectarlo en 50 documentos es casi gratis. Maximizar el éxito en la primera pasada es lo que hace rentable la economía de los lotes.",
  },
  "t-pe-35": {
    question: "¿Qué cargas de trabajo asigna la página a la API de Batches frente a la API síncrona de Messages?",
    options: [
      "Lotes para el trabajo masivo no bloqueante, como informes nocturnos, ejecuciones de más de 10 000 documentos y barridos de auditoría semanales; síncrona para cualquier cosa bloqueante o interactiva, como una comprobación de PR previa a la fusión que un desarrollador está esperando",
      "Lotes para todas las cargas de más de 100 solicitudes, síncrona solo para solicitudes individuales",
      "Lotes siempre que el coste importe, incluido el chat interactivo",
      "Síncrona para el trabajo masivo para obtener reintentos por elemento, lotes para las respuestas de chat",
    ],
    explanation:
      "La línea divisoria es si alguien está esperando de forma síncrona: usa lotes cuando nadie está bloqueado esperando el resultado, y la API síncrona para cualquier vía en la que quien llama no pueda continuar hasta que llegue la respuesta.",
  },
  "t-pe-36": {
    question: "¿En qué situaciones dice la página que vale la pena el patrón de entrevista?",
    options: [
      "Solo cuando el usuario pide explícitamente a Claude que formule preguntas",
      "En todas las tareas, ya que las preguntas siempre salen más baratas que cualquier implementación",
      "Dominios desconocidos (fintech, sanidad, legal), tareas con implicaciones no evidentes y varios enfoques viables cuya mejor elección depende de un contexto que no se ha dado",
      "Tareas simples y bien especificadas donde los valores por defecto son evidentes",
    ],
    explanation:
      "Preguntar primero sale más barato que construir lo equivocado y rehacerlo, y las propias preguntas documentan las suposiciones que hay detrás del diseño.",
  },
  "t-tm-01": {
    question: "¿Qué campo de la definición de una herramienta es el mecanismo principal que Claude usa para seleccionar una herramienta?",
    options: [
      "name",
      "description",
      "input_schema",
      "tool_choice",
    ],
    explanation:
      "Claude lee los campos `description`, no el código fuente, para decidir qué herramienta encaja con el paso actual. El `name` importa mucho menos de lo que la mayoría supone, y las descripciones vagas son la causa más común de una selección de herramienta equivocada.",
  },
  "t-tm-02": {
    question: "¿Cuáles son los tres elementos que enuncia una buena descripción de herramienta?",
    options: [
      "La versión de la herramienta, su autor y sus límites de tasa",
      "El nombre de la herramienta, sus campos obligatorios y su tipo de salida",
      "El endpoint de la API subyacente, su método de autenticación y sus códigos de error",
      "Qué hace y qué devuelve, los formatos de entrada con ejemplos, y cuándo usarla frente a una herramienta similar",
    ],
    explanation:
      "Una buena descripción enuncia qué hace y qué devuelve la herramienta, sus formatos de entrada aceptados con ejemplos (por ejemplo, `user@domain.com`) y su límite frente a herramientas similares (por ejemplo, \"Usa esta herramienta ANTES de `lookup_order`\").",
  },
  "t-tm-03": {
    question: "¿Qué significa realmente marcar un campo como `required` en un esquema de entrada?",
    options: [
      "La información siempre está disponible en el momento de la llamada",
      "El campo es importante y el modelo debe priorizarlo",
      "Claude hará fallar la llamada de forma limpia siempre que falte el valor",
      "La aplicación debe validar el campo antes de la ejecución",
    ],
    explanation:
      "`required` es una promesa sobre la disponibilidad, no una declaración de importancia. Si un campo obligatorio a veces falta en los datos de entrada, Claude inventará un valor de aspecto plausible para satisfacer el esquema en lugar de hacer fallar la llamada: un campo importante pero que a veces falta debe ir en el esquema como opcional y anulable.",
  },
  "t-tm-04": {
    question: "¿Cuál es el propósito de declarar el tipo de un campo como [\"string\", \"null\"]?",
    options: [
      "Marca el campo como obligatorio a la vez que permite cadenas vacías",
      "Le indica a la API que omita el campo de la respuesta",
      "Le da al modelo una forma explícita y válida de decir que la información realmente no está en lugar de alucinar un valor",
      "Permite que el campo acepte valores de cualquier tipo de dato",
    ],
    explanation:
      "Una unión de tipos anulable permite al modelo devolver `null` en lugar de fabricar un valor para rellenar el hueco. Cualquier campo que describa información que podría no existir en los datos subyacentes debe ser anulable.",
  },
  "t-tm-05": {
    question: "¿Qué dos valores de enum sirven como vías de escape para un enum cerrado?",
    options: [
      "\"none\" y \"unknown\"",
      "\"other\" y \"unclear\"",
      "\"misc\" y \"n/a\"",
      "\"default\" y \"skip\"",
    ],
    explanation:
      "`\"other\"` se combina con un campo de detalle de texto libre (por ejemplo, `category_detail`) para que la información que queda fuera de las categorías predefinidas no se descarte en silencio, y `\"unclear\"` permite al modelo informar de una ambigüedad genuina en lugar de dar una respuesta segura pero equivocada.",
  },
  "t-tm-06": {
    question: "¿Qué palabra clave de JSON Schema impone la forma de una cadena, como un código postal de 5 dígitos?",
    options: [
      "enum",
      "format",
      "minimum / maximum",
      "pattern",
    ],
    explanation:
      "`pattern` impone la forma de una cadena (por ejemplo, `^[0-9]{5}$` para un código postal de 5 dígitos), mientras que `minimum`/`maximum` acotan rangos numéricos. Son barreras de protección baratas y deterministas que eliminan la salida malformada antes de que llegue a ejecutarse.",
  },
  "t-tm-07": {
    question: "¿Qué clase de errores elimina `tool_use` combinado con un JSON Schema?",
    options: [
      "Errores de sintaxis, como JSON malformado, tipos de campo incorrectos o campos obligatorios que faltan",
      "Errores semánticos, como totales de líneas de detalle que no suman correctamente",
      "Tanto errores de sintaxis como semánticos",
      "Ninguno de los dos: la validación de esquema es puramente orientativa",
    ],
    explanation:
      "La API impone un JSON válido que coincida con el esquema, eliminando los errores de sintaxis, pero una respuesta puede ser perfectamente válida según el esquema y aun así ser incorrecta. Los errores semánticos requieren validación a nivel de aplicación y un bucle de reintento que devuelva la discrepancia al modelo.",
  },
  "t-tm-08": {
    question: "¿Qué valor de `tool_choice` obliga a Claude a llamar a una herramienta concreta por su nombre?",
    options: [
      "{\"type\": \"auto\"}",
      "{\"type\": \"any\"}",
      "{\"type\": \"tool\", \"name\": \"verify_customer\"}",
      "{\"type\": \"forced\", \"tool\": \"verify_customer\"}",
    ],
    explanation:
      "`{\"type\": \"tool\", \"name\": ...}` obliga a usar la herramienta nombrada, `\"any\"` obliga a usar alguna herramienta (cualquiera de las proporcionadas) y `\"auto\"` deja decidir al modelo. Forzar suele ser una jugada de una sola vez para garantizar que primero se ejecuta una condición previa, seguida de un cambio de vuelta a `\"auto\"`.",
  },
  "t-tm-09": {
    question: "En el ciclo de tool_use, ¿cómo se vincula un bloque `tool_result` con la llamada a herramienta que responde?",
    options: [
      "Repitiendo el campo `name` de la herramienta en el resultado",
      "Por su posición en el array de contenido",
      "Por la memoria del modelo de su solicitud anterior",
      "Mediante un `tool_use_id` que coincide con el `id` del bloque `tool_use`, enviado como el siguiente turno del usuario",
    ],
    explanation:
      "Tu aplicación ejecuta la herramienta y luego añade un bloque `tool_result` con el `tool_use_id` correspondiente como el siguiente turno del usuario. Claude no tiene memoria entre solicitudes, así que cada solicitud debe reenviar todo el historial de conversación, incluidas todas las llamadas a herramientas y sus resultados anteriores.",
  },
  "t-tm-10": {
    question: "¿Qué valor de `stop_reason` significa que Claude ha terminado y que el resultado debe mostrarse al usuario?",
    options: [
      "\"tool_use\"",
      "\"end_turn\"",
      "\"max_tokens\"",
      "\"stop_sequence\"",
    ],
    explanation:
      "`\"end_turn\"` significa que la tarea está completa. `\"tool_use\"` significa ejecutar la herramienta solicitada y devolver un `tool_result`, `\"max_tokens\"` significa que la respuesta se truncó, y `\"stop_sequence\"` significa que se alcanzó una secuencia de parada configurada.",
  },
  "t-tm-11": {
    question: "¿Cuáles son las tres primitivas de MCP?",
    options: [
      "Herramientas, agentes y memorias",
      "Servidores, clientes y transportes",
      "Herramientas, recursos y prompts",
      "Comandos, archivos y esquemas",
    ],
    explanation:
      "Las herramientas son acciones que pueden modificar el estado o desencadenar efectos secundarios, los recursos son contexto de solo lectura que el modelo puede incorporar, y los prompts son plantillas predefinidas expuestas por el servidor. La distinción clave: las herramientas actúan, los recursos informan.",
  },
  "t-tm-12": {
    question: "¿Qué archivo contiene la configuración de servidores MCP de nivel de proyecto que está bajo control de versiones y se comparte con el equipo?",
    options: [
      "`.mcp.json` en la raíz del proyecto",
      "`~/.claude.json` en el directorio de inicio del usuario",
      "`.claude/settings.json` en el proyecto",
      "`mcp.config.js` confirmado en el repositorio",
    ],
    explanation:
      "`.mcp.json` se confirma en el repositorio para que cada compañero obtenga los mismos servidores, con los secretos referenciados mediante la sustitución de variables de entorno `${VAR}`: el token en sí nunca se confirma. `~/.claude.json` es para servidores personales, experimentos o las credenciales de un solo desarrollador.",
  },
  "t-tm-13": {
    question: "En la correspondencia de categoría de error → acción, ¿qué `errorCategory` suele reintentarse (a menudo con retroceso)?",
    options: [
      "validation",
      "permission",
      "business",
      "transient",
    ],
    explanation:
      "`transient` cubre tiempos de espera agotados, errores 503 y fallos puntuales de red: reintentar, a menudo con retroceso. `validation` significa corregir la entrada en lugar de reintentar sin cambios, mientras que `business` y `permission` no deben reintentarse; los errores estructurados también llevan un booleano `isRetryable` explícito para que quien llama no tenga que deducirlo de la prosa.",
  },
  "t-tm-14": {
    question: "¿Qué herramienta integrada de Claude Code busca en el contenido de los archivos?",
    options: [
      "Glob",
      "Grep",
      "Read",
      "Bash",
    ],
    explanation:
      "Grep encuentra texto dentro de los archivos (un nombre de función, una cadena de error o una importación), mientras que Glob encuentra rutas y nombres de archivo (por ejemplo, `**/*.test.tsx`). El patrón incremental recomendado es Glob/Grep → Read → Grep → Read en lugar de leerlo todo de antemano.",
  },
  "t-tm-15": {
    question: "¿Cuál es la alternativa correcta cuando Edit falla porque el fragmento objetivo aparece más de una vez en el archivo?",
    options: [
      "Leer el archivo completo, modificar el contenido de forma programática en memoria y luego reescribirlo con Write",
      "Reintentar Edit con un fragmento ligeramente distinto hasta que uno coincida",
      "Usar Write de inmediato para sobrescribir el archivo con solo el fragmento nuevo",
      "Usar Glob para localizar otra copia del archivo y editar esa en su lugar",
    ],
    explanation:
      "Edit requiere una coincidencia de texto única y falla en lugar de adivinar qué aparición se pretendía. La alternativa es Read → modificar de forma programática (desambiguando por el contexto circundante o la posición de la línea) → Write, usada con cautela, ya que la semántica de reemplazarlo todo de Write corre el riesgo de aplastar contenido no relacionado.",
  },
  "t-tm-16": {
    question: "En la tabla de antipatrones de diseño de herramientas, ¿por qué fallan los verbos vagos como \"process\", \"handle\" y \"manage\"?",
    options: [
      "Superan la longitud máxima permitida para el nombre de una herramienta",
      "Hacen que la API rechace la definición de la herramienta por inválida",
      "No le dicen al modelo qué cambia el estado frente a qué solo lee",
      "Impiden que se valide el input_schema",
    ],
    explanation:
      "Los verbos vagos no dan ninguna señal sobre si una herramienta muta el estado o es de solo lectura. Las otras filas de la tabla: las descripciones idénticas provocan una selección arbitraria o equivocada, la falta de ejemplos de entrada hace que el modelo adivine el formato y posiblemente fabrique un valor, y la ausencia de un límite declarado deja al modelo incapaz de decidir entre herramientas que se solapan.",
  },
  "t-tm-17": {
    question: "Cuando dos herramientas se solapan realmente en su función, ¿qué solución recomienda la página en lugar de escribir una descripción más larga?",
    options: [
      "Renombrar y acotar el alcance; por ejemplo, renombrar analyze_content a extract_web_results",
      "Fusionar las dos herramientas en una sola con un esquema combinado",
      "Forzar la herramienta correcta con tool_choice en cada turno",
      "Eliminar por completo una de las herramientas del array de herramientas",
    ],
    explanation:
      "Renombrar elimina la ambigüedad en el propio nivel del nombre, respaldado por una descripción que enuncia el propósito más acotado. Esto resuelve el solapamiento de forma más fiable que amontonar más prosa sobre dos descripciones que siguen solapándose.",
  },
  "t-tm-18": {
    question: "¿Qué hace tool_choice {\"type\": \"any\"}?",
    options: [
      "Deja que el modelo decida si llamar a una herramienta o responder en texto plano",
      "Obliga al modelo a llamar a alguna herramienta, cualquiera de las proporcionadas",
      "Obliga al modelo a llamar a una herramienta concreta nombrada",
      "Permite que el modelo invente una herramienta que no estaba en la lista proporcionada",
    ],
    explanation:
      "`\"any\"` sirve para cuando necesitas una salida estructurada o con forma de herramienta garantizada y no te importa qué herramienta se dispara, siempre que se dispare una. `\"auto\"` deja decidir al modelo, y `{\"type\": \"tool\", \"name\": ...}` fuerza una herramienta concreta.",
  },
  "t-tm-19": {
    question: "¿Por qué forzar una herramienta concreta mediante tool_choice suele ser una técnica de una sola vez en lugar de una configuración permanente?",
    options: [
      "La API solo acepta un tool_choice forzado en la primera solicitud de una conversación",
      "Forzar una herramienta deshabilita la validación de JSON Schema en los turnos posteriores",
      "Las llamadas a herramientas forzadas consumen tokens a un ritmo mayor",
      "Forzar en cada turno le quita al modelo la capacidad de reconocer cuándo no procede ninguna llamada a herramienta",
    ],
    explanation:
      "El patrón habitual es forzar una herramienta una vez para garantizar que se ejecuta una condición previa (por ejemplo, `verify_customer` para la verificación de identidad) y luego volver a `{\"type\": \"auto\"}` para que el modelo pueda razonar libremente una vez satisfecha esa condición previa.",
  },
  "t-tm-20": {
    question: "En el ciclo de tool_use, ¿quién ejecuta realmente la herramienta?",
    options: [
      "Claude la ejecuta directamente contra la API o la base de datos externa",
      "Tu aplicación: Claude solo emite una solicitud para llamar a la herramienta",
      "La API de Anthropic la ejecuta del lado del servidor y devuelve el resultado automáticamente",
      "La herramienta se ejecuta a sí misma una vez que su entrada pasa la validación del esquema",
    ],
    explanation:
      "Claude no ejecuta las herramientas por sí mismo: responde con `stop_reason: \"tool_use\"` y un bloque `tool_use` que contiene `id`, `name` e `input`. Tu aplicación llama a la API/BD/función real y devuelve el resultado como un bloque `tool_result`.",
  },
  "t-tm-21": {
    question: "¿Qué indica stop_reason \"max_tokens\"?",
    options: [
      "El modelo terminó la tarea y el resultado debe mostrarse al usuario",
      "Se alcanzó una secuencia de parada configurada",
      "La respuesta se truncó: puede que necesites un límite de tokens más alto",
      "La entrada de la llamada a la herramienta superó las restricciones de tamaño del esquema",
    ],
    explanation:
      "`\"max_tokens\"` significa que la respuesta se cortó, no que esté completa. `\"stop_sequence\"` significa que se alcanzó una secuencia de parada configurada y debe gestionarse según la lógica de tu aplicación, mientras que `\"end_turn\"` significa que Claude ha terminado.",
  },
  "t-tm-22": {
    question: "¿Qué es el Model Context Protocol (MCP)?",
    options: [
      "Un protocolo estándar para conectar Claude a sistemas externos sin código de integración a medida para cada combinación de modelo y servicio",
      "Un dialecto de JSON Schema usado únicamente para definir las entradas de las herramientas",
      "El formato interno de Claude Code para almacenar el historial de conversación",
      "Una especificación de política de reintentos para las llamadas a herramientas fallidas",
    ],
    explanation:
      "MCP estandariza cómo se conecta Claude a fuentes de datos, API y herramientas, para que cada integración no necesite código de pegamento a medida. Expone tres primitivas: herramientas, recursos y prompts.",
  },
  "t-tm-23": {
    question: "En MCP, ¿qué es la primitiva \"prompts\"?",
    options: [
      "El system prompt que el cliente envía con cada solicitud",
      "Instrucciones de texto libre que el modelo escribe de vuelta al servidor",
      "Contexto de solo lectura que el modelo puede incorporar, como un archivo o un esquema",
      "Plantillas de prompt predefinidas expuestas por el servidor, como una plantilla de \"resume este ticket\" con variables definidas por el servidor",
    ],
    explanation:
      "Los prompts son plantillas expuestas por el servidor, distintas de las otras dos primitivas: las herramientas actúan (modifican el estado o desencadenan efectos secundarios) y los recursos informan (contexto de solo lectura).",
  },
  "t-tm-24": {
    question: "Según la página, ¿por qué existen los recursos de MCP?",
    options: [
      "Para permitir que el modelo desencadene efectos secundarios sin una definición de herramienta",
      "Para dar al modelo o a la aplicación un \"mapa\" inmediato de lo que está disponible sin hacer llamadas a herramientas exploratorias solo para descubrir la estructura",
      "Para almacenar en caché los resultados de herramientas anteriores entre solicitudes a la API",
      "Para almacenar las credenciales de autenticación del servidor",
    ],
    explanation:
      "Los recursos son contexto de solo lectura: un archivo, un esquema de base de datos, un catálogo de contenido, documentación. Un catálogo de todas las tareas de un proyecto o un esquema da un mapa inmediato de lo que existe, de modo que las herramientas actúan mientras los recursos informan.",
  },
  "t-tm-25": {
    question: "¿Cuándo está justificado construir un servidor MCP propio en lugar de usar uno de la comunidad?",
    options: [
      "Solo para flujos de trabajo únicos y específicos del equipo que ningún servidor de la comunidad cubre",
      "Siempre que quieras un control adicional sobre una integración bien cubierta como GitHub",
      "Para todas las integraciones estándar, ya que el código a medida es más fácil de auditar",
      "Siempre que el servidor de la comunidad requiera variables de entorno para los secretos",
    ],
    explanation:
      "Para integraciones estándar como GitHub, Jira y Slack, prefiere los servidores de la comunidad existentes: ya están probados frente a las peculiaridades de la API objetivo y se mantienen de forma independiente de tu proyecto. Los servidores propios se justifican por la singularidad (por ejemplo, un sistema interno propietario), no por el deseo de un control adicional.",
  },
  "t-tm-26": {
    question: "En un error de herramienta estructurado, ¿cuál es el propósito del campo attempted_query?",
    options: [
      "Le indica a quien llama si es seguro reintentar el fallo",
      "Clasifica el fallo para que quien llama pueda decidir cómo reaccionar",
      "Registra lo que realmente se envió, para que un reintento pueda ajustar el parámetro correcto en lugar de adivinar",
      "Almacena la explicación legible del fallo",
    ],
    explanation:
      "`attempted_query` muestra lo que realmente se envió (por ejemplo, `order_id=12345`). Los demás campos cubren los distractores: `isRetryable` es el booleano explícito de reintento, `errorCategory` clasifica el fallo, y `message` es el complemento legible de los campos estructurados, no un sustituto de ellos.",
  },
  "t-tm-27": {
    question: "¿Qué contiene el campo partial_results en un error estructurado?",
    options: [
      "El rastro de pila (stack trace) del lado del servidor de la excepción",
      "El subconjunto del esquema de entrada que no superó la validación",
      "El número de reintentos ya realizados",
      "Cualquier cosa utilizable que se recuperó antes del fallo, para que un fallo parcial no descarte todo",
    ],
    explanation:
      "Devolver `partial_results` permite a quien llama conservar lo que se recuperó antes del fallo. Abortar toda la operación ante el primer fallo en lugar de devolver resultados parciales es uno de los antipatrones del lado del servidor enumerados.",
  },
  "t-tm-28": {
    question: "¿Cuál es la acción habitual para un error con errorCategory \"validation\"?",
    options: [
      "Corregir la entrada: no reintentar sin cambios",
      "Reintentar, a menudo con retroceso",
      "Exponer al usuario o escalar sin modificar nada",
      "Cambiar por otras credenciales y reintentar",
    ],
    explanation:
      "`validation` cubre una entrada malformada o un parámetro obligatorio que falta, así que reintentar la misma llamada sin cambios simplemente vuelve a fallar. `transient` es la categoría de reintentar-con-retroceso, `business` debe exponerse o escalarse, y `permission` necesita otras credenciales o intervención humana: ninguno de los dos debe reintentarse.",
  },
  "t-tm-29": {
    question: "¿Cuál de estos figura como un antipatrón de gestión de errores del lado del servidor?",
    options: [
      "Devolver un booleano isRetryable explícito",
      "Tratar en silencio un resultado vacío como un éxito",
      "Clasificar los fallos con un campo errorCategory",
      "Devolver resultados parciales tras un fallo a mitad de la operación",
    ],
    explanation:
      "Los antipatrones enumerados son: cadenas de estado genéricas sin categoría, tratar en silencio un resultado vacío como un éxito, abortar toda la operación ante el primer fallo en lugar de devolver resultados parciales, y reintentar indefinidamente sin límite independientemente de la categoría.",
  },
  "t-tm-30": {
    question: "¿Qué herramienta integrada de Claude Code ejecuta comandos de shell como git, comandos de gestores de paquetes, pruebas y compilaciones?",
    options: [
      "Edit",
      "Glob",
      "Read",
      "Bash",
    ],
    explanation:
      "Bash es el ejecutor de shell para git, los gestores de paquetes, las pruebas y las compilaciones. Glob encuentra archivos por patrón de ruta/nombre, Read carga un archivo por completo, y Edit reemplaza un fragmento mediante una coincidencia de texto única.",
  },
  "t-tm-31": {
    question: "¿Cuál es el propósito de la herramienta integrada Write?",
    options: [
      "Añadir contenido al final de un archivo existente",
      "Reemplazar un fragmento de un archivo existente mediante una coincidencia de texto única",
      "Crear un archivo desde cero, o reescribirlo por completo",
      "Buscar en el contenido de los archivos un nombre de función o una cadena de error",
    ],
    explanation:
      "Write crea un archivo nuevo o lo reescribe por completo, con una semántica de reemplazarlo todo. Por eso se prefiere Edit para cambios precisos en el sitio siempre que haya una coincidencia única disponible: Write corre el riesgo de aplastar contenido no relacionado.",
  },
  "t-tm-32": {
    question: "¿Cuál es el ciclo de investigación incremental recomendado en Claude Code?",
    options: [
      "Glob/Grep para encontrar los puntos de entrada → Read de esos archivos → Grep de los usos de lo que leíste → Read de los archivos consumidores → repetir",
      "Read de todos los archivos de antemano y luego Grep del contenido cargado en busca de símbolos relevantes",
      "Bash para volcar todo el árbol y luego Edit de los archivos según sea necesario",
      "Write de un archivo de resumen primero y luego Glob de coincidencias frente a él",
    ],
    explanation:
      "El ciclo Glob → Grep → Read → Grep → Read construye la comprensión de forma incremental, manteniendo el contexto centrado en lo que es relevante para la pregunta actual en lugar de cargar todo el código por adelantado antes de saber qué importa.",
  },
  "t-tm-33": {
    question: "¿Cuál de estos figura como un antipatrón de las herramientas integradas?",
    options: [
      "Usar Grep para buscar una cadena de error en el contenido de los archivos",
      "Informar de los hallazgos sin una referencia precisa de archivo:línea",
      "Leer un archivo por completo antes de editarlo",
      "Confirmar el alcance antes de ejecutar un comando de Bash destructivo",
    ],
    explanation:
      "\"Hay un error en el módulo de autenticación\" no es accionable; \"falta la comprobación de null en auth.ts:42\" sí lo es. Los otros antipatrones enumerados son leer todos los archivos a la vez, patrones de Glob demasiado amplios (por ejemplo, `**/*` en todo un monorepo) y un Bash inseguro: comandos destructivos como borrados amplios, force-push o un rm sin acotar sin confirmar antes el alcance.",
  },
  "t-cr-01": {
    question: "¿Qué debe reenviar un cliente en cada solicitud a la API de Claude para continuar una conversación?",
    options: [
      "Solo el mensaje de usuario más nuevo más un token de sesión emitido por la API",
      "Únicamente el system prompt y el intercambio de usuario/asistente más reciente",
      "Todo el historial de mensajes: el system prompt, cada turno anterior de usuario/asistente, cada llamada a herramienta y cada resultado de herramienta",
      "Un ID de conversación del lado del servidor que la API usa para buscar los turnos anteriores",
    ],
    explanation:
      "La API no tiene estado: no hay ninguna sesión del lado del servidor ni estado de conversación oculto, así que el cliente reenvía todo el historial en cada llamada. Todo lo que parezca memoria persistente es una ilusión de la capa de aplicación: el entorno (harness) la reinyecta en cada turno.",
  },
  "t-cr-02": {
    question: "¿Qué valor de `stop_reason` indica que la respuesta se cortó a mitad de la generación en lugar de haber terminado?",
    options: [
      "`end_turn`",
      "`max_tokens`",
      "`pause_turn`",
      "`stop_sequence`",
    ],
    explanation:
      "`max_tokens` significa que la respuesta se truncó, no que terminó: tratarla como una respuesta completa es un error de fiabilidad común y evitable, así que quien llama debe comprobar `stop_reason` antes de confiar en una respuesta. `pause_turn`, en cambio, señala un uso de herramientas del lado del servidor de larga duración (por ejemplo, una búsqueda web) que se ha pausado para continuar, y `end_turn` es la finalización natural.",
  },
  "t-cr-03": {
    question: "¿Qué es el efecto de \"perderse en el medio\" (lost in the middle)?",
    options: [
      "Los modelos procesan la información del principio y del final de una entrada larga de forma más fiable que la información enterrada en el medio",
      "Los tokens del medio de la ventana de contexto son los primeros en descartarse cuando se supera el presupuesto de tokens",
      "Los pasos de resumen descartan los turnos del medio de una conversación mientras conservan el primero y el último",
      "El modelo pierde la pista de los pasos intermedios de un plan de varios pasos que generó él mismo",
    ],
    explanation:
      "Es una propiedad estructural de la atención en contextos largos, no un fallo de entrenamiento que se pueda esquivar con un prompt ingenioso. Significa que *dónde* colocas un dato importa tanto como *si* lo incluyes: una restricción en la línea 400 de un resultado de herramienta de 900 líneas corre un riesgo real de ser ignorada.",
  },
  "t-cr-04": {
    question: "¿Qué componente identifica la página como, normalmente, el mayor contribuyente y el menos controlado de la ventana de contexto, y la parte que crece más rápido en una conversación larga sin gestionar?",
    options: [
      "El system prompt",
      "Las definiciones de herramientas (el esquema JSON de cada herramienta que el modelo podría llamar)",
      "Los turnos de mensajes anteriores de usuario/asistente",
      "Los resultados de herramientas devueltos a la conversación",
    ],
    explanation:
      "Una sola llamada a la API puede devolver un blob JSON de varios KB cuando solo importan dos campos, y si nunca se recorta permanece en todas las solicitudes posteriores. Sin control, la acumulación de resultados de herramientas desperdicia presupuesto y empeora el efecto de perderse en el medio, al empujar hacia el medio datos anteriores que siguen siendo relevantes.",
  },
  "t-cr-05": {
    question: "Según la página, ¿cómo se manifiesta típicamente la degradación en una sesión muy larga (prolongada)?",
    options: [
      "La API empieza a rechazar solicitudes una vez que la ventana de contexto se llena",
      "El modelo da respuestas inconsistentes y deriva hacia \"patrones típicos\" genéricos en lugar de las clases, funciones y datos específicos que descubrió antes",
      "La latencia de respuesta crece en cada turno hasta que la sesión expira por tiempo",
      "El modelo se niega a llamar a herramientas que usó con éxito antes en la sesión",
    ],
    explanation:
      "La señal reveladora es un agente que era preciso en el turno 10 y que en el turno 60 responde como si razonara a partir de sus conocimientos previos de entrenamiento en lugar de a partir de lo que realmente encontró. Las técnicas de persistencia contrarrestan esto reanclando al modelo en hallazgos concretos en lugar de confiar en que sobrevivan en el contexto vivo.",
  },
  "t-cr-06": {
    question: "¿Qué técnica presenta la página como la solución principal para la pérdida de precisión provocada por el resumen (por ejemplo, \"42,3%\" derivando a \"alrededor del 42%\")?",
    options: [
      "Un bloque persistente de datos del caso que reside fuera de la ruta de resumen y se inyecta textualmente en cada prompt",
      "Un hook `PostToolUse` que elimina los campos prolijos de los resultados de herramientas",
      "Indicar al resumidor que mantenga exactos todos los números y fechas",
      "Colocar las cifras exactas al principio del prompt para que sobrevivan a la compactación",
    ],
    explanation:
      "Como el bloque nunca se resume —se regenera o se arrastra textualmente independientemente de cuánto se compacte la conversación—, \"$89.99\" sigue siendo \"$89.99\" en el turno 50 igual que en el turno 1. La deriva es peligrosa porque el valor degradado sigue pareciendo seguro y específico; la vaguedad se introduce en silencio, sin señalarse.",
  },
  "t-cr-07": {
    question: "¿Qué hace un hook de recorte `PostToolUse`?",
    options: [
      "Resume todo el historial de conversación después de cada llamada a herramienta",
      "Elimina los turnos de usuario más antiguos una vez que se supera el presupuesto de contexto",
      "Intercepta la salida en bruto de una herramienta antes de que se añada al contexto y conserva solo los campos que importan",
      "Comprime los esquemas JSON de las herramientas para que las definiciones cuesten menos tokens",
    ],
    explanation:
      "Esto ataca directamente la acumulación de resultados de herramientas: una respuesta en bruto de 5 KB puede quedar en unos 200 bytes. El ahorro se acumula en cada turno posterior porque lo que se reenvía es el resultado recortado, no el bruto.",
  },
  "t-cr-08": {
    question: "En la colocación consciente de la posición, ¿cómo dice la página que debe organizarse el contenido inyectado?",
    options: [
      "Cronológicamente, en el orden en que se encontraron los datos",
      "Las tareas pendientes arriba, los hallazgos clave abajo y el detalle en medio",
      "Todos los datos críticos agrupados en el medio, donde el modelo se centra de forma natural",
      "Los hallazgos clave arriba, todo el detalle de apoyo en el medio, y las tareas pendientes / próximos pasos abajo",
    ],
    explanation:
      "Esto contrarresta el efecto de perderse en el medio por construcción: las partes que más probablemente se leerán por encima o se pasarán por alto (el medio) son exactamente las que menos importan para la decisión inmediata, mientras que la recencia al final ayuda a recuperar los próximos pasos.",
  },
  "t-cr-09": {
    question: "¿Qué desencadenante de escalado clasifica la página como fiable?",
    options: [
      "Un análisis de sentimiento que detecta a un cliente enfadado",
      "Que la confianza autoevaluada del modelo caiga por debajo de un umbral",
      "Un clasificador automático de complejidad que puntúa el caso como difícil",
      "Ningún progreso después de N intentos",
    ],
    explanation:
      "Ningún progreso después de N intentos es una prueba concreta y medible de que el enfoque actual no funciona; los otros desencadenantes fiables son una petición humana explícita, el silencio de la política, una operación financiera por encima de un umbral de la política y varias coincidencias en una búsqueda. El sentimiento no se correlaciona con la complejidad del caso, la confianza autoevaluada no es una probabilidad calibrada, y un clasificador de complejidad sin etiquetar solo esconde una conjetura detrás de un número de aspecto objetivo.",
  },
  "t-cr-10": {
    question: "Para un cliente frustrado que no ha pedido explícitamente hablar con una persona, ¿qué patrón de escalado prescribe la página?",
    options: [
      "Reconocer el problema, ofrecer una resolución concreta y escalar solo si el cliente vuelve a insistir tras esa oferta",
      "Escalar de inmediato ante la primera señal de frustración",
      "Ejecutar un análisis de sentimiento y escalar cuando el enfado cruce un umbral",
      "Intentar la solución repetidamente y no escalar nunca a menos que la política guarde silencio",
    ],
    explanation:
      "Escalar ante el primer atisbo de frustración sobrecarga las colas de atención humana y enseña a los clientes que la frustración es el camino más rápido hacia una persona. Los otros dos patrones son el escalado inmediato (reservado para una petición humana explícita) y el de intentar-y-luego-escalar (para un problema plausiblemente resoluble: prueba la solución, verifícala y escala solo si no resuelve el caso).",
  },
  "t-cr-11": {
    question: "¿Qué estándar debe cumplir una entrega (handoff) de escalado estructurada?",
    options: [
      "Debe adjuntar la transcripción completa de la conversación para que no se pierda nada",
      "Debe contener únicamente el ID del cliente y un enlace a la conversación",
      "La persona debe poder actuar sin leer la transcripción completa, usando campos como `actions_taken`, `root_cause`, `recommended_action` y `escalation_reason`",
      "Debe incluir una puntuación de sentimiento y una clasificación de prioridad para el triaje",
    ],
    explanation:
      "La entrega es una carga útil estructurada, no un \"aquí tienes la conversación, buena suerte\". Cada campo responde a una pregunta que, de lo contrario, la persona tendría que reconstruir a partir de la transcripción: qué pasó, qué se ha intentado, por qué no fue suficiente y qué hacer a continuación.",
  },
  "t-cr-12": {
    question: "Un sistema informa de un 97% de precisión global, pero falla el 40% de las veces en un tipo de documento poco frecuente. ¿Qué solución recomienda la página?",
    options: [
      "Elevar el único umbral de precisión de todo el sistema hasta que desaparezcan los fallos",
      "Muestreo estratificado: auditar la precisión por segmento y fijar umbrales por segmento usando puntuaciones de confianza a nivel de campo",
      "Reentrenar el modelo con más ejemplos del tipo de documento poco frecuente",
      "Promediar la precisión entre los tipos de documento, ponderada por volumen",
    ],
    explanation:
      "La precisión agregada oculta los fallos específicos de un patrón cuando el segmento que falla representa una proporción demasiado pequeña como para mover el número combinado. Auditar por segmento (tipo de documento, campo, nivel de cliente, idioma) saca a la luz bolsas ocultas de fallo, y un segmento históricamente débil recibe un umbral de procesamiento automático más estricto aunque el número global parezca saludable.",
  },
  "t-cr-13": {
    question: "Dos fuentes informan de valores distintos para la misma métrica (por ejemplo, 10% en una publicación de 2023 y 15% en una de 2024). ¿Cómo debe gestionar esto el paso de agregación?",
    options: [
      "Promediar los dos valores para que los consumidores aguas abajo obtengan un único número",
      "Preservar ambos valores con su atribución (incluida `publication_date`) y activar un indicador `conflict_detected`",
      "Conservar solo el valor más reciente y descartar en silencio el más antiguo",
      "Quitar las fechas e informar del rango 10-15%",
    ],
    explanation:
      "Promediar destruye información y puede producir un valor que ninguna fuente informó; el indicador `conflict_detected` evita que el paso de agregación tome en silencio la decisión sobre en qué confiar, y la traslada al coordinador o al usuario final, que tiene más contexto. Las fechas preservadas también importan: 10% (2023) frente a 15% (2024) es muy probablemente un crecimiento a lo largo del tiempo, no una contradicción; la correspondencia de afirmación a fuente conserva `source_url`, `source_name`, `publication_date` y `confidence` junto a cada afirmación.",
  },
  "t-cr-14": {
    question: "¿Cómo dice la página que debe elegirse el formato de salida al presentar hallazgos sintetizados?",
    options: [
      "Por tipo de contenido: tablas para los datos numéricos/comparables, prosa para la explicación narrativa, listas para las tareas pendientes",
      "Siempre prosa, ya que es la que se lee de forma más natural para las personas",
      "Siempre tablas, ya que la estructura es la que mejor sobrevive al resumen",
      "El formato que minimice el conteo total de tokens",
    ],
    explanation:
      "Forzarlo todo a prosa entierra los números justo donde el efecto de perderse en el medio y la deriva del resumen hacen más daño, mientras que forzar una narrativa a una tabla despoja del matiz que un lector necesita para interpretarla correctamente.",
  },
  "t-cr-15": {
    question: "Según la correspondencia de la página entre las seis técnicas de gestión de contexto y lo que contrarrestan, ¿qué emparejamiento es correcto?",
    options: [
      "Bloque de datos del caso → recuperación tras un fallo",
      "Colocación consciente de la posición → pérdida de precisión por el resumen",
      "Delegación en subagentes → aislar el descubrimiento prolijo para que los volcados en bruto nunca entren en el contexto del padre",
      "Archivos de scratchpad → sobrecarga por los resultados de herramientas",
    ],
    explanation:
      "El subagente gasta su *propio* presupuesto de contexto en la exploración ruidosa y devuelve solo un resumen destilado (unas 2 frases, no 400 líneas). La correspondencia completa: bloque de datos del caso → pérdida de precisión, hooks de recorte → sobrecarga por resultados de herramientas, colocación consciente de la posición → perderse en el medio, scratchpads → persistencia entre sesiones, delegación en subagentes → descubrimiento prolijo, estado estructurado + manifiesto → recuperación tras un fallo (reanudar desde `completed_phases`).",
  },
  "t-cr-16": {
    question: "¿Cuál es la primera consecuencia que la página extrae de la falta de estado de la API?",
    options: [
      "La latencia se mantiene constante porque el servidor almacena en caché la conversación entre llamadas",
      "El coste y la latencia escalan con la longitud del historial, ya que cada turno reenvía y reprocesa todo lo anterior",
      "El coste depende solo del mensaje más nuevo, porque los turnos anteriores se facturan una sola vez",
      "La latencia solo crece en los turnos que incluyen llamadas a herramientas",
    ],
    explanation:
      "Como todo el historial se reprocesa en cada solicitud, el crecimiento ilimitado del historial es un problema real de producción, no teórico, y es la razón por la que existe la caché de prompts. La segunda consecuencia es que la \"memoria\" es una ilusión de la capa de aplicación: el entorno (harness) la reinyecta en cada llamada; el modelo no está recordando.",
  },
  "t-cr-17": {
    question: "¿Qué cuatro componentes enumera la página como los que comparten el presupuesto fijo de tokens de la ventana de contexto en una sola solicitud?",
    options: [
      "El system prompt, las definiciones de herramientas, el historial de mensajes y los resultados de herramientas",
      "El system prompt, los pesos del modelo, el historial de mensajes y los tokens de salida",
      "Las definiciones de herramientas, los embeddings, el historial de mensajes y las secuencias de parada",
      "El system prompt, el historial de mensajes, los parámetros de muestreo y los resultados de herramientas",
    ],
    explanation:
      "Las definiciones de herramientas cuestan el esquema JSON completo de cada herramienta que el modelo *podría* llamar, se use o no en ese turno, y el system prompt se envía en cada turno. Los resultados de herramientas suelen ser el mayor contribuyente y el menos controlado del presupuesto.",
  },
  "t-cr-18": {
    question: "¿Qué valor de `stop_reason` señala que un uso de herramientas del lado del servidor de larga duración (por ejemplo, una búsqueda web) se ha pausado para continuar?",
    options: [
      "`tool_use`",
      "`stop_sequence`",
      "`end_turn`",
      "`pause_turn`",
    ],
    explanation:
      "`pause_turn` significa que una herramienta del lado del servidor de larga duración se pausó y que el turno debe continuarse. `tool_use`, en cambio, significa que el modelo quiere llamar a una herramienta y se pausa a la espera del resultado, y `end_turn` es la finalización natural.",
  },
  "t-cr-19": {
    question: "¿Qué significa un `stop_reason` de `tool_use`?",
    options: [
      "La respuesta alcanzó el límite de tokens mientras emitía una llamada a herramienta",
      "Una herramienta del lado del servidor sigue ejecutándose y el turno está en pausa",
      "El modelo quiere llamar a una herramienta y se pausa a la espera del resultado",
      "El modelo terminó su turno después de que se devolviera un resultado de herramienta",
    ],
    explanation:
      "`tool_use` es el modelo solicitando la invocación de una herramienta y esperando a que quien llama devuelva el resultado. El conjunto completo de valores tratados es `end_turn` (finalización natural), `max_tokens` (truncado), `stop_sequence`, `tool_use` y `pause_turn` (uso de herramientas del lado del servidor de larga duración pausado para continuar).",
  },
  "t-cr-20": {
    question: "Cuando el historial se compacta mediante resumen, ¿qué dice la página que sobrevive bien y qué se degrada?",
    options: [
      "La narrativa cualitativa sobrevive bien, pero la precisión numérica no: las cifras y fechas exactas derivan hacia aproximaciones vagas",
      "Los números sobreviven bien, pero el contexto narrativo es lo primero que se descarta",
      "Todo se degrada de manera uniforme en proporción a la tasa de compresión",
      "Solo se degradan los primeros turnos; el contenido reciente se conserva textualmente",
    ],
    explanation:
      "\"42,3%\" tiende a derivar hacia \"alrededor del 42%\" y \"2024-06-15\" hacia \"en algún momento del año pasado\" tras una o dos rondas de resumen. Esto es peligroso porque el valor degradado sigue pareciendo seguro y específico: la vaguedad se introduce en silencio, sin señalarse nunca.",
  },
  "t-cr-21": {
    question: "¿Cuál es el propósito de los archivos de scratchpad como técnica de gestión de contexto?",
    options: [
      "Almacenan en caché las definiciones de herramientas para que los esquemas no se reenvíen en cada turno",
      "Almacenan la transcripción completa de la conversación para auditorías de cumplimiento",
      "Guardan el razonamiento intermedio para que el modelo pueda reproducirlo dentro del mismo turno",
      "Persisten los hallazgos clave en disco para que una sesión nueva o un subagente pueda leer un archivo pequeño y específico en lugar de necesitar que se reenvíe toda la transcripción anterior",
    ],
    explanation:
      "Los scratchpads sirven para el trabajo que abarca varias sesiones o excede una sola ventana de contexto, cambiando una gran cantidad de historial de conversación por la lectura de un archivo pequeño y específico. También contrarrestan la degradación de las sesiones prolongadas reanclando al modelo en hallazgos concretos.",
  },
  "t-cr-22": {
    question: "En el patrón de persistencia de estado estructurada, ¿cómo reanuda un agente nuevo después de un fallo o una interrupción?",
    options: [
      "Reproduce el registro de eventos completo desde el inicio del flujo de trabajo",
      "Lee el manifiesto, carga el archivo de estado de cada agente desde la ubicación de disco conocida y reanuda desde `completed_phases` en lugar de reiniciar todo el flujo de trabajo",
      "Pide al usuario que resuma lo que se había hecho hasta el momento",
      "Restaura una instantánea en memoria desde el almacén de sesiones de la API",
    ],
    explanation:
      "El estado se persiste en una ubicación de disco conocida —un archivo de estado por agente más un manifiesto que los indexa a todos— en lugar de solo en memoria. Reanudar desde `completed_phases` evita rehacer el trabajo ya terminado.",
  },
  "t-cr-23": {
    question: "¿Qué papel desempeña el campo `coverage_gaps` del archivo de estado de un agente más adelante en el flujo de trabajo?",
    options: [
      "Enumera las herramientas para las que se denegó permiso de uso al agente",
      "Hace seguimiento de qué técnicas de gestión de contexto se aplicaron",
      "Alimenta un informe honesto y con matices en lugar de que el flujo de trabajo finja en silencio que el trabajo estaba completo",
      "Registra qué turnos se descartaron durante el resumen",
    ],
    explanation:
      "Una entrada como \"Sin datos para la región EU-WEST después del 2025-06-20\" persiste lo que el agente sabe que no cubrió, para que el informe aguas abajo pueda enunciar sus límites explícitamente en lugar de presentar un trabajo parcial como completo.",
  },
  "t-cr-24": {
    question: "Según la tabla de desencadenantes fiables, ¿cómo debe gestionar un agente varias coincidencias en una búsqueda?",
    options: [
      "Resolver primero la ambigüedad con una pregunta aclaratoria y escalar solo si la propia aclaración falla",
      "Escalar de inmediato, ya que la ambigüedad no puede resolverla el agente",
      "Elegir la coincidencia más reciente y continuar",
      "Fusionar los registros coincidentes y continuar con los datos combinados",
    ],
    explanation:
      "Las coincidencias múltiples son el único desencadenante fiable con un paso previo al escalado: la ambigüedad debe resolverse primero con una pregunta aclaratoria y escalarse solo si esa aclaración falla.",
  },
  "t-cr-25": {
    question: "¿Por qué \"la política guarda silencio sobre la solicitud\" es un desencadenante de escalado fiable?",
    options: [
      "Porque las políticas silenciosas siempre indican riesgo legal",
      "Porque los clientes se frustran más por los vacíos en la política",
      "Porque obliga al clasificador de complejidad a abstenerse",
      "Porque el agente no tiene ninguna acción autorizada que tomar, y adivinar es peor que preguntar",
    ],
    explanation:
      "Al igual que los demás desencadenantes fiables, es objetivo en lugar de un juicio subjetivo: una operación financiera por encima de un umbral de la política es fiable por la misma razón: es un límite de importe/riesgo objetivo y acordado de antemano.",
  },
  "t-cr-26": {
    question: "¿Por qué la página clasifica un clasificador automático de complejidad como un desencadenante de escalado poco fiable?",
    options: [
      "Añade demasiada latencia a cada respuesta",
      "Sin un conjunto de entrenamiento etiquetado que se corresponda con la distribución real de tus casos, también está adivinando: solo esconde esa conjetura detrás de un número que parece objetivo",
      "Solo puede puntuar texto, no resultados de herramientas",
      "Siempre escala más casos que el análisis de sentimiento",
    ],
    explanation:
      "El mismo defecto recorre los tres desencadenantes poco fiables: el sentimiento falla porque el estado de ánimo del cliente no se correlaciona con la complejidad del caso, y la confianza autoevaluada no es una probabilidad calibrada. Ninguno de ellos rastrea si el caso es resoluble por la política, ahora mismo, por este agente, así que los escalados basados en ellos no se correlacionan con la necesidad real.",
  },
  "t-cr-27": {
    question: "¿Qué desencadena el patrón de escalado \"inmediato\" y qué hace el agente primero?",
    options: [
      "Una superación de un umbral financiero; el agente reintenta la operación una vez antes de escalar",
      "Frustración detectada; el agente se disculpa y escala",
      "Una petición humana explícita; el agente escala en el acto sin intentar resolver primero",
      "Silencio de la política; el agente hace una pregunta aclaratoria antes de escalar",
    ],
    explanation:
      "Una petición explícita de hablar con una persona es una intención inequívoca del cliente, así que no se hacen más intentos de resolución. Los otros dos patrones son intentar-y-luego-escalar y reconocer → ofrecer una resolución concreta → escalar solo ante una insistencia reiterada.",
  },
  "t-cr-28": {
    question: "¿Para qué situación está pensado el patrón de intentar-y-luego-escalar, y cuáles son sus pasos?",
    options: [
      "Cualquier operación financiera: escalar primero y luego reintentar tras la aprobación",
      "Peticiones humanas explícitas: intentar una solución antes de atender la petición",
      "Clientes frustrados: intentar una solución en silencio antes de reconocer el problema",
      "Un problema plausiblemente resoluble: probar la solución, verificarla y escalar solo si no resuelve el caso",
    ],
    explanation:
      "La verificación se sitúa entre el intento y la decisión de escalar: el agente escala solo cuando el resultado verificado muestra que el caso sigue sin resolverse, no simplemente porque la solución fuera difícil.",
  },
  "t-cr-29": {
    question: "¿Qué permiten las puntuaciones de confianza a nivel de campo cuando se combinan con el muestreo estratificado?",
    options: [
      "Umbrales por segmento para lo que se procesa automáticamente frente a lo que se deriva a revisión humana, con umbrales más estrictos para los segmentos históricamente débiles",
      "Un único número de precisión calibrado para todo el sistema",
      "Reentrenamiento automático en cualquier segmento que caiga por debajo de la media",
      "Eliminar por completo la revisión humana una vez que la confianza global supere el 97%",
    ],
    explanation:
      "Un segmento con un rendimiento históricamente débil recibe un umbral de procesamiento automático más estricto aunque el número global de todo el sistema parezca saludable: lo contrario de confiar en una métrica agregada y combinada.",
  },
  "t-cr-30": {
    question: "¿Qué campos preserva la correspondencia de afirmación a fuente de la página junto a cada afirmación?",
    options: [
      "`source_url`, `retrieval_method`, `token_count` y `model_version`",
      "`source_url`, `source_name`, `publication_date` y `confidence`",
      "`source_name`, `sentiment`, `confidence` y `conflict_detected`",
      "`claim_id`, `source_url`, `reviewer` y `accuracy`",
    ],
    explanation:
      "En conjunto, estos permiten a un consumidor aguas abajo —humano o agente— juzgar cuánto peso dar a la afirmación sin rehacer la investigación, preservados como datos estructurados en lugar de como una nota al pie en prosa. Perder el enlace de vuelta al origen de una afirmación es un fallo de fiabilidad silencioso: la salida parece igual de segura tanto si está bien fundamentada como si está fabricada.",
  },
  "t-cr-31": {
    question: "¿Por qué preservar `publication_date` cambia cómo deben interpretarse los valores en conflicto?",
    options: [
      "Porque las fuentes más nuevas siempre son más precisas y deben prevalecer",
      "Porque las fechas permiten al agregador promediar los valores ponderados por recencia",
      "Porque una fuente de 2023 que informa un 10% y una de 2024 que informa un 15% es muy probablemente un crecimiento a lo largo del tiempo, no una contradicción, pero solo si las fechas sobreviven a la agregación",
      "Porque las fuentes que superen un límite de frescura deben eliminarse de la correspondencia",
    ],
    explanation:
      "Quita las fechas durante la agregación y esos mismos dos números parecen una inconsistencia inexplicable en lugar de una tendencia. `publication_date` es lo que distingue las contradicciones reales de las tendencias temporales.",
  },
};
