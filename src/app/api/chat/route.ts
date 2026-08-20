import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const LANGUAGE_NAMES: Record<string, string> = {
    es: 'Spanish',
    en: 'English',
    fr: 'French',
};

// Modelos de OpenRouter (prioridad: Gemma 4 26B primero)
const OPENROUTER_MODELS = [
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free'
];

// AQUÍ ESTÁ TU PROMPT NUTRIDO SIN CAMBIAR TU ESTRUCTURA
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
    console.log('--- Iniciando Chat con Maestro Kong Nutrito ---');
    try {
        const { message, diagnosis, history = [], language = 'es' } = await req.json();
        if (!message || !diagnosis) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

        const groqKey = process.env.GROQ_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;

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

        // 1. PRIMERO: OpenRouter con Gemma 4 26B (modelo preferido)
        if (openRouterKey) {
            for (const model of OPENROUTER_MODELS) {
                console.log(`🚀 [Chat] Intentando OpenRouter con ${model}...`);
                try {
                    const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: model,
                            temperature: 0.7,
                            messages: [
                                { role: 'system', content: systemPrompt },
                                ...history.map((m: any) => ({ role: m.role, content: m.content })),
                                { role: 'user', content: message }
                            ],
                        }),
                    }, 15000);

                    if (response.ok) {
                        const data = await response.json();
                        const content = data.choices?.[0]?.message?.content;
                        if (content) {
                            console.log(`✅ Chat exitoso con ${model}`);
                            return NextResponse.json({ content });
                        }
                    }
                } catch (err) {
                    console.error(`⚠️ ${model} falló en Chat`);
                    continue;
                }
            }
        }

        // 2. RESPALDO: Groq
        if (groqKey) {
            console.log('🔄 [Chat] Intentando respaldo con Groq...');
            try {
                const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-oss-120b",
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
                        console.log('✅ Chat exitoso con Groq (respaldo)');
                        return NextResponse.json({ content });
                    }
                }
            } catch (err: any) {
                console.error('⚠️ Groq falló en Chat');
            }
        }

        throw new Error('Todas las vías de comunicación cerradas.');

    } catch (error: any) {
        return NextResponse.json({
            error: 'El Maestro Kong está en meditación profunda.',
            details: error.message
        }, { status: 500 });
    }
}