import { CollectibleCard } from '../types/cards';

export const BASE_COLLECTIBLE_CARDS: Omit<CollectibleCard, 'unlocked'>[] = [
  // ==========================================
  // A. CASUAL GAMING CARDS
  // ==========================================
  {
    id: 'mind_master',
    cardId: 'DA-CAS-001',
    title: 'Mind Master',
    category: 'casual',
    rarity: 'rare',
    description: 'Demonstrated superior working memory recall across expanding 5x5 spatial patterns.',
    unlockCriteria: 'Reach Level 7 or score 450+ points in Memory Grid.',
    artworkType: 'matrix-grid',
    benchmarkPercentile: 'Top 8.4%',
    engineBuild: 'DEVARENA-NEURAL-V2',
    verifiedHash: '0xMM-884A-91C2',
    metrics: [
      { label: 'Max Grid Level', value: 'Level 8' },
      { label: 'Accuracy', value: '96.2%' }
    ],
    gameId: 'memory-grid'
  },
  {
    id: 'logic_architect',
    cardId: 'DA-CAS-002',
    title: 'Logic Architect',
    category: 'casual',
    rarity: 'epic',
    description: 'Engineered a seamless, non-intersecting topological path through all numerical checkpoints.',
    unlockCriteria: 'Complete a Zip daily puzzle challenge with 100% path precision.',
    artworkType: 'circuit-path',
    benchmarkPercentile: 'Top 3.8%',
    engineBuild: 'DEVARENA-ZIP-NEXUS',
    verifiedHash: '0xLA-771B-22F0',
    metrics: [
      { label: 'Nodes Linked', value: '4/4 Clean' },
      { label: 'Solve Latency', value: '84s' }
    ],
    gameId: 'zip'
  },
  {
    id: 'speed_thinker',
    cardId: 'DA-CAS-003',
    title: 'Speed Thinker',
    category: 'casual',
    rarity: 'uncommon',
    description: 'Clocked lightning cognitive reflex response below 200ms on visual stimulus.',
    unlockCriteria: 'Achieve sub-200ms average response time in Reaction Challenge.',
    artworkType: 'synapse-pulse',
    benchmarkPercentile: 'Top 11.2%',
    engineBuild: 'DEVARENA-PRECISION-SYS',
    verifiedHash: '0xST-994E-88A1',
    metrics: [
      { label: 'Impulse Speed', value: '198 ms' },
      { label: 'Variance', value: '±6 ms' }
    ],
    gameId: 'reaction-challenge'
  },
  {
    id: 'puzzle_streak',
    cardId: 'DA-CAS-004',
    title: 'Puzzle Streak',
    category: 'casual',
    rarity: 'epic',
    description: 'Maintained uninterrupted cognitive discipline across five consecutive daily global puzzles.',
    unlockCriteria: 'Complete 5 consecutive daily puzzle challenges without breaking streak.',
    artworkType: 'streak-chain',
    benchmarkPercentile: 'Top 4.5%',
    engineBuild: 'DEVARENA-CHRONO-V2',
    verifiedHash: '0xPS-550A-33D4',
    metrics: [
      { label: 'Consecutive Days', value: '5 Days' },
      { label: 'XP Multiplier', value: '1.5x Multiplier' }
    ],
    gameId: 'word-puzzle'
  },
  {
    id: 'daily_challenger',
    cardId: 'DA-CAS-005',
    title: 'Daily Challenger',
    category: 'casual',
    rarity: 'common',
    description: 'Cracked the synchronized worldwide daily 5-letter technical puzzle on today\'s board.',
    unlockCriteria: 'Complete today\'s synchronized Word Puzzle challenge.',
    artworkType: 'word-matrix',
    benchmarkPercentile: 'Top 35.0%',
    engineBuild: 'DEVARENA-LEXICON-V1',
    verifiedHash: '0xDC-102C-44B9',
    metrics: [
      { label: 'Attempts', value: '4 / 6' },
      { label: 'Solved Word', value: 'C O D E' }
    ],
    gameId: 'word-puzzle'
  },
  {
    id: 'mental_calculator',
    cardId: 'DA-CAS-006',
    title: 'Mental Calculator',
    category: 'casual',
    rarity: 'uncommon',
    description: 'Computed 14+ rapid mental arithmetic operations under strict 60-second time pressure.',
    unlockCriteria: 'Score 14 or higher in the 60-second Quick Math arithmetic sprint.',
    artworkType: 'arithmetic-wave',
    benchmarkPercentile: 'Top 14.8%',
    engineBuild: 'DEVARENA-ARITHMETIC-X',
    verifiedHash: '0xMC-331F-77D8',
    metrics: [
      { label: 'Operations Solved', value: '14 Correct' },
      { label: 'Accuracy', value: '93%' }
    ],
    gameId: 'quick-math'
  },

  // ==========================================
  // B. CODING ARENA CARDS
  // ==========================================
  {
    id: 'first_blood',
    cardId: 'DA-COD-001',
    title: 'First Blood',
    category: 'coding',
    rarity: 'common',
    description: 'Entered the competitive 1v1 Code Arena and secured an inaugural duel victory.',
    unlockCriteria: 'Win your first live 1v1 algorithmic duel against an opponent.',
    artworkType: 'crossed-swords',
    benchmarkPercentile: 'Top 45.0%',
    engineBuild: 'DEVARENA-MONACO-JUDGE',
    verifiedHash: '0xFB-410C-90A2',
    metrics: [
      { label: 'Duel Status', value: 'VICTORY' },
      { label: 'Rating Gain', value: '+24 Elo' }
    ]
  },
  {
    id: 'algorithm_ace',
    cardId: 'DA-COD-002',
    title: 'Algorithm Ace',
    category: 'coding',
    rarity: 'rare',
    description: 'Crafted an optimal O(N) runtime algorithm passing hidden boundary and large-scale tests.',
    unlockCriteria: 'Solve a Medium or Hard algorithmic duel problem with all test cases verified.',
    artworkType: 'binary-tree',
    benchmarkPercentile: 'Top 9.6%',
    engineBuild: 'DEVARENA-MONACO-JUDGE',
    verifiedHash: '0xAA-662B-18E3',
    metrics: [
      { label: 'Complexity', value: 'O(N) Time' },
      { label: 'Space', value: 'O(1) Aux' }
    ]
  },
  {
    id: 'bug_slayer',
    cardId: 'DA-COD-003',
    title: 'Bug Slayer',
    category: 'coding',
    rarity: 'uncommon',
    description: 'Dissected subtle off-by-one errors and zero-pointer anomalies on first compilation run.',
    unlockCriteria: 'Win a duel with zero compilation errors and all tests green on first submit.',
    artworkType: 'silicon-bug',
    benchmarkPercentile: 'Top 18.0%',
    engineBuild: 'DEVARENA-MONACO-JUDGE',
    verifiedHash: '0xBS-883F-55C1',
    metrics: [
      { label: 'Submission Runs', value: '1 Attempt' },
      { label: 'Failed Checks', value: '0 Errors' }
    ]
  },
  {
    id: 'arena_champion',
    cardId: 'DA-COD-004',
    title: 'Arena Champion',
    category: 'coding',
    rarity: 'legendary',
    description: 'Surpassed 1250+ Elo rating threshold through proven algorithmic competitive excellence.',
    unlockCriteria: 'Ascend to 1250+ Elo rating in official ranked Code Arena duels.',
    artworkType: 'arena-crest',
    benchmarkPercentile: 'Top 1.8%',
    engineBuild: 'DEVARENA-RANKED-CORE',
    verifiedHash: '0xAC-001A-99F7',
    metrics: [
      { label: 'Peak Rating', value: '1248 Elo' },
      { label: 'Tier', value: 'Diamond Arena' }
    ]
  },
  {
    id: 'perfect_submission',
    cardId: 'DA-COD-005',
    title: 'Perfect Submission',
    category: 'coding',
    rarity: 'rare',
    description: 'Executed 100% test case pass rate with sub-15ms execution latency across all suites.',
    unlockCriteria: 'Pass every single hidden and public test case on a problem in under 3 minutes.',
    artworkType: 'monaco-check',
    benchmarkPercentile: 'Top 7.2%',
    engineBuild: 'DEVARENA-MONACO-JUDGE',
    verifiedHash: '0xPS-992D-44A8',
    metrics: [
      { label: 'Test Suite', value: '5/5 Passed' },
      { label: 'Execution', value: '12 ms' }
    ]
  },
  {
    id: 'unstoppable',
    cardId: 'DA-COD-006',
    title: 'Unstoppable',
    category: 'coding',
    rarity: 'legendary',
    description: 'Defended code supremacy across three consecutive verified 1v1 duel victories.',
    unlockCriteria: 'Win 3 consecutive 1v1 coding battles without a loss.',
    artworkType: 'momentum-vector',
    benchmarkPercentile: 'Top 2.1%',
    engineBuild: 'DEVARENA-RANKED-CORE',
    verifiedHash: '0xUN-777E-00B1',
    metrics: [
      { label: 'Streak', value: '3 Duels' },
      { label: 'Win Ratio', value: '100% In Run' }
    ]
  },

  // ==========================================
  // C. SPECIAL EVENT CARDS
  // ==========================================
  {
    id: 'weekend_gauntlet',
    cardId: 'DA-EVT-001',
    title: 'Weekend Gauntlet Champion',
    category: 'events',
    rarity: 'epic',
    description: 'Conquered the 48-hour global community blitz tournament with top-bracket placement.',
    unlockCriteria: 'Compete in the Weekend Blitz Arena and finish in top 10% bracket.',
    artworkType: 'gauntlet-shield',
    benchmarkPercentile: 'Top 3.2%',
    engineBuild: 'DEVARENA-TOURNAMENT-SYS',
    verifiedHash: '0xWG-881C-66A3',
    metrics: [
      { label: 'Event', value: 'Blitz Gauntlet' },
      { label: 'Placement', value: 'Top 5%' }
    ]
  },
  {
    id: 'global_puzzle_winner',
    cardId: 'DA-EVT-002',
    title: 'Global Puzzle Invitational',
    category: 'events',
    rarity: 'legendary',
    description: 'Awarded to verified finalists of the Worldwide DEVARENA Logic & Puzzle Invitational.',
    unlockCriteria: 'Finish in the top percentile during the Global Puzzle Championship week.',
    artworkType: 'world-globe',
    benchmarkPercentile: 'Top 0.8%',
    engineBuild: 'DEVARENA-GLOBAL-INVITE',
    verifiedHash: '0xGP-002F-77D9',
    metrics: [
      { label: 'Tournament', value: 'Invitational' },
      { label: 'Rank', value: 'Global Finalist' }
    ]
  },
  {
    id: 'season_champion',
    cardId: 'DA-EVT-003',
    title: 'Season 1 Champion',
    category: 'events',
    rarity: 'legendary',
    description: 'Inaugural season competitive distinction for extraordinary developer tournament impact.',
    unlockCriteria: 'Conclude Season 1 ranked in the top division of the Developer Leaderboard.',
    artworkType: 'season-laurel',
    benchmarkPercentile: 'Top 1.0%',
    engineBuild: 'DEVARENA-SEASONAL-V1',
    verifiedHash: '0xSC-110A-88B4',
    metrics: [
      { label: 'Season', value: 'Season 1 Genesis' },
      { label: 'Honors', value: 'Grandmaster Division' }
    ]
  },
  {
    id: 'community_clash_winner',
    cardId: 'DA-EVT-004',
    title: 'Community Clash Winner',
    category: 'events',
    rarity: 'rare',
    description: 'Hosted or participated in a custom room multiplayer clash and emerged undefeated.',
    unlockCriteria: 'Create or join a private multiplayer room and win the match.',
    artworkType: 'peer-network',
    benchmarkPercentile: 'Top 12.5%',
    engineBuild: 'DEVARENA-P2P-HUB',
    verifiedHash: '0xCC-440D-11E5',
    metrics: [
      { label: 'Room Mode', value: '1v1 Clash' },
      { label: 'Margin', value: '+4 Pts Victory' }
    ]
  },

  // ==========================================
  // D. DSA PROBLEM SOLVING MILESTONE CARDS (50, 100, 200, 500, 1000)
  // ==========================================
  {
    id: 'dsa_50_club',
    cardId: 'DA-DSA-050',
    title: '50 Problems Mastered',
    category: 'coding',
    rarity: 'rare',
    description: 'Cracked 50 verified DSA algorithmic problems across fundamental linear, hashing and two-pointer structures.',
    unlockCriteria: 'Solve 50 coding problems in DEVARENA.',
    artworkType: 'binary-tree',
    benchmarkPercentile: 'Top 14.5%',
    engineBuild: 'DEVARENA-DSA-CORPS',
    verifiedHash: '0xD50-88A2-4411',
    metrics: [
      { label: 'Milestone', value: '50 Problems' },
      { label: 'Rank', value: 'Cadet Solver' }
    ]
  },
  {
    id: 'dsa_100_club',
    cardId: 'DA-DSA-100',
    title: 'Century Coder (100 Problems)',
    category: 'coding',
    rarity: 'epic',
    description: 'Triple-digit algorithmic mastery unlocked. Solved 100 problems covering dynamic programming, graphs, and recursion.',
    unlockCriteria: 'Solve 100 coding problems in DEVARENA.',
    artworkType: 'monaco-check',
    benchmarkPercentile: 'Top 6.8%',
    engineBuild: 'DEVARENA-DSA-CORPS',
    verifiedHash: '0xD100-77C3-9942',
    metrics: [
      { label: 'Milestone', value: '100 Problems' },
      { label: 'Rank', value: 'Century Club' }
    ]
  },
  {
    id: 'dsa_200_club',
    cardId: 'DA-DSA-200',
    title: 'Algorithm Veteran (200 Problems)',
    category: 'coding',
    rarity: 'epic',
    description: '200 solved technical challenges spanning trees, heaps, monotonic stacks, and complex matrix traversals.',
    unlockCriteria: 'Solve 200 coding problems in DEVARENA.',
    artworkType: 'circuit-path',
    benchmarkPercentile: 'Top 2.9%',
    engineBuild: 'DEVARENA-DSA-CORPS',
    verifiedHash: '0xD200-33F8-01E4',
    metrics: [
      { label: 'Milestone', value: '200 Problems' },
      { label: 'Rank', value: 'Algorithm Veteran' }
    ]
  },
  {
    id: 'dsa_500_club',
    cardId: 'DA-DSA-500',
    title: 'Leet Titan (500 Problems)',
    category: 'coding',
    rarity: 'legendary',
    description: 'Half-a-thousand algorithmic triumphs. Elite competitive endurance and full-spectrum problem solving.',
    unlockCriteria: 'Solve 500 coding problems in DEVARENA.',
    artworkType: 'arena-crest',
    benchmarkPercentile: 'Top 0.8%',
    engineBuild: 'DEVARENA-DSA-CORPS',
    verifiedHash: '0xD500-11A0-7799',
    metrics: [
      { label: 'Milestone', value: '500 Problems' },
      { label: 'Rank', value: 'Leet Titan' }
    ]
  },
  {
    id: 'dsa_1000_club',
    cardId: 'DA-DSA-1000',
    title: 'Mythic Legend (1,000 Problems)',
    category: 'coding',
    rarity: 'legendary',
    description: 'The immortal 1,000 problem pinnacle. An extraordinary demonstration of lifelong algorithmic discipline.',
    unlockCriteria: 'Solve 1,000 coding problems in DEVARENA.',
    artworkType: 'world-globe',
    benchmarkPercentile: 'Top 0.05%',
    engineBuild: 'DEVARENA-DSA-CORPS',
    verifiedHash: '0xD1K-9999-EVAL',
    metrics: [
      { label: 'Milestone', value: '1,000 Solved' },
      { label: 'Rank', value: 'Hall of Fame' }
    ]
  }
];

export const DSA_MILESTONE_THRESHOLDS = [
  { threshold: 50, cardId: 'dsa_50_club', badge: '50 CLUB', label: 'Cadet Milestone' },
  { threshold: 100, cardId: 'dsa_100_club', badge: '100 CLUB', label: 'Century Coder' },
  { threshold: 200, cardId: 'dsa_200_club', badge: '200 CLUB', label: 'Algorithm Veteran' },
  { threshold: 500, cardId: 'dsa_500_club', badge: '500 CLUB', label: 'Leet Titan' },
  { threshold: 1000, cardId: 'dsa_1000_club', badge: '1000 CLUB', label: 'Mythic Legend' },
];

export function getUserCards(unlockedCardIds: string[] = []): CollectibleCard[] {
  return BASE_COLLECTIBLE_CARDS.map(base => {
    const isUnlocked = unlockedCardIds.includes(base.id);
    return {
      ...base,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? 'Nov 14, 2026' : undefined
    };
  });
}

