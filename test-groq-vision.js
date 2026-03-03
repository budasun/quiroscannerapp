require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.error('❌ Error: GROQ_API_KEY no encontrada en .env.local');
    process.exit(1);
}

// Imagen pixel blanco 1x1 base64
const TEST_IMAGE_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const MODELS_TO_TEST = [
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview',
    'llama-3.3-70b-versatile', // Not vision but let's check
    'mixtral-8x7b-32768' // Not vision
];

async function testGroqModel(modelId) {
    console.log(`\n🔍 Probando Groq: ${modelId}...`);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
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
            console.log(`✅ [${modelId}] está VIVO y soporta visión.`);
            console.log(`   Respuesta: "${content}"`);
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ [${modelId}] FALLÓ.`);
            console.error(`   Status: ${response.status} ${response.statusText}`);
            console.error(`   Error: ${JSON.stringify(errorData.error || errorData)}`);
            return false;
        }
    } catch (err) {
        console.error(`💥 Error de red para ${modelId}:`, err.message);
        return false;
    }
}

async function runTests() {
    console.log('--- TEST DE MODELOS DE VISIÓN EN GROQ ---');
    for (const model of MODELS_TO_TEST) {
        await testGroqModel(model);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

runTests();
