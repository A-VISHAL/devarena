import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Lock, 
  ShieldCheck, 
  Gamepad2, 
  Swords, 
  Calendar,
  Layers,
  Pin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CollectibleCard, CardRarity, CardCategory } from '../types/cards';
import { getUserCards, BASE_COLLECTIBLE_CARDS } from '../data/collectibleCards';
import { CollectibleCardItem } from '../components/cards/CollectibleCardItem';
import { CardDetailModal } from '../components/cards/CardDetailModal';
import { CardShareStudioModal } from '../components/cards/CardShareStudioModal';
import { sound } from '../utils/sound';

export const CardsCollection: React.FC = () => {
  const { user, updateUserProfile } = useApp();

  // State
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rarity' | 'id'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [inspectingCard, setInspectingCard] = useState<CollectibleCard | null>(null);
  const [sharingCard, setSharingCard] = useState<CollectibleCard | null>(null);

  // Compute cards based on user's actual unlocked list
  const userUnlockedIds = useMemo(() => {
    return user.unlockedCards || ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission'];
  }, [user.unlockedCards]);

  const pinnedCardIds = useMemo(() => {
    return user.pinnedCardIds || ['first_blood', 'perfect_submission'];
  }, [user.pinnedCardIds]);

  const cards = useMemo(() => {
    return getUserCards(userUnlockedIds);
  }, [userUnlockedIds]);

  // Handle pinning card to profile
  const handleTogglePin = (card: CollectibleCard) => {
    sound.playClick();
    const currentPinned = [...pinnedCardIds];
    const isPinned = currentPinned.includes(card.id);
    let nextPinned: string[];

    if (isPinned) {
      nextPinned = currentPinned.filter(id => id !== card.id);
    } else {
      if (currentPinned.length >= 3) {
        nextPinned = [...currentPinned.slice(1), card.id];
      } else {
        nextPinned = [...currentPinned, card.id];
      }
    }

    updateUserProfile({ pinnedCardIds: nextPinned });
  };

  // Stats calculation
  const totalCards = cards.length;
  const unlockedCount = cards.filter(c => c.unlocked).length;
  const progressPercent = Math.round((unlockedCount / totalCards) * 100);

  const rarityStats = useMemo(() => {
    const stats: Record<CardRarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 }
    };

    cards.forEach(c => {
      stats[c.rarity].total += 1;
      if (c.unlocked) stats[c.rarity].unlocked += 1;
    });

    return stats;
  }, [cards]);

  // Filtering and Sorting
  const filteredCards = useMemo(() => {
    return cards
      .filter(card => {
        // Category
        if (selectedCategory !== 'all' && card.category !== selectedCategory) return false;
        // Rarity
        if (selectedRarity !== 'all' && card.rarity !== selectedRarity) return false;
        // Status
        if (statusFilter === 'unlocked' && !card.unlocked) return false;
        if (statusFilter === 'locked' && card.unlocked) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = card.title.toLowerCase().includes(q);
          const matchId = card.cardId.toLowerCase().includes(q);
          const matchDesc = card.description.toLowerCase().includes(q);
          if (!matchTitle && !matchId && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rarity') {
          const rarityRank: Record<CardRarity, number> = {
            legendary: 5,
            epic: 4,
            rare: 3,
            uncommon: 2,
            common: 1
          };
          return rarityRank[b.rarity] - rarityRank[a.rarity];
        }
        if (sortBy === 'id') {
          return a.cardId.localeCompare(b.cardId);
        }
        // 'recent' by default (unlocked first)
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        return a.cardId.localeCompare(b.cardId);
      });
  }, [cards, selectedCategory, selectedRarity, statusFilter, sortBy, searchQuery]);

  return (
    <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Page Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#172022] via-[#151D1F] to-[#111719] border border-[#2B3B3F] p-6 sm:p-8 overflow-hidden shadow-card">
        
        {/* Subtle Background Circuit Mesh */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
            <path d="M 20 20 L 180 180 M 180 20 L 20 180" stroke="#F5AA3B" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="100" cy="100" r="40" stroke="#69B9A7" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-amber/15 border border-arena-amber/35 text-arena-amber text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verifiable Collectible System</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-arena-textPrimary">
              Achievement & Victory Cards
            </h1>

            <p className="text-sm text-arena-textSecondary leading-relaxed font-normal">
              Every card represents verified execution: high-difficulty algorithm duels, cognitive speed benchmarks, and unbroken puzzle discipline. Export cards, share to LinkedIn, or pin your proudest achievements.
            </p>
          </div>

          {/* Collection Progress Box */}
          <div className="p-5 rounded-2xl bg-[#12181A] border border-[#27363A] space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-arena-textSubtle tracking-wider">
                Collection Progress
              </span>
              <span className="font-mono text-xs font-black text-arena-amber">
                {unlockedCount} / {totalCards} ({progressPercent}%)
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#1C2629] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-arena-teal via-arena-amber to-[#F5AA3B] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Rarity Breakdown Mini-Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as CardRarity[]).map(r => (
                <div 
                  key={r}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#182224] border border-[#263539]"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    r === 'legendary' ? 'bg-[#F5AA3B]' : r === 'epic' ? 'bg-amber-400' : r === 'rare' ? 'bg-arena-amber' : r === 'uncommon' ? 'bg-arena-teal' : 'bg-arena-textSubtle'
                  }`} />
                  <span className="capitalize text-arena-textSecondary">{r}:</span>
                  <span className="font-bold text-arena-textPrimary">
                    {rarityStats[r].unlocked}/{rarityStats[r].total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141B1D] border border-[#27363A]">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Cards', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'casual', label: 'Casual Gaming', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
            { id: 'coding', label: 'Coding Arena', icon: <Swords className="w-3.5 h-3.5" /> },
            { id: 'events', label: 'Special Events', icon: <Trophy className="w-3.5 h-3.5" /> },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-arena-amber text-[#111719] shadow-sm font-bold'
                  : 'bg-[#182224] text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1E2B2E]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search, Rarity & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-arena-textSubtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#111618] border border-[#27363A] text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber"
            />
          </div>

          {/* Rarity Select */}
          <select
            value={selectedRarity}
            onChange={(e) => {
              sound.playClick();
              setSelectedRarity(e.target.value as any);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#182224] border border-[#27363A] text-arena-textPrimary focus:outline-none focus:border-arena-amber capitalize"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              sound.playClick();
              setStatusFilter(e.target.value as any);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#182224] border border-[#27363A] text-arena-textPrimary focus:outline-none focus:border-arena-amber"
          >
            <option value="all">All Status</option>
            <option value="unlocked">Unlocked Only</option>
            <option value="locked">Locked Only</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => {
              sound.playClick();
              setSortBy(e.target.value as any);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#182224] border border-[#27363A] text-arena-textPrimary focus:outline-none focus:border-arena-amber"
          >
            <option value="recent">Recently Earned</option>
            <option value="rarity">Rarity (High to Low)</option>
            <option value="id">Card ID</option>
          </select>

        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card) => {
            const isPinned = pinnedCardIds.includes(card.id);
            return (
              <CollectibleCardItem
                key={card.id}
                card={card}
                isPinned={isPinned}
                onTogglePin={card.unlocked ? handleTogglePin : undefined}
                onInspect={(c) => {
                  sound.playClick();
                  setInspectingCard(c);
                }}
                onShare={(c) => {
                  sound.playClick();
                  setSharingCard(c);
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#141B1D] border border-[#27363A] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#192224] border border-[#2A393D] flex items-center justify-center text-arena-textSubtle mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-arena-textPrimary">No Collectible Cards Found</h3>
          <p className="text-xs text-arena-textSecondary max-w-md mx-auto">
            No cards match your current combination of filters. Try clearing filters or search queries to see all available achievement cards.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedRarity('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="btn-secondary py-1.5 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 3D Card Detail & Flip Modal */}
      <CardDetailModal
        card={inspectingCard}
        onClose={() => setInspectingCard(null)}
        isPinned={inspectingCard ? pinnedCardIds.includes(inspectingCard.id) : false}
        onTogglePin={handleTogglePin}
        onShare={(c) => {
          setInspectingCard(null);
          setSharingCard(c);
        }}
      />

      {/* Victory Studio Card Share Modal */}
      <CardShareStudioModal
        card={sharingCard}
        user={user}
        onClose={() => setSharingCard(null)}
      />

    </div>
  );
};
