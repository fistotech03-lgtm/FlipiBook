import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  LifeBuoy, 
  AlertCircle, 
  UploadCloud,
  Loader2,
  Trash2
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
        role: currentUser?.role || 'User',
        userID: currentUser?.userID || currentUser?.userId || ''
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
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-[1vw]"
    >
      <div 
        className="w-full max-w-[34vw] bg-white rounded-[1vw] shadow-xl border border-gray-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-[1.6vw] pt-[1.35vw] pb-[0.8vw] border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-[0.65vw]">
              <div className="mt-[0.1vw] text-[#EC5137]">
                <LifeBuoy className="w-[1.15vw] h-[1.15vw]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[1.15vw] font-semibold text-gray-800 leading-tight">
                  Raise Support Ticket
                </h2>
                <p className="text-[0.72vw] text-gray-500 mt-[0.2vw] font-normal">
                  Direct inquiry to our support and engineering team.
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-[0.3vw] rounded-[0.4vw] hover:bg-gray-100"
            >
              <X className="w-[0.95vw] h-[0.95vw]" strokeWidth="2.2" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-[1.6vw] pb-[0.8vw] pt-[0.9vw] flex flex-col gap-[0.85vw] overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Module Selector with CustomDropdown */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Department / Module <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <CustomDropdown
                value={moduleId}
                onChange={(val) => setModuleId(val)}
                options={modulesList.map((m) => ({
                  value: m.id,
                  label: m.name
                }))}
                placeholder="Select a module..."
                buttonClassName="h-[2.3vw] py-[0.35vw] text-[0.76vw] rounded-[0.5vw] border-gray-200 text-gray-800 font-normal"
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Subject <span className="text-[#EC5137]">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue..."
                className="w-full px-[0.85vw] py-[0.52vw] text-[0.76vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none text-gray-800 placeholder-gray-400 font-normal transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-[0.25vw]">
              <label className="text-[0.74vw] font-medium text-gray-700">
                Description <span className="text-[#EC5137]">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem in detail (what happened, steps taken, error message)..."
                className="w-full p-[0.85vw] text-[0.76vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 focus:border-[#4c5add] focus:ring-1 focus:ring-[#4c5add] outline-none resize-y text-gray-800 placeholder-gray-400 font-normal leading-relaxed transition-colors"
              />
            </div>

            {/* Attachment */}
            <div className="flex flex-col gap-[0.25vw]">
              <div className="flex items-center justify-between mb-[0.1vw]">
                <label className="text-[0.74vw] font-medium text-gray-700">
                  Image Attachments <span className="text-gray-400 font-normal">(Optional, max 5)</span>
                </label>
                <span className="text-[0.66vw] text-gray-400 font-normal">
                  {attachments.length}/5 images • {formatFileSize(totalBytes)}/4 MB
                </span>
              </div>

              <div className="border border-dashed border-gray-200 rounded-[0.5vw] p-[0.85vw] bg-[#f8f9fa] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[0.6vw]">
                  <div className="flex items-center gap-[0.55vw]">
                    <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-orange-100/70 text-[#EC5137] flex items-center justify-center shrink-0">
                      <UploadCloud className="w-[1vw] h-[1vw]" />
                    </div>
                    <div>
                      <p className="text-[0.76vw] font-medium text-gray-800">
                        Upload JPG, PNG, JPEG, or WebP
                      </p>
                      <p className="text-[0.66vw] text-gray-400 font-normal">
                        Max 10 MB per image • Auto-resized to 1920px & compressed
                      </p>
                    </div>
                  </div>

                  <label className={`px-[0.75vw] py-[0.38vw] rounded-[0.45vw] border border-gray-200 bg-white text-[0.74vw] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-xs shrink-0 flex items-center justify-center gap-[0.35vw] ${
                    attachments.length >= 5 || isCompressing ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    {isCompressing ? (
                      <>
                        <Loader2 className="w-[0.75vw] h-[0.75vw] animate-spin text-[#EC5137]" />
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
                  <div className="mt-[0.65vw] pt-[0.6vw] border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-[0.45vw]">
                    {attachments.map((att, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-[0.45vw] rounded-[0.45vw] bg-white border border-gray-200 shadow-xs gap-[0.45vw]"
                      >
                        <div className="flex items-center gap-[0.45vw] min-w-0">
                          <img 
                            src={att.dataUrl} 
                            alt={att.name} 
                            className="w-[1.8vw] h-[1.8vw] rounded-[0.3vw] object-cover border border-gray-100 shrink-0" 
                          />
                          <div className="min-w-0">
                            <p className="text-[0.72vw] font-medium text-gray-800 truncate" title={att.name}>
                              {att.name}
                            </p>
                            <p className="text-[0.62vw] text-gray-400 font-normal">
                              {formatFileSize(att.size)} <span className="text-gray-300">•</span> {att.width}×{att.height}px
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-gray-400 hover:text-red-500 p-[0.25vw] rounded-[0.3vw] hover:bg-red-50 transition-colors shrink-0"
                          title="Remove image"
                        >
                          <Trash2 className="w-[0.8vw] h-[0.8vw]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-[0.45vw] text-[0.74vw] font-medium text-red-600 bg-red-50 p-[0.65vw] rounded-[0.5vw] border border-red-200">
                <AlertCircle className="w-[0.85vw] h-[0.85vw] shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-[1.6vw] py-[0.9vw] border-t border-gray-100 flex items-center justify-end gap-[0.65vw] shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-[1.05vw] py-[0.48vw] rounded-[0.5vw] border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-[0.76vw] font-medium text-gray-700 transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-[1.25vw] py-[0.48vw] rounded-[0.5vw] bg-[#EC5137] hover:bg-[#d94229] active:scale-[0.98] text-white text-[0.76vw] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-[0.38vw]"
            >
              <Send className="w-[0.8vw] h-[0.8vw]" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
