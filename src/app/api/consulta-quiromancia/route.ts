import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;

const LANGUAGE_NAMES: Record<string, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
};

const LANGUAGE_RULE = `
⚠️ REGLA DE IDIOMA ESTRICTA: Todo el contenido estructurado de la respuesta JSON (quiromancia: lineas_principales, montes_y_planetas, personalidad, sexualidad; mensaje_sabio) DEBE estar redactado ÚNICAMENTE en idioma {languageName}. NO uses español ni ningún otro idioma. Responde COMPLETAMENTE en {languageName}.`;

const SYSTEM_PROMPT = `Eres el Gran Maestro de Quiromancia, heredero de la tradición milenaria de lectura de manos. Tu conocimiento abarca la quiromancia clásica, la astrología manual y la psicología de la personalidad.

Tu tarea es realizar una LECTURA DE QUIROMANCIA completa y detallada basada en el diagnóstico de las manos del usuario.

⚠️ INSTRUCCIONES (OBLIGATORIAS):
1. LÍNEAS PRINCIPALES: Describe la Línea de la Vida, Línea del Corazón, Línea de la Cabeza, Línea del Destino y Línea de la Suerte. Interpreta su longitud, profundidad, interrupciones, islas, bifurcaciones y lo que revelan.
2. MONTES: Analiza los montes de Venus, Júpiter, Saturno, Apolo, Mercurio, Marte (positivo y negativo) y la Luna. Describe su desarrollo, consistencia y marcas.
3. PLANETAS: Conecta cada monte con su influencia planetaria y cómo afecta la personalidad.
4. PERSONALIDAD: Sintetiza el carácter, talentos innatos, tendencias emocionales, estilo de comunicación y tipo de inteligencia.
5. SEXUALIDAD: Basado en la Línea del Corazón, el Monte de Venus, la consistencia de la palma y la Línea de la Vida, describe la energía sexual, el temperamento erótico, las necesidades afectivas y la compatibilidad instintiva.

## CONTEXTO DEL DIAGNÓSTICO:
- Órgano afectado: {organo_afectado}
- Elemento dominante: {elemento_dominante}
- Niveles de los 5 elementos: {niveles_elementos}

FORMATO JSON OBLIGATORIO:
{
  "quiromancia": {
    "lineas_principales": "Descripción detallada de las líneas de la vida, corazón, cabeza, destino y suerte...",
    "montes_y_planetas": "Análisis de los montes de la palma y su influencia planetaria...",
    "personalidad": "Síntesis del carácter, talentos y tendencias psicológicas...",
    "sexualidad": "Descripción de la energía sexual, temperamento erótico y necesidades afectivas según las líneas..."
  },
  "mensaje_sabio": "Frase de sabiduría del I Ching o la filosofía taoísta relacionada con el destino escrito en las manos."
}`;

function cleanJsonResponse(content: string): string {
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0].trim() : cleaned;
}

function parseJsonRobust(content: string): Record<string, unknown> | null {
    try { return JSON.parse(cleanJsonResponse(content)); }
    catch { return null; }
}

export async function POST(req: NextRequest) {
    console.log('--- Iniciando Lectura de Quiromancia ---');
    try {
        const { diagnosis, language = 'es' } = await req.json();
        if (!diagnosis) return NextResponse.json({ error: 'Falta el diagnóstico' }, { status: 400 });

        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;

        const diagnostico_wang = (diagnosis as Record<string, any>).diagnostico_wang;
        const niveles_radar = (diagnosis as Record<string, any>).niveles_radar;

        const organo_afectado = diagnostico_wang?.organo_afectado || 'No detectado';

        let elemento_dominante = 'Equilibrado';
        if (niveles_radar && typeof niveles_radar === 'object') {
            const entries = Object.entries(niveles_radar as Record<string, number>);
            if (entries.length > 0) {
                elemento_dominante = entries.reduce((a: [string, number], b: [string, number]) => a[1] > b[1] ? a : b)[0];
            }
        }

        const languageName = LANGUAGE_NAMES[language] || 'Spanish';
        const prompt = SYSTEM_PROMPT
            .replace('{organo_afectado}', organo_afectado)
            .replace('{elemento_dominante}', elemento_dominante)
            .replace('{niveles_elementos}', JSON.stringify(niveles_radar || {}))
            + LANGUAGE_RULE.replace(/{languageName}/g, languageName);

        const callAPI = async (model: string, apiKey: string, baseUrl: string, extraHeaders: Record<string, string> = {}) => {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    ...extraHeaders
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: prompt },
                        { role: "user", content: "Realiza la lectura de quiromancia completa basada en mi diagnóstico de manos. Devuelve solo JSON válido." }
                    ],
                    temperature: 0.6,
                    max_tokens: 2048
                })
            });
            if (response.ok) {
                const data = await response.json();
                return data.choices?.[0]?.message?.content || null;
            }
            return null;
        };

        const openRouterModels = [
            'google/gemma-4-26b-a4b-it:free',
            'google/gemma-4-31b-it:free',
            'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
        ];

        // 1. PRIMERO: OpenRouter con Gemma 4 26B (modelo preferido)
        if (openRouterKey) {
            for (const modelId of openRouterModels) {
                console.log(`🚀 [Quiromancia] Intentando OpenRouter con ${modelId}...`);
                try {
                    const content = await callAPI(modelId, openRouterKey, 'https://openrouter.ai/api/v1', {
                        'HTTP-Referer': 'https://tao-health-scanner.vercel.app',
                        'X-Title': 'Tao Health Scanner'
                    });
                    if (content) {
                        const parsed = parseJsonRobust(content);
                        if (parsed) {
                            console.log(`✅ Lectura de Quiromancia exitosa con ${modelId}`);
                            return NextResponse.json(parsed);
                        }
                    }
                } catch { console.error(`⚠️ ${modelId} falló en Quiromancia`); }
            }
        }

        // 2. RESPALDO: Groq
        if (groqKey) {
            console.log('🔄 [Quiromancia] Intentando respaldo con Groq...');
            try {
                const content = await callAPI('openai/gpt-oss-120b', groqKey, 'https://api.groq.com/openai/v1', {});
                if (content) {
                    const parsed = parseJsonRobust(content);
                    if (parsed) {
                        console.log('✅ Lectura de Quiromancia exitosa con Groq (respaldo)');
                        return NextResponse.json(parsed);
                    }
                }
            } catch { console.error('⚠️ Groq falló en Quiromancia'); }
        }

        throw new Error("No se pudo generar la lectura de quiromancia por ninguna vía.");

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Error fatal en /api/consulta-quiromancia:', errorMessage);
        return NextResponse.json({ error: 'El Maestro Kong tropezó: ' + errorMessage }, { status: 500 });
    }
}
