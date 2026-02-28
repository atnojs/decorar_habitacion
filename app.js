const { useState, useRef, useEffect } = React;

// === CONFIGURACIÓN DE MODELOS HÍBRIDA ===
// 1. "LAS MANOS": Modelo para CREAR imágenes (El potente Gemini 3)
const MODEL_IMAGE_GEN = "gemini-3-pro-image-preview";

// 2. "LOS OJOS": Modelo para VER y DESCRIBIR (Flash es excelente analizando imágenes a texto)
const MODEL_TEXT_ANALYSIS = "gemini-2.5-flash-image";

// Asegúrate que esta URL sea la correcta en tu servidor Hostinger
// Asegúrate que esta URL sea la correcta en tu servidor Hostinger
const PROXY_BASE = "https://atnojs.es/apps/decorar_habitacion/proxy.php";

const STORAGE_KEY = 'decorar_habitacion_history';

/* ==================== CONFIGURACIÓN DE ESTANCIAS Y ESTILOS ==================== */
const ROOM_CONFIG = {
  salon: {
    name: "Salón",
    styles: [
      "Moderno", "Nórdico", "Clásico", "Infantil", "Minimalista", "Bohemio",
      "Industrial", "Rústico", "Mediterráneo", "Japonés", "Art Decó", "Colonial",
      "Contemporáneo", "Vintage", "Glamour", "Ecológico"
    ]
  },
  cocina: {
    name: "Cocina",
    styles: [
      "Moderna", "Clásica", "Industrial", "Minimalista", "Mediterránea", "Campo",
      "Étnica", "Nórdica", "Americana", "Rural", "Urbana", "Lujo",
      "Vintage", "Ecológica", "Contemporánea", "Retro"
    ]
  },
  bano: {
    name: "Baño",
    styles: [
      "Spa", "Minimalista", "Clásico", "Industrial", "Nórdico", "Mediterráneo",
      "Moderno", "Vintage", "Ecológico", "Contemporáneo", "Lujoso", "Rústico",
      "Japonés", "Art Decó", "Colonial", "Urbano"
    ]
  },
  patio: {
    name: "Patio",
    styles: [
      "Mediterráneo", "Tropical", "Japonés", "Minimalista", "Rural", "Urbano",
      "Ecológico", "Moderno", "Clásico", "Contemporáneo", "Boho-Chic", "Industrial",
      "Zen", "Exótico", "Colonial", "Californiano"
    ]
  }
};

/* ==================== PROMPTS ESPECÍFICOS POR ESTANCIA ==================== */
const ROOM_PROMPTS = {
  salon: {
    Mediterráneo: "Crea una atmósfera costera mediterránea auténtica con paredes encaladas, azulejos azules, vigas de madera vista, muebles de mimbre y ratán, terracota, y elementos náuticos sutiles. Inclina la decoración hacia espacios abiertos, luminosos y frescos con plantas como olivos, buganvillas y lavanda.",
    Japonés: "Diseña un espacio minimalista zen con tatamis, shojis (pantallas deslizantes), muebles bajos y ligeros, elementos de bambú, una disposición ordenada y armónica. Incorpora la filosofía wabi-sabi con imperfecciones controladas, elementos naturales como piedras y agua, y una paleta de colores neutros y tierra.",
    "Art Decó": "Crea un ambiente lujoso y sofisticado con formas geométricas audaces, líneas simétricas, materiales como ébano, marfil, cromo y latón. Incluye muebles elegantes con curvas dramáticas, espejos con marcos ornamentados, alfombras con patrones geométricos y una iluminación dramática con lámparas de cristal.",
    Colonial: "Diseña un espacio que evoque la elegancia colonial con muebles de madera oscura y robusta, detalles tallados a mano, textiles con patrones étnicos, elementos de caña y mimbre. Incorpora objetos de viaje, mapas antiguos, plantas exóticas y una paleta de colores tierra con acentos dorados.",
    Contemporáneo: "Crea un espacio actual pero acogedor con líneas limpias pero suaves, mezcla de materiales tradicionales y modernos, colores neutros con acentos audaces. Incluye tecnología integrada discretamente, arte abstracto, muebles funcionales con diseño ergonómico y una iluminación estratificada.",
    Vintage: "Diseña un espacio nostálgico con elementos característicos de las décadas de 1950-1970, muebles icónicos como sillas Eames, colores vibrantes como turquesa, naranja y amarillo mostaza. Incluye patrones geométricos, cromados, formica, teléfonos rotativos y aparatos de radio vintage.",
    Glamour: "Crea un ambiente de lujo hollywoodense con muebles tapizados en terciopelo y seda, espejos con marcos dorados, cristales, metales dorados y plateados. Incluye elementos dramáticos como lámparas de araña, mesas con patas curvadas, textiles lujosos y una iluminación cálida y ambiental.",
    Ecológico: "Diseña un espacio sostenible con materiales reciclados y orgánicos, madera recuperada, bambú, corcho, textiles de fibras naturales. Incluye plantas abundantes, sistema de iluminación LED eficiente, compostaje integrado, mobiliario modular y una paleta de colores tierra y verdes naturales."
  },
  cocina: {
    Moderna: "Crea una cocina minimalista y funcional con electrodomésticos integrados, superficies de cuarzo o acero inoxidable, líneas limpias. Incuye isla central, almacenamiento inteligente, iluminación LED y paleta monocromática con acentos metálicos.",
    Clásica: "Diseña una cocina elegante y atemporal con muebles de madera noble, encimeras de mármol, azulejos con detalles decorativos. Incluye campana decorativa, tiradores vintage y paleta de blancos, cremas y maderas oscuras.",
    Industrial: "Crea una cocina urbana con ladrillo visto, tuberías expuestas, electrodomésticos profesionales, acero inoxidable. Incluye isla metálica, iluminación tipo fábrica y paleta de grises, negros y metálicos.",
    Mediterránea: "Diseña una cocina luminosa con azulejos azules, terracota, madera clara, arcos. Incuye detalles en hierro forjado, plantas aromáticas y paleta de blancos, azules y terracotas.",
    Americana: "Crea una cocina rústica americana con gabinetes de madera, encimeras de granito, isla grande. Incluye desayunador, dispensas vintage y paleta cálida de marrones y rojos.",
    Lujo: "Diseña una cocina exclusiva con materiales premium: mármol, maderas exóticas, electrodomésticos de alta gama. Incluye iluminación dramática, isla con taburetes de diseño y acabados dorados o plateados."
  },
  bano: {
    Spa: "Crea un baño de estilo spa con piedra natural, madera tratada, iluminación tenue, plantas tropicales. Incluye bañera de hidromasaje, ducha tipo lluvia, toalleros calefactados y paleta de blancos, grises y madera.",
    Lujoso: "Diseña un baño de lujo con mármol pulido, grifería dorada, espejos con marcos ornamentados, iluminación cálida. Incluye doble lavabo, bañera empotrada y detalles en cristal.",
    Clásico: "Crea un baño clásico con azulejos subway, sanitarios de líneas tradicionales, grifería cromada. Incluye espejo redondo, iluminación simétrica y paleta de blancos y grises claros.",
    Industrial: "Diseña un baño urbano con cemento pulido, tuberías expuestas, sanitarios suspendidos. Incluye divisiones de vidrio negro, grifería negra mate y paleta oscura.",
    Japonés: "Crea un baño zen con madera de hinoki, bañera ofuro, divisiones de papel. Incluye elementos naturales, iluminación suave y paleta neutra.",
    Minimalista: "Diseña un baño minimalista con líneas puras, muebles flotantes, sanitarios integrados. Incluye almacenamiento oculto, iluminación indirecta y paleta monocromática."
  },
  patio: {
    Mediterráneo: "Crea un patio mediterráneo con fuente central, tiestos de terracota, jazmines, piedra natural. Incluye zona de comedor exterior, pergola de madera y paleta de blancos terracotas y azules.",
    Tropical: "Diseña un patio tropical con palmeras, plantas de hojas grandes, madera de teca. Incluye hamaca, iluminación ambiental y paleta de verdes vibrantes y madera oscura.",
    Japonés: "Crea un patio zen con piedras decorativas, bambú, musgo, agua. Incluye camino de piedra, bancos de madera y paleta de grises, verdes y madera natural.",
    Urbano: "Diseña un patio urbano con acero corten, cemento pulido, mobiliario industrial. Incluye vegetación en macetas metálicas, iluminación moderna y paleta gris-negra.",
    Boho: "Crea un patio bohemio con textiles étnicos, cojines, plantas colgantes, luces de hadas. Incluye zona chill-out, macramé y paleta de colores tierra con acentos vibrantes.",
    Californiano: "Diseña un patio california con madera claras, cactus, agaves, piedra desértica. Incluye zona de fuego, mobiliario minimalista y paleta de arena, blanco y verde suave."
  }
};

/* ------------------------- Red ------------------------- */
async function callGemini(payload, action = "generate") {
  // LÓGICA HÍBRIDA:
  // Si la acción es 'analyze' (descripción) o 'detect' (objetos) -> Usamos Flash (Texto)
  // Si la acción es 'generate' (imágenes) -> Usamos Gemini 3 (Imagen)

  const modelToUse = (action === 'generate') ? MODEL_IMAGE_GEN : MODEL_TEXT_ANALYSIS;

  const body = {
    ...payload,
    action: action,
    model: modelToUse
  };

  const res = await fetch(PROXY_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${txt || "sin detalle"}`);
  }
  return await res.json();
}

/* ------------------------- Prompts ------------------------- */
function buildUniversalPrompt(style, variationNote, roomType) {
  const roomSpecifics = ROOM_PROMPTS[roomType] || {};
  const styleSpecifics = roomSpecifics[style] ||
    "Crea una decoración coherente y realista manteniendo la funcionalidad del espacio.";

  const roomContext = {
    salon: "salón o sala de estar",
    cocina: "cocina",
    bano: "baño",
    patio: "patio o jardín"
  };

  const core = `
ORDEN EJECUTIVA: REDECORACIÓN POR SOBRESCRITURA TOTAL.

Analiza la imagen de entrada. Tu tarea es generar una nueva imagen donde ${roomContext[roomType]} original ha sido completamente redecorada en el estilo ${style}, IGNORANDO POR COMPLETO el mobiliario y la decoración existentes.

EJECUTA LOS SIGUIENTES PASOS EN ORDEN:

1.  **IDENTIFICAR Y BORRAR MENTALMENTE**: Identifica todas las superficies ocupadas por mobiliario, electrodomésticos, sanitarios o elementos decorativos. Considera esas áreas como "lienzo en blanco".

2.  **PRESERVAR ESTRUCTURA**: MANTÉN inalterados los elementos arquitectónicos fijos: forma de las paredes, posición y tamaño de ventanas y puertas, tipo de suelo, y la estructura del techo (para exteriores, conserva elementos fijos como muros, suelo y estructuras permanentes).

3.  **SOBRESCRIBIR Y REEMPLAZAR**: Sobre las áreas "borradas", inserta mobiliario y decoración completamente nuevos y coherentes con el estilo ${style}. Los nuevos objetos deben ocupar el espacio de forma realista y funcional.

CARACTERÍSTICAS ESPECÍFICAS DEL ESTILO ${style}: ${styleSpecifics}

RESTRICCIONES ABSOLUTAS (CRÍTICO):
- **NO COPIES** el diseño, forma, color o posición de ningún mueble u objeto de la imagen original.
- **NO TE INSPIRES** en la distribución original. Crea una composición nueva, funcional y estética.
- El resultado final debe parecer un ${roomContext[roomType]} completamente distinto, no una "versión mejorada" de la original.
- Debe ser fotorrealista, con iluminación, sombras y materiales coherentes con el estilo y el espacio.
- Calidad: Imagen JPEG de alta resolución (lado largo ≈1536 px). Solo imagen, sin texto.
`.trim();

  const variability = `
Variación aleatoria para esta generación:
 ${variationNote}
`.trim();

  return `${core}\n\n${variability}`;
}

function buildRecompositionPrompt(style, objects, roomType) {
  const roomContext = {
    salon: "del salón",
    cocina: "de la cocina",
    bano: "del baño",
    patio: "del patio"
  };

  const objLine = Array.isArray(objects) && objects.length
    ? objects.map(o => `- ${o}`).join("\n")
    : "- Usa exactamente los mismos objetos que aparecen en la imagen.";

  return `
ORDEN DIRECTA: REUBICACIÓN RADICAL Y COMPOSICIÓN TOTALMENTE NUEVA PARA ${roomContext[roomType]}.

Mantén el estilo ${style} y los MISMOS OBJETOS. Tu ÚNICA tarea es crear una DISTRIBUCIÓN ESPACIAL completamente diferente y notablemente distinta a la imagen original.

INSTRUCCIONES CRÍTICAS (OBLIGATORIO):
- CAMBIA DRASTICAMENTE la posición de al menos 4-5 piezas principales del espacio.
- La composición final debe ser ESPACIALMENTE DIFERENTE. No es válido mover un objeto 10 cm.
- INTERCAMBIA las funciones de las zonas: por ejemplo, en salón convierte zona de TV en lectura; en cocina cambia zona de cocción por preparación.
- ROTA elementos grandes entre 30° y 90° para forzar una nueva perspectiva.
- NO te limites a reorganizar. Crea un FLUJO y un TRÁNSITO nuevos en el espacio.
- Ignora la composición original. Piensa en "¿dónde más podría colocar estos elementos para que el espacio se sienta completamente distinto?".

Restricciones:
- Mantén los mismos tipos de objetos, materiales y la paleta de color general del estilo ${style}.
- Respeta la perspectiva, el punto de vista y la iluminación coherentes.
- Calidad: Imagen JPEG de alta resolución (lado largo ≈1536 px), nítido. Solo imagen, sin texto.

Objetos que deben conservarse (mismos tipos y aspecto general):
 ${objLine}
`.trim();
}

function buildEditPrompt(style, objects, userInstruction, roomType) {
  const roomContext = {
    salon: "salón",
    cocina: "cocina",
    bano: "baño",
    patio: "patio"
  };

  return `
EDITOR DE DISEÑO: MODIFICACIÓN ESPECÍFICA SOLICITADA PARA ${roomContext[roomType]}.

IMAGEN ACTUAL:
- Estilo: ${style}
- Objetos presentes: ${Array.isArray(objects) ? objects.join(', ') : 'varios objetos de decoración'}

INSTRUCCIÓN DEL USUARIO:
"${userInstruction}"

REQUISITOS DE EJECUCIÓN:
1. Analiza la imagen actual y comprende exactamente lo que el usuario quiere modificar
2. Aplica SOLO los cambios específicos solicitados en la instrucción
3. Mantén todo lo demás IDÉNTICO a la imagen original (estilo, objetos no mencionados, composición general, iluminación, perspectiva)
4. Los cambios deben integrarse de forma natural y coherente con el estilo existente
5. Si se solicita añadir un objeto, debe ser coherente con el estilo ${style} y el espacio (${roomContext[roomType]})
6. Si se solicita eliminar un objeto, elimínalo completamente sin dejar rastros
7. Si se solicita mover un objeto, mantén su apariencia pero cambia solo su posición
8. Respeta la perspectiva, iluminación y calidad de la imagen original

RESULTADO ESPERADO:
El mismo ${roomContext[roomType]} con los cambios específicos aplicados, manteniendo máxima fidelidad al original.

Formato: JPEG de alta calidad, sin texto.
`.trim();
}

function buildRemoveObjectsPrompt(roomType) {
  const roomContext = {
    salon: "la habitación",
    cocina: "la cocina",
    bano: "el baño",
    patio: "el patio"
  };

  return `
ORDEN ESPECÍFICA: ELIMINACIÓN COMPLETA DE OBJETOS Y MOBILIARIO.

Analiza la imagen de entrada. Tu tarea es generar una versión exacta del mismo espacio pero COMPLETAMENTE VACÍA, sin ningún objeto ni mobiliario.

INSTRUCCIONES PRECISAS:
1. ELIMINA TODOS los objetos: muebles, electrodomésticos, sanitarios, decoraciones, alfombras, lámparas, plantas, estanterías, cables, enchufes, etc.

2. MANTÉN ÚNICAMENTE:
   - Paredes, suelo y techo con sus texturas originales
   - Ventanas y marcos de puertas
   - Elementos arquitectónicos fijos (columnas, molduras, etc.)

3. REPARA las áreas donde estaban los objetos con materiales coherentes.

4. CALIDAD REQUERIDA:
   - Imagen fotorrealista y nítida
   - Sin texto ni marcas de agua
   - Imagen JPEG de alta resolución (lado largo ≈1536 px)
   - ${roomContext[roomType]} debe verse completamente vacío pero natural

El resultado debe ser ${roomContext[roomType]} idéntic${roomType === 'cocina' ? 'a' : 'o'} a la original pero sin absolutamente nada dentro, solo la estructura arquitectónica.
`.trim();
}

function buildCustomPrompt(customInstruction, roomType) {
  const roomContext = {
    salon: "habitación",
    cocina: "cocina",
    bano: "baño",
    patio: "patio"
  };

  return `
INSTRUCCIÓN PERSONALIZADA DEL USUARIO PARA ${roomContext[roomType]}:

"${customInstruction}"

Analiza la imagen de entrada y aplica exactamente lo que el usuario solicita en su instrucción personalizada.

REQUISITOS DE EJECUCIÓN:
1. Comprende y aplica la instrucción del usuario de manera precisa
2. Mantén la perspectiva, iluminación y calidad de la imagen original
3. Respeta los elementos arquitectónicos fijos (paredes, ventanas, puertas, suelo, techo)
4. Genera una imagen fotorrealista de alta calidad
5. Formato: Imagen JPEG de alta resolución (lado largo ≈1536 px), sin texto

La imagen resultante debe reflejar exactamente lo solicitado por el usuario en su instrucción personalizada para ${roomContext[roomType]}.
`.trim();
}

/* ------------------------- Variabilidad ------------------------- */
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeVariationNote(style, roomType) {
  const variations = {
    salon: {
      lighting: [
        "Iluminación matinal suave con sombras largas y difusas",
        "Iluminación de tarde cálida con contraste medio",
        "Iluminación homogénea tipo cielo nublado con reflejos suaves",
        "Iluminación lateral marcada que resalta texturas",
        "Iluminación ambiental cálida con puntos de acento discretos"
      ],
      comp: [
        "Distribución distinta con pieza icónica como foco visual",
        "Composición centrada en equilibrio y tránsito fluido",
        "Composición asimétrica con énfasis en zonas de lectura",
        "Jerarquía clara: ancla visual + acompañamientos discretos",
        "Zona de estar redefinida con diálogo entre piezas principales"
      ]
    },
    cocina: {
      lighting: [
        "Iluminación cenital para trabajo en encimeras",
        "Iluminación tipo spotlight sobre isla central",
        "Iluminación natural uniforme con ventanas amplias",
        "Iluminación LED integrada en muebles",
        "Iluminación cálida para ambiente acogedor"
      ],
      comp: [
        "Triángulo de trabajo optimizado para cocina funcional",
        "Isla central como protagonista con espacios de preparación",
        "Distribución en L con zona de comedor integrada",
        "Cocina de galera con almacenamiento vertical máximo",
        "Zona de agua y fuego separadas por área de preparación"
      ]
    },
    bano: {
      lighting: [
        "Iluminación suave tipo spa con luces indirectas",
        "Iluminación espejo para tareas de aseo",
        "Iluminación natural difusa para relajación",
        "Iluminación focal en bañera o ducha",
        "Iluminación ambiental cálida"
      ],
      comp: [
        "Distribución con bañera como elemento central",
        "Zonificación en área húmeda y área seca",
        "Distribución simétrica con doble lavabo",
        "Espacio abierto con solo ducha y sanitarios suspendidos",
        "Jardinera interior con plantas para ambiente tropical"
      ]
    },
    patio: {
      lighting: [
        "Iluminación de jardín con focos direccionales",
        "Iluminación tenue para veladas",
        "Iluminación solar en postes",
        "Luces de hadas en vegetación",
        "Iluminación de acento en elementos arquitectónicos"
      ],
      comp: [
        "Zonas de estar y comedor claramente diferenciadas",
        "Camino de piedra con áreas de descanso laterales",
        "Espacio centrado en elemento focal (fuente, chimenea)",
        "Distribución orgánica con vegetación natural",
        "Terrazas en diferentes niveles"
      ]
    }
  };

  const roomVars = variations[roomType] || variations.salon;

  const materials = [
    "materiales con grano sutil y matices realistas",
    "textiles con tejido visible y caída natural",
    "acabados mate combinados con puntuales brillos especulares",
    "superficies con microtextura y bordes limpios",
    "mezcla controlada de superficies lisas y texturadas"
  ];

  const color = [
    "paleta dominante neutra con acento cromático puntual",
    "armonía monocromática con ligera variación tonal",
    "complementarios desaturados en pequeñas dosis",
    "paleta baja saturación con un acento profundo",
    "degradados sutiles en textiles y pequeños objetos"
  ];

  const camera = [
    "mantén la altura de cámara y el ángulo de fuga coherentes",
    "respeta el punto de vista original y el horizonte percibido",
    "conserva la distancia focal aparente de la toma base",
    "mantén el paralelismo y la convergencia de líneas existente",
    "evita cambios de perspectiva; respeta la geometría original"
  ];

  return `- ${randomChoice(roomVars.lighting)}.
- ${randomChoice(roomVars.comp)}.
- Usa ${randomChoice(materials)}.
- ${randomChoice(color)}.
- ${randomChoice(camera)}.
- Directriz: decoración funcional y estética coherente con el espacio.`;
}

/* ------------------------- Payloads ------------------------- */
function payloadForAnalysis(b64jpeg) {
  return {
    contents: [
      {
        role: "user",
        parts: [
          { text: "Describe con precisión esta habitación en 2–3 frases: materiales dominantes, iluminación, distribución, elementos singulares y sensación general. Responde en español neutro." },
          { inlineData: { mimeType: "image/jpeg", data: b64jpeg } },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, topK: 40, topP: 0.9, maxOutputTokens: 256 },
  };
}

function payloadForImageEdit(b64img, promptText, mime = "image/jpeg", cfg = {}) {
  return {
    contents: [
      { role: "user", parts: [{ text: promptText }, { inlineData: { mimeType: mime, data: b64img } }] },
    ],
    generationConfig: Object.assign(
      { temperature: 0.9, topK: 64, topP: 0.95 },
      cfg || {}
    ),
  };
}

function payloadForDetectObjects(b64png) {
  return {
    contents: [
      {
        role: "user",
        parts: [
          { text: "Enumera de 8 a 15 objetos visibles en esta imagen, con nombres cortos y materiales cuando sea relevante. Formato: lista con guiones, en español, sin frases extra." },
          // Nota: Aquí el mimetype depende de lo que se le pase, pero suele ser la imagen generada.
          // Si la imagen generada ya es jpeg, esto debería ser jpeg.
          // Sin embargo, el backend de Gemini suele ser tolerante si le dices png pero es jpeg.
          // Lo dejaremos genérico o lo adaptaremos en la llamada.
          { inlineData: { mimeType: "image/jpeg", data: b64png } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, topK: 40, topP: 0.9, maxOutputTokens: 220 },
  };
}

/* ------------------------- Conversores ------------------------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1]);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function dataUriToBase64(uri) { return String(uri).split(",")[1] || ""; }

// FUNCIÓN CORREGIDA Y RENOMBRADA PARA JPEG
function toJPEGDataUriFromCandidate(json) {
  try {
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const inline = parts.find((p) => p.inlineData?.data);
    if (!inline) return null;
    // IMPORTANTE: Gemini devuelve JPEG, así que definimos la cabecera correcta
    return `data:image/jpeg;base64,${inline.inlineData.data}`;
  } catch { return null; }
}

function textFromCandidate(json) {
  try {
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const t = parts.find((p) => typeof p.text === "string")?.text || "";
    return t.trim();
  } catch { return ""; }
}

/* ------------------------- Móvil 'capture' ------------------------- */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTouch =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (window.matchMedia && window.matchMedia("(pointer:coarse)").matches);
    setMobile(!!isTouch);
  }, []);
  return mobile;
}

/* ------------------------- App ------------------------- */
function App() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [src, setSrc] = useState(null);
  const [srcB64, setSrcB64] = useState(null);
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState("");
  // const [showUploadMenu, setShowUploadMenu] = useState(false); // REMOVED
  const [customInstruction, setCustomInstruction] = useState("");
  const [editingUserImage, setEditingUserImage] = useState(false);

  const [results, setResults] = useState({});

  const [viewer, setViewer] = useState({ open: false, uri: null });
  const [editingItem, setEditingItem] = useState(null);
  const [editInstruction, setEditInstruction] = useState("");

  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const isMobile = useIsMobile();

  // --- PERSISTENCIA ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          setResults(parsed);
        }
      }
    } catch (e) {
      console.warn('Error cargando historial:', e);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(results).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
      } catch (e) {
        console.warn('Error guardando historial:', e);
      }
    }
  }, [results]);

  const clearHistory = () => {
    if (confirm("¿Estás seguro de que quieres borrar todo el historial?")) {
      const initialResults = {};
      Object.keys(ROOM_CONFIG).forEach(room => {
        initialResults[room] = {}; // O resets structure
      });
      // Re-initialize structure based on current selectedRoom if needed or just empty
      setResults({});
      localStorage.removeItem(STORAGE_KEY);
      location.reload(); // Refresh to clean up
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      setResults(prev => {
        // Si ya tenemos resultados para este estilo (cargados de localStorage), no sobreescribimos
        const initialResults = { ...prev };
        ROOM_CONFIG[selectedRoom].styles.forEach(style => {
          if (!initialResults[style]) initialResults[style] = [];
        });
        if (!initialResults["Personalizado"]) initialResults["Personalizado"] = [];
        return initialResults;
      });
    }
  }, [selectedRoom]);

  /* REMOVED handleClickOutside for upload menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (showUploadMenu && !event.target.closest('.upload-menu-container')) {
        setShowUploadMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUploadMenu]);
  */

  async function handleUpload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const b64 = await fileToBase64(file);
      setSrcB64(b64);
      setSrc(URL.createObjectURL(file));
      const analysisRes = await callGemini(payloadForAnalysis(b64), "analyze");
      setAnalysis(textFromCandidate(analysisRes));
    } catch (e) {
      console.error(e);
      alert(`Error al preparar/analizar la imagen. Asegúrate de que el proxy funciona y la API Key es correcta: ${e.message}`);
    } finally { setBusy(false); }
  }

  function openFilePicker(mode) {
    let inputElement;
    if (mode === 'camera') {
      inputElement = cameraRef.current;
    } else {
      inputElement = fileRef.current;
    }
    if (!inputElement) return;
    try { inputElement.value = ""; } catch { }
    inputElement.click();
    // setShowUploadMenu(false); // REMOVED
  }

  async function onInputChange(e) {
    const f = e.target.files?.[0];
    if (f) await handleUpload(f);
  }

  async function detectObjectsFromImageUri(uri) {
    try {
      const b64 = dataUriToBase64(uri);
      // Usamos 'detect' que enviará al modelo Flash. Payload adaptado a JPEG.
      const resp = await callGemini(payloadForDetectObjects(b64), "detect");
      const txt = textFromCandidate(resp);
      const lines = txt.split(/\r?\n/)
        .map((s) => s.replace(/^[-•\*\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 12);
      return lines;
    } catch { return []; }
  }

  async function removeObjectsFromImage() {
    if (!srcB64 || !selectedRoom) return;
    setBusy(true);
    try {
      const prompt = buildRemoveObjectsPrompt(selectedRoom);

      let gen = await callGemini(
        payloadForImageEdit(srcB64, prompt, "image/jpeg", { temperature: 0.95 }),
        "generate"
      );
      let uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG

      if (!uri) {
        const altPrompt = prompt + "\n\n¡IMPORTANTE! Elimina ABSOLUTAMENTE TODO lo que no sea estructura arquitectónica. El espacio debe quedar completamente vacío. Solo JPEG.";
        gen = await callGemini(
          payloadForImageEdit(srcB64, altPrompt, "image/jpeg", { temperature: 0.3 }),
          "generate"
        );
        uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG
      }
      if (!uri) throw new Error("La respuesta no contiene imagen generada.");

      setSrc(uri);
      const newB64 = dataUriToBase64(uri);
      setSrcB64(newB64);

      const analysisRes = await callGemini(payloadForAnalysis(newB64), "analyze");
      setAnalysis(textFromCandidate(analysisRes));

    } catch (e) {
      alert(`No pudo eliminar los objetos: ${e.message}`);
    } finally { setBusy(false); }
  }

  async function generateCustom() {
    if (!srcB64 || !customInstruction.trim() || !selectedRoom) return;
    setBusy(true);
    try {
      const prompt = buildCustomPrompt(customInstruction, selectedRoom);

      let gen = await callGemini(
        payloadForImageEdit(srcB64, prompt, "image/jpeg", { temperature: 0.9 }),
        "generate"
      );
      let uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG

      if (!uri) {
        const altPrompt = prompt + "\n\n¡IMPORTANTE! Aplica exactamente la instrucción del usuario. Genera una imagen de alta calidad. Solo JPEG.";
        gen = await callGemini(
          payloadForImageEdit(srcB64, altPrompt, "image/jpeg", { temperature: 0.9 }),
          "generate"
        );
        uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG
      }
      if (!uri) throw new Error("La respuesta no contiene imagen generada.");

      const objects = await detectObjectsFromImageUri(uri);
      const newItem = {
        uri,
        ts: Date.now(),
        objects,
        style: "Personalizado",
        instruction: customInstruction
      };

      setResults((prev) => ({
        ...prev,
        Personalizado: [newItem, ...prev.Personalizado]
      }));

    } catch (e) {
      alert(`No se pudo generar con instrucción personalizada: ${e.message}`);
    } finally { setBusy(false); }
  }

  async function generateOne(style) {
    if (!srcB64 || !selectedRoom) return;
    setBusy(true);
    try {
      const newItems = [];
      // Generamos 2 variantes
      for (let i = 0; i < 2; i++) {
        const variation = makeVariationNote(style, selectedRoom);
        const prompt = buildUniversalPrompt(style, variation, selectedRoom);

        let gen = await callGemini(
          payloadForImageEdit(srcB64, prompt, "image/jpeg", { temperature: 0.95 }),
          "generate"
        );
        let uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG

        if (!uri) {
          const alt = buildUniversalPrompt(
            style,
            `${variation}\n- Reformula: composición y mobiliario totalmente nuevos. Mantén perspectiva original. Solo JPEG.`,
            selectedRoom
          );
          gen = await callGemini(
            payloadForImageEdit(srcB64, alt, "image/jpeg", { temperature: 0.95 }),
            "generate"
          );
          uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG
        }
        if (!uri) throw new Error("La respuesta no contiene imagen generada.");

        const objects = await detectObjectsFromImageUri(uri);
        newItems.push({ uri, ts: Date.now() + i, objects, style });
      }
      setResults((prev) => ({ ...prev, [style]: [...newItems, ...prev[style]] }));
    } catch (e) {
      alert(`No se pudo generar (${style}): ${e.message}`);
    } finally { setBusy(false); }
  }

  async function regenerateItem(style, index) {
    const item = results[style]?.[index];
    if (!item || !selectedRoom) return;
    setBusy(true);
    try {
      const b64img = dataUriToBase64(item.uri); // Obtenemos base64 de la imagen almacenada (ahora es JPEG)
      const prompt = buildRecompositionPrompt(style, item.objects, selectedRoom);

      // En regenerate, la imagen de entrada ya es un JPEG generado previamente
      let gen = await callGemini(
        payloadForImageEdit(b64img, prompt, "image/jpeg", {
          temperature: 0.95,
          topK: 64,
          topP: 0.99
        }),
        "generate"
      );
      let uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG

      if (!uri) {
        const prompt2 = prompt + "\n\n¡RECUERDA! La composición debe ser RADICALMENTE DIFERENTE. No te conformes con cambios menores. Solo JPEG.";
        gen = await callGemini(
          payloadForImageEdit(b64img, prompt2, "image/jpeg", {
            temperature: 0.95,
            topK: 64,
            topP: 0.99
          }),
          "generate"
        );
        uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG
      }
      if (!uri) throw new Error("La respuesta no contiene imagen regenerada.");

      const objects = await detectObjectsFromImageUri(uri);

      setResults((prev) => {
        const copy = { ...prev };
        copy[style] = [{ uri, ts: Date.now(), objects, style }, ...copy[style]];
        return copy;
      });
    } catch (e) {
      alert(`No se pudo regenerar (${style}): ${e.message}`);
    } finally { setBusy(false); }
  }

  async function editItem(style, index) {
    const item = results[style]?.[index];
    if (!item || !editInstruction.trim() || !selectedRoom) return;

    setBusy(true);
    try {
      const b64img = dataUriToBase64(item.uri); // Input es JPEG
      const prompt = buildEditPrompt(style, item.objects, editInstruction, selectedRoom);

      let gen = await callGemini(
        payloadForImageEdit(b64img, prompt, "image/jpeg", {
          temperature: 0.7,
          topK: 40,
          topP: 0.9
        }),
        "generate"
      );
      let uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG

      if (!uri) {
        const prompt2 = prompt + "\n\nIMPORTANTE: Aplica SOLO los cambios específicos solicitados. Mantén todo lo demás idéntico.";
        gen = await callGemini(
          payloadForImageEdit(b64img, prompt2, "image/jpeg", {
            temperature: 0.7,
            topK: 40,
            topP: 0.9
          }),
          "generate"
        );
        uri = toJPEGDataUriFromCandidate(gen); // Actualizado a JPEG
      }
      if (!uri) throw new Error("La respuesta no contiene imagen editada.");

      const objects = await detectObjectsFromImageUri(uri);

      const newItem = {
        uri,
        ts: Date.now(),
        objects,
        style
      };

      setResults((prev) => {
        const copy = { ...prev };
        copy[style] = [newItem, ...copy[style]];
        return copy;
      });

      setEditInstruction("");
      setEditingItem(null);

    } catch (e) {
      alert(`No se pudo editar (${style}): ${e.message}`);
    } finally { setBusy(false); }
  }

  function deleteItem(style, index) {
    setResults((prev) => {
      const copy = { ...prev };
      copy[style] = copy[style].filter((_, i) => i !== index);
      return copy;
    });
  }

  function cancelEdit() {
    setEditInstruction("");
    setEditingItem(null);
  }

  const openLightbox = (uri) => setViewer({ open: true, uri });
  const closeLightbox = () => setViewer({ open: false, uri: null });

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  function resetAll() {
    setSelectedRoom(null);
    setSrc(null);
    setSrcB64(null);
    setAnalysis("");
    setCustomInstruction("");
    setResults({});
    // setShowUploadMenu(false); // REMOVED
    setEditInstruction("");
    setEditingItem(null);
    setEditingUserImage(false);
    if (fileRef.current) { try { fileRef.current.value = ""; } catch { } }
    if (cameraRef.current) { try { cameraRef.current.value = ""; } catch { } }
  }

  const canGenerate = !!srcB64 && !busy && !!selectedRoom;

  function shoppingUrlFor(obj, style) {
    const q = `${obj} ${style} ${selectedRoom || 'decoracion'}`.trim();
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;
  }

  const availableStyles = selectedRoom ? ROOM_CONFIG[selectedRoom].styles : [];

  const allStyleKeys = [...availableStyles, "Personalizado"];

  const stylesWithResults = selectedRoom ?
    allStyleKeys
      .filter(style => results[style]?.length > 0)
      .sort((a, b) => results[b][0].ts - results[a][0].ts)
    : [];

  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 relative">
        {busy && (
          <div className="loading-overlay">
            <div className="spinner-triple">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
            <p className="loading-text">IA Diseñando tu espacio...</p>
          </div>
        )}

        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold gradient-text app-title">DECORADOR DE ESPACIOS</h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 gradient-text app-hero-title">Elige el espacio que quieres decorar</h2>
            <p className="text-white-600 app-hero-subtitle">Selecciona el tipo de estancia para ver los estilos disponibles</p>
          </div>

          <div className="room-selector-container">
            <button className="room-button btn-3d" onClick={() => setSelectedRoom('salon')}>
              <span className="room-button-icon">🛋️</span>
              Salón
            </button>
            <button className="room-button btn-3d" onClick={() => setSelectedRoom('cocina')}>
              <span className="room-button-icon">🍳</span>
              Cocina
            </button>
            <button className="room-button btn-3d" onClick={() => setSelectedRoom('bano')}>
              <span className="room-button-icon">🛁</span>
              Baño
            </button>
            <button className="room-button btn-3d" onClick={() => setSelectedRoom('patio')}>
              <span className="room-button-icon">🌿</span>
              Patio
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 transition-all font-semibold"
              onClick={clearHistory}
            >
              🗑️ Limpiar Todo el Historial
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {busy && (
        <div className="loading-overlay">
          <div className="spinner-triple">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
          <p className="loading-text">IA Transformando tu Estancia...</p>
        </div>
      )}

      {viewer.open && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-controls">
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
          </div>
          <img
            id="lightbox-img"
            src={viewer.uri}
            alt="Vista ampliada"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 top-title-wrap">
            <button className="px-3 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50 btn-3d" onClick={resetAll} disabled={busy} type="button">
              ← Cambiar estancia
            </button>
            <h1 className="text-xl font-semibold gradient-text app-title room-header-title">DECORADOR DE {ROOM_CONFIG[selectedRoom].name.toUpperCase()}</h1>
          </div>

          <input
            ref={fileRef}
            id="input-subir-imagen-gallery"
            type="file"
            accept="image/*"
            onChange={onInputChange}
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0, zIndex: -1 }}
            aria-hidden="true"
            tabIndex={-1}
          />
          <input
            ref={cameraRef}
            id="input-subir-imagen-camera"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onInputChange}
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0, zIndex: -1 }}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-3">
            <h2 className="text-lg font-semibold mb-3">Imagen a Decorar</h2>
            {src ? (
              <div className="relative">
                <img
                  src={src}
                  alt={`${ROOM_CONFIG[selectedRoom].name} original`}
                  className="w-full rounded-lg object-contain bg-white cursor-zoom-in"
                  style={{ imageRendering: "auto" }}
                  onClick={() => setViewer({ open: true, uri: src })}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    className="p-1.5 rounded bg-white/90 border text-sm edit-user-image-btn"
                    onClick={() => setEditingUserImage(true)}
                    type="button"
                    title={`Editar imagen del ${ROOM_CONFIG[selectedRoom].name}`}
                    aria-label="Editar imagen"
                    disabled={busy}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button
                    className="p-1.5 rounded bg-white/90 border text-sm clear-objects-btn"
                    onClick={removeObjectsFromImage}
                    type="button"
                    title={`Eliminar todos los objetos del ${ROOM_CONFIG[selectedRoom].name}`}
                    aria-label="Eliminar objetos"
                    disabled={busy}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500 cursor-pointer hover:border-acc hover:shadow-lg transition-all"
                onClick={() => {
                  openFilePicker('gallery');
                }}
              >
                <div className="icon mb-4 text-4xl">📸</div>
                <h3 className="text-lg mb-2">Sube una imagen del {ROOM_CONFIG[selectedRoom].name}</h3>
                <p className="text-sm">Haz clic aquí para cargar una imagen</p>

                {/* Mobile menu REMOVED */}
              </div>
            )}
          </div>

          {editingUserImage && src && (
            <div className="bg-white rounded-xl shadow p-3 mt-4 animate-in">
              <h3 className="font-semibold mb-2">Instrucciones Personalizadas</h3>
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder={`Escribe aquí tus instrucciones para modificar el ${ROOM_CONFIG[selectedRoom].name}...`}
                className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                rows="3"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={generateCustom}
                  disabled={!customInstruction.trim() || !srcB64 || busy}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                >
                  Aplicar Instrucción
                </button>
                <button
                  onClick={() => {
                    setEditingUserImage(false);
                    setCustomInstruction("");
                  }}
                  disabled={busy}
                  className="px-3 py-2 bg-gray-500 text-white rounded text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Ejemplos:</strong> "Pinta las paredes de azul", "Añade una lámpara moderna",
                "Cambia el suelo por madera", "Elimina todos los cuadros"
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-3 mt-4">
            <h3 className="font-semibold mb-2">Descripción del {ROOM_CONFIG[selectedRoom].name}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {analysis || "Se generará una breve descripción al subir la imagen."}
            </p>
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="bg-white rounded-xl shadow p-3 mb-4" style={{ width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 className="text-lg font-semibold mb-3 text-center gradient-text app-section-title">Estilos Disponibles para {ROOM_CONFIG[selectedRoom].name}</h2>
            <div className="style-buttons-container">
              {availableStyles.map((style) => (
                <button key={style} className="px-3 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50 btn-3d" onClick={() => generateOne(style)} disabled={!canGenerate} type="button">
                  {style}
                </button>
              ))}
            </div>
          </div>

          {stylesWithResults.map((style) => (
            <div key={style} className="bg-white rounded-xl shadow p-3 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{style}</h3>
                {style === "Personalizado" && results.Personalizado.length > 0 && (
                  <span className="text-xs text-gray-500 italic truncate max-w-xs">
                    {results.Personalizado[0].instruction}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results[style]?.map((r, idx) => (
                  <figure key={r.ts} className="relative">
                    <img
                      src={r.uri}
                      alt={`${style} generado`}
                      className="w-full rounded-lg object-contain bg-white cursor-zoom-in"
                      style={{ imageRendering: "auto" }}
                      onClick={() => setViewer({ open: true, uri: r.uri })}
                    />

                    <div className="absolute top-2 right-2 flex gap-1">
                      <a
                        href={r.uri}
                        // CAMBIO: Extensión .jpg para evitar error en IrfanView
                        download={`decor-${ROOM_CONFIG[selectedRoom].name}-${style}-${r.ts}.jpg`}
                        className="p-1.5 rounded bg-white/90 border text-sm download-btn"
                        title="Descargar imagen"
                        aria-label="Descargar imagen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </a>
                      <button
                        className="p-1.5 rounded bg-white/90 border text-sm regenerate-btn"
                        onClick={() => regenerateItem(style, idx)}
                        type="button"
                        title="Recolocar mismos objetos con cambios notorios"
                        aria-label="Regenerar imagen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                      </button>
                      <button
                        className="p-1.5 rounded bg-white/90 border text-sm edit-btn"
                        onClick={() => setEditingItem({ style, index: idx })}
                        type="button"
                        title="Editar imagen con instrucciones específicas"
                        aria-label="Editar imagen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        className="p-1.5 rounded bg-white/90 border text-sm delete-btn"
                        onClick={() => deleteItem(style, idx)}
                        type="button"
                        title="Eliminar imagen"
                        aria-label="Eliminar imagen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>

                    {editingItem && editingItem.style === style && editingItem.index === idx && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instrucciones de edición:
                        </label>
                        <textarea
                          value={editInstruction}
                          onChange={(e) => setEditInstruction(e.target.value)}
                          placeholder={`Ej: Añade una planta, cambia el color del suelo...`}
                          className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                          rows="3"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => editItem(style, idx)}
                            disabled={!editInstruction.trim() || busy}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                          >
                            Aplicar cambios
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={busy}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>Ejemplos:</strong> "Añade una planta", "Cambia los muebles de color",
                          "Elimina elementos", "Mueve la iluminación"
                        </p>
                      </div>
                    )}

                    {Array.isArray(r.objects) && r.objects.length > 0 ? (
                      <ul className="mt-2 text-xs text-gray-700 list-disc list-inside space-y-0.5">
                        {r.objects.map((it, i2) => (
                          <li key={i2}>
                            <a
                              href={shoppingUrlFor(it, style)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2 hover:opacity-80"
                              title={`Buscar ${it} en compras`}
                            >
                              {it}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500">Detectando objetos…</p>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
