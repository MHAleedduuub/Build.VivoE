#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class VercelDeployer {
  constructor() {
    this.token = process.env.VERCEL_TOKEN;
    this.teamId = process.env.VERCEL_TEAM_ID;
    this.projectId = process.env.VERCEL_PROJECT_ID;
    
    this.api = axios.create({
      baseURL: 'https://api.vercel.com',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async deploy(directory = 'dist', projectName = null) {
    try {
      console.log('🚀 بدء عملية النشر على Vercel...');
      
      // 1. التحقق من وجود الملفات
      const distPath = path.join(process.cwd(), directory);
      if (!fs.existsSync(distPath)) {
        throw new Error(`المجلد ${directory} غير موجود`);
      }
      
      // 2. إنشاء مشروع جديد إذا لزم الأمر
      const project = await this.createOrGetProject(projectName);
      
      // 3. رفع الملفات
      const deployment = await this.uploadFiles(project.id, distPath);
      
      // 4. انتظار اكتمال النشر
      await this.waitForDeployment(deployment.id);
      
      console.log('✅ تم النشر بنجاح!');
      console.log(`🌐 الرابط: ${deployment.url}`);
      
      return deployment;
      
    } catch (error) {
      console.error('❌ خطأ في النشر:', error.message);
      process.exit(1);
    }
  }

  async createOrGetProject(name) {
    try {
      // محاولة الحصول على المشروع الحالي
      const response = await this.api.get('/v9/projects', {
        params: { teamId: this.teamId }
      });
      
      const projects = response.data.projects;
      const existingProject = projects.find(p => p.name === name);
      
      if (existingProject) {
        console.log(`📁 استخدام المشروع الحالي: ${existingProject.name}`);
        return existingProject;
      }
      
      // إنشاء مشروع جديد
      console.log(`🆕 إنشاء مشروع جديد: ${name}`);
      const createResponse = await this.api.post('/v9/projects', {
        name: name,
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: '.next',
        publicSource: false,
        teamId: this.teamId
      });
      
      return createResponse.data;
      
    } catch (error) {
      throw new Error(`فشل في إنشاء/الحصول على المشروع: ${error.message}`);
    }
  }

  async uploadFiles(projectId, directory) {
    try {
      console.log('📤 رفع الملفات...');
      
      const formData = new FormData();
      
      // إضافة جميع الملفات
      this.addFilesToFormData(formData, directory, '');
      
      // إعدادات النشر
      formData.append('projectId', projectId);
      formData.append('target', 'production');
      formData.append('name', projectId);
      
      const response = await this.api.post('/v13/deployments', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      return response.data;
      
    } catch (error) {
      throw new Error(`فشل في رفع الملفات: ${error.message}`);
    }
  }

  addFilesToFormData(formData, directory, relativePath) {
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // تجاهل بعض المجلدات
        if (!['node_modules', '.git'].includes(item)) {
          this.addFilesToFormData(formData, fullPath, path.join(relativePath, item));
        }
      } else {
        // إضافة الملف
        const filePath = path.join(relativePath, item);
        const fileContent = fs.readFileSync(fullPath);
        
        formData.append('file', fileContent, filePath);
        console.log(`   📄 ${filePath}`);
      }
    });
  }

  async waitForDeployment(deploymentId, interval = 3000, maxAttempts = 60) {
    console.log('⏳ انتظار اكتمال النشر...');
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.api.get(`/v13/deployments/${deploymentId}`);
        const deployment = response.data;
        
        console.log(`   الحالة: ${deployment.readyState} (${attempt + 1}/${maxAttempts})`);
        
        if (deployment.readyState === 'READY') {
          return deployment;
        } else if (deployment.readyState === 'ERROR') {
          throw new Error('فشل النشر على Vercel');
        } else if (deployment.readyState === 'CANCELED') {
          throw new Error('تم إلغاء النشر');
        }
        
        // الانتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, interval));
        
      } catch (error) {
        if (error.response?.status === 404 && attempt < 5) {
          // النشر قد لا يكون جاهزاً بعد
          await new Promise(resolve => setTimeout(resolve, interval));
          continue;
        }
        throw error;
      }
    }
    
    throw new Error('انتهى وقت انتظار النشر');
  }
}

// تشغيل السكربت
const deployer = new VercelDeployer();
const args = process.argv.slice(2);
const directory = args[0] || 'dist';
const projectName = args[1] || `website-${Date.now()}`;

deployer.deploy(directory, projectName)
  .then(deployment => {
    console.log('\n🎉 تم النشر بنجاح!');
    console.log(`🔗 رابط الإنتاج: ${deployment.url}`);
    
    // حفظ معلومات النشر
    const deployInfo = {
      deploymentId: deployment.id,
      url: deployment.url,
      projectId: deployment.projectId,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'vercel-deploy.json'),
      JSON.stringify(deployInfo, null, 2)
    );
    
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 فشل النشر:', error.message);
    process.exit(1);
  });
