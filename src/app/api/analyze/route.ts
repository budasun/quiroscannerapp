import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

const LANGUAGE_NAMES: Record<string, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
};

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

const LANGUAGE_RULE = `
⚠️ REGLA DE IDIOMA ESTRICTA: Todo el contenido del JSON de respuesta (mensaje_maestro, observacion_visual, organo_afectado, significado_mtc, y todos los campos de cuadrantes_integral) DEBE estar redactado ÚNICAMENTE en idioma {languageName}. NO uses español ni ningún otro idioma. Responde COMPLETAMENTE en {languageName}.`;

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
    console.log('--- Iniciando Análisis Tao (OpenRouter Vision + Groq Fallback) ---');
    try {
        const { leftHand, rightHand, language = 'es' } = await req.json();

        if (!leftHand || !rightHand) {
            return NextResponse.json({ error: 'Faltan las imágenes de las manos' }, { status: 400 });
        }

        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;

        if (!openRouterKey && !groqKey) {
            console.error('❌ Error: Ni OPENROUTER_API_KEY ni GROQ_API_KEY configuradas');
            return NextResponse.json({ error: 'Llaves de API no configuradas' }, { status: 500 });
        }

        const languageName = LANGUAGE_NAMES[language] || 'Spanish';
        const systemPromptWithLang = SYSTEM_PROMPT + LANGUAGE_RULE.replace(/{languageName}/g, languageName);

        const visionPrompt = systemPromptWithLang + "\n\n---\n\nAnaliza ambas manos (IZQUIERDA = energía ancestral/Yin, DERECHA = energía actual/Yang). Busca marcas físicas reales: lunares, manchas, venas, color de uñas, líneas. Responde ÚNICAMENTE con JSON válido.";

        let contentText = "";
        let success = false;
        let lastError = "";
        let modelUsed = "";

        // 1. PRIMERO: Groq con qwen/qwen3.6-27b (vision + JSON mode)
        if (groqKey) {
            console.log('📡 Intentando Groq (qwen/qwen3.6-27b)...');
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "qwen/qwen3.6-27b",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: visionPrompt },
                                    { type: "image_url", image_url: { url: leftHand } },
                                    { type: "image_url", image_url: { url: rightHand } }
                                ]
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 1024,
                        response_format: { type: "json_object" }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json() as any;
                    contentText = data.choices?.[0]?.message?.content;
                    if (contentText) {
                        modelUsed = "Groq/qwen/qwen3.6-27b";
                        success = true;
                        console.log('✅ Éxito con Groq (qwen/qwen3.6-27b)');
                    }
                } else {
                    const errDetail = await response.text();
                    lastError = `Groq Status ${response.status}: ${errDetail}`;
                    console.warn(`⚠️ Groq falló: ${lastError}`);
                }
            } catch (err: any) {
                lastError = `Groq Error: ${err.message}`;
                console.warn(`⚠️ Error de red/timeout con Groq: ${lastError}`);
            }
        }

        // 2. RESPALDO: OpenRouter con Gemini Vision
        if (!success && openRouterKey) {
            const OPENROUTER_MODELS = [
                "google/gemini-2.5-flash",
                "google/gemini-2.0-flash-001"
            ];

            for (const model of OPENROUTER_MODELS) {
                console.log(`🔄 Intentando respaldo OpenRouter con ${model}...`);
                try {
                    const payload = {
                        model: model,
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: visionPrompt },
                                    { type: "image_url", image_url: { url: leftHand } },
                                    { type: "image_url", image_url: { url: rightHand } }
                                ]
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 1024
                    };

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 20000);

                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://tao-health-scanner.vercel.app',
                            'X-Title': 'Tao Health Scanner'
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json() as any;
                        contentText = data.choices?.[0]?.message?.content;
                        if (contentText) {
                            modelUsed = `OpenRouter/${model}`;
                            console.log(`✅ Éxito con ${model}`);
                            success = true;
                            break;
                        }
                    } else {
                        const errDetail = await response.text();
                        lastError = `Status ${response.status}: ${errDetail}`;
                        console.warn(`⚠️ ${model} falló en OpenRouter: ${lastError}`);
                    }
                } catch (err: any) {
                    lastError = err.message;
                    console.warn(`⚠️ Error de red/timeout con ${model}: ${lastError}`);
                }
            }
        }

        if (!success) {
            throw new Error(`Todos los modelos fallaron. Último error: ${lastError}`);
        }

        const parsed = parseJsonRobust(contentText);
        if (!parsed) {
            console.error("❌ OpenRouter no devolvió un JSON válido:", contentText);
            throw new Error('Formato de diagnóstico inválido');
        }

        const validated = validateAndFixDiagnosis(parsed as { [key: string]: unknown });
        if (!validated) {
            throw new Error('Faltan campos en la respuesta');
        }

        console.log('✅ ¡Diagnóstico devuelto a la velocidad de la luz!');
        return NextResponse.json({
            modelo_utilizado: modelUsed,
            ...(validated as object)
        });

    } catch (error: any) {
        console.error('❌ Error fatal en /api/analyze:', error.message);
        return NextResponse.json({
            error: 'Las nubes de datos están densas. El servidor falló en procesar la imagen.',
            details: error.message,
            fallback: true
        }, { status: 200 });
    }
}