const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('❌ GEMINI_API_KEY غير موجود في البيئة');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro' 
    });
    this.visionModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_VISION_MODEL || 'gemini-pro-vision'
    });
  }

  async generateWebsite(prompt, options = {}) {
    try {
      const {
        type = 'business',
        style = 'modern',
        colors = ['#3B82F6', '#1E40AF'],
        pages = ['home', 'about', 'contact']
      } = options;

      const systemPrompt = `
        أنت مساعد متخصص في إنشاء مواقع ويب. 
        قم بإنشاء موقع ويب كامل بناءً على الوصف التالي:
        
        ${prompt}
        
        نوع الموقع: ${type}
        النمط: ${style}
        الألوان: ${colors.join(', ')}
        الصفحات: ${pages.join(', ')}
        
        يجب أن تقدم النتيجة كـ HTML و CSS و JavaScript متكاملة.
        استخدم Tailwind CSS للإطار.
        أضف تعليقات في الكود لتوضيح الأجزاء.
        تأكد من أن الموقع متجاوب مع جميع الشاشات.
        أضف تأثيرات تفاعلية بسيطة باستخدام JavaScript.
        
        قدم الكود في التنسيق التالي:
        HTML: [الكود هنا]
        CSS: [الكود هنا]
        JS: [الكود هنا]
      `;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      // تحليل النتيجة إلى أجزاء
      return this.parseGeneratedCode(text);
    } catch (error) {
      console.error('❌ خطأ في إنشاء الموقع:', error);
      throw new Error('فشل في إنشاء الموقع بالذكاء الاصطناعي');
    }
  }

  async generateContent(topic, options = {}) {
    try {
      const { tone = 'professional', length = 'medium', language = 'arabic' } = options;
      
      const prompt = `
        اكتب محتوى ${length} باللغة ${language} حول: ${topic}
        
        النبرة: ${tone}
        اجعل النص:
        - جذاباً وسهل القراءة
        - يحتوي على عناوين فرعية
        - يحتوي على نقاط مهمة
        - ملائماً لمحركات البحث
        - مناسب لموقع ويب
        
        قدم النتيجة كـ JSON بهذه الصورة:
        {
          "title": "العنوان الرئيسي",
          "subtitle": "العنوان الفرعي",
          "sections": [
            {
              "heading": "عنوان القسم",
              "content": "محتوى القسم هنا",
              "bullets": ["نقطة 1", "نقطة 2"]
            }
          ],
          "meta": {
            "description": "وصف للمحركات البحث",
            "keywords": ["كلمة 1", "كلمة 2"]
          }
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

      throw new Error('فشل في تحليل النتيجة');
    } catch (error) {
      console.error('❌ خطأ في إنشاء المحتوى:', error);
      throw error;
    }
  }

  async generateImageDescription(imageBuffer) {
    try {
      // في الإصدار الحقيقي، ستقوم بتحويل imageBuffer إلى تنسيق مناسب
      // هذا مثال مبسط
      const prompt = "صف هذه الصورة بالتفصيل لتستخدم في موقع ويب";
      
      // ملاحظة: تحتاج إلى تكوين رؤية Gemini للنموذج
      const result = await this.visionModel.generateContent([
        prompt,
        { inlineData: { data: imageBuffer.toString('base64'), mimeType: 'image/jpeg' } }
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ خطأ في وصف الصورة:', error);
      throw error;
    }
  }

  parseGeneratedCode(text) {
    const htmlMatch = text.match(/HTML:\s*```html\n([\s\S]*?)\n```/i) || 
                     text.match(/HTML:\s*([\s\S]*?)(?=CSS:|JS:|$)/i);
    
    const cssMatch = text.match(/CSS:\s*```css\n([\s\S]*?)\n```/i) || 
                    text.match(/CSS:\s*([\s\S]*?)(?=JS:|HTML:|$)/i);
    
    const jsMatch = text.match(/JS:\s*```javascript\n([\s\S]*?)\n```/i) || 
                   text.match(/JS:\s*([\s\S]*?)(?=HTML:|CSS:|$)/i);

    return {
      html: htmlMatch ? htmlMatch[1].trim() : '',
      css: cssMatch ? cssMatch[1].trim() : '',
      js: jsMatch ? jsMatch[1].trim() : '',
      raw: text
    };
  }
}

module.exports = new GeminiService();
