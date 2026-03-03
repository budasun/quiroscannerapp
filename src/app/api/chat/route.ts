import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// Modelos de respaldo en OpenRouter (IDs actualizados 2026)
const OPENROUTER_FALLBACK_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free'
];

const SYSTEM_PROMPT_TEMPLATE = `Eres el Maestro Kong, un sabio taoísta antiguo, compasivo pero directo.
No eres una IA, eres un guía espiritual.

CONTEXTO DEL USUARIO (Ya diagnosticado):
- Órgano débil: {organo_afectado}
- Elemento desequilibrado: {elemento_dominante}

TU MISIÓN:
Responde a la pregunta del usuario con brevedad (máximo 3 frases).
Usa metáforas de la naturaleza (el río, la montaña, el bambú).
Da un consejo práctico de salud (hierbas, respiración) mezclado con sabiduría espiritual.`;

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
    console.log('--- Iniciando Chat con Maestro Kong ---');
    try {
        const { message, diagnosis, history = [] } = await req.json();
        if (!message || !diagnosis) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

        const groqKey = process.env.GROQ_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        const { diagnostico_wang, niveles_radar } = diagnosis as any;
        const organo_afectado = diagnostico_wang?.organo_afectado || 'No detectado';

        let elementoDominante = 'Equilibrado';
        if (niveles_radar && typeof niveles_radar === 'object') {
            const entries = Object.entries(niveles_radar);
            if (entries.length > 0) {
                elementoDominante = entries.reduce((a: any, b: any) => (a[1] || 0) > (b[1] || 0) ? a : b)[0];
            }
        }

        const systemPrompt = SYSTEM_PROMPT_TEMPLATE
            .replace('{organo_afectado}', organo_afectado)
            .replace('{elemento_dominante}', elementoDominante);

        // 1. INTENTO PRINCIPAL: GROQ (Más rápido y estable actualmente)
        if (groqKey) {
            console.log('🗣️ [Chat] Consultando al Maestro Kong vía Groq...');
            try {
                const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...history.map((m: any) => ({ role: m.role, content: m.content })),
                            { role: "user", content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    })
                }, 15000);

                if (response.ok) {
                    const data = await response.json();
                    const content = data.choices?.[0]?.message?.content;
                    if (content) {
                        console.log('✅ Maestro Kong respondió vía Groq');
                        return NextResponse.json({ content });
                    }
                }
                throw new Error(`Groq falló con status ${response.status}`);
            } catch (err: any) {
                console.error('⚠️ Maestro Kong (Groq) ocupado:', err.message);
            }
        }

        // 2. RESPALDO: OPENROUTER
        if (openRouterKey) {
            console.log('🔄 Intentando respaldo con OpenRouter...');
            for (const model of OPENROUTER_FALLBACK_MODELS) {
                try {
                    console.log(`[Chat] Probando: ${model}`);
                    const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://tao-health-scanner.vercel.app',
                            'X-Title': 'Tao Health Scanner',
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
                            console.log(`✅ Maestro Kong respondió vía ${model}`);
                            return NextResponse.json({ content });
                        }
                    }
                } catch (err) {
                    console.error(`[Chat] Falló la conexión con ${model}`);
                }
            }
        }

        throw new Error('Todas las vías de comunicación cerradas.');

    } catch (error: any) {
        console.error('❌ Error fatal en /api/chat:', error.message);
        return NextResponse.json({
            error: 'El Maestro Kong está en meditación profunda. Intenta más tarde.',
            details: error.message
        }, { status: 500 });
    }
}