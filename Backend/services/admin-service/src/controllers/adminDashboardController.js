const User = require('../models/User');
const Flipbook = require('../models/Flipbook');
const ForumPost = require('../models/ForumPost');
const AdminLog = require('../models/AdminLog');
const http = require('http');

// Helper to ping microservice health
const pingService = (url) => {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = http.get(
        {
          hostname: parsed.hostname,
          port: parsed.port,
          path: '/health',
          timeout: 2000
        },
        (res) => {
          resolve({
            status: res.statusCode === 200 ? 'ONLINE' : 'DEGRADED',
            statusCode: res.statusCode
          });
        }
      );

      req.on('error', (err) => {
        resolve({ status: 'OFFLINE', error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ status: 'INVALID_URL', error: e.message });
    }
  });
};

/**
 * 1. Global Admin Dashboard Overview
 * GET /api/admin/dashboard/overview
 */
const getDashboardOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminCount,
      totalFlipbooks,
      totalForumPosts,
      unansweredForumPosts,
      recentUsers,
      recentLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'admin' }),
      Flipbook.countDocuments(),
      ForumPost.countDocuments(),
      ForumPost.countDocuments({ status: { $in: ['awaiting_admin', 'under_review'] } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password').lean(),
      AdminLog.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    // Aggregate storage & views across flipbooks
    const flipbookStats = await Flipbook.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalBytes: { $sum: '$fileSize' }
        }
      }
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminCount
      },
      flipbooks: {
        total: totalFlipbooks,
        totalViews: flipbookStats[0]?.totalViews || 0,
        totalLikes: flipbookStats[0]?.totalLikes || 0,
        totalBytes: flipbookStats[0]?.totalBytes || 0,
        totalMB: Number(((flipbookStats[0]?.totalBytes || 0) / (1024 * 1024)).toFixed(2))
      },
      forum: {
        totalPosts: totalForumPosts,
        unanswered: unansweredForumPosts
      },
      recentUsers,
      recentLogs
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('[AdminDashboardController - getDashboardOverview] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics', error: error.message });
  }
};

/**
 * 2. Real-time Microservices Health
 * GET /api/admin/dashboard/services-health
 */
const getMicroservicesHealth = async (req, res) => {
  try {
    const services = [
      { name: 'api-gateway', port: 8000, url: 'http://127.0.0.1:8000' },
      { name: 'auth-service', port: 5001, url: 'http://127.0.0.1:5001' },
      { name: 'myflipibook-service', port: 5002, url: 'http://127.0.0.1:5002' },
      { name: 'page-editor-service', port: 5003, url: 'http://127.0.0.1:5003' },
      { name: 'pdf-editor-service', port: 5004, url: 'http://127.0.0.1:5004' },
      { name: 'customized-editor-service', port: 5005, url: 'http://127.0.0.1:5005' },
      { name: 'threed-editor-service', port: 5006, url: 'http://127.0.0.1:5006' },
      { name: 'payment-services', port: 5007, url: 'http://127.0.0.1:5007' },
      { name: 'user-service', port: 5008, url: 'http://127.0.0.1:5008' },
      { name: 'admin-service', port: 5009, url: 'http://127.0.0.1:5009' }
    ];

    const results = await Promise.all(
      services.map(async (svc) => {
        if (svc.name === 'admin-service') {
          return { ...svc, status: 'ONLINE', latencyMs: 0 };
        }
        const start = Date.now();
        const ping = await pingService(svc.url);
        return {
          ...svc,
          status: ping.status,
          latencyMs: Date.now() - start
        };
      })
    );

    res.json({
      success: true,
      timestamp: new Date(),
      services: results
    });
  } catch (error) {
    console.error('[AdminDashboardController - getMicroservicesHealth] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to inspect services', error: error.message });
  }
};

/**
 * 3. Query Audit Logs
 * GET /api/admin/dashboard/logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetType } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AdminLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      AdminLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs
    });
  } catch (error) {
    console.error('[AdminDashboardController - getAuditLogs] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getMicroservicesHealth,
  getAuditLogs
};
