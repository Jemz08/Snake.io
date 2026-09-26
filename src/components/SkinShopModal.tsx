import React, { useState } from 'react';
import { SkinDef, DeathEffectDef, DeathEffectType, SkinRarity, EmoteType } from '../types';
import { SKINS, getSkinById, RARITY_CONFIG } from '../utils/skins';
import { DEATH_EFFECTS, getDeathEffectById } from '../utils/deathEffects';
import { EMOTES, getEmoteById } from '../utils/emotes';
import { SnakePreviewCanvas } from './SnakePreviewCanvas';
import { DeathEffectPreviewCanvas } from './DeathEffectPreviewCanvas';
import { X, Coins, Check, Lock, Sparkles, Shield, Flame, Zap, Package, MessageSquare, Volume2, Radio } from 'lucide-react';
import {
  playRetroButtonClick,
  playAbilitySound,
  playCashSound,
  playShieldDeflectSound,
} from '../utils/audio';

interface SkinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  selectedSkinId: string;
  unlockedSkinIds: string[];
  selectedDeathEffectId: DeathEffectType;
  unlockedDeathEffectIds: DeathEffectType[];
  selectedEmoteId?: EmoteType;
  onSelectSkin: (skinId: string) => void;
  onBuySkin: (skin: SkinDef) => void;
  onSelectDeathEffect: (id: DeathEffectType) => void;
  onBuyDeathEffect: (effect: DeathEffectDef) => void;
  onSelectEmote?: (emoteId: EmoteType) => void;
  onOpenCrate?: () => void;
  initialTab?: 'skins' | 'death-effects' | 'taunts';
}

const ARCHETYPE_TRAITS: Record<string, { role: string; combat: string; color: string }> = {
  phoenix: { role: 'BURST SURVIVOR', combat: 'Fire trail burns chasers • 1x match explosive rebirth', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
  frost: { role: 'CROWD CONTROL', combat: 'Sub-zero ice trail slows enemies • Bullets stack freeze', color: 'text-sky-300 border-sky-500/40 bg-sky-950/40' },
  venom: { role: 'DAMAGE OVER TIME', combat: 'Poison ground trail • Bullets inflict toxic decay', color: 'text-lime-400 border-lime-500/40 bg-lime-950/40' },
  storm: { role: 'CHAIN ASSAULT', combat: 'Bullets arc chain lightning • Boosting shocks nearby snakes', color: 'text-blue-300 border-blue-500/40 bg-blue-950/40' },
  phantom: { role: 'INFILTRATOR', combat: 'Quantum phase-shift • Passes freely through obstacles & walls', color: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/40' },
  vampire: { role: 'DRAIN TANK', combat: 'Drains HP on kills • Swarming bat death effect', color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
  chrono: { role: 'TEMPORAL WARDEN', combat: 'Time-slow distortion bubble • Rotating gear visual aura', color: 'text-amber-300 border-amber-500/40 bg-amber-950/40' },
  ninja: { role: 'MELEE ASSASSIN', combat: 'Katana dash-slash melee attack • Smoke bomb escapes', color: 'text-red-400 border-red-500/40 bg-red-950/40' },
  crystal: { role: 'JUGGERNAUT', combat: '-30% damage resistance • Prismatic facets reflect incoming bullets', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40' },
  alien: { role: 'SHIELD BREAKER', combat: 'Acid spit melts shields • Glowing bio-luminescent body', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
  angel: { role: 'GUARDIAN', combat: 'Divine Shield invulnerability • Passive health regeneration', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/40' },
  devil: { role: 'HELLFIRE BERSERKER', combat: 'Soul harvest damage stacking • Hellfire burst', color: 'text-rose-500 border-rose-500/40 bg-rose-950/40' },
  blackhole: { role: 'SINGULARITY VOID', combat: 'Gravitational vortex draws nearby food & mass', color: 'text-purple-300 border-purple-500/40 bg-purple-950/40' },
  robot: { role: 'HEAVY TITAN', combat: 'Overclock turbine • +75% rapid-fire speed burst', color: 'text-sky-400 border-sky-500/40 bg-sky-950/40' },
  dragon: { role: 'MYTHIC WYRM', combat: 'Dragon scales armor • Dragonfire breath blast', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40' },
  cyber: { role: 'TACTICAL RECON', combat: 'Holographic decoy projection • High agility', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
};

export const SkinShopModal: React.FC<SkinShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  selectedSkinId,
  unlockedSkinIds,
  selectedDeathEffectId,
  unlockedDeathEffectIds,
  selectedEmoteId = 'target',
  onSelectSkin,
  onBuySkin,
  onSelectDeathEffect,
  onBuyDeathEffect,
  onSelectEmote,
  onOpenCrate,
  initialTab = 'skins',
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'death-effects' | 'taunts'>(initialTab);
  const [inspectingSkinId, setInspectingSkinId] = useState<string>(selectedSkinId);
  const [inspectingEffectId, setInspectingEffectId] = useState<DeathEffectType>(selectedDeathEffectId);
  const [inspectingEmoteId, setInspectingEmoteId] = useState<EmoteType>(selectedEmoteId);
  const [testedEmote, setTestedEmote] = useState<EmoteType | null>(null);
  const [archetypeFilter, setArchetypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  const playTauntAudio = (emoteId: EmoteType) => {
    if (emoteId === 'target') playAbilitySound('robot');
    else if (emoteId === 'gg') playCashSound();
    else if (emoteId === 'overload') playAbilitySound('storm');
    else if (emoteId === 'fire') playAbilitySound('devil');
    else if (emoteId === 'shield') playShieldDeflectSound();
    else if (emoteId === 'dust') playAbilitySound('phoenix');
    else playRetroButtonClick();
  };

  const handleTestTaunt = (emoteId: EmoteType) => {
    setTestedEmote(emoteId);
    setInspectingEmoteId(emoteId);
    playTauntAudio(emoteId);
    setTimeout(() => {
      setTestedEmote((prev) => (prev === emoteId ? null : prev));
    }, 2200);
  };

  if (!isOpen) return null;

  const inspectingSkin = getSkinById(inspectingSkinId);
  const isSkinUnlocked = unlockedSkinIds.includes(inspectingSkin.id);
  const isSkinEquipped = selectedSkinId === inspectingSkin.id;
  const canAffordSkin = coins >= inspectingSkin.price;

  const inspectingEffect = getDeathEffectById(inspectingEffectId);
  const isEffectUnlocked = unlockedDeathEffectIds.includes(inspectingEffect.id);
  const isEffectEquipped = selectedDeathEffectId === inspectingEffect.id;
  const canAffordEffect = coins >= inspectingEffect.price;

  const filteredSkins = SKINS.filter((s) => {
    if (archetypeFilter !== 'all' && s.archetype !== archetypeFilter) return false;
    if (rarityFilter !== 'all' && s.rarity !== rarityFilter) return false;
    return true;
  });

  return (
    <div
      id="skin-shop-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[96vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-cyber text-sm sm:text-lg font-black text-white tracking-wider uppercase">
                CYBER ARMORY & EFFECTS
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                Equip skins, roll supply crates, and test retro death effects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Open Crate Quick Action */}
            {onOpenCrate && (
              <button
                type="button"
                onClick={onOpenCrate}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-400 px-3 py-1.5 rounded-xl text-amber-300 font-cyber font-black text-xs transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>ROLL CRATE (1k 🪙)</span>
              </button>
            )}

            {/* Cash / Coins indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-500/15 border border-amber-500/50 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-amber-400 font-cyber font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)] shrink-0">
              <Coins className="w-4 h-4 animate-pulse text-amber-300" />
              <span className="text-xs sm:text-sm tracking-wide font-black">${coins.toLocaleString()}</span>
            </div>

            {/* Generous touch target Close Button */}
            <button
              id="btn-close-shop"
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-400 transition-all flex items-center justify-center shrink-0 shadow-md active:scale-95"
              title="Close Armory"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 border-b border-slate-800 bg-slate-900/60 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('skins')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-cyber text-xs sm:text-sm font-bold uppercase transition-all shrink-0 ${
              activeTab === 'skins'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>CYBER SKINS ({unlockedSkinIds.length}/{SKINS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('death-effects')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-cyber text-xs sm:text-sm font-bold uppercase transition-all shrink-0 ${
              activeTab === 'death-effects'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>DEATH EFFECTS ({unlockedDeathEffectIds.length}/{DEATH_EFFECTS.length})</span>
          </button>

          <button
            type="button"
            id="tab-shop-taunts"
            onClick={() => setActiveTab('taunts')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-cyber text-xs sm:text-sm font-bold uppercase transition-all shrink-0 ${
              activeTab === 'taunts'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/60 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-yellow-400" />
            <span>COMBAT TAUNTS ({EMOTES.length})</span>
          </button>

          {onOpenCrate && (
            <button
              type="button"
              onClick={onOpenCrate}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-cyber text-xs sm:text-sm font-bold uppercase transition-all text-amber-300 hover:bg-amber-500/25 border border-amber-500/50 bg-amber-500/10 ml-auto shrink-0"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>SUPPLY CRATE</span>
            </button>
          )}
        </div>

        {/* Content Body: Skins Tab */}
        {activeTab === 'skins' && (
          <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-hidden">
            {/* Archetype Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[10px] text-cyan-400 font-bold uppercase shrink-0 font-cyber">
                SNAKES:
              </span>
              {[
                { id: 'all', label: 'All CyberSnakes', icon: '⚡' },
                { id: 'angel', label: 'Angel', icon: '🪽' },
                { id: 'devil', label: 'Devil', icon: '😈' },
                { id: 'blackhole', label: 'Blackhole', icon: '🌌' },
                { id: 'robot', label: 'Robot', icon: '🤖' },
                { id: 'dragon', label: 'Dragon', icon: '🐉' },
                { id: 'cyber', label: 'Cyber', icon: '🛡️' },
                { id: 'phoenix', label: 'Phoenix', icon: '🔥' },
                { id: 'frost', label: 'Frost', icon: '❄️' },
                { id: 'venom', label: 'Venom', icon: '🧪' },
                { id: 'storm', label: 'Storm', icon: '⚡' },
                { id: 'phantom', label: 'Phantom', icon: '👻' },
                { id: 'vampire', label: 'Vampire', icon: '🦇' },
                { id: 'chrono', label: 'Chrono', icon: '⏳' },
                { id: 'ninja', label: 'Ninja', icon: '🥷' },
                { id: 'crystal', label: 'Crystal', icon: '💎' },
                { id: 'alien', label: 'Alien', icon: '👽' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setArchetypeFilter(f.id)}
                  className={`px-2 py-0.5 rounded-lg font-cyber text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                    archetypeFilter === f.id
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* Rarity Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-1 scrollbar-none border-b border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 font-cyber">
                TIER:
              </span>
              {[
                { id: 'all', label: 'ALL TIERS', color: '#94a3b8' },
                { id: 'common', label: 'COMMON', color: RARITY_CONFIG.common.color },
                { id: 'uncommon', label: 'UNCOMMON', color: RARITY_CONFIG.uncommon.color },
                { id: 'epic', label: 'EPIC', color: RARITY_CONFIG.epic.color },
                { id: 'legendary', label: 'LEGENDARY', color: RARITY_CONFIG.legendary.color },
                { id: 'mythic', label: 'MYTHIC', color: RARITY_CONFIG.mythic.color },
                { id: 'secret', label: '★ SECRET ★', color: RARITY_CONFIG.secret.color },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRarityFilter(r.id)}
                  className={`px-2 py-0.5 rounded-md font-cyber text-[10px] font-black whitespace-nowrap transition-all border ${
                    rarityFilter === r.id
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                  style={{
                    borderColor: rarityFilter === r.id ? r.color : undefined,
                    color: rarityFilter === r.id ? r.color : undefined,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 overflow-y-auto">
              {/* Skins Grid List - Responsive & Collision-Free */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 max-h-[46vh] md:max-h-[58vh] overflow-y-auto pr-1">
                {filteredSkins.map((skin) => {
                  const unlocked = unlockedSkinIds.includes(skin.id);
                  const isCurrent = inspectingSkinId === skin.id;
                  const equipped = selectedSkinId === skin.id;
                  const rarity = skin.rarity || 'common';
                  const rConfig = RARITY_CONFIG[rarity];

                  return (
                    <button
                      key={skin.id}
                      id={`skin-item-${skin.id}`}
                      type="button"
                      onClick={() => setInspectingSkinId(skin.id)}
                      className={`relative p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-w-0 ${
                        isCurrent
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
                          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                      style={{
                        borderColor: isCurrent ? undefined : `${rConfig.color}40`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-1 gap-1.5">
                        <span
                          className="font-cyber text-xs sm:text-sm font-bold truncate flex-1 min-w-0"
                          style={{ color: isCurrent ? '#38bdf8' : rConfig.color }}
                        >
                          {skin.name}
                        </span>
                        {equipped ? (
                          <span className="bg-cyan-500 text-slate-950 font-cyber text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shrink-0">
                            EQUIPPED
                          </span>
                        ) : unlocked ? (
                          <span className="text-emerald-400 text-[10px] flex items-center gap-0.5 font-cyber shrink-0 font-bold">
                            <Check className="w-3 h-3" /> OWNED
                          </span>
                        ) : (
                          <span className="text-amber-400 text-[10px] flex items-center gap-0.5 font-cyber font-bold shrink-0">
                            <Lock className="w-3 h-3" /> ${skin.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Rarity & Archetype Tags (Flex wrap prevents text collision) */}
                      <div className="flex items-center flex-wrap gap-1 my-1">
                        <span
                          className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-cyber shrink-0"
                          style={{
                            backgroundColor: `${rConfig.color}20`,
                            color: rConfig.color,
                          }}
                        >
                          {rConfig.label}
                        </span>
                        <span className="text-[9px] font-cyber px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 uppercase font-mono shrink-0">
                          {skin.badge || skin.archetype}
                        </span>
                      </div>

                      {/* Color Swatch Preview */}
                      <div className="flex items-center gap-1.5 my-1">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: skin.primaryColor }}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: skin.secondaryColor }}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: skin.accentColor }}
                        />
                        {skin.crateExclusive && (
                          <span className="text-[8px] font-bold text-amber-300/90 uppercase font-mono ml-auto truncate">
                            ★ Crate Only
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-1">{skin.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Skin Inspection & Preview Panel */}
              <div className="md:col-span-5 flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
                <div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-cyber text-sm sm:text-base font-black"
                        style={{
                          color: RARITY_CONFIG[inspectingSkin.rarity || 'common'].color,
                        }}
                      >
                        {inspectingSkin.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span
                          className="text-[9px] font-cyber px-1.5 py-0.5 rounded uppercase font-black"
                          style={{
                            backgroundColor: `${RARITY_CONFIG[inspectingSkin.rarity || 'common'].color}25`,
                            color: RARITY_CONFIG[inspectingSkin.rarity || 'common'].color,
                          }}
                        >
                          {RARITY_CONFIG[inspectingSkin.rarity || 'common'].label}
                        </span>
                        <span className="text-[9px] font-cyber px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 uppercase font-black">
                          {inspectingSkin.badge || inspectingSkin.archetype}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{inspectingSkin.description}</p>
                    {inspectingSkin.specialAura && (
                      <p className="text-[10px] font-cyber text-amber-300 mt-0.5">
                        ✨ Aura: {inspectingSkin.specialAura}
                      </p>
                    )}

                    {/* Archetype Combat Mechanics Breakdown */}
                    {(() => {
                      const arch = inspectingSkin.archetype || 'cyber';
                      const trait = ARCHETYPE_TRAITS[arch];
                      if (!trait) return null;
                      return (
                        <div className={`mt-1.5 p-1.5 rounded-lg border text-[10px] font-cyber ${trait.color}`}>
                          <span className="font-black block uppercase tracking-wider">
                            ROLE: {trait.role}
                          </span>
                          <span className="text-[9px] text-slate-300 leading-tight block">
                            {trait.combat}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Animated 3D/Isometric Snake Preview */}
                  <div className="my-1 flex justify-center">
                    <SnakePreviewCanvas skin={inspectingSkin} width={240} height={120} />
                  </div>
                </div>

                {/* Action Buttons (Desktop Panel) */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5 shrink-0">
                  {isSkinEquipped ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-cyber font-bold text-xs tracking-wider uppercase cursor-default flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
                    </button>
                  ) : isSkinUnlocked ? (
                    <button
                      id="btn-equip-skin"
                      type="button"
                      onClick={() => onSelectSkin(inspectingSkin.id)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 active:scale-95"
                    >
                      EQUIP SKIN
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        id="btn-buy-skin"
                        type="button"
                        disabled={!canAffordSkin}
                        onClick={() => onBuySkin(inspectingSkin)}
                        className={`w-full py-2.5 rounded-xl font-cyber font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                          canAffordSkin
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>DIRECT UNLOCK (${inspectingSkin.price} CASH)</span>
                      </button>

                      {onOpenCrate && (
                        <button
                          type="button"
                          onClick={onOpenCrate}
                          className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 font-cyber font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>ROLL FROM CRATE (1,000 🪙)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Sticky Action Bar - Always visible regardless of scroll position! */}
            <div className="md:hidden sticky bottom-0 left-0 right-0 z-20 bg-slate-950/95 border-t border-cyan-500/30 p-2.5 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 mt-2 -mx-3 -mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: inspectingSkin.primaryColor,
                    borderColor: inspectingSkin.accentColor,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: inspectingSkin.secondaryColor }}
                  />
                </div>
                <div className="truncate">
                  <span
                    className="text-xs font-black block truncate"
                    style={{ color: RARITY_CONFIG[inspectingSkin.rarity || 'common'].color }}
                  >
                    {inspectingSkin.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase block">
                    {inspectingSkin.archetype}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {isSkinEquipped ? (
                  <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-black text-xs">
                    EQUIPPED
                  </span>
                ) : isSkinUnlocked ? (
                  <button
                    type="button"
                    onClick={() => onSelectSkin(inspectingSkin.id)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
                  >
                    EQUIP
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAffordSkin}
                    onClick={() => onBuySkin(inspectingSkin)}
                    className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg active:scale-95 ${
                      canAffordSkin
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>BUY ${inspectingSkin.price}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Body: Death Effects Tab */}
        {activeTab === 'death-effects' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 p-3 sm:p-5 overflow-y-auto">
            {/* Death Effects Grid List */}
            <div className="md:col-span-7 grid grid-cols-2 gap-2.5 max-h-[48vh] md:max-h-none overflow-y-auto pr-1">
              {DEATH_EFFECTS.map((effect) => {
                const unlocked = unlockedDeathEffectIds.includes(effect.id);
                const isCurrent = inspectingEffectId === effect.id;
                const equipped = selectedDeathEffectId === effect.id;

                return (
                  <button
                    key={effect.id}
                    id={`effect-item-${effect.id}`}
                    type="button"
                    onClick={() => setInspectingEffectId(effect.id)}
                    className={`relative p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-rose-950/50 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] ring-1 ring-rose-400'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-cyber text-xs sm:text-sm font-bold text-white truncate">
                        {effect.name}
                      </span>
                      {equipped ? (
                        <span className="bg-rose-500 text-slate-950 font-cyber text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded">
                          EQUIPPED
                        </span>
                      ) : unlocked ? (
                        <span className="text-emerald-400 text-[11px] flex items-center gap-0.5 font-cyber">
                          <Check className="w-3 h-3" /> OWNED
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px] flex items-center gap-0.5 font-cyber font-bold">
                          <Lock className="w-3 h-3" /> ${effect.price}
                        </span>
                      )}
                    </div>

                    {/* Effect Color Swatch & Badge */}
                    <div className="flex items-center justify-between my-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: effect.primaryColor }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: effect.secondaryColor }}
                        />
                      </div>
                      <span className="text-[9px] font-cyber font-bold text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/40">
                        {effect.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1">{effect.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Death Effect Inspection & Simulator Panel */}
            <div className="md:col-span-5 flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
              <div>
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cyber text-sm sm:text-base font-black text-white">{inspectingEffect.name}</h3>
                    <span className="text-[10px] font-cyber font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 uppercase">
                      {inspectingEffect.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{inspectingEffect.description}</p>
                </div>

                {/* Interactive Particle Simulator */}
                <div className="my-1 flex justify-center">
                  <DeathEffectPreviewCanvas effect={inspectingEffect} />
                </div>
              </div>

              {/* Action Buttons (Desktop Panel) */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 shrink-0">
                {isEffectEquipped ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400 font-cyber font-bold text-xs tracking-wider uppercase cursor-default flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
                  </button>
                ) : isEffectUnlocked ? (
                  <button
                    id="btn-equip-death-effect"
                    type="button"
                    onClick={() => onSelectDeathEffect(inspectingEffect.id)}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-cyber font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Zap className="w-4 h-4" /> EQUIP DEATH EFFECT
                  </button>
                ) : (
                  <button
                    id="btn-buy-death-effect"
                    type="button"
                    disabled={!canAffordEffect}
                    onClick={() => onBuyDeathEffect(inspectingEffect)}
                    className={`w-full py-2.5 rounded-xl font-cyber font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                      canAffordEffect
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>UNLOCK (${inspectingEffect.price} CASH)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Sticky Action Bar for Death Effects */}
            <div className="md:hidden sticky bottom-0 left-0 right-0 z-20 bg-slate-950/95 border-t border-rose-500/30 p-2.5 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 mt-2 -mx-3 -mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: inspectingEffect.primaryColor,
                    borderColor: inspectingEffect.secondaryColor,
                  }}
                >
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-black block truncate text-white">
                    {inspectingEffect.name}
                  </span>
                  <span className="text-[9px] text-rose-300 font-mono uppercase block">
                    {inspectingEffect.badge}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {isEffectEquipped ? (
                  <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-black text-xs">
                    EQUIPPED
                  </span>
                ) : isEffectUnlocked ? (
                  <button
                    type="button"
                    onClick={() => onSelectDeathEffect(inspectingEffect.id)}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
                  >
                    EQUIP
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAffordEffect}
                    onClick={() => onBuyDeathEffect(inspectingEffect)}
                    className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg active:scale-95 ${
                      canAffordEffect
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>UNLOCK ${inspectingEffect.price}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Body: Combat Taunts Tab */}
        {activeTab === 'taunts' && (
          <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-hidden">
            {/* Live Hologram Broadcast Banner */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl mb-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>HOLOGRAM TAUNT BROADCASTER</span>
                    <span className="text-[10px] text-cyan-400 font-mono">[{EMOTES.length} LOADED]</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Broadcast above your snake during battle to taunt or warn opponents
                  </p>
                </div>
              </div>

              {testedEmote && (
                <div
                  className="px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-black animate-bounce shadow-lg"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: getEmoteById(testedEmote).color,
                    color: getEmoteById(testedEmote).color,
                  }}
                >
                  <span>{getEmoteById(testedEmote).icon}</span>
                  <span>{getEmoteById(testedEmote).badgeText}</span>
                </div>
              )}
            </div>

            {/* Taunts Grid List */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 overflow-y-auto pr-1">
              {EMOTES.map((emote, idx) => {
                const isEquipped = selectedEmoteId === emote.id;
                const isTesting = testedEmote === emote.id;

                return (
                  <div
                    key={emote.id}
                    onClick={() => handleTestTaunt(emote.id)}
                    className={`relative p-3 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer select-none active:scale-[0.99] group ${
                      isEquipped
                        ? 'border-yellow-400 bg-yellow-950/30 shadow-[0_0_15px_rgba(250,204,21,0.25)] ring-1 ring-yellow-400'
                        : isTesting
                        ? 'border-cyan-400 bg-cyan-950/40'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {emote.icon}
                        </span>
                        <span className="font-cyber text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                          {emote.label || emote.badgeText}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[9px] font-bold">
                        KEY [{idx + 1}]
                      </span>
                    </div>

                    <div
                      className="px-2 py-1 rounded-lg border text-xs font-black uppercase tracking-wider text-center"
                      style={{
                        backgroundColor: `${emote.color}15`,
                        borderColor: `${emote.color}50`,
                        color: emote.color,
                      }}
                    >
                      {emote.badgeText}
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/60 gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestTaunt(emote.id);
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-cyan-300 py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-700 transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-cyan-400" />
                        <span>TEST AUDIO</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestTaunt(emote.id);
                          if (onSelectEmote) onSelectEmote(emote.id);
                        }}
                        className={`flex items-center gap-1 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg border transition-all ${
                          isEquipped
                            ? 'bg-yellow-500/25 border-yellow-400 text-yellow-300'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400 text-cyan-300'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3 h-3 text-yellow-400" />
                            <span>PRIMARY</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3 h-3" />
                            <span>EQUIP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
