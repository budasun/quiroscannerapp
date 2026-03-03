import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `Eres el Gran Maestro Taoísta Wang Chenxia, especializado en la lectura integral de manos, la Medicina Tradicional China (MTC) y la visión integral de Ken Wilber.

Tu objetivo es entregar una CONSULTA COMPLETA profunda, accionable y personalizada basada en el diagnóstico de las manos del usuario, y finalizar haciendo preguntas clave para elevar su nivel de consciencia.

⚠️ REGLAS CLÍNICAS Y SOMÁTICAS (OBLIGATORIAS):
1. DIMENSIÓN SOMÁTICA: En los cuadrantes "YO" y "ELLO", conecta directamente los síntomas físicos con las cargas emocionales (y viceversa). Explica cómo "el cuerpo grita lo que el alma calla" según su órgano afectado.
2. ACUPUNTURA: Sugiere meridianos y puntos exactos (ej. Hígado 3 - Tai Chong, Estómago 36 - Zu San Li) y cómo estimularlos mediante digitopuntura para este caso.
3. HERBOLARIA: Sugiere hierbas específicas, tiempos de infusión y posología (ej. 1 taza en ayunas por 7 días).
4. DIETÉTICA: Recomienda alimentos térmicos (fríos/calientes/neutros) según el exceso o deficiencia de su elemento dominante.
5. SUEÑO TAOÍSTA: Da consejos de higiene del sueño basados en el reloj biológico de los meridianos de la MTC y el equilibrio Yin/Yang.

## CONTEXTO DEL DIAGNÓSTICO:
- Órgano afectado: {organo_afectado}
- Elemento dominante: {elemento_dominante}
- Niveles de los 5 elementos: {niveles_elementos}

FORMATO JSON OBLIGATORIO:
{
  "consulta_completa": {
    "yo": { "contenido": "Reflexión psicológica, emocional y su manifestación somática oculta..." },
    "ello": { "contenido": "Estado fisiológico y biológico (cómo el dolor físico está afectando su psique)..." },
    "nosotros": { "contenido": "Cargas del linaje paterno/materno y dinámicas familiares..." },
    "ellos": { "contenido": "Impacto del entorno social y laboral en su desgaste energético..." }
  },
  "tratamiento_mtc": {
    "acupuntura": ["Punto 1 y función", "Punto 2 y función"],
    "herbolaria": ["Hierba 1 (dosis y tiempo)", "Hierba 2 (dosis y tiempo)"],
    "dietetica": ["Recomendación 1", "Recomendación 2"]
  },
  "consejos_practicos": {
    "fisicos": ["..."],
    "mentales": ["..."],
    "espirituales": ["..."],
    "sueno_taoista": ["Consejo taoísta sobre horarios o posturas...", "Consejo sobre el ambiente..."]
  },
  "pregunta_despertar": "Elabora 2 preguntas directas y empáticas indagando su edad, peso, nivel de estrés actual o sedentarismo para poder ajustar sus dosis y seguimiento aquí en el chat."
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
    console.log('--- Iniciando Consulta Completa Integral ---');
    try {
        const { diagnosis } = await req.json();
        if (!diagnosis) return NextResponse.json({ error: 'Falta el diagnóstico' }, { status: 400 });

        const groqKey = process.env.GROQ_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        const diagnostico_wang = (diagnosis as Record<string, any>).diagnostico_wang;
        const niveles_radar = (diagnosis as Record<string, any>).niveles_radar;

        const organo_afectado = diagnostico_wang?.organo_afectado || 'No detectado';

        let elemento_dominante = 'Equilibrado';
        if (niveles_radar && typeof niveles_radar === 'object') {
            const entries = Object.entries(niveles_radar as Record<string, number>);
            if (entries.length > 0) {
                // Tipado estricto para que Vercel no marque error 'any'
                elemento_dominante = entries.reduce((a: [string, number], b: [string, number]) => a[1] > b[1] ? a : b)[0];
            }
        }

        const promptTemplate = SYSTEM_PROMPT
            .replace('{organo_afectado}', organo_afectado)
            .replace('{elemento_dominante}', elemento_dominante)
            .replace('{niveles_elementos}', JSON.stringify(niveles_radar || {}));

        // 1. INTENTO CON GROQ
        if (groqKey) {
            console.log('🚀 [Consulta] Consultando a Groq...');
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: promptTemplate },
                            { role: "user", content: "Genera la consulta completa basada en mi diagnóstico de manos. Devuelve solo JSON válido." }
                        ],
                        temperature: 0.5,
                        response_format: { type: "json_object" }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const contentText = data.choices?.[0]?.message?.content;
                    const parsed = parseJsonRobust(contentText);
                    if (parsed) {
                        console.log('✅ Consulta Completa exitosa con Groq');
                        return NextResponse.json(parsed);
                    }
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error('⚠️ Groq falló en Consulta:', errorMessage);
            }
        }

        // 2. INTENTO CON OPENROUTER (RESPALDO)
        if (openRouterKey) {
            console.log('🔄 [Consulta] Intentando respaldo con OpenRouter...');
            const models = ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-3-27b-it:free'];

            for (const modelId of models) {
                try {
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelId,
                            messages: [
                                { role: "system", content: promptTemplate },
                                { role: "user", content: "Genera la consulta completa basada en mi diagnóstico de manos. Devuelve solo JSON válido." }
                            ],
                            temperature: 0.5
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const contentText = data.choices?.[0]?.message?.content;
                        const parsed = parseJsonRobust(contentText);
                        if (parsed) {
                            console.log(`✅ Consulta Completa exitosa con ${modelId}`);
                            return NextResponse.json(parsed);
                        }
                    }
                } catch (err) {
                    console.error(`⚠️ ${modelId} falló en Consulta`);
                }
            }
        }

        throw new Error("No se pudo generar la consulta por ninguna vía.");

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Error fatal en /api/consulta-completa:', errorMessage);
        return NextResponse.json({ error: 'El Maestro Kong tropezó: ' + errorMessage }, { status: 500 });
    }
}