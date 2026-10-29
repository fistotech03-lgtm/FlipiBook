// Backend/services/user-service/src/controllers/ticketController.js
const SupportTicket = require('../models/SupportTicket');
const mongoose = require('mongoose');
const {
  resolveUserFolder,
  processTicketAttachments,
  deleteTicketAttachments
} = require('../utils/ticketStorageHelper');

let User;
try {
  User = mongoose.models.User || mongoose.models.user || require('../models/user');
} catch (e) {
  User = mongoose.models.User || mongoose.models.user || mongoose.model('user', new mongoose.Schema({ emailId: String, email: String, role: String }, { strict: false }));
}

/**
 * Check if the user is an admin
 */
const isUserAdmin = async (email) => {
  if (!email) return false;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ $or: [{ emailId: cleanEmail }, { email: cleanEmail }] });
    return user && (user.role === 'admin' || user.isAdmin === true);
  } catch (err) {
    return false;
  }
};

/**
 * GET /api/tickets
 * Query params:
 *   - status: 'open' | 'closed' | 'all'
 *   - category: moduleId | 'all'
 *   - search: string
 *   - email: requester email (scopes to user's tickets)
 *   - isAdmin: boolean string ('true' | 'false')
 *   - page: number (default 1)
 *   - limit: number (default 8)
 */
const getTickets = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      email,
      isAdmin,
      page = 1,
      limit = 8
    } = req.query;

    const query = { isDeleted: false };

    // Resolve caller identity and administrative privileges
    const headerEmail = req.headers['x-user-email'];
    const effectiveEmail = (email || headerEmail || '').toLowerCase().trim();
    const headerIsAdmin = req.headers['x-is-admin'] === 'true';
    const queryIsAdmin = isAdmin === 'true';

    let isAdminUser = headerIsAdmin || queryIsAdmin;
    if (!isAdminUser && effectiveEmail) {
      isAdminUser = await isUserAdmin(effectiveEmail);
    }

    // If not admin and email provided, scope tickets to the user
    if (!isAdminUser && effectiveEmail) {
      query['requester.email'] = effectiveEmail;
    }

    // Status filter: 'open' | 'closed'
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category / Module filter
    if (category && category !== 'all') {
      query.moduleId = category;
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { id: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'requester.name': { $regex: q, $options: 'i' } },
        { 'requester.email': { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 8));
    const skip = (pageNum - 1) * limitNum;

    // Build base filter for count scoping
    const countScope = { isDeleted: false };
    if (!isAdminUser && effectiveEmail) {
      countScope['requester.email'] = effectiveEmail;
    }

    // Fetch tickets and counts in parallel
    const [tickets, totalCount, openCount, closedCount] = await Promise.all([
      SupportTicket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SupportTicket.countDocuments(countScope),
      SupportTicket.countDocuments({ ...countScope, status: 'open' }),
      SupportTicket.countDocuments({ ...countScope, status: 'closed' })
    ]);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      },
      counts: {
        total: totalCount,
        open: openCount,
        closed: closedCount
      }
    });
  } catch (error) {
    console.error('[getTickets Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve tickets', error: error.message });
  }
};

/**
 * GET /api/tickets/:id
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = {
      $or: [
        { id: id },
        ...(isObjectId ? [{ _id: id }] : [])
      ],
      isDeleted: false
    };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('[getTicketById Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve ticket', error: error.message });
  }
};

/**
 * POST /api/tickets
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
  try {
    const {
      subject,
      moduleId,
      moduleName,
      department,
      description,
      priority = 'medium',
      requester,
      ccRecipients = [],
      attachments = []
    } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const effectiveRequester = {
      name: requester?.name || 'Support User',
      email: (requester?.email || req.headers['x-user-email'] || 'user@example.com').toLowerCase().trim(),
      role: requester?.role || 'User',
      avatarColor: requester?.avatarColor || '#ec5137',
      userID: requester?.userID || req.headers['x-user-id'] || ''
    };

    // 1. Resolve user storage folder (e.g. 'FLIPI0001')
    const userFolder = await resolveUserFolder(
      effectiveRequester.email,
      effectiveRequester.userID
    );

    // 2. Generate unique ticket code
    const ticketCode = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Process and write attachments into Backend/storage/<userFolder>/tickets/
    const processedAttachments = processTicketAttachments(userFolder, attachments, ticketCode);

    const newTicket = new SupportTicket({
      id: ticketCode,
      subject: subject.trim(),
      moduleId: moduleId || 'others',
      moduleName: moduleName || department || 'General',
      department: department || moduleName || 'Support',
      priority,
      status: 'open',
      requester: effectiveRequester,
      ccRecipients: Array.isArray(ccRecipients) ? ccRecipients : [],
      description: description.trim(),
      attachments: processedAttachments,
      messages: [
        {
          sender: 'user',
          authorName: effectiveRequester.name,
          authorEmail: effectiveRequester.email,
          content: description.trim(),
          attachments: processedAttachments,
          createdAt: new Date()
        }
      ]
    });

    const savedTicket = await newTicket.save();
    res.status(201).json({ success: true, data: savedTicket, message: 'Ticket raised successfully' });
  } catch (error) {
    console.error('[createTicket Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to raise ticket', error: error.message });
  }
};

/**
 * PATCH /api/tickets/:id/status
 * Update status ('open' or 'closed')
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['open', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either "open" or "closed"' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = {
      $or: [
        { id: id },
        ...(isObjectId ? [{ _id: id }] : [])
      ],
      isDeleted: false
    };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    res.json({ success: true, data: ticket, message: `Ticket status updated to ${status}` });
  } catch (error) {
    console.error('[updateTicketStatus Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket status', error: error.message });
  }
};

/**
 * POST /api/tickets/:id/messages
 * Add a message/reply to conversation
 */
const addTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      content, 
      message,
      sender = 'user', 
      senderRole,
      authorName, 
      senderName,
      authorEmail, 
      senderEmail,
      attachments = [] 
    } = req.body;

    const messageContent = (content || message || '').trim();
    if (!messageContent && (!Array.isArray(attachments) || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message content or attachment is required' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = {
      $or: [
        { id: id },
        ...(isObjectId ? [{ _id: id }] : [])
      ],
      isDeleted: false
    };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Resolve user storage folder for ticket requester
    const userFolder = await resolveUserFolder(
      ticket.requester?.email,
      ticket.requester?.userID || req.headers['x-user-id']
    );

    // Save attachments to Backend/storage/<userFolder>/tickets/
    const processedAttachments = processTicketAttachments(userFolder, attachments, ticket.id);

    const effectiveSender = senderRole || sender || 'user';
    const effectiveAuthorName = authorName || senderName || (effectiveSender === 'admin' ? 'Support Admin' : ticket.requester?.name);
    const effectiveAuthorEmail = authorEmail || senderEmail || (effectiveSender === 'admin' ? 'admin@flipibook.com' : ticket.requester?.email);

    const newMessage = {
      sender: effectiveSender,
      authorName: effectiveAuthorName,
      authorEmail: effectiveAuthorEmail,
      content: messageContent,
      attachments: processedAttachments,
      createdAt: new Date()
    };

    ticket.messages.push(newMessage);
    await ticket.save();

    res.status(201).json({ success: true, data: ticket, message: 'Reply posted successfully' });
  } catch (error) {
    console.error('[addTicketMessage Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to post message', error: error.message });
  }
};

/**
 * DELETE /api/tickets/:id
 * Delete / Withdraw ticket and remove all attached files from physical storage
 */
const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = {
      $or: [
        { id: id },
        ...(isObjectId ? [{ _id: id }] : [])
      ],
      isDeleted: false
    };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // 1. Resolve user storage folder and remove all attachment files from disk
    const userFolder = await resolveUserFolder(
      ticket.requester?.email,
      ticket.requester?.userID || req.headers['x-user-id']
    );
    const deletedFiles = deleteTicketAttachments(userFolder, ticket);

    // 2. Mark ticket as deleted and clear attachment references
    ticket.isDeleted = true;
    ticket.attachments = [];
    if (Array.isArray(ticket.messages)) {
      ticket.messages.forEach(m => {
        m.attachments = [];
      });
    }
    await ticket.save();

    res.json({ 
      success: true, 
      message: `Ticket #${ticket.id} and its attachments deleted successfully`,
      deletedAttachmentsCount: deletedFiles.length
    });
  } catch (error) {
    console.error('[cancelTicket Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ticket', error: error.message });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  addTicketMessage,
  cancelTicket
};
