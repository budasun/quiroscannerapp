import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 90;

const VISION_MODELS = [
    {
        id: 'meta-llama/llama-3.2-11b-vision-instruct',
        name: 'Llama 3.2 11B Vision',
        provider: 'Meta',
        description: 'Modelo principal de visión de Meta',
    },
    {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'DeepSeek',
        description: 'Modelo de texto (fallback)',
    },
];

const TEST_IMAGE_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=';

const SYSTEM_PROMPT = `Responde en formato JSON exactamente así:
{
  "test_passed": true/false,
  "model_response": "Lo que el modelo pudo observar",
  "analysis": "Análisis breve de la imagen",
  "detection_quality": "alta/media/baja"
}`;

async function testModel(modelId: string, apiKey: string) {
    const startTime = Date.now();
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://tao-health-scanner.vercel.app',
            'X-Title': 'Tao Health Scanner - Test',
        },
        body: JSON.stringify({
            model: modelId,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { 
                    role: 'user', 
                    content: [
                        { type: 'text', text: 'Analiza esta imagen de una mano humana y responde en JSON.' },
                        { type: 'image_url', image_url: { url: TEST_IMAGE_URL } }
                    ]
                }
            ],
            max_tokens: 500,
        }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
        const error = await response.json();
        return {
            model: modelId,
            success: false,
            error: error.error?.message || `HTTP ${response.status}`,
            duration,
        };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let parsed = null;
    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        parsed = null;
    }

    return {
        model: modelId,
        success: true,
        raw_response: content,
        parsed_response: parsed,
        duration,
    };
}

export async function GET(req: NextRequest) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        return NextResponse.json({ 
            error: 'OPENROUTER_API_KEY no configurada',
            setup: 'Añade OPENROUTER_API_KEY a .env.local'
        }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('model');

    if (modelId) {
        const result = await testModel(modelId, apiKey);
        return NextResponse.json(result);
    }

    return NextResponse.json({
        description: 'Test endpoint para modelos de visión de OpenRouter',
        usage: 'GET /api/test-vision?model=id_del_modelo',
        models: VISION_MODELS,
        test_image: TEST_IMAGE_URL,
    });
}

export async function POST(req: NextRequest) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        return NextResponse.json({ 
            error: 'OPENROUTER_API_KEY no configurada'
        }, { status: 500 });
    }

    const body = await req.json();
    const { customImage, customPrompt } = body;

    const results: any[] = [];
    
    for (const model of VISION_MODELS) {
        try {
            const result = await testModel(model.id, apiKey);
            results.push({
                ...model,
                ...result,
            });
        } catch (e: any) {
            results.push({
                id: model.id,
                name: model.name,
                provider: model.provider,
                description: model.description,
                success: false,
                error: e.message,
                duration: 0,
            });
        }
    }

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
        summary: {
            total: results.length,
            successful: successful.length,
            failed: failed.length,
            recommended: successful.length > 0 
                ? successful.sort((a, b) => a.duration - b.duration)[0].model 
                : null,
        },
        results: results.map((r) => ({
            id: r.model || r.id,
            name: r.name,
            provider: r.provider,
            success: r.success,
            duration: r.duration,
            error: r.error,
            preview: r.parsed_response?.analysis || r.raw_response?.substring(0, 100),
        })),
    });
}
