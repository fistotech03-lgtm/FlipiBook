import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import ColorPallet from '../ColorPallet';
import p1 from '../../assets/settings/p1.png';
import p2 from '../../assets/settings/p2.png';
import p3 from '../../assets/settings/p3.png';
import p4 from '../../assets/settings/p4.png';
import p5 from '../../assets/settings/p5.png';
import { resolveUploadsPath } from '../../utils/assetUtils';

const AvatarPopup = ({ isOpen, onClose, onSelectAvatar, onSelectColor, currentAvatar, onStartCrop }) => {
  const [isColorPalletOpen, setIsColorPalletOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#E8D4C8');
  const [uploadedImage, setUploadedImage] = useState(null);

  if (!isOpen) return null;

  const colors = [
    '#8a4419ff', '#597810ff', '#20509cff', '#951b48ff', '#909018ff', '#1f8686ff',
    '#dcd0f0ff', '#e6f0d0ff', '#cee7f3','#ddf0d0ff', '#F0D0DC'
  ];
  
  const avatars = [p1, p2, p3, p4, p5];

  const isPresetAvatar = avatars.includes(currentAvatar);
  const isCustomUploaded = uploadedImage || (currentAvatar && currentAvatar !== 'color_only' && !isPresetAvatar);
  const displayImageSrc = uploadedImage?.src || (isCustomUploaded ? currentAvatar : null);

  const handleSelectPresetAvatar = async (avatarSrc) => {
    try {
      setUploadedImage(null);
      // Fetch default avatar image as a blob and convert to File to upload into Supabase Profile folder
      const response = await fetch(avatarSrc);
      const blob = await response.blob();
      const file = new File([blob], 'default_avatar.png', { type: blob.type || 'image/png' });
      onSelectAvatar(file);
    } catch (err) {
      console.error("Error converting default avatar for Supabase upload:", err);
      onSelectAvatar(avatarSrc);
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (onStartCrop) {
          onStartCrop(file, 'avatar');
        } else {
          const objectUrl = URL.createObjectURL(file);
          setUploadedImage({
            src: objectUrl,
            name: file.name || 'Image',
            width: 'Auto',
            height: 'Auto',
            size: (file.size / 1024).toFixed(1) + ' KB'
          });
          onSelectAvatar(file);
        }
      }
    };
    input.click();
  };

  return (
    <div className="absolute top-[2vw] left-[2vw] w-[18.5vw] min-w-[315px] max-w-[360px] bg-white rounded-[0.8vw] shadow-[0_12px_36px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.08)] border border-gray-100 p-[1.1vw] z-50">
      <div className="flex justify-between items-center mb-[0.9vw]">
        <h3 className="text-[0.95vw] font-bold text-gray-800">Edit Profile</h3>
        <button onClick={onClose} className="p-[0.2vw] text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
          <Icon icon="mdi:close" className="w-[1.1vw] h-[1.1vw]" />
        </button>
      </div>

      <div className="mb-[1.1vw]">
        <h4 className="text-[0.78vw] font-semibold text-gray-800 mb-[0.5vw]">Solid Color</h4>
        <div className="flex flex-wrap gap-[0.35vw]">
          {colors.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setUploadedImage(null);
                onSelectColor(color);
              }}
              className="w-[1.9vw] h-[1.9vw] min-w-[24px] min-h-[24px] rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-2xs flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="relative">
             <button 
                type="button"
                onClick={() => setIsColorPalletOpen(!isColorPalletOpen)}
                className="w-[1.9vw] h-[1.9vw] min-w-[24px] min-h-[24px] rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-2xs bg-gray-50 flex items-center justify-center cursor-pointer flex-shrink-0"
                title="Custom color picker"
             >
                <Icon icon="mdi:pencil" className="text-gray-500 w-[1.1vw] h-[1.1vw]" />
             </button>
             
             {isColorPalletOpen && (
                <div className="absolute top-[-5vw] right-[-17vw] w-[16vw] z-[100]">
                   <ColorPallet 
                      inline={true}
                      smallMode={false}
                      color={customColor}
                      opacity={100}
                      onChange={(c) => {
                         setUploadedImage(null);
                         setCustomColor(c);
                         onSelectColor(c);
                      }}
                      onClose={() => setIsColorPalletOpen(false)}
                   />
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="mb-[1.1vw]">
        <h4 className="text-[0.78vw] font-semibold text-gray-800 mb-[0.5vw]">Avatar</h4>
        <div className="grid grid-cols-5 gap-[0.5vw]">
          {avatars.map((avatar, index) => (
            <button
              key={index}
              onClick={() => handleSelectPresetAvatar(avatar)}
              className="w-[2.4vw] h-[2.4vw] min-w-[32px] min-h-[32px] rounded-full border border-gray-200 overflow-hidden hover:scale-105 transition-transform bg-[#f5f5f5] shadow-2xs flex items-center justify-center cursor-pointer"
            >
              <img src={avatar} alt={`Avatar ${index + 1}`} className="w-[90%] h-[90%] object-cover rounded-full" />
            </button>
          ))}
        </div>
      </div>

      <div>
        {isCustomUploaded && displayImageSrc ? (
          <div className="flex gap-[0.75vw] items-center p-[0.6vw] bg-gray-50/80 rounded-[0.5vw] border border-gray-200/70">
             <img 
               src={displayImageSrc.startsWith('blob:') || displayImageSrc.startsWith('data:') ? displayImageSrc : resolveUploadsPath(displayImageSrc)} 
               alt="Uploaded" 
               className="w-[3.6vw] h-[3.6vw] min-w-[46px] min-h-[46px] object-cover rounded-[0.45vw] border border-gray-200/80 shadow-2xs shrink-0" 
               referrerPolicy="no-referrer" 
             />
             <div className="flex-1 min-w-0">
                <h4 className="text-[0.82vw] font-semibold text-gray-800 truncate leading-tight">Image</h4>
                <p className="text-[0.65vw] text-gray-500 mt-[0.1vw] truncate">
                   {uploadedImage?.size || 'Custom Avatar'}
                </p>
                <div className="flex items-center gap-[0.35vw] mt-[0.45vw]">
                   <button 
                     onClick={handleUpload} 
                     className="px-[0.45vw] py-[0.25vw] border border-gray-200 rounded-[0.3vw] text-[0.68vw] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                   >
                      Replace Image
                   </button>
                   {onStartCrop && displayImageSrc && (
                     <button 
                       onClick={() => {
                         const fullSrc = displayImageSrc.startsWith('blob:') || displayImageSrc.startsWith('data:')
                           ? displayImageSrc
                           : resolveUploadsPath(displayImageSrc);
                         onStartCrop(fullSrc, 'avatar');
                       }} 
                       className="px-[0.45vw] py-[0.25vw] border border-gray-200 rounded-[0.3vw] text-[0.68vw] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-[0.2vw] cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                       title="Crop avatar"
                     >
                       <Icon icon="solar:crop-bold" className="w-[0.8vw] h-[0.8vw] text-gray-600" />
                       <span>Crop</span>
                     </button>
                   )}
                   <button 
                     onClick={() => {
                        setUploadedImage(null);
                        onSelectAvatar(null);
                     }} 
                     className="p-[0.3vw] border border-gray-200 rounded-[0.3vw] text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0 ml-auto"
                     title="Delete avatar"
                   >
                      <Icon icon="mdi:trash-can-outline" className="w-[0.9vw] h-[0.9vw]" />
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <button 
            onClick={handleUpload}
            className="w-full py-[0.6vw] border border-gray-200 rounded-[0.4vw] flex items-center justify-center gap-[0.5vw] text-[0.82vw] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Icon icon="mdi:upload" className="w-[1vw] h-[1vw]" />
            Upload Image
          </button>
        )}
      </div>
    </div>
  );
};

export default AvatarPopup;

