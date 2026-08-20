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
    console.log('--- Iniciando Quiromancia (Groq) ---');
    try {
        const { diagnosis, language = 'es' } = await req.json();
        if (!diagnosis) return NextResponse.json({ error: 'Falta el diagnóstico' }, { status: 400 });

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 });
        }

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

        const GROQ_MODELS = [
            { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B" },
            { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B" }
        ];

        for (const { id, name } of GROQ_MODELS) {
            console.log(`📡 [Quiromancia] Intentando Groq (${name})...`);
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: id,
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: "Realiza la lectura de quiromancia completa basada en mi diagnóstico de manos. Devuelve solo JSON válido." }
                        ],
                        temperature: 0.6,
                        max_tokens: 3000,
                        response_format: { type: "json_object" }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const contentText = data.choices?.[0]?.message?.content;
                    const parsed = parseJsonRobust(contentText);
                    if (parsed) {
                        console.log(`✅ Quiromancia exitosa con Groq (${name})`);
                        return NextResponse.json(parsed);
                    }
                }
            } catch (err) {
                console.error(`⚠️ Groq ${name} falló:`, err);
            }
        }

        throw new Error("No se pudo generar la quiromancia por ninguna vía.");

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Error fatal en /api/consulta-quiromancia:', errorMessage);
        return NextResponse.json({ error: 'El Maestro Kong tropezó: ' + errorMessage }, { status: 500 });
    }
}
