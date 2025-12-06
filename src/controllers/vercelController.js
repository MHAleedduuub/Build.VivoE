const axios = require('axios');
const Site = require('../models/Site');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class VercelController {
  constructor() {
    this.vercelApi = axios.create({
      baseURL: process.env.VERCEL_API_URL || 'https://api.vercel.com',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // نشر موقع على Vercel
  async deploySite(req, res) {
    try {
      const { siteId } = req.params;
      const { projectName, domain } = req.body;

      // الحصول على الموقع
      const site = await Site.findOne({
        _id: siteId,
        user: req.user._id
      });

      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'الموقع غير موجود'
        });
      }

      // تحديث حالة النشر
      site.vercel.deploymentStatus = 'pending';
      site.vercel.lastDeployed = new Date();
      await site.save();

      // إنشاء ملفات الموقع
      const siteFiles = this.createSiteFiles(site);

      // إنشاء مشروع في Vercel
      const project = await this.createProject(projectName || site.slug);

      // رفع الملفات
      const deployment = await this.createDeployment(project.id, siteFiles);

      // تحديث معلومات Vercel في قاعدة البيانات
      site.vercel = {
        deploymentId: deployment.id,
        deploymentUrl: deployment.url,
        projectId: project.id,
        domain: domain || deployment.url,
        deploymentStatus: 'building',
        lastDeployed: new Date()
      };

      await site.save();

      // تحديث حالة الموقع
      site.status = 'published';
      await site.save();

      // تحديث إحصائيات المستخدم
      await require('../models/User').findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.sitesPublished': 1 }
      });

      res.json({
        success: true,
        message: 'جاري نشر الموقع على Vercel',
        data: {
          deploymentId: deployment.id,
          url: deployment.url,
          status: deployment.readyState,
          projectId: project.id
        }
      });

    } catch (error) {
      console.error('❌ خطأ في النشر على Vercel:', error);
      
      // تحديث حالة الخطأ
      if (siteId) {
        await Site.findByIdAndUpdate(siteId, {
          'vercel.deploymentStatus': 'error'
        });
      }

      res.status(500).json({
        success: false,
        message: 'حدث خطأ في نشر الموقع',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // إنشاء مشروع في Vercel
  async createProject(projectName) {
    try {
      const response = await this.vercelApi.post('/v9/projects', {
        name: projectName,
        framework: 'static',
        publicSource: false
      });

      return response.data;
    } catch (error) {
      console.error('❌ خطأ في إنشاء المشروع:', error.response?.data || error.message);
      throw new Error('فشل في إنشاء مشروع Vercel');
    }
  }

  // إنشاء نشر
  async createDeployment(projectId, files) {
    try {
      const formData = new FormData();

      // إضافة ملفات
      files.forEach(file => {
        formData.append('file', file.content, file.name);
      });

      // إعدادات النشر
      formData.append('projectId', projectId);
      formData.append('target', 'production');
      formData.append('name', projectId);

      const response = await this.vercelApi.post('/v13/deployments', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ خطأ في إنشاء النشر:', error.response?.data || error.message);
      throw new Error('فشل في إنشاء نشر Vercel');
    }
  }

  // إنشاء ملفات الموقع
  createSiteFiles(site) {
    const files = [];

    // ملف HTML الرئيسي
    files.push({
      name: 'index.html',
      content: Buffer.from(this.generateCompleteHTML(site))
    });

    // ملف CSS
    if (site.content.css) {
      files.push({
        name: 'style.css',
        content: Buffer.from(site.content.css)
      });
    }

    // ملف JavaScript
    if (site.content.js) {
      files.push({
        name: 'script.js',
        content: Buffer.from(site.content.js)
      });
    }

    // ملف التكوين لـ Vercel
    files.push({
      name: 'vercel.json',
      content: Buffer.from(JSON.stringify({
        version: 2,
        builds: [
          { src: '*.html', use: '@vercel/static' },
          { src: '*.css', use: '@vercel/static' },
          { src: '*.js', use: '@vercel/static' }
        ],
        routes: [
          { src: '/(.*)', dest: '/index.html' }
        ]
      }, null, 2))
    });

    return files;
  }

  // توليد HTML كامل
  generateCompleteHTML(site) {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${site.settings.seo?.title || site.name}</title>
    <meta name="description" content="${site.settings.seo?.description || site.description}">
    <meta name="keywords" content="${site.settings.seo?.keywords?.join(', ') || ''}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        ${site.content.css || ''}
        
        /* أنماط إضافية */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 0 10px;
            }
        }
    </style>
    ${site.settings.analytics?.googleAnalyticsId ? `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${site.settings.analytics.googleAnalyticsId}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${site.settings.analytics.googleAnalyticsId}');
    </script>
    ` : ''}
    
    ${site.settings.analytics?.facebookPixelId ? `
    <!-- Facebook Pixel -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${site.settings.analytics.facebookPixelId}');
        fbq('track', 'PageView');
    </script>
    ` : ''}
</head>
<body>
    ${site.content.html || '<h1>مرحباً بكم في موقعي</h1>'}
    
    <script>
        ${site.content.js || ''}
        
        // إدارة الأحداث
        document.addEventListener('DOMContentLoaded', function() {
            console.log('تم تحميل الموقع بنجاح!');
            
            // تحديث عدد المشاهدات
            fetch('/api/site/${site._id}/view', { method: 'POST' });
        });
    </script>
</body>
</html>
    `;
  }

  // الحصول على حالة النشر
  async getDeploymentStatus(req, res) {
    try {
      const { deploymentId } = req.params;

      const response = await this.vercelApi.get(`/v13/deployments/${deploymentId}`);

      // تحديث حالة النشر في قاعدة البيانات
      await Site.findOneAndUpdate(
        { 'vercel.deploymentId': deploymentId },
        {
          'vercel.deploymentStatus': response.data.readyState,
          'vercel.deploymentUrl': response.data.url
        }
      );

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      console.error('❌ خطأ في الحصول على حالة النشر:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في الحصول على حالة النشر'
      });
    }
  }

  // الحصول على جميع النشرات
  async getDeployments(req, res) {
    try {
      const response = await this.vercelApi.get('/v6/deployments', {
        params: {
          limit: 20,
          projectId: process.env.VERCEL_PROJECT_ID
        }
      });

      res.json({
        success: true,
        data: response.data.deployments
      });

    } catch (error) {
      console.error('❌ خطأ في الحصول على النشرات:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في الحصول على النشرات'
      });
    }
  }

  // إضافة نطاق مخصص
  async addDomain(req, res) {
    try {
      const { siteId } = req.params;
      const { domain } = req.body;

      const site = await Site.findOne({
        _id: siteId,
        user: req.user._id
      });

      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'الموقع غير موجود'
        });
      }

      // إضافة النطاق في Vercel
      const response = await this.vercelApi.post(`/v9/projects/${site.vercel.projectId}/domains`, {
        name: domain
      });

      // تحديث النطاق في قاعدة البيانات
      site.vercel.domain = domain;
      await site.save();

      res.json({
        success: true,
        message: 'تم إضافة النطاق بنجاح',
        data: response.data
      });

    } catch (error) {
      console.error('❌ خطأ في إضافة النطاق:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إضافة النطاق'
      });
    }
  }

  // إعادة النشر
  async redeploySite(req, res) {
    try {
      const { siteId } = req.params;

      const site = await Site.findOne({
        _id: siteId,
        user: req.user._id
      });

      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'الموقع غير موجود'
        });
      }

      // إنشاء نشر جديد
      const siteFiles = this.createSiteFiles(site);
      const deployment = await this.createDeployment(site.vercel.projectId, siteFiles);

      // تحديث معلومات النشر
      site.vercel.deploymentId = deployment.id;
      site.vercel.deploymentUrl = deployment.url;
      site.vercel.deploymentStatus = 'building';
      site.vercel.lastDeployed = new Date();
      await site.save();

      res.json({
        success: true,
        message: 'جاري إعادة نشر الموقع',
        data: {
          deploymentId: deployment.id,
          url: deployment.url
        }
      });

    } catch (error) {
      console.error('❌ خطأ في إعادة النشر:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إعادة نشر الموقع'
      });
    }
  }

  // حذف النشر
  async deleteDeployment(req, res) {
    try {
      const { deploymentId } = req.params;

      await this.vercelApi.delete(`/v13/deployments/${deploymentId}`);

      // تحديث حالة الموقع في قاعدة البيانات
      await Site.findOneAndUpdate(
        { 'vercel.deploymentId': deploymentId },
        {
          'vercel.deploymentStatus': 'canceled',
          status: 'archived'
        }
      );

      res.json({
        success: true,
        message: 'تم حذف النشر بنجاح'
      });

    } catch (error) {
      console.error('❌ خطأ في حذف النشر:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في حذف النشر'
      });
    }
  }
}

module.exports = new VercelController();
