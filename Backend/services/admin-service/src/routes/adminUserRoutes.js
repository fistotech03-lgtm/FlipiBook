const express = require('express');
const {
  listUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminUserController');

const router = express.Router();

router.get('/', listUsers);
router.get('/:id', getUserDetails);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
