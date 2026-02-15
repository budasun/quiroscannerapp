import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// Modelos Llama 3.1 para el Maestro Kong
const LLAMA_MODELS = [
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
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

async function fetchWithTimeout(resource: string, options: any = {}) {
    const { timeout = 20000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    });
    clearTimeout(id);
    return response;
}

export async function POST(req: NextRequest) {
    try {
        const { message, diagnosis, history = [] } = await req.json();

        if (!message || !diagnosis) {
            return NextResponse.json({ error: 'Faltan datos para el chat' }, { status: 400 });
        }

        const { organo_afectado, elemento_dominante } = diagnosis;

        const systemPrompt = SYSTEM_PROMPT_TEMPLATE
            .replace('{organo_afectado}', organo_afectado || 'No detectado')
            .replace('{elemento_dominante}', elemento_dominante || 'Equilibrado');

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
        }

        let lastError = null;

        for (const model of LLAMA_MODELS) {
            try {
                console.log(`[Maestro Kong] Intentando con modelo: ${model}`);
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
                            { role: 'system', content: systemPrompt },
                            ...history.map((m: any) => ({ role: m.role, content: m.content })),
                            { role: 'user', content: message }
                        ],
                    }),
                    timeout: 25000,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`[Maestro Kong] Error con ${model}:`, errorData);
                    if (response.status === 429 || response.status >= 500) {
                        lastError = errorData;
                        continue;
                    }
                    throw new Error(errorData.error?.message || 'Error en la API');
                }

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;

                if (!content) {
                    console.error(`[Maestro Kong] Respuesta vacía de ${model}`);
                    lastError = new Error('Respuesta vacía del modelo');
                    continue;
                }

                console.log(`[Maestro Kong] Respuesta recibida de ${model}`);
                return NextResponse.json({ content });

            } catch (err: any) {
                console.error(`[Maestro Kong] Fallo con ${model}:`, err.message);
                lastError = err;
                continue;
            }
        }

        return NextResponse.json({
            error: 'El Maestro Kong no puede conectarse en este momento.',
            details: lastError?.message || 'Error desconocido'
        }, { status: 500 });

    } catch (error: any) {
        console.error('Error fatal en /api/chat:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
