import React from 'react';
import { IMOTA_LOGO_URL, IMOTA_LOGO_FALLBACK } from '../constants/assets';

interface ImotaLogoProps {
  className?: string;
  alt?: string;
  id?: string;
}

export const ImotaLogo: React.FC<ImotaLogoProps> = ({
  className = 'w-full h-full object-contain',
  alt = 'Imota LCDA Official Logo',
  id,
}) => {
  return (
    <img
      id={id}
      src={IMOTA_LOGO_URL}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback to local copy if remote CDN fails
        if (e.currentTarget.src !== IMOTA_LOGO_FALLBACK && !e.currentTarget.src.endsWith(IMOTA_LOGO_FALLBACK)) {
          e.currentTarget.src = IMOTA_LOGO_FALLBACK;
        }
      }}
    />
  );
};
