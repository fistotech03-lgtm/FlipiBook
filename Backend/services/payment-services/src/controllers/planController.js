const Plan = require('../models/plan');
const { DEFAULT_PLANS } = require('../config/defaultPlans');

/**
 * GET /api/payment/plans
 * List all available plans
 */
exports.getPlans = async (req, res) => {
  try {
    let plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, tier: 1 });

    // Auto-seed if database has no plans yet
    if (!plans || plans.length === 0) {
      await Plan.insertMany(DEFAULT_PLANS);
      plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, tier: 1 });
    }

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error('[Plan Controller] Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
};

/**
 * GET /api/payment/plans/:planId
 * Get details for a specific plan
 */
exports.getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findOne({ planId: planId.toLowerCase() });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Plan '${planId}' not found`
      });
    }

    res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('[Plan Controller] Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan details'
    });
  }
};

/**
 * POST /api/payment/plans/seed
 * Seed / reset default plans
 */
exports.seedPlans = async (req, res) => {
  try {
    for (const planData of DEFAULT_PLANS) {
      await Plan.findOneAndUpdate(
        { planId: planData.planId },
        { $set: planData },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const plans = await Plan.find({}).sort({ sortOrder: 1 });
    res.status(200).json({
      success: true,
      message: 'Default plans seeded successfully',
      plans
    });
  } catch (error) {
    console.error('[Plan Controller] Error seeding plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed plans'
    });
  }
};
