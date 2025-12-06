const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  // المعلومات الأساسية
  name: {
    type: String,
    required: [true, 'اسم الموقع مطلوب'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'الوصف يجب ألا يتجاوز 500 حرف']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // المالك
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // المحتوى
  content: {
    html: String,
    css: String,
    js: String,
    assets: [{
      type: { type: String, enum: ['image', 'font', 'icon', 'file'] },
      url: String,
      name: String,
      size: Number
    }]
  },
  
  // الإعدادات
  settings: {
    theme: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#1E40AF' },
      fontFamily: { type: String, default: 'Inter, sans-serif' },
      darkMode: { type: Boolean, default: false }
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String
    },
    analytics: {
      googleAnalyticsId: String,
      facebookPixelId: String
    },
    social: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },
  
  // حالة النشر
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Vercel
  vercel: {
    deploymentId: String,
    deploymentUrl: String,
    projectId: String,
    domain: String,
    deploymentStatus: {
      type: String,
      enum: ['pending', 'building', 'ready', 'error', 'canceled'],
      default: 'pending'
    },
    lastDeployed: Date
  },
  
  // الإحصائيات
  stats: {
    views: { type: Number, default: 0 },
    visitors: { type: Number, default: 0 },
    lastViewed: Date
  },
  
  // النسخ الاحتياطي
  versions: [{
    version: Number,
    content: {
      html: String,
      css: String,
      js: String
    },
    createdAt: { type: Date, default: Date.now },
    note: String
  }],
  
  // الذكاء الاصطناعي
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String,
  aiModel: String,
  
  // التواريخ
  publishedAt: Date,
  expiresAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// إنشاء slug قبل الحفظ
siteSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  }
  next();
});

// تحديث آخر مشاهدات
siteSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.stats.lastViewed = new Date();
  return this.save();
};

// إنشاء نسخة احتياطية
siteSchema.methods.createBackup = function(note = '') {
  const latestVersion = this.versions.length > 0 ? 
    Math.max(...this.versions.map(v => v.version)) : 0;
  
  this.versions.push({
    version: latestVersion + 1,
    content: {
      html: this.content.html,
      css: this.content.css,
      js: this.content.js
    },
    note
  });
  
  return this.save();
};

// استعادة نسخة
siteSchema.methods.restoreVersion = function(versionNumber) {
  const version = this.versions.find(v => v.version === versionNumber);
  if (!version) {
    throw new Error('النسخة غير موجودة');
  }
  
  this.content.html = version.content.html;
  this.content.css = version.content.css;
  this.content.js = version.content.js;
  
  this.versions.push({
    version: this.versions.length + 1,
    content: {
      html: this.content.html,
      css: this.content.css,
      js: this.content.js
    },
    note: `استعادة من النسخة ${versionNumber}`
  });
  
  return this.save();
};

module.exports = mongoose.model('Site', siteSchema);
