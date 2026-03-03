require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.error('❌ Error: OPENROUTER_API_KEY no encontrada en .env.local');
    process.exit(1);
}

// Imagen pixel blanco 1x1 base64 (ultra ligero)
const TEST_IMAGE_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const MODELS_TO_TEST = [
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'qwen/qwen-vl-plus:free'
];

async function testModel(modelId) {
    console.log(`\n🔍 Probando modelo: ${modelId}...`);

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://tao-health-scanner.vercel.app', // Opcional para OpenRouter
                'X-Title': 'Tao Health Scanner Test'
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: '¿De qué color es esta imagen? Responde en una palabra.' },
                            { type: 'image_url', image_url: { url: TEST_IMAGE_BASE64 } }
                        ]
                    }
                ],
                max_tokens: 10
            })
        });

        if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content?.trim();
            console.log(`✅ ${modelId} está VIVO y soporta visión.`);
            console.log(`   Respuesta: "${content}"`);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ ${modelId} FALLÓ.`);
            console.error(`   Status: ${response.status} ${response.statusText}`);
            console.error(`   Error: ${JSON.stringify(errorData.error || errorData)}`);
        }
    } catch (err) {
        console.error(`💥 Error de red/sistema para ${modelId}:`, err.message);
    }
}

async function runTests() {
    console.log('--- SISTEMA DE DIAGNÓSTICO DE MODELOS OPENROUTER ---');
    console.log(`Utilizando API Key: ${apiKey.substring(0, 10)}...`);

    for (const model of MODELS_TO_TEST) {
        await testModel(model);
        // Pequeño delay para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n--- TEST FINALIZADO ---');
}

runTests();
