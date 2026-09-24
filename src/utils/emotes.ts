import { EmoteDef, EmoteType } from '../types';

export const EMOTES: EmoteDef[] = [
  {
    id: 'target',
    label: 'Target Locked',
    badgeText: '🎯 TARGET LOCKED',
    icon: '🎯',
    color: '#ef4444',
  },
  {
    id: 'gg',
    label: 'GG WP',
    badgeText: '💀 GG WP',
    icon: '💀',
    color: '#a855f7',
  },
  {
    id: 'overload',
    label: 'Overload',
    badgeText: '⚡ OVERLOAD!',
    icon: '⚡',
    color: '#38bdf8',
  },
  {
    id: 'fire',
    label: 'On Fire',
    badgeText: '🔥 ON FIRE!',
    icon: '🔥',
    color: '#f97316',
  },
  {
    id: 'shield',
    label: 'Impervious',
    badgeText: '🛡️ IMPERVIOUS',
    icon: '🛡️',
    color: '#10b981',
  },
  {
    id: 'dust',
    label: 'Eat Dust',
    badgeText: '🚀 EAT DUST!',
    icon: '🚀',
    color: '#facc15',
  },
];

export function getEmoteById(id: EmoteType): EmoteDef {
  return EMOTES.find((e) => e.id === id) || EMOTES[0];
}
