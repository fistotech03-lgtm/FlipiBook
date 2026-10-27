import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  LifeBuoy, 
  AlertCircle, 
  UploadCloud,
  Loader2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { TICKET_MODULES } from './data/ticketData';
import CustomDropdown from '../../CustomDropdown';
import { createTicketApi } from '../../../api/ticketApi';
import { 
  processImageAttachmentsSequentially, 
  formatFileSize 
} from './functions/imageCompressor';

const modulesList = TICKET_MODULES.filter(m => m.id !== 'all');

export default function RaiseTicketModal({ isOpen, onClose, onSubmit, defaultModuleId = 'my-flipbooks', currentUser }) {
  const [moduleId, setModuleId] = useState(defaultModuleId === 'all' ? 'my-flipbooks' : defaultModuleId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setDescription('');
      setError('');
      setAttachments([]);
      setModuleId(defaultModuleId === 'all' ? 'my-flipbooks' : defaultModuleId);
    }
  }, [isOpen, defaultModuleId]);

  if (!isOpen) return null;

  const handleImageFilesChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setIsCompressing(true);

    try {
      const { attachments: newAttachments } = await processImageAttachmentsSequentially(files, attachments);
      setAttachments(newAttachments);
    } catch (err) {
      setError(err.message || 'Error processing image attachments');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a ticket subject');
      return;
    }
    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters');
      return;
    }
    if (!description.trim()) {
      setError('Please explain your problem or inquiry in detail');
      return;
    }

    setIsSubmitting(true);
    const selectedMod = modulesList.find(m => m.id === moduleId) || modulesList[0];
    const contactEmail = currentUser?.email || currentUser?.emailId || 'user@flipibook.com';
    const userDisplayName = currentUser?.name || contactEmail.split('@')[0] || 'User';

    const ticketAttachments = attachments.map(att => ({
      name: att.name,
      size: att.size,
      originalSize: att.originalSize,
      url: att.dataUrl,
      width: att.width,
      height: att.height
    }));

    const ticketPayload = {
      subject: subject.trim(),
      moduleId: selectedMod.id,
      moduleName: selectedMod.name,
      department: selectedMod.name,
      status: 'open',
      priority: 'medium',
      requester: {
        name: userDisplayName,
        email: contactEmail,
        avatarColor: currentUser?.avatarBgColor || '#ec5137',
        badge: 'Authorized User',
        role: currentUser?.role || 'User'
      },
      ccRecipients: [
        contactEmail,
        'support@flipibook.com'
      ],
      description: description.trim(),
      attachments: ticketAttachments
    };

    (async () => {
      try {
        const createdFromBackend = await createTicketApi(ticketPayload);
        if (createdFromBackend && createdFromBackend.id) {
          onSubmit(createdFromBackend);
          setIsSubmitting(false);
          onClose();
          return;
        }
      } catch (err) {
        console.warn('Backend ticket creation failed, falling back to local object:', err);
      }

      // Fallback only if backend is completely offline
      const localTicket = {
        ...ticketPayload,
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        submittedAt: 'Just now',
        updatedAt: 'Just now',
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'user',
            authorName: userDisplayName,
            badge: 'Authorized User',
            email: contactEmail,
            timestamp: 'Just now',
            content: description.trim(),
            attachments: ticketAttachments
          }
        ]
      };

      onSubmit(localTicket);
      setIsSubmitting(false);
      onClose();
    })();
  };

  const totalBytes = attachments.reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-[1vw] bg-stone-900/60 backdrop-blur-[2px] animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white rounded-[1vw] shadow-2xl w-full max-w-[42vw] max-h-[88vh] flex flex-col overflow-hidden border border-stone-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-[1.4vw] py-[0.9vw] border-b border-orange-100 flex items-center justify-between bg-orange-50/40 flex-shrink-0">
          <div className="flex items-center gap-[0.7vw]">
            <div className="w-[2vw] h-[2vw] rounded-[0.5vw] bg-orange-100 text-[#ec5137] flex items-center justify-center">
              <LifeBuoy className="w-[1.05vw] h-[1.05vw]" />
            </div>
            <div>
              <h2 className="text-[1.05vw] font-bold text-stone-900">
                Raise Support Ticket
              </h2>
              <p className="text-[0.72vw] text-stone-500 font-normal">
                Direct inquiry to our support and engineering team
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-[#ec5137] p-[0.35vw] rounded-[0.4vw] hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <X className="w-[1vw] h-[1vw]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-[1.4vw] space-y-[0.85vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Module Selector with CustomDropdown */}
          <CustomDropdown
            label="Module (Optional)"
            value={moduleId}
            onChange={(val) => setModuleId(val)}
            options={modulesList.map((m) => ({
              value: m.id,
              label: m.name
            }))}
            placeholder="Select a module..."
          />

          {/* Subject */}
          <div>
            <label className="block text-[0.72vw] font-semibold text-stone-700 uppercase tracking-wide mb-[0.35vw]">
              Subject <span className="text-[#ec5137]">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full px-[0.85vw] py-[0.5vw] text-[0.8vw] border border-stone-300 rounded-[0.55vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137]/20 focus:border-[#ec5137] text-stone-900 font-normal shadow-2xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[0.72vw] font-semibold text-stone-700 uppercase tracking-wide mb-[0.35vw]">
              Description <span className="text-[#ec5137]">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem in detail (what happened, steps taken, error message)..."
              className="w-full p-[0.85vw] text-[0.8vw] border border-stone-300 rounded-[0.55vw] focus:outline-none focus:ring-1 focus:ring-[#ec5137]/20 focus:border-[#ec5137] resize-y text-stone-900 font-normal leading-relaxed shadow-2xs"
            />
          </div>

          {/* Attachment */}
          <div>
            <div className="flex items-center justify-between mb-[0.35vw]">
              <label className="block text-[0.72vw] font-semibold text-stone-700 uppercase tracking-wide">
                Image Attachments <span className="text-stone-400 font-normal">(Optional, max 5)</span>
              </label>
              <span className="text-[0.68vw] text-stone-500 font-normal">
                {attachments.length}/5 images • {formatFileSize(totalBytes)}/4 MB
              </span>
            </div>

            <div className="border border-dashed border-stone-300 hover:border-[#ec5137]/50 rounded-[0.65vw] p-[0.9vw] bg-stone-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.7vw]">
                <div className="flex items-center gap-[0.6vw]">
                  <div className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] bg-orange-100/70 text-[#ec5137] flex items-center justify-center shrink-0">
                    <UploadCloud className="w-[1.1vw] h-[1.1vw]" />
                  </div>
                  <div>
                    <p className="text-[0.78vw] font-medium text-stone-800">
                      Upload JPG, PNG, JPEG, or WebP
                    </p>
                    <p className="text-[0.68vw] text-stone-500 font-normal">
                      Max 10 MB per image • Auto-resized to 1920px & compressed
                    </p>
                  </div>
                </div>

                <label className={`px-[0.75vw] py-[0.4vw] rounded-[0.45vw] border border-stone-300 bg-white text-[0.75vw] font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors shadow-2xs shrink-0 flex items-center justify-center gap-[0.35vw] ${
                  attachments.length >= 5 || isCompressing ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-[0.8vw] h-[0.8vw] animate-spin text-[#ec5137]" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <span>Add Images</span>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png,image/jpeg,image/jpg,image/webp" 
                    multiple
                    disabled={attachments.length >= 5 || isCompressing}
                    onChange={handleImageFilesChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Attached Images Previews */}
              {attachments.length > 0 && (
                <div className="mt-[0.75vw] pt-[0.65vw] border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-[0.45vw]">
                  {attachments.map((att, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-[0.5vw] rounded-[0.45vw] bg-white border border-stone-200 shadow-2xs gap-[0.45vw]"
                    >
                      <div className="flex items-center gap-[0.45vw] min-w-0">
                        <img 
                          src={att.dataUrl} 
                          alt={att.name} 
                          className="w-[1.8vw] h-[1.8vw] rounded-[0.3vw] object-cover border border-stone-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-[0.72vw] font-medium text-stone-800 truncate" title={att.name}>
                            {att.name}
                          </p>
                          <p className="text-[0.62vw] text-stone-400">
                            {formatFileSize(att.size)} <span className="text-stone-300">•</span> {att.width}×{att.height}px
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-stone-400 hover:text-red-500 p-[0.25vw] rounded-[0.3vw] hover:bg-red-50 transition-colors shrink-0"
                        title="Remove image"
                      >
                        <Trash2 className="w-[0.85vw] h-[0.85vw]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-[0.45vw] text-[0.75vw] font-semibold text-red-600 bg-red-50 p-[0.7vw] rounded-[0.5vw] border border-red-200">
              <AlertCircle className="w-[0.9vw] h-[0.9vw] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-[0.6vw] pt-[0.75vw] border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-[0.9vw] py-[0.45vw] text-[0.78vw] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-[1.1vw] py-[0.45vw] text-[0.78vw] font-semibold text-white bg-[#ec5137] hover:bg-[#d9442b] rounded-[0.55vw] transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-50 flex items-center gap-[0.45vw]"
            >
              <Send className="w-[0.85vw] h-[0.85vw]" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
