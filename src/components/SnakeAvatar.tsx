import React from 'react';
import { SnakeAvatarId, SnakeAvatarDef, getSnakeAvatarById } from '../utils/snakeAvatars';

interface SnakeAvatarProps {
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  showBadge?: boolean;
  showBorder?: boolean;
  showGlow?: boolean;
  rounded?: 'full' | 'xl' | '2xl';
  variant?: 'portrait' | 'card' | 'badge';
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const SnakeAvatar: React.FC<SnakeAvatarProps> = ({
  avatarId = 'angel',
  size = 'md',
  showBadge = false,
  showBorder = true,
  showGlow = false,
  rounded = 'xl',
  variant = 'portrait',
  className = '',
  onClick,
  title,
}) => {
  const avatar: SnakeAvatarDef = getSnakeAvatarById(avatarId);

  // Size mapping in pixels
  let pixelSize = 48;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'xs':
        pixelSize = 26;
        break;
      case 'sm':
        pixelSize = 36;
        break;
      case 'md':
        pixelSize = 48;
        break;
      case 'lg':
        pixelSize = 64;
        break;
      case 'xl':
        pixelSize = 88;
        break;
      case '2xl':
        pixelSize = 120;
        break;
    }
  }

  const roundedClass =
    rounded === 'full' ? 'rounded-full' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl';

  // Render SVG Mask & Details based on Avatar ID
  const renderSnakeGraphic = (isCard: boolean) => {
    switch (avatar.id) {
      case 'angel':
        return (
          <g>
            {/* Halo */}
            <ellipse
              cx="50"
              cy="22"
              rx="22"
              ry="7"
              fill="none"
              stroke="#facc15"
              strokeWidth="3.5"
              filter="drop-shadow(0 0 5px #facc15)"
            />
            <ellipse cx="50" cy="22" rx="20" ry="5.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
            {/* Wing Frills */}
            <path
              d="M 22 45 C 8 36 10 22 24 16 C 30 26 32 38 28 48 Z"
              fill="#f8fafc"
              stroke="#facc15"
              strokeWidth="2"
            />
            <path
              d="M 78 45 C 92 36 90 22 76 16 C 70 26 68 38 72 48 Z"
              fill="#f8fafc"
              stroke="#facc15"
              strokeWidth="2"
            />
            {/* Slithering cyber body curl if card */}
            {isCard && (
              <path
                d="M 32 82 C 16 75 14 60 28 50 C 44 40 48 30 50 25"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeLinecap="round"
              />
            )}
            {/* Snake Head Chassis */}
            <path
              d="M 50 28 C 36 34 32 50 36 68 C 40 82 50 90 50 90 C 50 90 60 82 64 68 C 68 50 64 34 50 28 Z"
              fill="#f8fafc"
              stroke="#38bdf8"
              strokeWidth="3"
            />
            {/* Golden Armor Inlays */}
            <path d="M 50 34 L 50 60" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
            <path d="M 42 46 L 50 54 L 58 46" fill="none" stroke="#facc15" strokeWidth="2.5" />
            {/* Glowing Cyan Eyes */}
            <ellipse cx="42" cy="52" rx="3.5" ry="6" fill="#38bdf8" transform="rotate(-15 42 52)" />
            <ellipse cx="58" cy="52" rx="3.5" ry="6" fill="#38bdf8" transform="rotate(15 58 52)" />
            <circle cx="42" cy="52" r="1.5" fill="#ffffff" />
            <circle cx="58" cy="52" r="1.5" fill="#ffffff" />
          </g>
        );

      case 'devil':
        return (
          <g>
            {/* Obsidian Magma Horns */}
            <path
              d="M 36 38 C 26 26 14 10 22 6 C 30 16 38 28 42 36 Z"
              fill="#18181b"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            <path d="M 24 12 C 28 20 34 28 38 34" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M 64 38 C 74 26 86 10 78 6 C 70 16 62 28 58 36 Z"
              fill="#18181b"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            <path d="M 76 12 C 72 20 66 28 62 34" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
            {/* Demon Head Chassis */}
            <path
              d="M 50 30 C 34 36 30 54 34 72 C 38 86 50 94 50 94 C 50 94 62 86 66 72 C 70 54 66 36 50 30 Z"
              fill="#18181b"
              stroke="#ef4444"
              strokeWidth="3"
            />
            {/* Forehead Brimstone Gem */}
            <polygon points="50,38 56,48 50,56 44,48" fill="#f97316" stroke="#ef4444" strokeWidth="1.5" />
            {/* Glowing Magma Eyes */}
            <polygon points="38,58 45,62 38,65 35,61" fill="#facc15" stroke="#ef4444" strokeWidth="1" />
            <polygon points="62,58 55,62 62,65 65,61" fill="#facc15" stroke="#ef4444" strokeWidth="1" />
            <circle cx="40" cy="62" r="1.5" fill="#ffffff" />
            <circle cx="60" cy="62" r="1.5" fill="#ffffff" />
            {/* Sharp Mandibles */}
            <path d="M 44 80 L 48 88 L 46 80" fill="#f8fafc" />
            <path d="M 56 80 L 52 88 L 54 80" fill="#f8fafc" />
          </g>
        );

      case 'void':
        return (
          <g>
            {/* Gravitational Accretion Rings */}
            <ellipse
              cx="50"
              cy="50"
              rx="44"
              ry="44"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              strokeDasharray="14 8"
              opacity="0.8"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="34"
              ry="34"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.6"
            />
            {/* Deep Space Black Hole Core */}
            <circle cx="50" cy="50" r="26" fill="#030712" stroke="#c084fc" strokeWidth="3" />
            {/* Event Horizon Lensing Eye */}
            <circle cx="50" cy="50" r="12" fill="#2e1065" stroke="#e879f9" strokeWidth="2" />
            <circle cx="50" cy="50" r="5" fill="#ffffff" />
            {/* Singularity Spikes */}
            <path d="M 50 14 L 50 24" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
            <path d="M 50 86 L 50 76" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
            <path d="M 14 50 L 24 50" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
            <path d="M 86 50 L 76 50" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'robot':
        return (
          <g>
            {/* Hydraulic Comms Antennas */}
            <path d="M 32 36 L 20 16" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M 68 36 L 80 16" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="80" cy="16" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            {/* Titanium Mecha Helmet */}
            <polygon
              points="50,26 74,38 72,74 50,92 28,74 26,38"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="3.5"
            />
            {/* Bolted Armor Plating */}
            <path d="M 28 50 L 72 50" stroke="#0ea5e9" strokeWidth="2" />
            <circle cx="34" cy="42" r="2" fill="#64748b" />
            <circle cx="66" cy="42" r="2" fill="#64748b" />
            <circle cx="36" cy="70" r="2" fill="#64748b" />
            <circle cx="64" cy="70" r="2" fill="#64748b" />
            {/* Horizontal Optic Scanner Visor */}
            <rect
              x="32"
              y="56"
              width="36"
              height="10"
              rx="4"
              fill="#082f49"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <rect x="42" y="58" width="16" height="6" rx="2" fill="#38bdf8" />
            <rect x="47" y="59" width="6" height="4" rx="1" fill="#ffffff" />
          </g>
        );

      case 'dragon':
        return (
          <g>
            {/* Golden Dragon Horns */}
            <path
              d="M 34 36 C 24 22 16 8 26 4 C 36 12 40 24 44 32 Z"
              fill="#f59e0b"
              stroke="#7c2d12"
              strokeWidth="2"
            />
            <path
              d="M 66 36 C 76 22 84 8 74 4 C 64 12 60 24 56 32 Z"
              fill="#f59e0b"
              stroke="#7c2d12"
              strokeWidth="2"
            />
            {/* Center Flame Spine Crest */}
            <path
              d="M 50 14 Q 44 26 50 36 Q 56 26 50 14"
              fill="#ea580c"
              stroke="#facc15"
              strokeWidth="1.5"
            />
            {/* Dragon Head Shell */}
            <path
              d="M 50 26 C 34 32 28 52 32 72 C 36 88 50 94 50 94 C 50 94 64 88 68 72 C 72 52 66 32 50 26 Z"
              fill="#991b1b"
              stroke="#f97316"
              strokeWidth="3.5"
            />
            {/* Draconic Whiskers */}
            <path
              d="M 32 70 C 18 72 12 84 14 92"
              fill="none"
              stroke="#facc15"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 68 70 C 82 72 88 84 86 92"
              fill="none"
              stroke="#facc15"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Glowing Golden Eyes */}
            <polygon points="38,52 46,56 38,60" fill="#facc15" stroke="#7c2d12" strokeWidth="1" />
            <polygon points="62,52 54,56 62,60" fill="#facc15" stroke="#7c2d12" strokeWidth="1" />
            <circle cx="41" cy="56" r="1.5" fill="#ffffff" />
            <circle cx="59" cy="56" r="1.5" fill="#ffffff" />
          </g>
        );

      case 'cyber':
        return (
          <g>
            {/* Glitch Displaced Pixels */}
            <rect x="20" y="24" width="12" height="4" fill="#06b6d4" opacity="0.8" />
            <rect x="70" y="68" width="14" height="4" fill="#ec4899" opacity="0.8" />
            <rect x="16" y="58" width="8" height="3" fill="#a855f7" opacity="0.8" />
            {/* Cyber Glitch Head Chassis */}
            <polygon
              points="50,22 72,34 76,70 50,92 24,70 28,34"
              fill="#2e1065"
              stroke="#ec4899"
              strokeWidth="3"
            />
            {/* Dual Color Circuit Tracks */}
            <path d="M 32 40 L 44 48 L 44 64" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
            <path d="M 68 40 L 56 48 L 56 64" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
            {/* High Tech Neon Visor */}
            <polygon points="32,54 68,54 64,68 36,68" fill="#030712" stroke="#06b6d4" strokeWidth="2" />
            <path d="M 36 61 L 64 61" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <path d="M 44 61 L 56 61" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'phoenix':
        return (
          <g>
            {/* Tri-Plume Solar Crest */}
            <path
              d="M 50 6 C 42 18 44 28 50 36 C 56 28 58 18 50 6 Z"
              fill="#fbbf24"
              stroke="#f97316"
              strokeWidth="2"
            />
            <path
              d="M 32 14 C 28 26 34 34 40 40 C 42 32 40 22 32 14 Z"
              fill="#ea580c"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <path
              d="M 68 14 C 72 26 66 34 60 40 C 58 32 60 22 68 14 Z"
              fill="#ea580c"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            {/* Head Silhouette */}
            <path
              d="M 50 28 C 36 34 30 52 34 72 C 38 88 50 94 50 94 C 50 94 62 88 66 72 C 70 52 64 34 50 28 Z"
              fill="#c2410c"
              stroke="#facc15"
              strokeWidth="3.5"
            />
            {/* Raptorial Beak / Snout */}
            <polygon points="50,72 58,86 50,96 42,86" fill="#facc15" stroke="#7c2d12" strokeWidth="1.5" />
            {/* White-Hot Solar Pupils */}
            <circle cx="40" cy="54" r="5" fill="#f97316" />
            <circle cx="60" cy="54" r="5" fill="#f97316" />
            <circle cx="40" cy="54" r="2.5" fill="#ffffff" />
            <circle cx="60" cy="54" r="2.5" fill="#ffffff" />
          </g>
        );

      case 'frost':
        return (
          <g>
            {/* Glacial Icicle Horns */}
            <polygon points="34,36 18,12 28,26 22,6 38,28" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.8" />
            <polygon points="66,36 82,12 72,26 78,6 62,28" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.8" />
            {/* Diamond Glacial Head */}
            <polygon
              points="50,24 74,38 72,74 50,94 28,74 26,38"
              fill="#0c4a6e"
              stroke="#38bdf8"
              strokeWidth="3"
            />
            {/* Crystal Facets */}
            <path d="M 50 24 L 50 94" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            <polygon points="50,38 64,56 50,72 36,56" fill="#0284c7" stroke="#e0f2fe" strokeWidth="2" />
            {/* Frost Diamond Brow */}
            <polygon points="50,44 58,54 50,64 42,54" fill="#e0f2fe" />
            {/* Icy Cyan Eyes */}
            <polygon points="36,54 44,58 36,62" fill="#e0f2fe" />
            <polygon points="64,54 56,58 64,62" fill="#e0f2fe" />
          </g>
        );

      case 'venom':
        return (
          <g>
            {/* Flared Cobra Hood */}
            <path
              d="M 28 42 C 14 36 10 56 16 72 C 22 84 32 88 36 90"
              fill="#14532d"
              stroke="#84cc16"
              strokeWidth="2.5"
            />
            <path
              d="M 72 42 C 86 36 90 56 84 72 C 78 84 68 88 64 90"
              fill="#14532d"
              stroke="#84cc16"
              strokeWidth="2.5"
            />
            {/* Venom Snake Head */}
            <path
              d="M 50 26 C 36 32 32 50 36 70 C 40 86 50 92 50 92 C 50 92 60 86 64 70 C 68 50 64 32 50 26 Z"
              fill="#052e16"
              stroke="#a3e635"
              strokeWidth="3"
            />
            {/* Biohazard Forehead Marking */}
            <circle cx="50" cy="44" r="5" fill="#a3e635" />
            {/* Glowing Slit Eyes */}
            <ellipse cx="40" cy="56" rx="4" ry="6" fill="#84cc16" />
            <rect x="39" y="52" width="2" height="8" rx="1" fill="#052e16" />
            <ellipse cx="60" cy="56" rx="4" ry="6" fill="#84cc16" />
            <rect x="59" y="52" width="2" height="8" rx="1" fill="#052e16" />
            {/* Dripping Tungsten Fangs */}
            <path d="M 42 82 L 46 94 L 44 82" fill="#86efac" stroke="#ffffff" strokeWidth="1" />
            <path d="M 58 82 L 54 94 L 56 82" fill="#86efac" stroke="#ffffff" strokeWidth="1" />
          </g>
        );

      case 'storm':
        return (
          <g>
            {/* Dual Tesla Electrodes */}
            <path d="M 32 38 L 18 18 L 10 22" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="10" cy="22" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
            <path d="M 68 38 L 82 18 L 90 22" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="90" cy="22" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
            {/* Crackling Electric Arc */}
            <path
              d="M 14 24 L 28 32 L 42 22 L 58 32 L 72 22 L 86 24"
              stroke="#93c5fd"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 2"
            />
            {/* Storm Helm Head */}
            <polygon
              points="50,24 74,38 72,74 50,92 28,74 26,38"
              fill="#1e3a8a"
              stroke="#60a5fa"
              strokeWidth="3.5"
            />
            {/* Lightning Forehead Emblem */}
            <polygon points="52,36 44,48 50,48 48,58 56,46 50,46" fill="#facc15" />
            {/* Blue Optic Visor */}
            <polygon points="34,58 66,58 60,68 40,68" fill="#0284c7" stroke="#93c5fd" strokeWidth="1.5" />
            <circle cx="44" cy="63" r="2.5" fill="#ffffff" />
            <circle cx="56" cy="63" r="2.5" fill="#ffffff" />
          </g>
        );

      case 'vampire':
        return (
          <g>
            {/* Bat-Wing Crest Ears */}
            <path
              d="M 34 36 C 24 24 12 12 18 6 C 24 16 30 20 38 28 Z"
              fill="#450a0a"
              stroke="#ef4444"
              strokeWidth="2"
            />
            <path
              d="M 66 36 C 76 24 88 12 82 6 C 76 16 70 20 62 28 Z"
              fill="#450a0a"
              stroke="#ef4444"
              strokeWidth="2"
            />
            {/* Gothic Vampire Head */}
            <path
              d="M 50 26 C 36 32 30 50 34 72 C 38 88 50 94 50 94 C 50 94 62 88 66 72 C 70 50 64 32 50 26 Z"
              fill="#18181b"
              stroke="#dc2626"
              strokeWidth="3.5"
            />
            {/* Blood Ruby Forehead Gem */}
            <polygon points="50,38 56,48 50,56 44,48" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />
            {/* Crimson Eyes */}
            <polygon points="38,58 45,62 38,66" fill="#f87171" />
            <polygon points="62,58 55,62 62,66" fill="#f87171" />
            {/* Long Vampire Fangs */}
            <path d="M 44 80 L 48 94 L 46 80" fill="#ffffff" />
            <path d="M 56 80 L 52 94 L 54 80" fill="#ffffff" />
            {/* Blood Drop */}
            <circle cx="48" cy="98" r="2" fill="#ef4444" />
          </g>
        );

      case 'chrono':
        return (
          <g>
            {/* Clockwork Brass Gear Horns */}
            <circle cx="28" cy="30" r="14" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
            <circle cx="28" cy="30" r="6" fill="#b45309" />
            <circle cx="72" cy="30" r="14" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
            <circle cx="72" cy="30" r="6" fill="#b45309" />
            {/* Chrono Mask Chassis */}
            <polygon
              points="50,24 74,38 72,74 50,92 28,74 26,38"
              fill="#0f172a"
              stroke="#0284c7"
              strokeWidth="3.5"
            />
            {/* Central Clock Dial */}
            <circle cx="50" cy="56" r="16" fill="#0369a1" stroke="#fef08a" strokeWidth="2" />
            <line x1="50" y1="56" x2="50" y2="44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="56" x2="58" y2="56" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="56" r="3" fill="#ffffff" />
          </g>
        );

      case 'ninja':
        return (
          <g>
            {/* Shuriken Blade Horn Fins */}
            <polygon points="34,36 16,16 28,26" fill="#18181b" stroke="#a855f7" strokeWidth="2" />
            <polygon points="66,36 84,16 72,26" fill="#18181b" stroke="#a855f7" strokeWidth="2" />
            {/* Shinobi Cowl Head */}
            <polygon
              points="50,22 74,36 72,74 50,92 28,74 26,36"
              fill="#09090b"
              stroke="#7e22ce"
              strokeWidth="3.5"
            />
            {/* Forehead Kunai Guard */}
            <path d="M 36 40 L 64 40 L 50 48 Z" fill="#27272a" stroke="#a855f7" strokeWidth="1.5" />
            {/* Narrow Crimson Slit Visor */}
            <rect
              x="34"
              y="54"
              width="32"
              height="8"
              rx="3"
              fill="#450a0a"
              stroke="#ef4444"
              strokeWidth="2"
            />
            <rect x="42" y="56" width="16" height="4" rx="2" fill="#ef4444" />
            <circle cx="50" cy="58" r="2" fill="#ffffff" />
          </g>
        );

      case 'crystal':
        return (
          <g>
            {/* Multi-faceted Prismatic Crystal Shards */}
            <polygon points="30,34 16,14 26,24" fill="#a5f3fc" stroke="#6366f1" strokeWidth="2" />
            <polygon points="50,20 44,4 56,4" fill="#67e8f9" stroke="#6366f1" strokeWidth="2" />
            <polygon points="70,34 84,14 74,24" fill="#a5f3fc" stroke="#6366f1" strokeWidth="2" />
            {/* Geode Crystal Head */}
            <polygon
              points="50,22 74,38 72,74 50,94 28,74 26,38"
              fill="#1e1b4b"
              stroke="#818cf8"
              strokeWidth="3.5"
            />
            {/* Internal Crystalline Facets */}
            <polygon points="50,36 66,54 50,72 34,54" fill="#312e81" stroke="#67e8f9" strokeWidth="2" />
            <polygon points="50,44 60,54 50,64 40,54" fill="#67e8f9" opacity="0.9" />
            <polygon points="50,48 55,54 50,60 45,54" fill="#ffffff" />
          </g>
        );

      case 'alien':
        return (
          <g>
            {/* Xenomorph Ribbed Antennae */}
            <path
              d="M 32 38 C 22 24 16 12 24 6"
              fill="none"
              stroke="#84cc16"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="24" cy="6" r="3.5" fill="#a3e635" />
            <path
              d="M 68 38 C 78 24 84 12 76 6"
              fill="none"
              stroke="#84cc16"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="76" cy="6" r="3.5" fill="#a3e635" />
            {/* Biomechanical Elongated Carapace */}
            <ellipse
              cx="50"
              cy="58"
              rx="24"
              ry="34"
              fill="#022c22"
              stroke="#16a34a"
              strokeWidth="3.5"
            />
            {/* Exoskeleton Rib Segments */}
            <path d="M 34 46 Q 50 40 66 46" stroke="#22c55e" strokeWidth="2.5" fill="none" />
            <path d="M 32 58 Q 50 52 68 58" stroke="#22c55e" strokeWidth="2.5" fill="none" />
            <path d="M 34 70 Q 50 64 66 70" stroke="#22c55e" strokeWidth="2.5" fill="none" />
            {/* Glowing Alien Compound Eyes */}
            <ellipse cx="40" cy="50" rx="5" ry="8" fill="#4ade80" transform="rotate(-15 40 50)" />
            <ellipse cx="60" cy="50" rx="5" ry="8" fill="#4ade80" transform="rotate(15 60 50)" />
            <circle cx="40" cy="49" r="2" fill="#ffffff" />
            <circle cx="60" cy="49" r="2" fill="#ffffff" />
          </g>
        );

      default:
        return null;
    }
  };

  // Archetype icon emblem in top-left (mirroring the user's reference cards)
  const renderEmblemIcon = (dim: number = 18) => {
    switch (avatar.id) {
      case 'angel':
        return <span style={{ fontSize: `${dim}px` }}>🪽</span>;
      case 'devil':
        return <span style={{ fontSize: `${dim}px` }}>🔱</span>;
      case 'void':
        return <span style={{ fontSize: `${dim}px` }}>🌀</span>;
      case 'robot':
        return <span style={{ fontSize: `${dim}px` }}>⚙️</span>;
      case 'dragon':
        return <span style={{ fontSize: `${dim}px` }}>🔥</span>;
      case 'cyber':
        return <span style={{ fontSize: `${dim}px` }}>⚡</span>;
      case 'phoenix':
        return <span style={{ fontSize: `${dim}px` }}>☀️</span>;
      case 'frost':
        return <span style={{ fontSize: `${dim}px` }}>❄️</span>;
      case 'venom':
        return <span style={{ fontSize: `${dim}px` }}>☣️</span>;
      case 'storm':
        return <span style={{ fontSize: `${dim}px` }}>⚡</span>;
      case 'vampire':
        return <span style={{ fontSize: `${dim}px` }}>🦇</span>;
      case 'chrono':
        return <span style={{ fontSize: `${dim}px` }}>⏱️</span>;
      case 'ninja':
        return <span style={{ fontSize: `${dim}px` }}>🥷</span>;
      case 'crystal':
        return <span style={{ fontSize: `${dim}px` }}>💎</span>;
      case 'alien':
        return <span style={{ fontSize: `${dim}px` }}>👽</span>;
      default:
        return <span style={{ fontSize: `${dim}px` }}>🐍</span>;
    }
  };

  // FULL CARD VARIANT (Mirrors the exact card format from the user's reference image)
  if (variant === 'card') {
    return (
      <div
        onClick={onClick}
        className={`relative rounded-2xl overflow-hidden border-2 bg-gradient-to-b ${avatar.cardBg} transition-all duration-200 select-none flex flex-col ${
          onClick ? 'cursor-pointer hover:scale-102 active:scale-98' : ''
        } ${className}`}
        style={{
          borderColor: avatar.borderColor,
          boxShadow: showGlow ? `0 0 20px ${avatar.glowColor}40` : undefined,
          width: pixelSize ? `${pixelSize}px` : '100%',
        }}
        title={title || `${avatar.name} - ${avatar.title}`}
      >
        {/* Top Header Banner matching the user image */}
        <div
          className="flex items-center justify-between px-3 py-1.5 border-b"
          style={{
            borderColor: `${avatar.borderColor}60`,
            backgroundColor: `${avatar.borderColor}15`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center border text-[11px]"
              style={{
                borderColor: avatar.borderColor,
                backgroundColor: `${avatar.borderColor}30`,
              }}
            >
              {renderEmblemIcon(11)}
            </div>
            <span
              className="font-cyber font-black text-xs tracking-widest uppercase"
              style={{ color: avatar.themeColor }}
            >
              {avatar.archetypeLabel}
            </span>
          </div>
          <span className="text-[9px] font-cyber font-bold text-slate-400">
            {avatar.badge}
          </span>
        </div>

        {/* Card Body with Grid & Snake Graphic */}
        <div className="relative p-3 flex items-center justify-center min-h-[120px] overflow-hidden">
          {/* Subtle cyber grid backdrop */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(${avatar.borderColor} 1px, transparent 1px), linear-gradient(to right, ${avatar.borderColor} 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Main Snake Visual (Authentic Asset from zip with Vector Fallback) */}
          <img
            src={`/assets/snakes/${avatar.id}.png`}
            alt={avatar.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Hide broken img if any and reveal fallback
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'block';
            }}
            className="w-full h-full max-h-[110px] object-contain relative z-10 filter drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
          />
          <svg
            viewBox="0 0 100 100"
            style={{ display: 'none' }}
            className="w-full h-full max-h-[110px] filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
          >
            {renderSnakeGraphic(true)}
          </svg>

          {/* Mini right-side mask emblem from the user's reference image */}
          <div
            className="absolute right-2 top-2 w-7 h-7 rounded-lg border flex items-center justify-center bg-slate-950/70 backdrop-blur-sm overflow-hidden"
            style={{ borderColor: `${avatar.borderColor}50` }}
          >
            <img
              src={`/assets/snakes/${avatar.id}.png`}
              alt={avatar.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = 'block';
              }}
              className="w-5 h-5 object-contain"
            />
            <svg viewBox="0 0 100 100" style={{ display: 'none' }} className="w-5 h-5">
              {renderSnakeGraphic(false)}
            </svg>
          </div>
        </div>

        {/* Card Footer Details */}
        <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80">
          <span className="font-cyber font-bold text-xs text-white block truncate">
            {avatar.name}
          </span>
          <span
            className="text-[10px] font-cyber font-semibold block truncate"
            style={{ color: avatar.themeColor }}
          >
            {avatar.title}
          </span>
        </div>
      </div>
    );
  }

  // PORTRAIT & BADGE AVATAR (Default circular or squircle profile pic)
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-all duration-200 ${roundedClass} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        backgroundColor: '#090d16',
        border: showBorder ? `2px solid ${avatar.borderColor}` : undefined,
        boxShadow: showGlow
          ? `0 0 14px ${avatar.glowColor}60, inset 0 0 10px ${avatar.themeColor}30`
          : undefined,
      }}
      title={title || `${avatar.name} (${avatar.archetypeLabel})`}
    >
      {/* Ambient background radiant gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at center, ${avatar.themeColor} 0%, transparent 75%)`,
        }}
      />

      {/* Cyber Snake Head Portrait: Uses the authentic asset from the zip */}
      <img
        src={`/assets/snakes/${avatar.id}.png`}
        alt={avatar.name}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback) (fallback as HTMLElement).style.display = 'block';
        }}
        className="w-[86%] h-[86%] object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
      />
      <svg
        viewBox="0 0 100 100"
        style={{ display: 'none' }}
        className="w-[84%] h-[84%] relative z-10 filter drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
      >
        {renderSnakeGraphic(false)}
      </svg>

      {/* Optional Corner Archetype Emblem Badge */}
      {showBadge && pixelSize >= 38 && (
        <div
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border flex items-center justify-center bg-slate-950 text-[9px] shadow-sm z-20"
          style={{ borderColor: avatar.borderColor }}
        >
          {renderEmblemIcon(9)}
        </div>
      )}
    </div>
  );
};
