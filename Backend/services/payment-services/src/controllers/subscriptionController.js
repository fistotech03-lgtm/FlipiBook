const mongoose = require('mongoose');
const UserSubscription = require('../models/userSubscription');
const Plan = require('../models/plan');
const { DEFAULT_PLANS } = require('../config/defaultPlans');

/**
 * Extracts and normalizes user credentials from auth token or request
 */
const getAuthUser = (req) => {
  const user = req.user || {};
  let userObjectID = null;

  const candidates = [user.id, user._id, user.userId];
  for (const cand of candidates) {
    if (cand && typeof cand === 'string' && /^[0-9a-fA-F]{24}$/.test(cand)) {
      userObjectID = new mongoose.Types.ObjectId(cand);
      break;
    } else if (cand && typeof cand === 'object' && mongoose.Types.ObjectId.isValid(cand)) {
      userObjectID = cand;
      break;
    }
  }

  const userID = (user.userID || '').toString().trim();
  const emailId = (
    user.emailId ||
    user.email ||
    req.query?.emailId ||
    req.body?.emailId ||
    ''
  ).toString().trim().toLowerCase();

  return { userObjectID, userID: userID || null, emailId: emailId || null };
};

/**
 * GET /api/payment/subscription/my-subscription
 * Get current user plan, storage quota, and status
 */
exports.getMySubscription = async (req, res) => {
  try {
    const { userObjectID, userID, emailId } = getAuthUser(req);

    if (!userObjectID && !userID && !emailId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const conds = [];
    if (userObjectID) conds.push({ userObjectID });
    if (userID) conds.push({ userID });
    if (emailId) conds.push({ emailId });

    const query = conds.length === 1 ? conds[0] : { $or: conds };

    let subscription = await UserSubscription.findOne(query);

    // If no subscription yet, create default Free plan
    if (!subscription) {
      const freePlan =
        (await Plan.findOne({ planId: 'free' })) ||
        DEFAULT_PLANS.find((p) => p.planId === 'free');

      subscription = await UserSubscription.create({
        ...(userObjectID ? { userObjectID } : {}),
        ...(userID ? { userID } : {}),
        ...(emailId ? { emailId } : {}),
        planId: 'free',
        planRef: freePlan?._id || null,
        planName: freePlan?.name || 'Free Plan',
        storageQuota: {
          maxStorage: freePlan?.storage?.maxStorage || 300 * 1024 * 1024,
          bonusStorage: 0,
          formattedStorage: freePlan?.storage?.formattedStorage || '300 MB'
        },
        status: 'active',
        billingCycle: 'free',
        startDate: new Date(),
        endDate: null
      });
    }

    res.status(200).json({
      success: true,
      subscription: {
        _id: subscription._id,
        userObjectID: subscription.userObjectID,
        userID: subscription.userID,
        emailId: subscription.emailId,
        planId: subscription.planId,
        planName: subscription.planName,
        storageQuota: subscription.storageQuota,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    console.error('[Subscription Controller] Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user subscription'
    });
  }
};

/**
 * POST /api/payment/subscription/subscribe
 * Subscribe / upgrade to a specific plan
 */
exports.subscribePlan = async (req, res) => {
  try {
    const { userObjectID, userID, emailId } = getAuthUser(req);
    const { planId, billingCycle } = req.body;

    if (!userObjectID && !userID && !emailId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required' });
    }

    const plan = await Plan.findOne({ planId: planId.toLowerCase() });
    if (!plan) {
      return res.status(404).json({ success: false, message: `Plan '${planId}' not found` });
    }

    const conds = [];
    if (userObjectID) conds.push({ userObjectID });
    if (userID) conds.push({ userID });
    if (emailId) conds.push({ emailId });
    const query = conds.length === 1 ? conds[0] : { $or: conds };

    // Calculate expiration based on billingCycle
    const cycle = billingCycle || plan.billingCycle || 'monthly';
    let endDate = null;
    const now = new Date();
    if (cycle === 'monthly') {
      endDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (cycle === 'yearly') {
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    }

    const updateDoc = {
      $set: {
        planId: plan.planId,
        planRef: plan._id,
        planName: plan.name,
        'storageQuota.maxStorage': plan.storage.maxStorage,
        'storageQuota.formattedStorage': plan.storage.formattedStorage,
        status: 'active',
        billingCycle: cycle,
        startDate: new Date(),
        endDate
      }
    };

    const insertDoc = {};
    if (userObjectID) insertDoc.userObjectID = userObjectID;
    if (userID) insertDoc.userID = userID;
    if (emailId) insertDoc.emailId = emailId;
    if (Object.keys(insertDoc).length > 0) {
      updateDoc.$setOnInsert = insertDoc;
    }

    const subscription = await UserSubscription.findOneAndUpdate(
      query,
      updateDoc,
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
      subscription
    });
  } catch (error) {
    console.error('[Subscription Controller] Error subscribing to plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
};
