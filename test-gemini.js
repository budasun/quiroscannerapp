require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY no encontrada en .env.local');
    process.exit(1);
}

// Imagen pixel blanco 1x1 base64
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

const MODELS_TO_TEST = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-pro-exp-02-05' // Modelo experimental potente
];

async function testGeminiModel(modelId) {
    console.log(`\n🔍 Probando Google Gemini: ${modelId}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const startTime = Date.now();
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "¿De qué color es esta imagen? Responde en una palabra." },
                        { inlineData: { mimeType: "image/png", data: TEST_IMAGE_BASE64 } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 10
                }
            })
        });

        const duration = Date.now() - startTime;

        if (response.ok) {
            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            console.log(`✅ [${modelId}] VIVO | Latencia: ${duration}ms`);
            console.log(`   Respuesta: "${content}"`);
            return { modelId, alive: true, latency: duration };
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ [${modelId}] FALLÓ | Status: ${response.status}`);
            console.error(`   API Error: ${JSON.stringify(errorData.error || errorData)}`);
            return { modelId, alive: false };
        }
    } catch (err) {
        console.error(`💥 Error de red para ${modelId}:`, err.message);
        return { modelId, alive: false };
    }
}

async function runTests() {
    console.log('--- TEST DE VELOCIDAD Y DISPONIBILIDAD GEMINI (GOOGLE DIRECTO) ---');
    const results = [];

    for (const model of MODELS_TO_TEST) {
        const res = await testGeminiModel(model);
        results.push(res);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n--- RESUMEN FINAL ---');
    results.filter(r => r.alive).sort((a, b) => a.latency - b.latency).forEach(r => {
        console.log(`- ${r.modelId}: ${r.latency}ms (Recomendado)`);
    });
}

runTests();
