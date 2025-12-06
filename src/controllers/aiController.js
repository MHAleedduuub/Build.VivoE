const geminiService = require('../config/gemini');
const Site = require('../models/Site');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class AIController {
  // إنشاء موقع بالذكاء الاصطناعي
  async generateWebsite(req, res) {
    try {
      const { prompt, type, style, colors, pages } = req.body;
      
      // التحقق من البيانات
      if (!prompt || prompt.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'يرجى تقديم وصف مفصل للموقع (10 أحرف على الأقل)'
        });
      }

      // استخدام Gemini AI
      const websiteData = await geminiService.generateWebsite(prompt, {
        type: type || 'business',
        style: style || 'modern',
        colors: colors || ['#3B82F6', '#1E40AF'],
        pages: pages || ['home', 'about', 'contact']
      });

      // إنشاء الموقع في قاعدة البيانات
      const site = new Site({
        name: `موقع ${new Date().toLocaleDateString('ar-SA')}`,
        description: `موقع تم إنشاؤه بواسطة الذكاء الاصطناعي بناءً على: ${prompt.substring(0, 100)}...`,
        user: req.user._id,
        content: {
          html: websiteData.html,
          css: websiteData.css,
          js: websiteData.js
        },
        aiGenerated: true,
        aiPrompt: prompt,
        aiModel: process.env.GEMINI_MODEL,
        versions: [{
          version: 1,
          content: {
            html: websiteData.html,
            css: websiteData.css,
            js: websiteData.js
          },
          note: 'النسخة الأولية من الذكاء الاصطناعي'
        }]
      });

      await site.save();

      // تحديث إحصائيات المستخدم
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.sitesCreated': 1 }
      });

      res.json({
        success: true,
        message: 'تم إنشاء الموقع بنجاح',
        data: {
          siteId: site._id,
          html: websiteData.html,
          css: websiteData.css,
          js: websiteData.js,
          raw: websiteData.raw
        }
      });

    } catch (error) {
      console.error('❌ خطأ في إنشاء الموقع:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إنشاء الموقع',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // تحسين المحتوى
  async optimizeContent(req, res) {
    try {
      const { content, target, language } = req.body;

      const prompt = `
        قم بتحسين هذا المحتوى ليكون ${target} باللغة ${language || 'arabic'}:
        
        ${content}
        
        قدم النتيجة المحسنة مع شرح التغييرات التي أجريتها.
      `;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;
      const optimizedContent = response.text();

      res.json({
        success: true,
        data: {
          original: content,
          optimized: optimizedContent,
          changes: "تم تحسين المحتوى ليكون أكثر جاذبية وفعالية"
        }
      });

    } catch (error) {
      console.error('❌ خطأ في تحسين المحتوى:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحسين المحتوى'
      });
    }
  }

  // اقتراح تحسينات SEO
  async suggestSEO(req, res) {
    try {
      const { title, content, keywords } = req.body;

      const prompt = `
        بصفتك خبير SEO، قم بتحليل هذا المحتوى واقترح تحسينات:
        
        العنوان: ${title}
        المحتوى: ${content.substring(0, 2000)}...
        الكلمات المفتاحية: ${keywords ? keywords.join(', ') : 'غير محددة'}
        
        قدم اقتراحات لـ:
        1. تحسين العنوان
        2. وصف Meta
        3. هيكلة المحتوى
        4. الكلمات المفتاحية الإضافية
        5. نصائح عامة للSEO
        
        قدم النتيجة كـ JSON.
      `;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;
      const seoSuggestions = response.text();

      // محاولة استخراج JSON
      try {
        const jsonMatch = seoSuggestions.match(/\{[\s\S]*\}/);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: seoSuggestions };

        res.json({
          success: true,
          data: suggestions
        });
      } catch (parseError) {
        res.json({
          success: true,
          data: { raw: seoSuggestions }
        });
      }

    } catch (error) {
      console.error('❌ خطأ في اقتراح SEO:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في اقتراح تحسينات SEO'
      });
    }
  }

  // توليد محتوى تلقائي
  async generateContent(req, res) {
    try {
      const { topic, tone, length, language } = req.body;

      const content = await geminiService.generateContent(topic, {
        tone: tone || 'professional',
        length: length || 'medium',
        language: language || 'arabic'
      });

      res.json({
        success: true,
        data: content
      });

    } catch (error) {
      console.error('❌ خطأ في توليد المحتوى:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في توليد المحتوى'
      });
    }
  }

  // تحليل الصور
  async analyzeImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'لم يتم تحميل صورة'
        });
      }

      const description = await geminiService.generateImageDescription(req.file.buffer);

      res.json({
        success: true,
        data: {
          filename: req.file.originalname,
          description: description,
          altText: description.substring(0, 150) + '...',
          size: req.file.size,
          mimeType: req.file.mimetype
        }
      });

    } catch (error) {
      console.error('❌ خطأ في تحليل الصورة:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحليل الصورة'
      });
    }
  }

  // توليد أكواد مخصصة
  async generateCode(req, res) {
    try {
      const { requirements, language, framework } = req.body;

      const prompt = `
        بصفتك مبرمج محترف، قم بإنشاء كود ${language} ${framework ? `باستخدام ${framework}` : ''}:
        
        المتطلبات: ${requirements}
        
        قدم الكود مع:
        1. شرح للكود
        2. كيفية الاستخدام
        3. أي اعتبارات مهمة
      `;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;
      const code = response.text();

      res.json({
        success: true,
        data: {
          code: code,
          language: language,
          framework: framework,
          requirements: requirements
        }
      });

    } catch (error) {
      console.error('❌ خطأ في توليد الكود:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في توليد الكود'
      });
    }
  }
}

module.exports = new AIController();
