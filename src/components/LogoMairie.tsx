import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface LogoMairieProps {
  className?: string;
  src?: string;
  alt?: string;
  badge?: boolean;
}

export default function LogoMairie({ 
  className = "w-16 h-16", 
  src, 
  alt = "Armoiries Officielles de la Mairie de Libreville",
  badge
}: LogoMairieProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(() => {
    if (src !== undefined) return src || null;
    return typeof window !== 'undefined' ? (localStorage.getItem('digicab_custom_logo') || null) : null;
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (src !== undefined) {
      setLogoSrc(src || null);
      setImgError(false);
    }
  }, [src]);

  useEffect(() => {
    const handleUpdate = () => {
      if (src === undefined) {
        const stored = localStorage.getItem('digicab_custom_logo');
        setLogoSrc(stored || null);
        setImgError(false);
      }
    };

    window.addEventListener('settings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('settings-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [src]);

  const isWatermark = className.includes('grayscale') || badge === false;
  const containerClasses = isWatermark
    ? `flex items-center justify-center overflow-hidden ${className}`
    : `flex items-center justify-center p-1 rounded-2xl bg-white shadow-xl border border-gold/40 ring-2 ring-navy/10 overflow-hidden ${className}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={containerClasses}
      title={alt}
    >
      {logoSrc && !imgError ? (
        <img 
          src={logoSrc} 
          alt={alt} 
          onError={() => setImgError(true)}
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
        />
      ) : (
        /* Official Heraldic Coat of Arms of Libreville (Permanent, Vector-Sharp at all scales) */
        <svg 
          viewBox="0 0 300 240" 
          className="w-full h-full object-contain filter drop-shadow-sm select-none" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          <linearGradient id="goldLions" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="brickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>
          <clipPath id="shieldShape">
            <path d="M100 70 L200 70 L200 135 C200 185 150 205 150 205 C150 205 100 185 100 135 Z" />
          </clipPath>
        </defs>

        {/* Mural Crown (Couronne murale crénelée dorée) */}
        <g transform="translate(95, 28)">
          <rect x="20" y="0" width="16" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="42" y="0" width="16" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="64" y="0" width="16" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="86" y="0" width="16" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="10" y="10" width="18" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="30" y="10" width="18" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="50" y="10" width="18" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="70" y="10" width="18" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="90" y="10" width="18" height="10" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" />
          <rect x="5" y="20" width="100" height="12" fill="url(#brickGrad)" stroke="#92400E" strokeWidth="1.5" rx="1" />
        </g>

        {/* Left Gabonese Flag & Spear (Drapeau tricolore Gabonais gauche) */}
        <g transform="translate(45, 10)">
          <line x1="45" y1="10" x2="60" y2="120" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <polygon points="45,8 43,15 47,15" fill="#F59E0B" />
          <rect x="15" y="15" width="30" height="7" fill="#15803D" stroke="#000" strokeWidth="0.5" />
          <rect x="15" y="22" width="30" height="7" fill="#FACC15" stroke="#000" strokeWidth="0.5" />
          <rect x="15" y="29" width="30" height="7" fill="#1D4ED8" stroke="#000" strokeWidth="0.5" />
        </g>

        {/* Right Gabonese Flag & Spear (Drapeau tricolore Gabonais droit) */}
        <g transform="translate(195, 10)">
          <line x1="15" y1="10" x2="0" y2="120" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <polygon points="15,8 13,15 17,15" fill="#F59E0B" />
          <rect x="15" y="15" width="30" height="7" fill="#15803D" stroke="#000" strokeWidth="0.5" />
          <rect x="15" y="22" width="30" height="7" fill="#FACC15" stroke="#000" strokeWidth="0.5" />
          <rect x="15" y="29" width="30" height="7" fill="#1D4ED8" stroke="#000" strokeWidth="0.5" />
        </g>

        {/* Left Sea-Lion (Lion-marin d'or gauche) */}
        <g fill="url(#goldLions)" stroke="#92400E" strokeWidth="1.5">
          <circle cx="55" cy="85" r="14" />
          <path d="M48 76 C40 70 38 90 45 92" />
          <path d="M42 85 C35 88 40 100 48 97" />
          <polygon points="62,83 67,81 65,86" fill="#DC2626" stroke="#991B1B" strokeWidth="0.5" />
          <circle cx="58" cy="80" r="2" fill="#000" stroke="none" />
          <path d="M52 95 C45 110 50 140 65 155 C72 165 65 185 50 200 C40 210 30 200 25 185 C20 170 30 160 35 150 C40 140 42 120 48 100 Z" />
          <path d="M62 105 C75 100 85 95 98 100 C92 106 82 110 70 115 Z" />
          <path d="M68 130 C80 128 92 135 99 142 C90 145 80 140 68 138 Z" />
          <path d="M42 205 C25 215 15 210 18 190 C25 195 32 195 38 195 Z" fill="#D97706" />
          <path d="M52 208 C45 225 55 230 68 220 C60 215 56 210 52 208 Z" fill="#D97706" />
        </g>

        {/* Right Sea-Lion (Lion-marin d'or droit) */}
        <g transform="translate(300, 0) scale(-1, 1)" fill="url(#goldLions)" stroke="#92400E" strokeWidth="1.5">
          <circle cx="55" cy="85" r="14" />
          <path d="M48 76 C40 70 38 90 45 92" />
          <path d="M42 85 C35 88 40 100 48 97" />
          <polygon points="62,83 67,81 65,86" fill="#DC2626" stroke="#991B1B" strokeWidth="0.5" />
          <circle cx="58" cy="80" r="2" fill="#000" stroke="none" />
          <path d="M52 95 C45 110 50 140 65 155 C72 165 65 185 50 200 C40 210 30 200 25 185 C20 170 30 160 35 150 C40 140 42 120 48 100 Z" />
          <path d="M62 105 C75 100 85 95 98 100 C92 106 82 110 70 115 Z" />
          <path d="M68 130 C80 128 92 135 99 142 C90 145 80 140 68 138 Z" />
          <path d="M42 205 C25 215 15 210 18 190 C25 195 32 195 38 195 Z" fill="#D97706" />
          <path d="M52 208 C45 225 55 230 68 220 C60 215 56 210 52 208 Z" fill="#D97706" />
        </g>

        {/* Central Escutcheon (Écu de Libreville) */}
        <g clipPath="url(#shieldShape)">
          {/* Top: Black field with broken chain (Chef de sable à la chaîne brisée) */}
          <rect x="100" y="70" width="100" height="38" fill="#0F172A" />
          <ellipse cx="125" cy="88" rx="8" ry="4.5" fill="none" stroke="#E2E8F0" strokeWidth="2" />
          <line x1="133" y1="88" x2="140" y2="85" stroke="#E2E8F0" strokeWidth="2.5" />
          <ellipse cx="148" cy="85" rx="7" ry="4" fill="none" stroke="#E2E8F0" strokeWidth="2" />
          <line x1="155" y1="85" x2="162" y2="90" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="2,2" />
          <ellipse cx="172" cy="90" rx="8" ry="4.5" fill="none" stroke="#E2E8F0" strokeWidth="2" />

          {/* Middle: Azure with Rising Sun (Champ d'azur au soleil d'or rayonnant) */}
          <rect x="100" y="108" width="100" height="52" fill="#1E3A8A" />
          <circle cx="150" cy="155" r="24" fill="url(#sunGrad)" />
          <line x1="150" y1="125" x2="150" y2="114" stroke="#FDE047" strokeWidth="2.5" />
          <line x1="136" y1="132" x2="128" y2="122" stroke="#FDE047" strokeWidth="2.5" />
          <line x1="164" y1="132" x2="172" y2="122" stroke="#FDE047" strokeWidth="2.5" />
          <line x1="125" y1="145" x2="115" y2="140" stroke="#FDE047" strokeWidth="2.5" />
          <line x1="175" y1="145" x2="185" y2="140" stroke="#FDE047" strokeWidth="2.5" />

          {/* Base: Green & Silver Waves (Fascé-ondé de sinople et d'argent) */}
          <rect x="100" y="155" width="100" height="50" fill="#047857" />
          <path d="M100 165 Q125 160 150 165 T200 165" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M100 175 Q125 170 150 175 T200 175" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M100 185 Q125 180 150 185 T200 185" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M100 195 Q125 190 150 195 T200 195" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.8" />
        </g>

        {/* Shield Outer Golden Border */}
        <path d="M100 70 L200 70 L200 135 C200 185 150 205 150 205 C150 205 100 185 100 135 Z" fill="none" stroke="#D4AF37" strokeWidth="4" />
        <path d="M100 70 L200 70 L200 135 C200 185 150 205 150 205 C150 205 100 185 100 135 Z" fill="none" stroke="#1E293B" strokeWidth="1.5" />

        {/* Official Banner "LIBREVILLE" */}
        <g transform="translate(150, 218)">
          <path d="M-80 -6 Q0 8 80 -6 L75 14 Q0 26 -75 14 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
          <polygon points="-80,-6 -95,-12 -90,4 -75,14" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
          <polygon points="80,-6 95,-12 90,4 75,14" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
          <text x="0" y="8" fontFamily="'Times New Roman', serif" fontSize="11" fontWeight="900" letterSpacing="3" textAnchor="middle" fill="#0F172A">LIBREVILLE</text>
        </g>
      </svg>
      )}
    </motion.div>
  );
}
