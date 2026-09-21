import { SnakeArchetype } from '../types';

export interface ArchetypeAbilityDef {
  archetype: SnakeArchetype;
  name: string;
  icon: string;
  badge: string;
  themeColor: string;
  glowColor: string;
  // Active Ability
  activeName: string;
  activeDesc: string;
  activeCooldown: number; // in seconds (12s - 22s)
  activeDuration: number; // in seconds (3s - 5s)
  // Passive Ability
  passiveName: string;
  passiveDesc: string;
  // Lv.2 Style Upgrade details
  lv2Title: string;
  lv2Desc: string;
  lv2AuraName: string;
}

export const ARCHETYPE_ABILITIES: Record<SnakeArchetype, ArchetypeAbilityDef> = {
  angel: {
    archetype: 'angel',
    name: 'Seraphim Angel',
    icon: '🪽',
    badge: 'DIVINE',
    themeColor: '#facc15',
    glowColor: '#fef08a',
    activeName: 'Divine Shield',
    activeDesc: 'Summons a radiant celestial halo bubble for 3.0s that deflects all incoming bullets.',
    activeCooldown: 18,
    activeDuration: 3.0,
    passiveName: 'Grace',
    passiveDesc: 'Slowly regenerates +3.5 HP/sec when out of combat and not taking damage for 3s.',
    lv2Title: 'Lv.2 Seraphic Ascension',
    lv2Desc: 'Shield duration +0.8s and grace aura pulses faint blinding light.',
    lv2AuraName: 'Holy Starlight Aura',
  },
  devil: {
    archetype: 'devil',
    name: 'Infernal Devil',
    icon: '😈',
    badge: 'DEMON',
    themeColor: '#ef4444',
    glowColor: '#f87171',
    activeName: 'Hellfire Burst',
    activeDesc: 'Unleashes an expanding vortex ring of hellfire around the head, burning nearby enemies.',
    activeCooldown: 16,
    activeDuration: 3.2,
    passiveName: 'Soul Harvest',
    passiveDesc: 'Each kill permanently harvests souls, granting +5% bonus damage per kill for the match.',
    lv2Title: 'Lv.2 Brimstone Awakening',
    lv2Desc: 'Hellfire burst radius expanded by +25% and leaves flaming ground embers.',
    lv2AuraName: 'Hellfire Lava Vents',
  },
  blackhole: {
    archetype: 'blackhole',
    name: 'Black Hole Void',
    icon: '🌌',
    badge: 'COSMIC',
    themeColor: '#a855f7',
    glowColor: '#c084fc',
    activeName: 'Singularity',
    activeDesc: 'Creates a massive gravitational well that vortex-pulls nearby snakes, bots, and pickups.',
    activeCooldown: 20,
    activeDuration: 3.5,
    passiveName: 'Event Horizon',
    passiveDesc: 'Passively devours stray bullets passing within 65px of the head into dark matter.',
    lv2Title: 'Lv.2 Void Anomaly',
    lv2Desc: 'Singularity pull power increased by +35% with distorted gravity ripple VFX.',
    lv2AuraName: 'Gravitational Singularity',
  },
  robot: {
    archetype: 'robot',
    name: 'Robot Titan MK-IV',
    icon: '🤖',
    badge: 'MECHA',
    themeColor: '#38bdf8',
    glowColor: '#7dd3fc',
    activeName: 'Overclock',
    activeDesc: 'Supercharges fire rate (+75%) and boost speed for 4.0s, followed by a brief 1.2s cooling overheat.',
    activeCooldown: 17,
    activeDuration: 4.0,
    passiveName: 'Auto-Repair',
    passiveDesc: 'Internal nanite reactors deliver steady +12 HP armor repair pulses every 4.0 seconds.',
    lv2Title: 'Lv.2 Overclocked Frame',
    lv2Desc: 'Reduces overheat penalty duration by 50% and unleashes electric sparks.',
    lv2AuraName: 'High-Voltage Discharge',
  },
  dragon: {
    archetype: 'dragon',
    name: 'Emerald Dragon',
    icon: '🐉',
    badge: 'MYTHIC',
    themeColor: '#10b981',
    glowColor: '#6ee7b7',
    activeName: 'Flame Breath',
    activeDesc: 'Breathes an incandescent cone of dragonfire in front of the head, scorching enemy snakes.',
    activeCooldown: 15,
    activeDuration: 2.8,
    passiveName: 'Scales',
    passiveDesc: 'Reinforced draconic plating absorbs 40% reduced damage from flanking and rear body hits.',
    lv2Title: 'Lv.2 Draconic Fury',
    lv2Desc: 'Increases flame breath range and ignites targets with lingering draconic burn.',
    lv2AuraName: 'Dragonfire Flare',
  },
  cyber: {
    archetype: 'cyber',
    name: 'Cyber Viper',
    icon: '⚡',
    badge: 'CYBER',
    themeColor: '#06b6d4',
    glowColor: '#67e8f9',
    activeName: 'Glitch Dash',
    activeDesc: 'Instant quantum phase-dash teleport forward that leaves a holographic decoy afterimage.',
    activeCooldown: 14,
    activeDuration: 1.8,
    passiveName: 'Hack',
    passiveDesc: 'When hit, 35% chance to disrupt & jam the attacker’s weapon system for 2.5 seconds.',
    lv2Title: 'Lv.2 Matrix Infiltration',
    lv2Desc: 'Glitch dash leaves an EMP shockwave that briefly slows nearby enemies.',
    lv2AuraName: 'Matrix Optical Camo',
  },
};

export function getArchetypeAbility(archetype?: SnakeArchetype): ArchetypeAbilityDef {
  if (!archetype) return ARCHETYPE_ABILITIES.cyber;
  return ARCHETYPE_ABILITIES[archetype] || ARCHETYPE_ABILITIES.cyber;
}
