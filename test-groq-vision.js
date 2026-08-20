require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GROQ_API_KEY;
const fs = require('fs');
const path = require('path');

if (!apiKey) {
    console.error('❌ Error: GROQ_API_KEY no encontrada en .env.local');
    process.exit(1);
}

// Crear imagen PNG válida de 10x10 con Node.js puro
function createTestImage() {
    // PNG válido: 10x10 px, color negro con borde rojo
    const { Buffer } = require('buffer');
    const { Zlib } = (() => { try { return require('zlib'); } catch { return { Zlib: null }; } })();

    // Usar un approach más simple: crear un JPEG mínimo válido
    // O usar fetch para obtener una imagen de internet
    return null; // Vamos a descargar una
}

async function getTestImage() {
    // Intentar descargar una imagen pequeña de internet
    try {
        const r = await fetch('https://httpbin.org/image/jpeg');
        if (r.ok) {
            const buf = Buffer.from(await r.arrayBuffer());
            return 'data:image/jpeg;base64,' + buf.toString('base64');
        }
    } catch {}

    // Fallback: imagen PNG creada con canvas-like approach
    // Crear un PNG válido usando node puro
    const width = 10, height = 10;
    const rawData = Buffer.alloc(height * (1 + width * 3)); // filter byte + RGB per pixel
    for (let y = 0; y < height; y++) {
        rawData[y * (1 + width * 3)] = 0; // filter: none
        for (let x = 0; x < width; x++) {
            const idx = y * (1 + width * 3) + 1 + x * 3;
            rawData[idx] = 255;     // R
            rawData[idx + 1] = 0;   // G
            rawData[idx + 2] = 0;   // B
        }
    }

    const zlib = require('zlib');
    const compressed = zlib.deflateSync(rawData);

    // Build PNG
    function crc32(buf) {
        let c = 0xFFFFFFFF;
        const table = new Int32Array(256);
        for (let n = 0; n < 256; n++) {
            let cc = n;
            for (let k = 0; k < 8; k++) cc = (cc & 1) ? (0xEDB88320 ^ (cc >>> 1)) : (cc >>> 1);
            table[n] = cc;
        }
        for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
        return (c ^ 0xFFFFFFFF) >>> 0;
    }

    function chunk(type, data) {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length);
        const typeData = Buffer.concat([Buffer.from(type), data]);
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(crc32(typeData));
        return Buffer.concat([len, typeData, crc]);
    }

    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;  // bit depth
    ihdrData[9] = 2;  // color type RGB
    ihdrData[10] = 0; // compression
    ihdrData[11] = 0; // filter
    ihdrData[12] = 0; // interlace

    const png = Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
        chunk('IHDR', ihdrData),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0))
    ]);

    return 'data:image/png;base64,' + png.toString('base64');
}

async function testGroqModel(modelId, imageUrl) {
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
                            { type: 'image_url', image_url: { url: imageUrl } }
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
    const imageUrl = await getTestImage();
    if (!imageUrl) {
        console.error('No se pudo crear imagen de prueba');
        process.exit(1);
    }
    console.log('✅ Imagen de prueba creada');

    const MODELS_TO_TEST = [
        'qwen/qwen3.6-27b',
        'openai/gpt-oss-120b'
    ];

    for (const model of MODELS_TO_TEST) {
        await testGroqModel(model, imageUrl);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

runTests();
