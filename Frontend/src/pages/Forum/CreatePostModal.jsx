// Frontend/src/pages/Forum/CreatePostModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Send, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle, 
  ShieldAlert, 
  LifeBuoy, 
  Sparkles 
} from 'lucide-react';
import { FORUM_MODULES } from './data/forumData';
import CustomDropdown from '../../components/CustomDropdown';

export default function CreatePostModal({ isOpen, onClose, onSubmit, targetModuleId, existingPosts = [] }) {
  const [moduleId, setModuleId] = useState(targetModuleId || 'my-flipbooks');
  const [postType, setPostType] = useState('question'); // 'question' | 'suggestion'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setError('');
      setPostType('question');
      setModuleId(targetModuleId || 'my-flipbooks');
    }
  }, [isOpen, targetModuleId]);

  // Similar post suggestion detection to avoid duplicates
  const similarPosts = useMemo(() => {
    if (!title.trim() || title.trim().length < 4) return [];
    const queryWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return [];

    return existingPosts.filter(p => {
      const pTitle = p.title.toLowerCase();
      return queryWords.some(w => pTitle.includes(w));
    }).slice(0, 3);
  }, [title, existingPosts]);

  // Detect technical failure or bug keywords to recommend Support Tickets
  const hasBugKeywords = useMemo(() => {
    const text = (title + ' ' + description).toLowerCase();
    const bugWords = ['crash', 'failed', '500 error', '504', 'corrupt', 'freeze', 'broken', 'bug', 'cannot upload'];
    return bugWords.some(w => text.includes(w));
  }, [title, description]);

  if (!isOpen) return null;

  const activeModule = FORUM_MODULES.find(m => m.id === moduleId) || FORUM_MODULES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a descriptive title for your post');
      return;
    }
    if (title.trim().length < 8) {
      setError('Title must be at least 8 characters long');
      return;
    }
    if (!description.trim()) {
      setError('Please provide details for your question or suggestion');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPostData = {
        moduleId: activeModule.id,
        moduleName: activeModule.name,
        postType,
        title: title.trim(),
        description: description.trim(),
        status: postType === 'suggestion' ? 'under_review' : 'awaiting_admin'
      };

      if (onSubmit) {
        await onSubmit(newPostData);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit post');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-[clamp(12px,1.5vw,24px)] bg-stone-900/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl sm:rounded-[0.8vw] shadow-2xl w-full max-w-[clamp(320px,46vw,680px)] max-h-[92vh] flex flex-col overflow-hidden border border-stone-300"
        role="dialog"
      >
        {/* Header */}
        <div className="px-4 sm:px-[clamp(16px,1.4vw,24px)] py-3 sm:py-[clamp(10px,0.7vh,16px)] border-b border-orange-100 flex items-center justify-between bg-orange-50/40">
          <div className="flex items-center gap-2 sm:gap-[clamp(8px,0.6vw,12px)]">
            <h2 className="text-sm sm:text-[clamp(15px,1.1vw,18px)] font-bold text-stone-900">
              New Discussion
            </h2>
            <span className="text-[10px] sm:text-[clamp(10px,0.65vw,12px)] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-[#c23d26] border border-orange-200">
              Product Knowledge & Feedback
            </span>
          </div>

          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-[#ec5137] p-1 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-[clamp(16px,1vw,18px)] sm:h-[clamp(16px,1vw,18px)]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-[clamp(16px,1.5vw,26px)] space-y-3.5 sm:space-y-[clamp(12px,1vh,18px)]">
          {/* Module Selector with CustomDropdown */}
          <CustomDropdown
            label="Module"
            required
            value={moduleId}
            onChange={(val) => setModuleId(val)}
            options={FORUM_MODULES.map((m) => ({
              value: m.id,
              label: m.name
            }))}
            placeholder="Select a module..."
          />

          {/* Post Type Selector (Question vs Suggestion) */}
          <div>
            <label className="block text-[11px] sm:text-[clamp(10px,0.7vw,12px)] font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
              Post Type <span className="text-[#ec5137]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-[clamp(8px,0.7vw,14px)]">
              <button
                type="button"
                onClick={() => setPostType('question')}
                className={`p-2.5 sm:p-[clamp(10px,0.7vw,14px)] rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] border flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold transition-all cursor-pointer ${
                  postType === 'question'
                    ? 'bg-orange-50 border-[#ec5137] text-[#c23d26] ring-1 ring-[#ec5137]/30 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-[clamp(14px,0.9vw,17px)] sm:h-[clamp(14px,0.9vw,17px)] text-[#ec5137]" />
                <span>Ask a Question</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('suggestion')}
                className={`p-2.5 sm:p-[clamp(10px,0.7vw,14px)] rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] border flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold transition-all cursor-pointer ${
                  postType === 'suggestion'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-300 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 sm:w-[clamp(14px,0.9vw,17px)] sm:h-[clamp(14px,0.9vw,17px)] text-amber-600" />
                <span>Suggest Improvement</span>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-[11px] sm:text-[clamp(10px,0.7vw,12px)] font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
              Title <span className="text-[#ec5137]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === 'suggestion' 
                ? 'e.g. Add option to distribute elements evenly on canvas' 
                : 'e.g. How to optimize PDF vector pages for faster mobile flip?'}
              className="w-full px-3.5 py-2 sm:px-[clamp(12px,0.9vw,16px)] sm:py-[clamp(8px,0.55vh,12px)] text-xs sm:text-[clamp(12px,0.82vw,14px)] border border-stone-300 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] focus:outline-none focus:ring-1 focus:ring-[#ec5137]/20 focus:border-[#ec5137] transition-all text-stone-900 font-normal"
            />
          </div>

          {/* Similar Posts Suggestion Box */}
          {similarPosts.length > 0 && (
            <div className="p-3 sm:p-[clamp(10px,0.7vw,14px)] bg-orange-50/70 border border-orange-200 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] space-y-1.5 text-xs sm:text-[clamp(11px,0.72vw,13px)]">
              <div className="flex items-center gap-1.5 font-semibold text-[#c23d26]">
                <Sparkles className="w-3.5 h-3.5 text-[#ec5137]" />
                <span>Existing discussions that might answer your query:</span>
              </div>
              <div className="space-y-1">
                {similarPosts.map(sp => (
                  <div key={sp.id} className="text-stone-700 hover:text-[#ec5137] font-normal truncate">
                    • {sp.title} <span className="text-stone-500">({sp.moduleName})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Input (Plain Text) */}
          <div>
            <label className="block text-[11px] sm:text-[clamp(10px,0.7vw,12px)] font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
              Description <span className="text-[#ec5137]">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={postType === 'suggestion'
                ? 'Explain your suggestion and how it improves your Flipibook workflow...'
                : 'Explain what you want to achieve or what question you need official guidance on...'}
              className="w-full p-3 sm:p-[clamp(12px,0.9vw,16px)] text-xs sm:text-[clamp(12px,0.82vw,14px)] border border-stone-300 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] focus:outline-none focus:ring-1 focus:ring-[#ec5137]/20 focus:border-[#ec5137] transition-all resize-y text-stone-900 font-normal"
            />
          </div>

          {/* Bug / Technical failure suggestion to use Raise Ticket */}
          {hasBugKeywords && (
            <div className="p-3 sm:p-[clamp(10px,0.7vw,14px)] bg-amber-50/80 border border-amber-200 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] flex items-start gap-2.5 text-xs sm:text-[clamp(11px,0.72vw,13px)] text-amber-900">
              <LifeBuoy className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Facing a private technical failure or urgent bug?</strong>
                <p className="mt-0.5 text-amber-800 font-normal">
                  For account issues, crashes, or confidential files, consider opening a dedicated request under <strong>Raise Ticket</strong> for private engineering assistance.
                </p>
              </div>
            </div>
          )}

          {/* Privacy Warning */}
          <div className="p-2.5 sm:p-[clamp(8px,0.6vw,12px)] bg-stone-50 border border-stone-200 rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] flex items-center gap-2 text-xs sm:text-[clamp(11px,0.7vw,13px)] text-stone-600">
            <ShieldAlert className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span>Please do not include passwords, API keys, or private client details in public forum posts.</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs sm:text-[clamp(11px,0.72vw,13px)] font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 flex-wrap gap-2">
            <span className="text-xs sm:text-[clamp(11px,0.7vw,13px)] text-stone-500 font-normal">
              Posting to: <strong className="text-stone-800 font-medium">{activeModule.name}</strong>
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 sm:px-[clamp(12px,0.8vw,16px)] sm:py-[clamp(6px,0.4vh,10px)] text-xs sm:text-[clamp(12px,0.82vw,14px)] font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 sm:px-[clamp(16px,1.2vw,22px)] sm:py-[clamp(8px,0.55vh,12px)] text-xs sm:text-[clamp(12px,0.82vw,14px)] font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] rounded-xl sm:rounded-[clamp(8px,0.6vw,12px)] transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Post'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
