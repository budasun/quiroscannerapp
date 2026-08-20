import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const LANGUAGE_NAMES: Record<string, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
};

const SYSTEM_PROMPT_TEMPLATE = `Eres el Gran Maestro Taoísta Wang Chenxia, un sabio experto en Medicina Tradicional China (MTC) y Herbolaria Milenaria Mexicana.

CONTEXTO DEL USUARIO:
- Órgano débil: {organo_afectado}
- Elemento desequilibrado: {elemento_dominante}

TU MISIÓN:
1. Responde con sabiduría mística pero con precisión clínica.
2. HERBOLARIA MEXICANA: Sugiere siempre una planta de México (ej. Cuachalalate, Gordolobo, Siete Azahares) con su posología.
3. ACUPUNTURA: Si el usuario pide tratamiento o consejos, sugiere puntos específicos indicando nombre y función.
4. ADVERTENCIA: Explica brevemente que si no se atiende este {organo_afectado}, el desequilibrio podría moverse hacia otros órganos según el ciclo de control de la MTC.
5. CIERRE: Finaliza preguntando sutilmente la EDAD y el PESO del usuario para poder precisar las dosis de las infusiones.

Mantén un tono de guía espiritual, compasivo y directo. Máximo 4-5 frases por respuesta.`;

async function fetchWithTimeout(resource: string, options: any = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

export async function POST(req: NextRequest) {
    console.log('--- Iniciando Chat con Maestro Kong (Groq) ---');
    try {
        const { message, diagnosis, history = [], language = 'es' } = await req.json();
        if (!message || !diagnosis) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 });
        }

        const { diagnostico_wang, niveles_radar } = diagnosis as any;
        const organo_afectado = diagnostico_wang?.organo_afectado || 'No detectado';

        let elementoDominante = 'Equilibrado';
        if (niveles_radar && typeof niveles_radar === 'object') {
            const entries = Object.entries(niveles_radar);
            if (entries.length > 0) {
                elementoDominante = entries.reduce((a: any, b: any) => (Number(a[1]) || 0) > (Number(b[1]) || 0) ? a : b)[0];
            }
        }

        const languageName = LANGUAGE_NAMES[language] || 'Spanish';
        const systemPrompt = SYSTEM_PROMPT_TEMPLATE
            .replace('{organo_afectado}', organo_afectado)
            .replace('{elemento_dominante}', elementoDominante)
            + `\n\n⚠️ REGLA DE IDIOMA ESTRICTA: Responde COMPLETAMENTE en idioma ${languageName}. NO uses español ni ningún otro idioma.`;

        const GROQ_MODELS = [
            { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B" },
            { id: "qwen/qwen3.6-27b", name: "Qwen 3.6 27B" }
        ];

        for (const { id, name } of GROQ_MODELS) {
            console.log(`📡 [Chat] Intentando Groq (${name})...`);
            try {
                const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: id,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...history.map((m: any) => ({ role: m.role, content: m.content })),
                            { role: "user", content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 800
                    })
                }, 15000);

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        console.log(`✅ Chat exitoso con Groq (${name})`);
                        return NextResponse.json({ content });
                    }
                }
            } catch (err: any) {
                console.error(`⚠️ Groq ${name} falló:`, err.message);
            }
        }

        throw new Error('Todos los modelos de Groq fallaron.');

    } catch (error: any) {
        return NextResponse.json({
            error: 'El Maestro Kong está en meditación profunda.',
            details: error.message
        }, { status: 500 });
    }
}
