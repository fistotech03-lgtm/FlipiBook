// Backend/services/user-service/src/routes/ticketRoutes.js
const express = require('express');
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  addTicketMessage,
  cancelTicket
} = require('../controllers/ticketController');

const router = express.Router();

// GET all tickets with filtering / pagination
router.get('/', getTickets);

// POST create a new support ticket
router.post('/', createTicket);

// GET ticket by ID
router.get('/:id', getTicketById);

// PATCH update status ('open' or 'closed')
router.patch('/:id/status', updateTicketStatus);

// POST post a reply/message to conversation thread
router.post('/:id/messages', addTicketMessage);

// DELETE withdraw/cancel ticket (before admin replies)
router.delete('/:id', cancelTicket);

module.exports = router;
