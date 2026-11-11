// Backend/services/myflipibook-service/src/analytics_tracking/analyticsController.js
const FlipbookSessionAnalytics = require("./analyticsModel");
const { extractClientIp, resolveIpLocation } = require("./geoIpService");
const { parseUserAgent } = require("./deviceService");
const Flipbook = require("../../../../shared/models/Flipbook");

/**
 * 1. Start a new viewer session
 * Called as soon as the shared flipbook is opened
 */
const recordSessionStart = async (req, res) => {
  try {
    const { v_id, shareId, sessionId, totalPages = 1, referrer = "" } = req.body;

    if ((!v_id && !shareId) || !sessionId) {
      return res.status(400).json({ success: false, message: "v_id or shareId and sessionId are required" });
    }

    // Lookup flipbook to get owner email and title
    const bookQuery = v_id ? { v_id } : {
      $or: [
        { "Customized_Settings.Visibility.shareId": shareId },
        { "Visibility.shareId": shareId },
        { shareId: shareId }
      ]
    };
    const book = await Flipbook.findOne(bookQuery).select("v_id userEmail flipbookName viewsCount views viewers").lean();
    const resolvedVid = book?.v_id || v_id || shareId;
    const userEmail = (book?.userEmail || req.body.userEmail || "").toLowerCase();
    const flipbookName = book?.flipbookName || req.body.flipbookName || "Untitled Flipbook";

    // Detect Client IP and Geographic Location
    const ip = extractClientIp(req);
    const location = resolveIpLocation(ip);

    // Detect Device & Browser
    const device = parseUserAgent(req.headers["user-agent"]);

    // Clean Referrer
    const cleanReferrer = referrer || (req.headers && req.headers["referer"]) || "Direct";

    // Create session analytics record (upsert to prevent duplicate sessions if reloaded)
    const session = await FlipbookSessionAnalytics.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: {
          v_id: resolvedVid,
          shareId: shareId || "",
          userEmail,
          flipbookName,
          sessionId,
          location,
          device,
          totalPages: Number(totalPages) || 1,
          pagesRead: [1],
          maxPageReached: 1,
          referrer: cleanReferrer,
          startedAt: new Date(),
          durationSeconds: 0,
          completed: false
        },
        $set: {
          lastHeartbeatAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Also update main Flipbook viewsCount counter if new session
    if (book) {
      try {
        await Flipbook.updateOne(
          { v_id },
          { 
            $inc: { viewsCount: 1, views: 1 },
            $addToSet: { viewers: ip }
          }
        );
      } catch (e) {
        console.warn("[Flipbook viewsCount sync warning]:", e.message);
      }
    }

    return res.status(200).json({
      success: true,
      sessionId,
      location: {
        country: location.country,
        state: location.state,
        city: location.city
      },
      device: device.type
    });
  } catch (err) {
    console.error("[Analytics recordSessionStart Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to record session start" });
  }
};

/**
 * 2. Record periodic heartbeat
 * Keeps active duration accurate and tracks reading depth
 */
const recordHeartbeat = async (req, res) => {
  try {
    const { sessionId, durationSeconds = 0, currentPage = 1 } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    const duration = Math.max(0, parseInt(durationSeconds, 10) || 0);
    const pageNum = Math.max(1, parseInt(currentPage, 10) || 1);

    await FlipbookSessionAnalytics.updateOne(
      { sessionId },
      {
        $set: {
          durationSeconds: duration,
          lastHeartbeatAt: new Date()
        },
        $addToSet: {
          pagesRead: pageNum
        },
        $max: {
          maxPageReached: pageNum
        }
      }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Analytics recordHeartbeat Error]:", err);
    return res.status(500).json({ success: false, message: "Heartbeat update failed" });
  }
};

/**
 * 3. End session (navigator.sendBeacon on tab exit or close)
 */
const recordSessionEnd = async (req, res) => {
  try {
    let payload = req.body;

    // Handle beacon payload if sent as raw text
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {}
    }

    const { sessionId, durationSeconds = 0 } = payload || {};

    if (sessionId) {
      const finalDuration = Math.max(0, parseInt(durationSeconds, 10) || 0);

      await FlipbookSessionAnalytics.updateOne(
        { sessionId },
        {
          $set: {
            durationSeconds: finalDuration,
            endedAt: new Date(),
            completed: true
          }
        }
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Analytics recordSessionEnd Error]:", err);
    return res.status(500).json({ success: false, message: "Session end recording failed" });
  }
};

/**
 * 4. Record single page flip event
 */
const recordPageFlip = async (req, res) => {
  try {
    const { sessionId, pageNumber } = req.body;
    if (!sessionId || !pageNumber) {
      return res.status(400).json({ success: false, message: "sessionId and pageNumber required" });
    }

    const pageNum = parseInt(pageNumber, 10);

    await FlipbookSessionAnalytics.updateOne(
      { sessionId },
      {
        $addToSet: { pagesRead: pageNum },
        $max: { maxPageReached: pageNum }
      }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Analytics recordPageFlip Error]:", err);
    return res.status(500).json({ success: false, message: "Page flip recording failed" });
  }
};

/**
 * 5. Get comprehensive analytics for a single flipbook
 */
const getFlipbookAnalytics = async (req, res) => {
  try {
    const { v_id } = req.params;
    const { days = 30 } = req.query;

    const daysNum = Math.min(365, Math.max(1, parseInt(days, 10) || 30));
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysNum);

    const baseFilter = { v_id };
    const dateFilter = { v_id, startedAt: { $gte: sinceDate } };

    // 1. Total Sessions (Views)
    let totalViews = await FlipbookSessionAnalytics.countDocuments(baseFilter);

    // 2. Unique IP / Viewers
    const uniqueIps = await FlipbookSessionAnalytics.distinct("location.ip", baseFilter);
    let uniqueViewers = uniqueIps.length;

    // Check if book document has views recorded prior to session analytics
    const bookDoc = await Flipbook.findOne({ v_id }).select("views viewsCount").lean();
    const staticBookViews = Number(bookDoc?.viewsCount) || Number(bookDoc?.views) || 0;
    if (totalViews === 0 && staticBookViews > 0) {
      totalViews = staticBookViews;
      uniqueViewers = Math.max(1, Math.round(staticBookViews * 0.75));
    }

    // 3. Average Duration & Completion metrics
    const durationStats = await FlipbookSessionAnalytics.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$durationSeconds" },
          totalDuration: { $sum: "$durationSeconds" },
          avgPagesRead: { $avg: { $size: "$pagesRead" } },
          avgMaxPage: { $avg: "$maxPageReached" }
        }
      }
    ]);

    const avgDuration = Math.round(durationStats[0]?.avgDuration || 0);
    const totalDuration = Math.round(durationStats[0]?.totalDuration || 0);
    const avgPagesRead = Math.round((durationStats[0]?.avgPagesRead || 1) * 10) / 10;

    // 4. Country Breakdown
    const countryStats = await FlipbookSessionAnalytics.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$location.country",
          code: { $first: "$location.countryCode" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const countries = countryStats.map(c => ({
      country: c._id || "Unknown",
      code: c.code || "",
      views: c.count,
      percentage: totalViews > 0 ? Math.round((c.count / totalViews) * 100) : 0
    }));

    // 4b. State Breakdown
    const stateStats = await FlipbookSessionAnalytics.aggregate([
      { $match: { ...baseFilter, "location.state": { $nin: ["", "Unknown"] } } },
      {
        $group: {
          _id: "$location.state",
          country: { $first: "$location.country" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const states = stateStats.map(s => ({
      state: s._id,
      country: s.country,
      views: s.count
    }));

    // 5. City Breakdown
    const cityStats = await FlipbookSessionAnalytics.aggregate([
      { $match: { ...baseFilter, "location.city": { $ne: "Unknown" } } },
      {
        $group: {
          _id: "$location.city",
          country: { $first: "$location.country" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const cities = cityStats.map(c => ({
      city: c._id,
      country: c.country,
      views: c.count
    }));

    // 6. Device Breakdown
    const deviceStats = await FlipbookSessionAnalytics.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$device.type",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const devices = deviceStats.map(d => ({
      type: d._id || "Desktop",
      views: d.count,
      percentage: totalViews > 0 ? Math.round((d.count / totalViews) * 100) : 0
    }));

    // 7. Browser Breakdown
    const browserStats = await FlipbookSessionAnalytics.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$device.browser",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const browsers = browserStats.map(b => ({
      browser: b._id || "Other",
      views: b.count
    }));

    // 8. Views Over Time (Daily)
    const dailyViews = await FlipbookSessionAnalytics.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          views: { $sum: 1 },
          avgDuration: { $avg: "$durationSeconds" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 9. Recent Visitor Sessions
    const recentSessions = await FlipbookSessionAnalytics.find(baseFilter)
      .sort({ startedAt: -1 })
      .limit(200)
      .select("sessionId v_id flipbookName location device durationSeconds maxPageReached totalPages startedAt endedAt")
      .lean();

    return res.status(200).json({
      success: true,
      v_id,
      summary: {
        totalViews,
        uniqueViewers,
        avgDurationSeconds: avgDuration,
        totalDurationSeconds: totalDuration,
        avgPagesRead
      },
      countries,
      states,
      cities,
      devices,
      browsers,
      dailyViews,
      recentSessions
    });
  } catch (err) {
    console.error("[Analytics getFlipbookAnalytics Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

/**
 * 6. Get overall analytics across all flipbooks for a user
 */
const getUserAnalytics = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { days = 30 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "userEmail is required" });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    const daysNum = Math.min(365, Math.max(1, parseInt(days, 10) || 30));
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysNum);

    const filter = {
      $or: [
        { userEmail: normalizedEmail },
        { userEmail: userEmail }
      ]
    };
    const dateFilter = {
      $and: [
        filter,
        { startedAt: { $gte: sinceDate } }
      ]
    };

    let totalViews = await FlipbookSessionAnalytics.countDocuments(filter);
    const uniqueIps = await FlipbookSessionAnalytics.distinct("location.ip", filter);
    let uniqueVisitors = uniqueIps.length;

    const stats = await FlipbookSessionAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$durationSeconds" },
          totalDuration: { $sum: "$durationSeconds" }
        }
      }
    ]);

    // Top books by views from session analytics
    let topBooks = await FlipbookSessionAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$v_id",
          flipbookName: { $first: "$flipbookName" },
          views: { $sum: 1 },
          avgDuration: { $avg: "$durationSeconds" }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 6 }
    ]);

    // Fallback/Augment with Flipbook records if session tracking is newly introduced
    const existingBooks = await Flipbook.find({
      $or: [
        { userEmail: normalizedEmail },
        { userEmail: userEmail }
      ],
      trash: { $ne: true }
    }).select("v_id flipbookName views viewsCount").lean();

    if (existingBooks.length > 0) {
      const bookViewsSum = existingBooks.reduce((sum, b) => sum + (Number(b.viewsCount) || Number(b.views) || 0), 0);
      if (totalViews < bookViewsSum) {
        totalViews = bookViewsSum;
        if (uniqueVisitors === 0) {
          uniqueVisitors = Math.max(1, Math.round(bookViewsSum * 0.7));
        }
      }

      if (topBooks.length === 0) {
        topBooks = existingBooks
          .map(b => ({
            _id: b.v_id,
            flipbookName: b.flipbookName || "Untitled",
            views: Number(b.viewsCount) || Number(b.views) || 0,
            avgDuration: 0
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 6);
      }
    }

    // Top Countries
    const topCountries = await FlipbookSessionAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$location.country",
          code: { $first: "$location.countryCode" },
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 6 }
    ]);

    // Top States
    const topStates = await FlipbookSessionAnalytics.aggregate([
      { $match: { ...filter, "location.state": { $nin: ["", "Unknown"] } } },
      {
        $group: {
          _id: "$location.state",
          country: { $first: "$location.country" },
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 6 }
    ]);

    // Devices
    const devices = await FlipbookSessionAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$device.type",
          views: { $sum: 1 }
        }
      }
    ]);

    // Daily views across all books
    const dailyViews = await FlipbookSessionAnalytics.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          views: { $sum: 1 },
          avgDuration: { $avg: "$durationSeconds" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent visitor sessions across all books
    const recentSessions = await FlipbookSessionAnalytics.find(filter)
      .sort({ startedAt: -1 })
      .limit(200)
      .select("sessionId v_id flipbookName location device durationSeconds maxPageReached totalPages startedAt endedAt")
      .lean();

    return res.status(200).json({
      success: true,
      userEmail,
      totalViews,
      uniqueVisitors,
      avgDurationSeconds: Math.round(stats[0]?.avgDuration || 0),
      totalDurationSeconds: Math.round(stats[0]?.totalDuration || 0),
      topBooks: topBooks.map(b => ({
        v_id: b._id,
        name: b.flipbookName || "Untitled",
        views: b.views,
        avgDurationSeconds: Math.round(b.avgDuration || 0)
      })),
      topCountries: topCountries.map(c => ({
        country: c._id || "Unknown",
        code: c.code || "",
        views: c.views
      })),
      topStates: topStates.map(s => ({
        state: s._id || "Unknown",
        country: s.country || "",
        views: s.views
      })),
      devices: devices.map(d => ({
        type: d._id || "Desktop",
        views: d.views
      })),
      dailyViews,
      recentSessions
    });
  } catch (err) {
    console.error("[Analytics getUserAnalytics Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch user analytics" });
  }
};

module.exports = {
  recordSessionStart,
  recordHeartbeat,
  recordSessionEnd,
  recordPageFlip,
  getFlipbookAnalytics,
  getUserAnalytics
};
