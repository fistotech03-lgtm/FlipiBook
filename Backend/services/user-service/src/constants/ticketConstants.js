// Backend/services/user-service/src/constants/ticketConstants.js

const TICKET_MODULES = [
  { id: 'all', name: 'All Tickets' },
  { id: 'my-flipbooks', name: 'My Flipbooks' },
  { id: 'template-editor', name: 'Template Editor' },
  { id: 'customised-editor', name: 'Customised Editor' },
  { id: '3d-editor', name: '3D Editor' },
  { id: 'billing-account', name: 'Billing & Account' },
  { id: 'others', name: 'Others' }
];

const TICKET_STATUSES = ['open', 'closed'];

const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

module.exports = {
  TICKET_MODULES,
  TICKET_STATUSES,
  TICKET_PRIORITIES
};
