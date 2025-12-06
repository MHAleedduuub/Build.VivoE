const express = require('express');
const router = express.Router();
const vercelController = require('../controllers/vercelController');
const auth = require('../middleware/auth');

// جميع الروابط تتطلب تسجيل دخول
router.use(auth.isAuthenticated);

// نشر موقع
router.post('/deploy/:siteId', vercelController.deploySite);

// إعادة نشر
router.post('/redeploy/:siteId', vercelController.redeploySite);

// الحصول على حالة النشر
router.get('/deployment/:deploymentId/status', vercelController.getDeploymentStatus);

// الحصول على جميع النشرات
router.get('/deployments', vercelController.getDeployments);

// إضافة نطاق مخصص
router.post('/domain/:siteId', vercelController.addDomain);

// حذف النشر
router.delete('/deployment/:deploymentId', vercelController.deleteDeployment);

module.exports = router;
