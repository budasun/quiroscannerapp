import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `Actúa como el Gran Maestro Wang Chenxia (Diagnóstico por la mano) y Ken Wilber (Visión Integral).
Tu tarea es hacer una DISECCIÓN VISUAL de estas manos (Izquierda=Ancestral/Yin, Derecha=Actual/Yang).

⚠️ INSTRUCCIONES VISUALES (NO ALUCINES):
1. Busca EVIDENCIA FÍSICA: Lunares, manchas, venas azules, líneas rotas, islas, color de uñas.
2. CONTRASTA: ¿Qué cambió de la izquierda a la derecha?
3. En los "niveles_radar", calcula un valor real del 1 al 100 basado en lo que observas.

FORMATO JSON OBLIGATORIO (Responde SOLO esto, sin texto antes ni después, respeta las comillas dobles):
{
  "mensaje_maestro": "Frase mística del I Ching",
  "diagnostico_wang": {
    "observacion_visual": "Describe las marcas físicas reales que ves en las palmas.",
    "organo_afectado": "Hígado, Corazón, Riñón, Bazo o Pulmón.",
    "significado_mtc": "Explicación en Medicina Tradicional China."
  },
  "niveles_radar": { 
    "fuego": 85, "tierra": 60, "metal": 45, "agua": 70, "madera": 55 
  },
  "cuadrantes_integral": {
    "yo": { "titulo": "Mente (Yo)", "detalle": "Estado psicológico individual visible." },
    "ello": { "titulo": "Cuerpo (Ello)", "detalle": "Estado biológico y físico." },
    "nosotros": { "titulo": "Ancestros (Nosotros)", "detalle": "Cargas familiares (Mano Izq)." },
    "ellos": { "titulo": "Entorno (Ellos)", "detalle": "Impacto social actual (Mano Der)." }
  }
}`;

function cleanJsonResponse(content: string): string {
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0].trim() : cleaned;
}

function parseJsonRobust(content: string): object | null {
    try { return JSON.parse(cleanJsonResponse(content)); }
    catch { return null; }
}

function validateAndFixDiagnosis(parsed: { [key: string]: unknown }): object | null {
    const requiredFields = ['mensaje_maestro', 'diagnostico_wang', 'niveles_radar', 'cuadrantes_integral'];
    for (const f of requiredFields) if (!parsed[f]) return null;

    const wang = parsed.diagnostico_wang as { [key: string]: unknown };
    if (!wang || !wang.observacion_visual || !wang.organo_afectado || !wang.significado_mtc) return null;

    const radar = parsed.niveles_radar as { [key: string]: unknown };
    if (!radar) return null;

    const radarKeys = ['fuego', 'tierra', 'metal', 'agua', 'madera'];
    for (const key of radarKeys) {
        if (typeof radar[key] !== 'number') radar[key] = 50;
    }

    return parsed;
}

export async function POST(req: NextRequest) {
    console.log('--- Iniciando Análisis Tao (Vía Groq Turbo) ---');
    try {
        const { leftHand, rightHand } = await req.json();

        if (!leftHand || !rightHand) {
            return NextResponse.json({ error: 'Faltan las imágenes de las manos' }, { status: 400 });
        }

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            console.error('❌ Error: GROQ_API_KEY no encontrada en .env.local');
            return NextResponse.json({ error: 'Llave de Groq no configurada' }, { status: 500 });
        }

        const MODELS_TO_TRY = [
            "meta-llama/llama-4-scout-17b-16e-instruct",
            "meta-llama/llama-4-maverick-17b-128e-instruct",
            "qwen/qwen3-32b"
        ];

        let contentText = "";
        let success = false;
        let lastError = "";

        for (const model of MODELS_TO_TRY) {
            console.log(`📡 Intentando con ${model}...`);
            try {
                // Qwen3 en Groq actualmente requiere contenido como string simple
                const isQwen = model.toLowerCase().includes('qwen');

                const payload = {
                    model: model,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: isQwen
                                ? `Analiza ambas manos (IZQUIERDA = Yin, DERECHA = Yang). Responde en JSON.\n\nImagen 1: ${leftHand}\n\nImagen 2: ${rightHand}`
                                : [
                                    { type: "text", text: "Analiza ambas manos (IZQUIERDA = energía ancestral/Yin, DERECHA = energía actual/Yang). Busca marcas físicas reales: lunares, manchas, venas, color de uñas, líneas. Responde ÚNICAMENTE con JSON válido." },
                                    { type: "image_url", image_url: { url: leftHand } },
                                    { type: "image_url", image_url: { url: rightHand } }
                                ]
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 1024
                };

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s para modelos grandes

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json() as any;
                    contentText = data.choices?.[0]?.message?.content;
                    if (contentText) {
                        console.log(`✅ Éxito con ${model}`);
                        success = true;
                        break;
                    }
                } else {
                    const errDetail = await response.text();
                    lastError = `Status ${response.status}: ${errDetail}`;
                    console.warn(`⚠️ ${model} falló: ${lastError}`);
                }
            } catch (err: any) {
                lastError = err.message;
                console.warn(`⚠️ Error de red/timeout con ${model}: ${lastError}`);
            }
        }

        if (!success) {
            throw new Error(`Todos los modelos de Groq fallaron o no respondieron. Último error: ${lastError}`);
        }

        const parsed = parseJsonRobust(contentText);
        if (!parsed) {
            console.error("❌ Groq no devolvió un JSON válido:", contentText);
            throw new Error('Formato de diagnóstico inválido');
        }

        const validated = validateAndFixDiagnosis(parsed as { [key: string]: unknown });
        if (!validated) {
            throw new Error('Faltan campos en la respuesta');
        }

        console.log('✅ ¡Diagnóstico devuelto a la velocidad de la luz!');
        return NextResponse.json(validated);

    } catch (error: any) {
        console.error('❌ Error fatal en /api/analyze:', error.message);
        return NextResponse.json({
            error: 'Las nubes de datos están densas. El servidor falló en procesar la imagen.',
            details: error.message,
            fallback: true
        }, { status: 200 });
    }
}