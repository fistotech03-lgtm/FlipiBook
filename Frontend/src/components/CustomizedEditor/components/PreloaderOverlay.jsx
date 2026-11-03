import React from 'react';

const PreloaderOverlay = ({ isLoading, preloaderSettings, loadingProgress }) => {
  if (!isLoading) return null;

  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        backgroundColor: preloaderSettings?.bgColor || '#2D2F33',
        color: preloaderSettings?.textColor || '#ffffff'
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {preloaderSettings?.layout !== 'spinner' && preloaderSettings?.logo && (
          <img src={preloaderSettings.logo} alt="Preloader Logo" className="h-[60px] object-contain" />
        )}
        {preloaderSettings?.layout === 'bar' ? (
          <div className="flex flex-col items-center gap-2 w-[15vw]">
            <div className="w-full bg-gray-200/20 h-[0.5vw] rounded-full overflow-hidden">
              <div 
                className="h-full animate-pulse rounded-full" 
                style={{ 
                  width: `${loadingProgress}%`, 
                  backgroundColor: preloaderSettings?.spinnerColor || '#3B3C8A' 
                }}
              ></div>
            </div>
            {preloaderSettings?.showPercentage && (
              <span className="text-[0.85vw] font-semibold">{loadingProgress}%</span>
            )}
          </div>
        ) : preloaderSettings?.layout === 'dots' ? (
          <div className="flex flex-col items-center gap-[0.4vw] py-[0.5vw]">
            <div className="flex items-center gap-1.5">
              <div className="w-[0.6vw] h-[0.6vw] rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: preloaderSettings?.spinnerColor || '#3B3C8A' }}></div>
              <div className="w-[0.6vw] h-[0.6vw] rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: preloaderSettings?.spinnerColor || '#3B3C8A' }}></div>
              <div className="w-[0.6vw] h-[0.6vw] rounded-full animate-bounce" style={{ backgroundColor: preloaderSettings?.spinnerColor || '#3B3C8A' }}></div>
            </div>
            {preloaderSettings?.showPercentage && (
              <span className="text-[0.85vw] font-semibold">{loadingProgress}%</span>
            )}
          </div>
        ) : (
          // circular spinner
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div 
                className={`${preloaderSettings?.logo ? 'w-[80px] h-[80px]' : 'w-[3vw] h-[3vw]'} border-[3px] border-t-transparent rounded-full animate-spin`}
                style={{ 
                  borderColor: `${preloaderSettings?.spinnerColor || '#3B3C8A'} ${preloaderSettings?.spinnerColor || '#3B3C8A'} ${preloaderSettings?.spinnerColor || '#3B3C8A'} transparent` 
                }}
              ></div>
              {preloaderSettings?.logo && (
                <img src={preloaderSettings.logo} alt="Preloader Logo" className="absolute h-[45px] max-w-[60px] object-contain" />
              )}
              {preloaderSettings?.showPercentage && !preloaderSettings?.logo && (
                <span className="absolute text-[0.75vw] font-bold">{loadingProgress}%</span>
              )}
            </div>
            {preloaderSettings?.showPercentage && preloaderSettings?.logo && (
              <span className="text-[0.75vw] font-bold mt-2">{loadingProgress}%</span>
            )}
          </div>
        )}
        <p 
          className="font-semibold text-[0.9vw]"
          style={{ fontFamily: preloaderSettings?.font || 'Poppins' }}
        >
          {preloaderSettings?.text || 'Loading Modal Please Wait....'}
        </p>
      </div>
    </div>
  );
};

export default PreloaderOverlay;
