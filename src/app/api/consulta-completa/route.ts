import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `Eres el Gran Maestro Taoísta Wang Chenxia, especializado en la lectura integral de manos según la tradición taoísta y la Medicina Tradicional China (MTC), combinado con la visión integral de Ken Wilber.

Debes generar una CONSULTA COMPLETA Y EXHAUSTIVA estructurada en los 4 CUADRANTES DE KEN WILBER:

## 1. YO (Quadrante Individual - Interior)
- Estado mental y emocional
- Patrones de pensamiento
- Espiritualidad y propósito de vida
- Análisis de la línea de la cabeza en la mano

## 2. ELLO (Quadrante Individual - Exterior)
- Estado físico corporal
- Órganos y sistemas afectados
- Condiciones de las uñas, piel y venas
- Análisis de los montes y líneas de la salud

## 3. NOSOTROS (Quadrante Colectivo - Interior)
- Herencia familiar y patrones ancestrales
- Cargas emocionales transmitidas
- Karma familiar visible en la mano izquierda (Yin/Ancestral)
- Patrones de relaciones afectivas

## 4. ELLOS (Quadrante Colectivo - Exterior)
- Entorno social y laboral actual
- Relaciones interpersonales
- Ambiente de trabajo
- Impacto del entorno en la salud (mano derecha Yang/Actual)

## CONTEXTO DEL DIAGNÓSTICO:
- Órgano afectado: {organo_afectado}
- Elemento dominante: {elemento_dominante}
- Niveles de los 5 elementos: {niveles_elementos}

## FORMATO OBLIGATORIO (JSON):
{
  "consulta_completa": {
    "yo": { "titulo": "Yo - Mente y Espiritu", "contenido": "Análisis..." },
    "ello": { "titulo": "Ello - Cuerpo Físico", "contenido": "Análisis..." },
    "nosotros": { "titulo": "Nosotros - Ancestros y Linaje", "contenido": "Análisis..." },
    "ellos": { "titulo": "Ellos - Entorno y Sociedad", "contenido": "Análisis..." }
  },
  "consejos_practicos": {
    "fisicos": ["Consejo 1", "Consejo 2"],
    "mentales": ["Consejo 1", "Consejo 2"],
    "espirituales": ["Consejo 1", "Consejo 2"]
  },
  "resumen_tao": "Frase taoísta que sintetiza la lectura..."
}

Responde ÚNICAMENTE con JSON válido, sin texto adicional.`;

function cleanJsonResponse(content: string): string {
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0].trim() : cleaned;
}

function parseJsonRobust(content: string): any | null {
    try { return JSON.parse(cleanJsonResponse(content)); }
    catch { return null; }
}

export async function POST(req: NextRequest) {
    console.log('--- Iniciando Consulta Completa ---');
    try {
        const { diagnosis } = await req.json();
        if (!diagnosis) return NextResponse.json({ error: 'Falta el diagnóstico' }, { status: 400 });

        const groqKey = process.env.GROQ_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        const { diagnostico_wang, niveles_radar } = diagnosis as any;
        const organo_afectado = diagnostico_wang?.organo_afectado || 'No detectado';

        let elemento_dominante = 'Equilibrado';
        if (niveles_radar && typeof niveles_radar === 'object') {
            const entries = Object.entries(niveles_radar);
            if (entries.length > 0) {
                elemento_dominante = entries.reduce((a: any, b: any) => (a[1] || 0) > (b[1] || 0) ? a : b)[0];
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
            } catch (err: any) {
                console.error('⚠️ Groq falló en Consulta:', err.message);
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

    } catch (error: any) {
        console.error('❌ Error fatal en /api/consulta-completa:', error.message);
        return NextResponse.json({ error: 'El Maestro Kong tropezó: ' + error.message }, { status: 500 });
    }
}