export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type CardCategory = 'casual' | 'coding' | 'events';

export interface CardMetric {
  label: string;
  value: string;
}

export interface CollectibleCard {
  id: string; // e.g. 'mind_master'
  cardId: string; // e.g. 'DA-CAS-001'
  title: string;
  category: CardCategory;
  rarity: CardRarity;
  description: string;
  unlockCriteria: string;
  artworkType: 
    | 'matrix-grid' 
    | 'circuit-path' 
    | 'synapse-pulse' 
    | 'streak-chain' 
    | 'word-matrix' 
    | 'arithmetic-wave'
    | 'crossed-swords' 
    | 'binary-tree' 
    | 'silicon-bug' 
    | 'arena-crest' 
    | 'monaco-check' 
    | 'momentum-vector'
    | 'gauntlet-shield' 
    | 'world-globe' 
    | 'season-laurel' 
    | 'peer-network';
  unlocked: boolean;
  unlockedAt?: string;
  verifiedHash?: string;
  metrics?: CardMetric[];
  benchmarkPercentile?: string;
  engineBuild?: string;
  gameId?: string;
  showcase?: boolean;
}

export interface CardShareData {
  card: CollectibleCard;
  username: string;
  displayName: string;
  rating: number;
  streak: number;
}
