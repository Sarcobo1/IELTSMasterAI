// lib/pdfExtractor.ts

/**
 * PDF dan matnni chiqarish - require() usuli (TypeScript xatosiz)
 */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        console.log('📖 Starting PDF extraction...');
        
        // ✅ SODDA YECHIM: Faqat require() ishlatish
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        
        console.log('📦 pdf-parse loaded');
        console.log('📦 Module type:', typeof pdfParse);
        console.log('📦 Has default?', !!pdfParse.default);
        
        // Parse function ni topish
        let parseFunction = pdfParse;
        
        if (typeof pdfParse === 'object' && pdfParse.default) {
            parseFunction = pdfParse.default;
        }
        
        if (typeof parseFunction !== 'function') {
            console.error('❌ pdf-parse noto\'g\'ri formatda:', {
                type: typeof pdfParse,
                keys: Object.keys(pdfParse || {}),
                hasDefault: !!pdfParse.default,
                defaultType: typeof pdfParse.default
            });
            throw new Error('pdf-parse moduli funksiya emas');
        }
        
        console.log('🔄 Parsing PDF buffer (' + buffer.length + ' bytes)...');
        
        // PDF ni parse qilish
        const pdfData = await parseFunction(buffer, {
            max: 0, // Barcha sahifalar
            version: 'default'
        });
        
        console.log('📄 PDF parsed successfully:', {
            pages: pdfData.numpages || 0,
            textLength: pdfData.text?.length || 0,
            hasText: !!pdfData.text,
            title: pdfData.info?.Title || 'Untitled'
        });
        
        // Matnni tekshirish
        const text = pdfData.text;
        
        if (!text) {
            throw new Error('PDF fayldan matn olinmadi (text = null)');
        }
        
        if (text.trim().length === 0) {
            throw new Error('PDF fayldan bo\'sh matn olindi. Fayl skanerlangan rasm bo\'lishi mumkin.');
        }
        
        if (text.length < 50) {
            console.warn('⚠️  Juda qisqa matn:', text);
            throw new Error('PDF fayldan juda kam matn olindi (' + text.length + ' belgi)');
        }
        
        console.log('✅ Text extracted successfully!');
        console.log('📊 Total characters:', text.length);
        console.log('📝 Preview:', text.substring(0, 150).replace(/\n/g, ' ') + '...');
        
        return text;
        
    } catch (error: any) {
        console.error('❌ PDF Extraction Error:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        
        // Aniq xato xabarlari
        if (error.code === 'MODULE_NOT_FOUND') {
            throw new Error(
                'pdf-parse moduli o\'rnatilmagan.\n' +
                'Terminal: npm install pdf-parse@1.1.1 --save\n' +
                'Keyin: npm run dev'
            );
        }
        
        if (error.message?.includes('Invalid PDF structure')) {
            throw new Error(
                'PDF fayl buzilgan. Iltimos, to\'g\'ri PDF fayl yuklang.'
            );
        }
        
        if (error.message?.includes('Encrypted') || error.message?.includes('password')) {
            throw new Error(
                'PDF parol bilan himoyalangan. Iltimos, parolsiz PDF yuklang.'
            );
        }
        
        if (error.message?.includes('funksiya emas') || error.message?.includes('is not a function')) {
            throw new Error(
                'pdf-parse moduli noto\'g\'ri o\'rnatilgan.\n' +
                'Terminal: npm install pdf-parse@1.1.1 --force\n' +
                'Keyin: rm -rf .next && npm run dev'
            );
        }
        
        // Agar bizning o'zimiz throw qilgan xato bo'lsa
        if (error.message?.includes('matn')) {
            throw error;
        }
        
        // Umumiy xato
        throw new Error(
            'PDF o\'qishda xatolik: ' + (error?.message || 'Noma\'lum xato')
        );
    }
}

/**
 * PDF modulini tekshirish uchun yordamchi funksiya
 */
export function checkPdfParseModule(): void {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        
        console.log('🔍 pdf-parse module check:', {
            exists: true,
            type: typeof pdfParse,
            hasDefault: !!pdfParse.default,
            keys: Object.keys(pdfParse || {}),
            isFunction: typeof pdfParse === 'function'
        });
    } catch (error: any) {
        console.error('❌ pdf-parse module not found:', error.message);
    }
}