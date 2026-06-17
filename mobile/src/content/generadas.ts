// Pack GENERADO por la IA y horneado en el seed (scripts/export-seed.ts).
// Cubre todas las formas de mostrar contenido. Al ir por git, viaja a la nube.
// Regenerar/ampliar: arranca el proxy y `npm run export:seed`.

import { Capsule } from "../types";

export const PACK: Capsule[] = [
  {
    "id": "gn-01",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 45,
    "reflection_prompt": "¿Qué bucle de retroalimentación tiene (o podría tener) lo que estás construyendo?",
    "format": "motion",
    "payload": {
      "render": "compound",
      "title": "Tu producto no crece lineal: crece en bucles",
      "caption": "Cada usuario que entra puede traer otro. Cada mejora reduce el abandono. Cada euro reinvertido acelera el siguiente. Los fundadores que fracasan construyen funcionalidades. Los que triunfan construyen bucles que se retroalimentan solos. El tiempo no suma tu esfuerzo: lo multiplica."
    }
  },
  {
    "id": "gn-02",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 40,
    "reflection_prompt": "¿A quién podrías observar esta semana que tenga el problema que quieres resolver?",
    "format": "quiz",
    "payload": {
      "question": "Tienes una idea de producto. ¿Cuál es el primer paso más valioso?",
      "options": [
        {
          "label": "Montar un MVP lo antes posible",
          "correct": false
        },
        {
          "label": "Encontrar a alguien que ya tenga el problema y observarle",
          "correct": true
        },
        {
          "label": "Validar con una landing page y lista de espera",
          "correct": false
        },
        {
          "label": "Estudiar a la competencia en detalle",
          "correct": false
        }
      ],
      "explanation": "Una landing page te dice si alguien hace clic. Observar a alguien con el problema te dice por qué sufre, qué lenguaje usa y qué ya ha intentado. Eso vale más que mil respuestas de formulario. El MVP sin esa observación suele construir la solución equivocada muy rápido."
    }
  },
  {
    "id": "gn-03",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 50,
    "reflection_prompt": "¿Cuántas horas de trabajo profundo real hiciste ayer? ¿Y de ocupación visible?",
    "format": "visual",
    "payload": {
      "render": "concept_map",
      "nodes": [
        {
          "id": "1",
          "label": "Urgencia falsa\n(deadline artificial)"
        },
        {
          "id": "2",
          "label": "Trabajo\nprofundo real"
        },
        {
          "id": "3",
          "label": "Ocupación\nvisible"
        },
        {
          "id": "4",
          "label": "Resultado\nque importa"
        },
        {
          "id": "5",
          "label": "Sensación de\nproductividad"
        }
      ],
      "edges": [
        {
          "from": "1",
          "to": "3"
        },
        {
          "from": "3",
          "to": "5"
        },
        {
          "from": "2",
          "to": "4"
        },
        {
          "from": "1",
          "to": "2",
          "label": "solo si eliminas el ruido"
        }
      ],
      "caption": "La urgencia falsa (notificaciones, reuniones, emails) alimenta ocupación, no avance. El trabajo profundo —sin interrupciones, en bloques largos— es el único camino hacia resultados reales. La trampa: la ocupación se siente igual de satisfactoria que el trabajo real, pero no produce nada que perdure."
    }
  },
  {
    "id": "gn-04",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 60,
    "reflection_prompt": "¿Estás construyendo para resolver el problema o para evitar el momento de vender?",
    "format": "coach",
    "payload": {
      "question": "Imagina que lanzas tu producto mañana y nadie lo compra. ¿Cuál crees que sería la razón real, la que no te gusta admitir?",
      "placeholder": "Ej: que en el fondo no he hablado con suficiente gente, que el precio me da vergüenza, que no sé si el problema es lo bastante doloroso...",
      "followUp": "Eso que acabas de escribir no es un miedo: es tu hipótesis de riesgo número uno. Los builders que aprenden de verdad la convierten en el primer experimento que lanzan, no en algo que evitan. ¿Qué experimento pequeño podrías diseñar esta semana para atacar exactamente eso?"
    }
  },
  {
    "id": "gn-05",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 90,
    "reflection_prompt": "¿Qué actividad de 'Gestionar' podrías eliminar o automatizar esta semana sin que nadie lo notara?",
    "format": "activity",
    "payload": {
      "challenge": "La auditoría del sistema de atención: descubre a dónde va realmente tu tiempo cognitivo",
      "steps": [
        "Durante las próximas 24 horas, cada vez que cambies de tarea o abras algo nuevo, apúntalo en una nota (puede ser papel).",
        "Al final del día, agrupa esas entradas en tres columnas: Construir (creé algo), Consumir (leí/vi algo), Gestionar (respondí/organicé).",
        "Calcula el porcentaje de cada columna.",
        "Pregúntate: ¿qué porcentaje de 'Construir' necesitaría para lanzar en 60 días?"
      ],
      "why": "La mayoría de fundadores en early stage pasan más del 70% en Consumir y Gestionar creyendo que están trabajando en el producto. Este ejercicio no te dice qué hacer diferente: te muestra con datos propios lo que ya sabes pero no has querido medir."
    }
  },
  {
    "id": "gn-06",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 55,
    "reflection_prompt": "¿Cuál es la siguiente acción física —no 'trabajar en X'— que tienes pendiente en tu proyecto?",
    "format": "interactive",
    "payload": {
      "scenario": "Llevas tres semanas sin avanzar en tu producto. Un amigo te dice: 'Necesitas más disciplina, ponte un horario fijo'. Otro te dice: 'El problema no es la disciplina, es que no tienes claro el siguiente paso físico'. ¿Qué haces?",
      "choices": [
        {
          "label": "Le hago caso al primero: me pongo un bloque de 2h cada mañana",
          "outcome": "Funciona dos días. El tercero el bloque existe pero te quedas mirando la pantalla. La disciplina sin claridad produce parálisis disfrazada de esfuerzo."
        },
        {
          "label": "Le hago caso al segundo: defino la acción física más pequeña posible para avanzar",
          "outcome": "Correcto. 'Trabajar en el producto' no es una acción. 'Escribir el primer párrafo del email a 5 usuarios potenciales' sí lo es. La ambigüedad es el verdadero bloqueador, no la falta de voluntad."
        },
        {
          "label": "Ignoro a los dos y busco inspiración en podcasts de founders",
          "outcome": "Clásico. Consumes narrativas de éxito ajenas como sustituto de la incomodidad de tomar tu próxima decisión. Media hora después sigues en el mismo punto."
        }
      ],
      "insight": "La ciencia del comportamiento llama a esto 'especificidad de implementación': una intención con lugar, hora Y acción física concreta tiene 3 veces más probabilidad de ejecutarse. No necesitas más motivación; necesitas más granularidad."
    }
  },
  {
    "id": "gn-07",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 35,
    "reflection_prompt": "¿Cuánto tiempo llevas construyendo vs. hablando con personas que tienen el problema?",
    "format": "stat",
    "payload": {
      "figure": "95%",
      "claim": "de los primeros productos fracasan por construir algo que nadie quiere, no por mala ejecución técnica",
      "reveal": "El estudio post-mortem de CB Insights sobre startups fracasadas sitúa 'no market need' como causa número uno durante 10 años consecutivos. Y sin embargo, el 95% del tiempo de un founder early stage se gasta en construir, no en validar. La ejecución técnica es el problema que más se practica y el menos relevante al principio."
    }
  },
  {
    "id": "gn-08",
    "queue": {
      "title": "El motor oculto detrás de lo que construyes",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 70,
    "reflection_prompt": "¿Tienes alguna checklist para tus días de trabajo en el producto, o cada día empiezas desde cero decidiendo qué hacer?",
    "format": "narrative",
    "payload": {
      "slides": [
        {
          "type": "hook",
          "text": "En 1957, un ingeniero de Boeing se obsesionó con una pregunta rara: ¿por qué algunos pilotos cometen errores y otros no, aunque tengan el mismo entrenamiento? La respuesta que encontró no tenía nada que ver con talento."
        },
        {
          "type": "develop",
          "text": "Descubrió que los errores no venían de ignorancia ni de imprudencia. Venían de sistemas de trabajo mal diseñados: cabinas con demasiada información, sin jerarquía clara, sin forma de saber qué era urgente y qué no. La solución fue la checklist: no para pilotos mediocres, sino para los mejores. Porque los mejores entienden que su cerebro falla bajo presión."
        },
        {
          "type": "twist",
          "text": "Lo que construyes también es un sistema bajo presión: el tuyo. Si dependes de recordar, motivarte o 'tener un buen día' para avanzar, has diseñado un sistema que falla igual que una cabina caótica. Los builders que más lanzan no tienen más talento: tienen mejores checklists."
        }
      ]
    }
  },
  {
    "id": "gn-09",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 45,
    "reflection_prompt": "¿Qué perdería tu usuario si deja de usar tu producto mañana? Si la respuesta es 'nada', tienes un problema de diseño, no de marketing.",
    "format": "motion",
    "payload": {
      "render": "compound",
      "title": "Tu producto no vale lo que cuesta. Vale lo que cuesta dejarlo.",
      "caption": "El valor percibido no lo fija el precio de entrada, sino el coste de salida. Cada hábito que construyes alrededor de tu producto —datos guardados, progreso acumulado, rutinas creadas— es una capa de coste de abandono. Los productos que perduran no engancha con el primer uso: crean una deuda positiva que hace que irse duela más que quedarse."
    }
  },
  {
    "id": "gn-10",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 40,
    "reflection_prompt": "¿Cuántas de tus decisiones actuales están disfrazadas de análisis cuando en realidad son postergación?",
    "format": "quiz",
    "payload": {
      "question": "Llevas días investigando herramientas para lanzar tu producto. Según la psicología de la acción, ¿qué está pasando realmente?",
      "options": [
        {
          "label": "Estás optimizando tu stack técnico",
          "correct": false
        },
        {
          "label": "Tu cerebro confunde actividad con progreso para evitar el miedo al juicio",
          "correct": true
        },
        {
          "label": "Necesitas más información antes de decidir",
          "correct": false
        },
        {
          "label": "Es parte natural del proceso de planificación",
          "correct": false
        }
      ],
      "explanation": "Investigar herramientas activa el mismo circuito de recompensa que ejecutar. Tu cerebro recibe dopamina sin el riesgo de exposición. Se llama 'preparación infinita' y es la forma más sofisticada de procrastinación. La señal: cuando tienes suficiente información para empezar pero sigues buscando más."
    }
  },
  {
    "id": "gn-11",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 55,
    "reflection_prompt": "¿Qué decisión estás aplazando ahora mismo porque 'aún no tienes suficiente información'?",
    "format": "interactive",
    "payload": {
      "scenario": "Tienes dos versiones de ti mismo. Ambos quieren lanzar un producto. Uno espera tener todo claro antes de moverse. El otro lanza con incertidumbre y ajusta. Han pasado 6 meses.",
      "choices": [
        {
          "label": "El que esperó: ahora tiene un plan perfecto y está casi listo para lanzar",
          "outcome": "Falso. El que esperó tiene un plan más refinado pero el mercado ha cambiado, no tiene feedback real y su motivación ha caído un 40%. Sigue 'casi listo'."
        },
        {
          "label": "El que lanzó con incertidumbre: lleva 3 iteraciones y sabe exactamente qué no funciona",
          "outcome": "Correcto. Ha fallado dos veces en público, pero cada fallo le costó 2 semanas, no 6 meses. Ahora tiene datos que ningún plan puede darte."
        }
      ],
      "insight": "La certeza que buscas antes de lanzar solo existe después de lanzar. No es valentía ciega: es entender que el mercado es el único oráculo real. El plan perfecto es una ficción que tu cerebro usa para sentirse seguro sin exponerse."
    }
  },
  {
    "id": "gn-12",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 50,
    "reflection_prompt": "¿En qué nivel del iceberg estás invirtiendo más energía ahora mismo?",
    "format": "visual",
    "payload": {
      "render": "concept_map",
      "nodes": [
        {
          "id": "1",
          "label": "Lo que ves: features, diseño, precio"
        },
        {
          "id": "2",
          "label": "Lo que importa: trabajo que el usuario quiere hacer"
        },
        {
          "id": "3",
          "label": "Lo que decide: identidad del usuario"
        },
        {
          "id": "4",
          "label": "Lo invisible: miedo al cambio"
        }
      ],
      "edges": [
        {
          "from": "1",
          "to": "2"
        },
        {
          "from": "2",
          "to": "3"
        },
        {
          "from": "3",
          "to": "4"
        }
      ],
      "caption": "El iceberg de por qué la gente compra. Los fundadores novatos optimizan el nivel 1. Los que retienen usuarios llegan al 3. Los que crean categorías tocan el 4. Tu producto no compite con otros productos: compite con el comportamiento actual del usuario y su resistencia a cambiar su identidad."
    }
  },
  {
    "id": "gn-13",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 60,
    "reflection_prompt": "La respuesta que escribas aquí es más valiosa que cualquier framework que puedas leer hoy.",
    "format": "coach",
    "payload": {
      "question": "Piensa en la última semana. ¿Cuántas horas invertiste en construir tu producto y cuántas en aprender sobre cómo construirlo? Dime el ratio honesto.",
      "placeholder": "Ej: 2 horas construyendo, 8 horas leyendo sobre productividad y herramientas...",
      "followUp": "Si el ratio de aprendizaje supera al de ejecución, no tienes un problema de conocimiento: tienes un sistema que premia la preparación sobre el resultado. La pregunta real no es qué más necesitas aprender, sino qué mecanismo vas a crear para que ejecutar sea más fácil que prepararte."
    }
  },
  {
    "id": "gn-14",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 90,
    "reflection_prompt": "¿Qué te reveló este ejercicio que no esperabas encontrar?",
    "format": "activity",
    "payload": {
      "challenge": "La autopsia de tu sistema de creencias sobre el dinero",
      "steps": [
        "Escribe en papel la primera frase que escuchaste de niño sobre las personas que ganan mucho dinero.",
        "Escribe qué tipo de persona crees que hay que ser para cobrar precios altos.",
        "Ahora escribe el precio que ibas a poner a tu producto. Compáralo con lo que el mercado cobra por soluciones similares.",
        "Si tu precio es significativamente más bajo, lee las frases del paso 1 y 2. Ahí está la razón real."
      ],
      "why": "El precio de tu producto no lo decide el mercado en primera instancia: lo decide tu relación inconsciente con el dinero. La mayoría de fundadores subprecian no por estrategia sino por creencias heredadas. Un precio bajo no solo mata tu margen: señala al usuario que el producto no vale mucho. Precio y percepción de valor son inseparables."
    }
  },
  {
    "id": "gn-15",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 35,
    "reflection_prompt": "¿Cuántas conversaciones reales con usuarios potenciales has tenido esta semana?",
    "format": "stat",
    "payload": {
      "figure": "42 minutos",
      "claim": "Es el tiempo medio que un fundador dedica a hablar con usuarios en su primera semana de desarrollo",
      "reveal": "Mientras tanto, dedica una media de 11 horas a construir funcionalidades. La ratio debería ser al revés: en fase 0, cada hora de conversación con un usuario real vale más que diez horas de código. Lo que la gente te dice que quiere y lo que realmente pagarían son cosas distintas, y solo lo descubres hablando, no construyendo."
    }
  },
  {
    "id": "gn-16",
    "queue": {
      "title": "El ángulo que aún no has visto",
      "type": "topic",
      "theme": "systems"
    },
    "novelty_score": 1,
    "estimated_seconds": 50,
    "reflection_prompt": "¿Tu rutina actual está diseñada para protegerte o para hacerte avanzar?",
    "format": "interactive",
    "payload": {
      "scenario": "Son las 9:00 AM. Tienes 3 horas libres para trabajar en tu producto. Tu sistema de hábitos decide qué pasa a continuación sin que tú lo pienses conscientemente.",
      "choices": [
        {
          "label": "Abres el email primero 'para despejar la mente'",
          "outcome": "Has entregado tu mejor hora cognitiva a los problemas de otros. El email activa el modo reactivo: tu cerebro pasa de constructor a gestor. Las siguientes 2 horas serán de menor calidad sin que lo notes."
        },
        {
          "label": "Empiezas directamente con la tarea más incómoda de tu producto sin abrir ninguna app",
          "outcome": "Has usado tu pico de cortisol matutino —máxima capacidad de concentración y tolerancia al riesgo— en lo que más importa. No es disciplina: es arquitectura del entorno. Tu cerebro no tuvo que elegir."
        }
      ],
      "insight": "Los mejores sistemas no dependen de tu fuerza de voluntad del momento: eliminan la decisión. Si tienes que 'resistir' el email por la mañana, ya perdiste. La solución no es más disciplina, es hacer que la tarea difícil sea la de menor fricción posible en ese momento concreto."
    }
  }
] as unknown as Capsule[];
