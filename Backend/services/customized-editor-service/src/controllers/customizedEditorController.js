/**
 * Customized Editor Controller
 * Basic setup controller with simple authentication endpoints
 */

const getStatus = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      service: 'customized-editor-service',
      status: 'active',
      authenticated: !!req.user,
      user: req.user || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve service status',
      error: error.message
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully with Customized Editor Service',
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Auth check failed',
      error: error.message
    });
  }
};

module.exports = {
  getStatus,
  checkAuth
};
