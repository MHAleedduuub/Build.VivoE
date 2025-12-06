const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // المعلومات الأساسية
  username: {
    type: String,
    unique: true,
    trim: true,
    minlength: [3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل']
  },
  
  // المعلومات الشخصية
  firstName: String,
  lastName: String,
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'السيرة الذاتية يجب ألا تتجاوز 500 حرف']
  },
  
  // OAuth
  googleId: String,
  githubId: String,
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  
  // الأدوار والصلاحيات
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // الإعدادات
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'ar'
    },
    notifications: {
      email: { type: Boolean, default: true },
      siteUpdates: { type: Boolean, default: true }
    }
  },
  
  // الإحصائيات
  stats: {
    sitesCreated: { type: Number, default: 0 },
    sitesPublished: { type: Number, default: 0 },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 }
  },
  
  // التوكنات
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // التواريخ
  lastActive: Date,
  emailVerifiedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// العلاقات الافتراضية
userSchema.virtual('sites', {
  ref: 'Site',
  localField: '_id',
  foreignField: 'user'
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// تحديث آخر نشاط
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// إنشاء توكن إعادة تعيين كلمة المرور
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 دقائق
  
  return resetToken;
};

// التحقق من صلاحية التوكن
userSchema.methods.checkResetToken = function(token) {
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return hashedToken === this.resetPasswordToken && 
         this.resetPasswordExpire > Date.now();
};

module.exports = mongoose.model('User', userSchema);
