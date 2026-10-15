import React from 'react';
import { Plus, Trash2, Heart, Folder } from 'lucide-react';

export default function FlipbooksEmptyState({ activeFolder, setIsCreateModalOpen }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 py-[5vw]">
            {activeFolder === 'Recent Book' || activeFolder === 'Recent' ? (
                <>
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-[4vw] h-[4vw] rounded-full bg-[#ea543a]/10 flex items-center justify-center mb-[1vw] border border-[#ea543a]/20 cursor-pointer hover:bg-[#ea543a]/20 transition-all"
                    >
                        <Plus size="2vw" className="text-[#ea543a]" />
                    </div>
                    <h3 className="text-[1.25vw] font-medium text-gray-800 mb-[0.25vw]">Create Flipbook</h3>
                    <p className="text-gray-400 text-[0.875vw]">There are no recent flipbooks</p>
                </>
            ) : activeFolder === 'Trash' ? (
                <>
                    <div className="w-[4vw] h-[4vw] rounded-full bg-red-50 flex items-center justify-center mb-[1vw] border border-red-100">
                        <Trash2 size="2vw" className="text-red-400" />
                    </div>
                    <h3 className="text-[1.25vw] font-medium text-gray-800 mb-[0.25vw]">Trash is Empty</h3>
                    <p className="text-gray-400 text-[0.875vw]">There are no flipbooks in Trash</p>
                </>
            ) : activeFolder === 'Favorites' ? (
                <>
                    <div className="w-[4vw] h-[4vw] rounded-full bg-rose-50 flex items-center justify-center mb-[1vw] border border-rose-100">
                        <Heart size="2vw" className="text-rose-400" />
                    </div>
                    <h3 className="text-[1.25vw] font-medium text-gray-800 mb-[0.25vw]">No Favorites Yet</h3>
                    <p className="text-gray-400 text-[0.875vw]">Click the heart icon on any flipbook to add it to Favorites</p>
                </>
            ) : activeFolder === 'All Flipbook' || activeFolder === 'All Flipbooks' ? (
                <>
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-[4vw] h-[4vw] rounded-full bg-[#ea543a]/10 flex items-center justify-center mb-[1vw] border border-[#ea543a]/20 cursor-pointer hover:bg-[#ea543a]/20 transition-all"
                    >
                        <Plus size="2vw" className="text-[#ea543a]" />
                    </div>
                    <h3 className="text-[1.25vw] font-medium text-gray-800 mb-[0.25vw]">No Flipbooks Yet</h3>
                    <p className="text-gray-400 text-[0.875vw]">Upload a PDF or choose a template to create your first flipbook</p>
                </>
            ) : (
                <>
                    <div className="w-[4vw] h-[4vw] rounded-full bg-[#ea543a]/5 flex items-center justify-center mb-[1vw] border border-[#ea543a]/10">
                        <Folder size="2vw" className="text-[#ea543a]/60" />
                    </div>
                    <h3 className="text-[1.25vw] font-medium text-gray-800 mb-[0.25vw]">No Flipbooks Found</h3>
                    <p className="text-gray-400 text-[0.875vw]">This folder is empty</p>
                </>
            )}
        </div>
    );
}
