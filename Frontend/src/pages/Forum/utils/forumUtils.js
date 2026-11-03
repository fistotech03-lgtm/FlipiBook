import { FORUM_MODULES, POST_STATUS_CONFIG, formatForumDate } from '../data/forumData';

/**
 * Returns module metadata for a given module ID.
 */
export function getForumModule(moduleId) {
  const found = FORUM_MODULES.find(m => m.id === moduleId);
  if (found) return found;

  return {
    id: moduleId || 'general',
    name: 'General Discussion',
    shortName: 'General',
    tagline: 'General community discussion and feedback',
    description: 'Community questions, best practices, and suggestions.',
    icon: 'MessageSquare',
    color: '#64748b'
  };
}

/**
 * Returns initials from a user's full name.
 */
export function getAuthorInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns status configuration badge data.
 */
export function getStatusConfig(status) {
  return POST_STATUS_CONFIG[status] || {
    id: status || 'open',
    label: status ? status.replace(/_/g, ' ') : 'Open',
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-300',
    dot: 'bg-stone-400'
  };
}

export { formatForumDate };
