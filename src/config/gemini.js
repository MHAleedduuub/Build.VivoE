require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiFlash {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY غير موجود في ملف .env');
        }
        
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // استخدام Flash Model (أسرع وأرخص)
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192, // دعم نصوص طويلة
            }
        });
        
        console.log('✅ تم تهيئة Gemini Flash بنجاح');
    }

    /**
     * إنشاء موقع ويب كامل
     */
    async generateWebsite(options) {
        try {
            const {
                businessType = 'شركة ناشئة',
                industry = 'تكنولوجيا',
                features = ['موقع رئيسي', 'منتجات', 'اتصال'],
                style = 'حديث ومتجاوب',
                tone = 'احترافي وجذاب',
                language = 'العربية'
            } = options;

            const prompt = `
أنت Gemini Flash، مساعد متخصص في إنشاء مواقع الويب.

المهمة: إنشاء موقع ويب كامل شامل لـ ${businessType} في مجال ${industry}.

المتطلبات:
1. نوع الموقع: ${businessType}
2. المجال: ${industry}
3. المميزات المطلوبة: ${features.join(', ')}
4. النمط التصميمي: ${style}
5. النبرة: ${tone}
6. اللغة: ${language}

مطلوب منك:
1. HTML كامل مع Tailwind CSS
2. CSS مخصص إذا لزم الأمر
3. JavaScript للتفاعلية
4. تصميم متجاوب (Responsive)
5. هيكل سيمنطي مناسب لـ SEO
6. أكواد نظيفة ومعلقة

قدم الإخراج بالتنسيق التالي:
=== HTML ===
[الكود هنا]
=== CSS ===
[الكود هنا]
=== JS ===
[الكود هنا]
=== NOTES ===
[ملاحظات التطوير]
            `;

            console.log('🚀 جاري إنشاء الموقع بالذكاء الاصطناعي...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseWebsiteOutput(text);
            
        } catch (error) {
            console.error('❌ خطأ في إنشاء الموقع:', error.message);
            throw new Error(`فشل إنشاء الموقع: ${error.message}`);
        }
    }

    /**
     * تحسين وتحليل SEO
     */
    async optimizeSEO(content, keywords = []) {
        try {
            const prompt = `
أنت خبير SEO متخصص. قم بتحليل وتحسين المحتوى التالي:

المحتوى:
${content.substring(0, 3000)}...

الكلمات المفتاحية: ${keywords.join(', ')}

قم بـ:
1. تحليل نقاط القوة والضعف
2. اقتراح تحسينات للـ SEO
3. اقتراح كلمات مفتاحية إضافية
4. تحسين الهيكل والعناوين
5. اقتراح وصف Meta مثالي

قدم النتيجة كـ JSON بالتنسيق:
{
    "score": "X/10",
    "improvements": ["تحسين 1", "تحسين 2"],
    "meta_title": "العنوان المقترح",
    "meta_description": "الوصف المقترح",
    "keywords_suggested": ["كلمة 1", "كلمة 2"],
    "structure_advice": "نصائح للهيكل"
}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // استخراج JSON من النتيجة
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return { raw: text };
            
        } catch (error) {
            console.error('❌ خطأ في تحسين SEO:', error);
            throw error;
        }
    }

    /**
     * توليد محتوى ذكي
     */
    async generateContent(topic, options = {}) {
        try {
            const {
                length = 'medium', // short, medium, long
                tone = 'professional', // casual, professional, friendly
                language = 'arabic',
                targetAudience = 'عامة الناس'
            } = options;

            const prompt = `
أنت كاتب محتوى محترف. قم بكتابة محتوى حول الموضوع التالي:

الموضوع: ${topic}
الطول: ${length}
النبرة: ${tone}
اللغة: ${language}
الجمهور المستهدف: ${targetAudience}

المطلوب:
1. عنوان جذاب
2. مقدمة شيقة
3. محتوى رئيسي منظم
4. خاتمة ملخصة
5. دعوة للعمل (Call to Action)

قدم النتيجة كـ JSON:
{
    "title": "العنوان",
    "introduction": "المقدمة",
    "sections": [
        {"heading": "عنوان القسم", "content": "محتوى القسم"},
        {"heading": "عنوان القسم", "content": "محتوى القسم"}
    ],
    "conclusion": "الخاتمة",
    "cta": "دعوة للعمل",
    "meta_description": "وصف مختصر للمحركات"
}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return { content: text };
            
        } catch (error) {
            console.error('❌ خطأ في توليد المحتوى:', error);
            throw error;
        }
    }

    /**
     * إنشاء أكواد مخصصة
     */
    async generateCode(requirement, language = 'javascript') {
        try {
            const prompt = `
أنت مبرمج خبير في ${language}. قم بإنشاء كود بناءً على المتطلبات التالية:

المتطلبات: ${requirement}
اللغة: ${language}

المطلوب:
1. كود نظيف ومعلق
2. شرح لكيفية العمل
3. أمثلة للاستخدام
4. أفضل الممارسات
5. معالجة الأخطاء المحتملة

قدم النتيجة كـ:
=== CODE ===
[الكود هنا]
=== EXPLANATION ===
[الشرح هنا]
=== USAGE ===
[أمثلة الاستخدام]
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseCodeOutput(text);
            
        } catch (error) {
            console.error('❌ خطأ في توليد الكود:', error);
            throw error;
        }
    }

    /**
     * تحليل صورة وتحويلها لوصف
     */
    async describeImage(imageBase64, mimeType = 'image/jpeg') {
        try {
            const prompt = "صِف هذه الصورة بدقة لاستخدامها كوصف بديل (alt text) في موقع ويب. قدم وصفاً مفصلاً.";
            
            const imagePart = {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            };

            const result = await this.model.generateContent([prompt, imagePart]);
            const response = await result.response;
            
            return {
                description: response.text(),
                alt_text: response.text().substring(0, 150) + '...'
            };
            
        } catch (error) {
            console.error('❌ خطأ في وصف الصورة:', error);
            throw error;
        }
    }

    /**
     * تحليل واستخراج بيانات من وصف
     */
    async extractBusinessInfo(description) {
        try {
            const prompt = `
استخرج المعلومات التالية من الوصف أدناه:

الوصف: ${description}

استخرج:
1. نوع النشاط
2. الخدمات/المنتجات
3. الجمهور المستهدف
4. نقاط البيع الفريدة
5. نبرة التواصل المناسبة
6. كلمات مفتاحية مقترحة

قدم النتيجة كـ JSON:
{
    "business_type": "نوع النشاط",
    "services": ["خدمة 1", "خدمة 2"],
    "target_audience": "الجمهور المستهدف",
    "unique_selling_points": ["نقطة 1", "نقطة 2"],
    "communication_tone": "النبرة",
    "suggested_keywords": ["كلمة 1", "كلمة 2"]
}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return { extracted: text };
            
        } catch (error) {
            console.error('❌ خطأ في استخراج المعلومات:', error);
            throw error;
        }
    }

    /**
     * دمج وتلخيص محتوى
     */
    async summarizeContent(content, maxLength = 500) {
        try {
            const prompt = `
لخص المحتوى التالي في ${maxLength} كلمة أو أقل مع الحفاظ على الأفكار الرئيسية:

${content.substring(0, 10000)}

قدم:
1. ملخص مختصر
2. النقاط الرئيسية
3. الكلمات المفتاحية
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            return response.text();
            
        } catch (error) {
            console.error('❌ خطأ في تلخيص المحتوى:', error);
            throw error;
        }
    }

    /**
     * تحويل النص لتعليمات برمجية
     */
    async textToComponents(text, framework = 'react') {
        try {
            const prompt = `
حول الوصف التالي إلى مكونات ${framework}:

${text}

المطلوب:
1. هيكل المكونات
2. الـ Props المطلوبة
3. الـ State إذا لزم الأمر
4. الـ Styling باستخدام Tailwind CSS
5. أمثلة للاستخدام
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            
            return response.text();
            
        } catch (error) {
            console.error('❌ خطأ في تحويل النص لمكونات:', error);
            throw error;
        }
    }

    // ===== وظائف مساعدة =====

    /**
     * تحليل إخراج الموقع
     */
    parseWebsiteOutput(text) {
        const sections = {
            html: '',
            css: '',
            js: '',
            notes: ''
        };

        const patterns = {
            html: /=== HTML ===\s*([\s\S]*?)(?=\n===|$)/i,
            css: /=== CSS ===\s*([\s\S]*?)(?=\n===|$)/i,
            js: /=== JS ===\s*([\s\S]*?)(?=\n===|$)/i,
            notes: /=== NOTES ===\s*([\s\S]*?)(?=\n===|$)/i
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match && match[1]) {
                sections[key] = match[1].trim();
            }
        }

        // إذا لم يجد التنسيق، يحاول استخراج بأسلوب آخر
        if (!sections.html && !sections.css && !sections.js) {
            sections.html = text;
        }

        return sections;
    }

    /**
     * تحليل إخراج الكود
     */
    parseCodeOutput(text) {
        const sections = {
            code: '',
            explanation: '',
            usage: ''
        };

        const patterns = {
            code: /=== CODE ===\s*([\s\S]*?)(?=\n===|$)/i,
            explanation: /=== EXPLANATION ===\s*([\s\S]*?)(?=\n===|$)/i,
            usage: /=== USAGE ===\s*([\s\S]*?)(?=\n===|$)/i
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match && match[1]) {
                sections[key] = match[1].trim();
            }
        }

        return sections;
    }

    /**
     * التحقق من صحة API Key
     */
    async validateAPIKey() {
        try {
            const testPrompt = "أجب بـ 'OK' فقط";
            const result = await this.model.generateContent(testPrompt);
            await result.response;
            return true;
        } catch (error) {
            console.error('❌ مفتاح API غير صالح:', error.message);
            return false;
        }
    }

    /**
     * حساب التكلفة التقريبية (توكن)
     */
    estimateTokens(text) {
        // تقريب: 1 token ≈ 4 حروف إنجليزية، 2-3 حروف عربية
        return Math.ceil(text.length / 3);
    }
}

// تصدير Singleton
module.exports = new GeminiFlash();
