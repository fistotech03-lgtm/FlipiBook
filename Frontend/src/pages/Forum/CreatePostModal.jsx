// Frontend/src/pages/Forum/CreatePostModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle,
  Info
} from 'lucide-react';
import { FORUM_MODULES } from './data/forumData';
import CustomDropdown from '../../components/CustomDropdown';

export default function CreatePostModal({ isOpen, onClose, onSubmit, targetModuleId }) {
  const [moduleId, setModuleId] = useState(targetModuleId || 'my-flipbooks');
  const [postType, setPostType] = useState('suggestion'); // 'suggestion' | 'question'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setError('');
      setPostType('suggestion');
      setModuleId(targetModuleId || 'my-flipbooks');
    }
  }, [isOpen, targetModuleId]);

  if (!isOpen) return null;

  const activeModule = FORUM_MODULES.find(m => m.id === moduleId) || FORUM_MODULES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title must be at 8 characters');
      return;
    }
    if (title.trim().length < 8) {
      setError('Title must be at 8 characters');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description');
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-stone-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Create Post
              </h2>
              <div className="h-[1px] w-48 sm:w-64 bg-stone-200 self-center mt-1" />
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Start a discussion and get help from the community
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors cursor-pointer -mr-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Post Type Selector (What do you want to do ?) */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-2">
              What do you want to do ?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Suggestion Card */}
              <button
                type="button"
                onClick={() => setPostType('suggestion')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  postType === 'suggestion'
                    ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-white border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="mt-0.5">
                  <Lightbulb 
                    size={18} 
                    className={postType === 'suggestion' ? 'text-amber-500' : 'text-stone-400'} 
                  />
                </div>
                <div>
                  <div className={`text-xs font-bold ${
                    postType === 'suggestion' ? 'text-amber-700' : 'text-stone-800'
                  }`}>
                    Suggestion
                  </div>
                  <div className="text-[10px] text-stone-400 font-normal leading-tight mt-0.5">
                    Start a discussion and get help from the community
                  </div>
                </div>
              </button>

              {/* Question Card */}
              <button
                type="button"
                onClick={() => setPostType('question')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  postType === 'question'
                    ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-white border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="mt-0.5">
                  <HelpCircle 
                    size={18} 
                    className={postType === 'question' ? 'text-amber-500' : 'text-stone-500'} 
                  />
                </div>
                <div>
                  <div className={`text-xs font-bold ${
                    postType === 'question' ? 'text-amber-700' : 'text-stone-800'
                  }`}>
                    Question
                  </div>
                  <div className="text-[10px] text-stone-400 font-normal leading-tight mt-0.5">
                    Start a discussion and get help from the community
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Features Selector with CustomDropdown */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1.5">
              Features
            </label>
            <CustomDropdown
              value={moduleId}
              onChange={(val) => setModuleId(val)}
              options={FORUM_MODULES.map((m) => ({
                value: m.id,
                label: m.name
              }))}
              placeholder="Select feature..."
              buttonClassName="py-2.5 px-3.5 text-xs rounded-xl border-stone-300"
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder=""
              className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#ec5137] transition-all text-stone-900 font-normal"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5">
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              className="w-full p-3.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#ec5137] transition-all resize-none text-stone-900 font-normal"
            />
          </div>

          {/* Safe Notice */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <Info size={13} className="shrink-0" />
            <span>Stay safe! Keep your passwords and private account details confidential.</span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
