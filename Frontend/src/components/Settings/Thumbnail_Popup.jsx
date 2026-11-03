import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import ColorPallet from '../ColorPallet';
import ColorPicker from '../ColorPicker';
import { resolveUploadsPath } from '../../utils/assetUtils';

const ThumbnailPopup = ({ isOpen, onClose, bannerBg, setBannerBg, onStartCrop }) => {
  const [isColorPalletOpen, setIsColorPalletOpen] = useState(false);
  const [isGradientPickerOpen, setIsGradientPickerOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#E8D4C8');
  const [customGradient, setCustomGradient] = useState('linear-gradient(to right, #597810ff  0%, #e6f0d0ff 100%)');
  const [uploadedImage, setUploadedImage] = useState(null);

  if (!isOpen) return null;

  const colors = [
    '#8a4419ff', '#597810ff', '#20509cff', '#951b48ff', '#909018ff', '#1f8686ff',
    '#dcd0f0ff', '#e6f0d0ff', '#cee7f3','#ddf0d0ff', '#F0D0DC'
  ];
  
  const gradients = [
    'linear-gradient(to right, #597810ff  0%, #e6f0d0ff 100%)',
    'linear-gradient(to right, #cee7f3 0%, #20509cff 100%)',
    'linear-gradient(to right, #81163dff 0%, #a75573ff 50%, #F0D0DC 100%)',
    'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)',
    'linear-gradient(120deg, #e0c3fc 0%, #531b88ff 100%)'
  ];

  const isCustomBanner = uploadedImage || (bannerBg?.type === 'media' && bannerBg?.value);
  let displayBannerSrc = uploadedImage?.src;
  if (!displayBannerSrc && bannerBg?.type === 'media' && bannerBg?.value) {
    displayBannerSrc = bannerBg.value.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
  }

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (onStartCrop) {
          onStartCrop(file, 'banner');
        } else {
          const objectUrl = URL.createObjectURL(file);
          setUploadedImage({
            src: objectUrl,
            name: file.name || 'Image',
            width: 'Auto',
            height: 'Auto',
            size: (file.size / 1024).toFixed(1) + ' KB'
          });
          setBannerBg({ type: 'media', file, value: `url(${objectUrl})` });
        }
      }
    };
    input.click();
  };

  return (
    <div className="absolute top-[1.5vw] right-[1vw] w-[18.5vw] min-w-[315px] max-w-[360px] bg-white rounded-[0.8vw] shadow-[0_12px_36px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.08)] border border-gray-100 p-[1.1vw] z-[100]">
      <div className="flex justify-between items-center mb-[0.9vw]">
        <h3 className="text-[0.95vw] font-bold text-gray-800">Edit Thumbnail</h3>
        <button onClick={onClose} className="p-[0.2vw] text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
          <Icon icon="mdi:close" className="w-[1.1vw] h-[1.1vw]" />
        </button>
      </div>

      <div className="mb-[1.1vw]">
        <h4 className="text-[0.78vw] font-semibold text-gray-800 mb-[0.5vw]">Solid</h4>
        <div className="flex flex-wrap gap-[0.35vw]">
          {colors.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setUploadedImage(null);
                setBannerBg({ type: 'solid', value: color });
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
                <div className="absolute top-[-2vw] right-[15vw] w-[16vw] z-[100]">
                   <ColorPallet 
                      inline={true}
                      smallMode={false}
                      color={bannerBg?.type === 'solid' ? bannerBg.value : customColor}
                      opacity={100}
                      onChange={(c) => {
                         setUploadedImage(null);
                         setCustomColor(c);
                         setBannerBg({ type: 'solid', value: c });
                      }}
                      onClose={() => setIsColorPalletOpen(false)}
                   />
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="mb-[1.1vw]">
        <h4 className="text-[0.78vw] font-semibold text-gray-800 mb-[0.5vw]">Gradient</h4>
        <div className="flex flex-wrap gap-[0.35vw]">
          {gradients.map((gradient, index) => (
            <button
              key={index}
              onClick={() => {
                setUploadedImage(null);
                setCustomGradient(gradient);
                setBannerBg({ type: 'gradient', value: gradient });
              }}
              className="w-[1.9vw] h-[1.9vw] min-w-[24px] min-h-[24px] rounded-full border border-gray-200 overflow-hidden hover:scale-110 transition-transform shadow-2xs flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: gradient }}
            />
          ))}
          <div className="relative">
            <button 
               type="button"
               onClick={() => setIsGradientPickerOpen(!isGradientPickerOpen)}
               className="w-[1.9vw] h-[1.9vw] min-w-[24px] min-h-[24px] rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-2xs bg-gray-50 flex items-center justify-center cursor-pointer flex-shrink-0"
               title="Custom gradient picker"
            >
               <Icon icon="mdi:pencil" className="text-gray-500 w-[1.1vw] h-[1.1vw]" />
            </button>
            
            {isGradientPickerOpen && (
               <div className="absolute top-[-10vw] right-[10vw] z-[100]">
                  <ColorPicker 
                     color={bannerBg?.type === 'gradient' ? bannerBg.value : customGradient}
                     disableSolid={true}
                     onChange={(c) => {
                        setUploadedImage(null);
                        setCustomGradient(c);
                        setBannerBg({ type: 'gradient', value: c });
                     }}
                     onClose={() => setIsGradientPickerOpen(false)}
                  />
               </div>
            )}
          </div>
        </div>
      </div>

      <div>
        {isCustomBanner && displayBannerSrc ? (
          <div className="flex gap-[0.75vw] items-center p-[0.6vw] bg-gray-50/80 rounded-[0.5vw] border border-gray-200/70">
             <img 
               src={displayBannerSrc.startsWith('blob:') || displayBannerSrc.startsWith('data:') ? displayBannerSrc : resolveUploadsPath(displayBannerSrc)} 
               alt="Uploaded" 
               className="w-[3.6vw] h-[3.6vw] min-w-[46px] min-h-[46px] object-cover rounded-[0.45vw] border border-gray-200/80 shadow-2xs shrink-0" 
             />
             <div className="flex-1 min-w-0">
                <h4 className="text-[0.82vw] font-semibold text-gray-800 truncate leading-tight">Image</h4>
                <p className="text-[0.65vw] text-gray-500 mt-[0.1vw] truncate">
                   {uploadedImage?.size || 'Custom Banner'}
                </p>
                <div className="flex items-center gap-[0.35vw] mt-[0.45vw]">
                   <button 
                     onClick={handleUpload} 
                     className="px-[0.45vw] py-[0.25vw] border border-gray-200 rounded-[0.3vw] text-[0.68vw] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                   >
                      Replace Image
                   </button>
                   {onStartCrop && displayBannerSrc && (
                     <button 
                       onClick={() => {
                         const fullSrc = displayBannerSrc.startsWith('blob:') || displayBannerSrc.startsWith('data:')
                           ? displayBannerSrc
                           : resolveUploadsPath(displayBannerSrc);
                         onStartCrop(fullSrc, 'banner');
                       }} 
                       className="px-[0.45vw] py-[0.25vw] border border-gray-200 rounded-[0.3vw] text-[0.68vw] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-[0.2vw] cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                       title="Crop banner"
                     >
                       <Icon icon="solar:crop-bold" className="w-[0.8vw] h-[0.8vw] text-gray-600" />
                       <span>Crop</span>
                     </button>
                   )}
                   <button 
                     onClick={() => {
                        setUploadedImage(null);
                        setBannerBg({ type: 'gradient', value: 'linear-gradient(to bottom right, #c1e8d7, #85d8c3, #60bba3)' });
                     }} 
                     className="p-[0.3vw] border border-gray-200 rounded-[0.3vw] text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0 ml-auto"
                     title="Remove banner image"
                   >
                      <Icon icon="mdi:trash-can-outline" className="w-[0.9vw] h-[0.9vw]" />
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[0.4vw]">
            <button 
              onClick={handleUpload}
              className="w-full py-[0.6vw] border border-gray-200 rounded-[0.4vw] flex items-center justify-center gap-[0.5vw] text-[0.82vw] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Icon icon="mdi:upload" className="w-[1vw] h-[1vw]" />
              Upload Image
            </button>
            <p className="text-center text-[0.65vw] text-gray-400">Recommended size: 300 × 250 px</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailPopup;

