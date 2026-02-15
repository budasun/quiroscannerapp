import { NextRequest, NextResponse } from 'next/server';

const MODELS = [
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
];

const SYSTEM_PROMPT = `Actúa como el Gran Maestro Wang Chenxia (Diagnóstico por la mano) y Ken Wilber (Visión Integral).
Tu tarea es hacer una DISECCIÓN VISUAL de estas manos (Izquierda=Ancestral/Yin, Derecha=Actual/Yang).

⚠️ INSTRUCCIONES VISUALES (NO ALUCINES):
1. Busca EVIDENCIA FÍSICA: Lunares, manchas, venas azules, líneas rotas, islas, color de uñas.
2. CONTRASTA: ¿Qué cambió de la izquierda a la derecha?
3. MÉTODO WANG: Si diagnosticas "Hígado", debes decir "porque veo un tono azulado en el monte de Marte".

FORMATO JSON OBLIGATORIO (Responde SOLO esto, sin texto antes ni después):
{
  "mensaje_maestro": "Frase del I Ching basada en la energía detectada.",
  "diagnostico_wang": {
    "observacion_visual": "Texto detallado describiendo las marcas físicas reales que ves en las fotos.",
    "organo_afectado": "Órgano principal (Ej: Hígado, Corazón, Riñón).",
    "significado_mtc": "Explicación técnica de Medicina Tradicional China."
  },
  "niveles_radar": { 
    "fuego": 50, "tierra": 50, "metal": 50, "agua": 50, "madera": 50 
  },
  "cuadrantes_integral": {
    "yo": { "titulo": "Mente (Yo)", "detalle": "Estado psicológico individual visible." },
    "ello": { "titulo": "Cuerpo (Ello)", "detalle": "Estado biológico y físico." },
    "nosotros": { "titulo": "Ancestros (Nosotros)", "detalle": "Cargas familiares o linaje (Mano Izquierda)." },
    "ellos": { "titulo": "Entorno (Ellos)", "detalle": "Impacto social/laboral actual (Mano Derecha)." }
  }
}`;

async function fetchWithTimeout(resource: string, options: any = {}) {
    const { timeout = 15000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    });
    clearTimeout(id);
    return response;
}

function cleanJsonResponse(content: string) {
    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
    }
    return cleaned.trim();
}

export async function POST(req: NextRequest) {
    console.log('--- Iniciando Análisis Tao ---');
    try {
        const { leftHand, rightHand } = await req.json();

        if (!leftHand || !rightHand) {
            return NextResponse.json({ error: 'Faltan las imágenes de las manos' }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('Error: OPENROUTER_API_KEY no encontrada');
            return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
        }

        let lastError = null;

        for (const model of MODELS) {
            try {
                console.log(`Intentando con modelo: ${model}`);
                const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://tao-health-scanner.vercel.app',
                        'X-Title': 'Tao Health Scanner',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: SYSTEM_PROMPT,
                            },
                            {
                                role: 'user',
                                content: 'El usuario ha enviado fotos de ambas manos (izquierda y derecha). Realiza un diagnóstico completo basado en los principios de Wang Chenxia y la Psicología Integral de Ken Wilber. Genera valores realistas y variados para los niveles de radar. Responde estrictamente en formato JSON.',
                            },
                        ],
                        // Algunos modelos gratuitos pueden fallar con response_format, así que lo manejamos con el prompt
                    }),
                    timeout: 30000,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Error de API en modelo ${model}:`, errorData);
                    if (response.status === 429 || response.status >= 500) {
                        lastError = errorData;
                        continue;
                    }
                    throw new Error(errorData.error?.message || 'Error en la API');
                }

                const data = await response.json();
                console.log(`Respuesta recibida de ${model}`);

                const content = data.choices[0].message.content;
                const cleanedContent = cleanJsonResponse(content);

                try {
                    const parsed = JSON.parse(cleanedContent);
                    return NextResponse.json(parsed);
                } catch (parseErr) {
                    console.error('Error parseando JSON de la IA:', content);
                    lastError = new Error('La IA no respondió en el formato místico correcto.');
                    continue;
                }

            } catch (err: any) {
                console.error(`Fallo en el intento con ${model}:`, err.message);
                lastError = err;
                continue;
            }
        }

        return NextResponse.json({
            error: 'No se pudo obtener una respuesta de los modelos de IA',
            details: lastError?.message || 'Error desconocido'
        }, { status: 500 });

    } catch (error: any) {
        console.error('Error fatal en /api/analyze:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
