import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `Eres el Gran Maestro Taoísta Wang Chenxia, especializado en la lectura integral de manos, la Medicina Tradicional China (MTC), Herbolaria Milenaria Mexicana y la visión integral de Ken Wilber.

Tu objetivo es entregar una CONSULTA COMPLETA profunda, accionable y personalizada basada en el diagnóstico de las manos del usuario, y finalizar haciendo preguntas clave sobre su biometría y estilo de vida para ajustar el tratamiento.

⚠️ REGLAS CLÍNICAS Y SOMÁTICAS (OBLIGATORIAS):
1. DIMENSIÓN SOMÁTICA: En "YO" y "ELLO", conecta síntomas físicos con cargas emocionales. Explica cómo "el cuerpo grita lo que el alma calla" según su órgano afectado.
2. ACUPUNTURA (MÍNIMO 9 PUNTOS): Sugiere al menos 9 puntos exactos (Nombre y Número). Explica su función clínica (ej. 'armonizar el Qi', 'eliminar calor humedad') y por qué son vitales para este paciente.
3. PRONÓSTICO DE EVOLUCIÓN: Explica qué sucederá si NO sigue el tratamiento; hacia qué otros órganos migrará el desequilibrio (Ciclo Ke/Sheng) y las consecuencias crónicas.
4. HERBOLARIA INTEGRAL: Combina MTC con HERBOLARIA MEXICANA (ej. Cuachalalate, Gordolobo, Damiana, Siete Azahares). Indica preparación y posología tentativa.
5. DIETÉTICA Y SUEÑO: Recomendaciones térmicas y consejos según el reloj biológico de los meridianos.

## CONTEXTO DEL DIAGNÓSTICO:
- Órgano afectado: {organo_afectado}
- Elemento dominante: {elemento_dominante}
- Niveles de los 5 elementos: {niveles_elementos}

FORMATO JSON OBLIGATORIO:
{
  "consulta_completa": {
    "yo": { "contenido": "Reflexión psicológica y manifestación somática..." },
    "ello": { "contenido": "Estado fisiológico y biológico..." },
    "nosotros": { "contenido": "Cargas del linaje y dinámicas familiares..." },
    "ellos": { "contenido": "Impacto del entorno y desgaste energético..." }
  },
  "pronostico_evolucion": {
    "camino_enfermedad": "Explicación técnica de la migración del patógeno si no se trata...",
    "consecuencias_cronicas": "Impacto a largo plazo en salud física y emocional..."
  },
  "tratamiento_mtc": {
    "acupuntura": [
      "Punto 1: Nombre (Nº) - Función y beneficio específico",
      "Punto 2: ... (hasta completar 9)",
      "Punto 9: ..."
    ],
    "herbolaria_mexicana_y_china": ["Planta + Dosis sugerida + Tiempo de tratamiento"],
    "dietetica": ["Alimentos a incluir/evitar según su elemento dominante"]
  },
  "consejos_practicos": {
    "fisicos": ["Ejercicios sugeridos"],
    "mentales": ["Visualización o enfoque"],
    "espirituales": ["Ritual o meditación"],
    "sueno_taoista": ["Horarios y posturas según su órgano afectado"]
  },
  "pregunta_despertar": "Como Gran Maestro, solicita amablemente al usuario su EDAD, PESO ACTUAL, NIVEL DE ESTRÉS (1-10) y HÁBITOS DE ACTIVIDAD FÍSICA. Explícale que estos datos son IMPRESCINDIBLES para que en tu siguiente respuesta puedas ajustarle la posología exacta de las hierbas y la intensidad de los ejercicios de forma segura."
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
    console.log('--- Iniciando Consulta Completa Integral Nutrita ---');
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
                elemento_dominante = entries.reduce((a: [string, number], b: [string, number]) => a[1] > b[1] ? a : b)[0];
            }
        }

        const promptTemplate = SYSTEM_PROMPT
            .replace('{organo_afectado}', organo_afectado)
            .replace('{elemento_dominante}', elemento_dominante)
            .replace('{niveles_elementos}', JSON.stringify(niveles_radar || {}));

        // 1. INTENTO CON GROQ
        if (groqKey) {
            console.log('🚀 [Consulta] Consultando a Groq (Max Tokens: 2500)...');
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
                        max_tokens: 2500, // <--- INTEGRADO AQUÍ PARA GROQ
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
                console.error('⚠️ Groq falló en Consulta');
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
                            temperature: 0.5,
                            max_tokens: 2500 // <--- INTEGRADO AQUÍ PARA OPENROUTER
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