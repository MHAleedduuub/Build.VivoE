const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = {
  // التحقق من تسجيل الدخول
  isAuthenticated: (req, res, next) => {
    try {
      if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
      }

      // التحقق من التوكن في Header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة'
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى'
      });
    }
  },

  // التحقق من دور المستخدم
  hasRole: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'يجب تسجيل الدخول'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بالوصول إلى هذه الصفحة'
        });
      }

      next();
    };
  },

  // التحقق من ملكية الموقع
  isSiteOwner: async (req, res, next) => {
    try {
      const siteId = req.params.siteId || req.body.siteId;
      
      if (!siteId) {
        return res.status(400).json({
          success: false,
          message: 'معرف الموقع مطلوب'
        });
      }

      const Site = require('../models/Site');
      const site = await Site.findOne({
        _id: siteId,
        user: req.user._id
      });

      if (!site) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى هذا الموقع'
        });
      }

      req.site = site;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في التحقق من الصلاحية'
      });
    }
  },

  // إنشاء توكن JWT
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },

  // التحقق من التوكن
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // تحديث التوكن
  refreshToken: (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'توكن التحديث مطلوب'
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const newToken = auth.generateToken(decoded);

      res.json({
        success: true,
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'توكن التحديث غير صالح'
      });
    }
  }
};

module.exports = auth;
