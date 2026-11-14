import React from 'react';
import { CardRarity } from '../../types/cards';

interface CardArtworkProps {
  artworkType: string;
  rarity: CardRarity;
  unlocked: boolean;
  className?: string;
}

export const CardArtwork: React.FC<CardArtworkProps> = ({
  artworkType,
  rarity,
  unlocked,
  className = "w-full h-full"
}) => {
  // Theme colors
  const primaryAccent = rarity === 'legendary' 
    ? '#F5AA3B' 
    : rarity === 'epic' 
    ? '#D69E2E' 
    : rarity === 'rare' 
    ? '#E6A746' 
    : rarity === 'uncommon' 
    ? '#69B9A7' 
    : '#7E8E91';

  const secondaryAccent = rarity === 'legendary'
    ? '#69B9A7'
    : rarity === 'epic'
    ? '#83B6A3'
    : '#4C6065';

  const gridMuted = unlocked ? '#253135' : '#1A2124';
  const glow = unlocked ? (rarity === 'legendary' ? 0.8 : rarity === 'epic' ? 0.6 : 0.4) : 0.15;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-[#141A1C] border border-[#273438] ${className}`}>
      {/* Background Subtle Technical Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cardGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#69B9A7" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cardGrid)" />
      </svg>

      {/* Centerpiece Vector Graphics based on artworkType */}
      <svg viewBox="0 0 200 140" className="w-full h-full p-2 relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* 1. Mind Master: Spatial Memory Matrix */}
        {artworkType === 'matrix-grid' && (
          <g>
            <rect x="55" y="20" width="90" height="90" rx="8" stroke={gridMuted} strokeWidth="1.5" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const isActive = (r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 2 && c === 1);
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={63 + c * 26}
                    y={28 + r * 26}
                    width="22"
                    height="22"
                    rx="4"
                    fill={isActive && unlocked ? primaryAccent : '#192224'}
                    stroke={isActive ? primaryAccent : gridMuted}
                    strokeWidth="1.2"
                    opacity={isActive ? 0.95 : 0.6}
                  />
                );
              })
            )}
            {/* Memory Pulse Waves */}
            <circle cx="100" cy="65" r="54" stroke={secondaryAccent} strokeWidth="1" strokeDasharray="3 3" opacity={glow} />
          </g>
        )}

        {/* 2. Logic Architect: Isometric Topological Circuit Path (Zip) */}
        {artworkType === 'circuit-path' && (
          <g>
            {/* Grid Checkpoints */}
            <path d="M40 70 L70 35 L130 35 L160 70 L130 105 L70 105 Z" stroke={gridMuted} strokeWidth="1.5" />
            <path d="M60 70 L85 45 L115 45 L140 70 L115 95 L85 95 Z" stroke={gridMuted} strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Continuous topological route */}
            <path 
              d="M50 70 L80 40 L120 40 L150 70 L120 100 L90 100" 
              stroke={primaryAccent} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Node Checkpoints */}
            {[{ x: 50, y: 70, n: '1' }, { x: 80, y: 40, n: '2' }, { x: 120, y: 40, n: '3' }, { x: 150, y: 70, n: '4' }].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="8" fill="#141A1C" stroke={primaryAccent} strokeWidth="2" />
                <text x={pt.x} y={pt.y + 3.5} fill={primaryAccent} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {pt.n}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 3. Speed Thinker: Synapse Millisecond Wave */}
        {artworkType === 'synapse-pulse' && (
          <g>
            <line x1="20" y1="70" x2="180" y2="70" stroke={gridMuted} strokeWidth="1" strokeDasharray="4 4" />
            <line x1="100" y1="20" x2="100" y2="120" stroke={gridMuted} strokeWidth="1" strokeDasharray="4 4" />
            {/* Reflex Impulse Wave */}
            <path
              d="M25 70 L65 70 L80 30 L95 110 L110 50 L125 85 L140 70 L175 70"
              stroke={primaryAccent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Latency benchmark target */}
            <circle cx="100" cy="70" r="16" stroke={secondaryAccent} strokeWidth="1.5" strokeDasharray="3 3" opacity={glow} />
            <text x="100" y="24" fill={primaryAccent} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              198ms TGT
            </text>
          </g>
        )}

        {/* 4. Puzzle Streak: Chrono Hexagonal Chain */}
        {artworkType === 'streak-chain' && (
          <g>
            {[0, 1, 2, 3, 4].map((idx) => {
              const cx = 40 + idx * 30;
              const cy = 70 + (idx % 2 === 0 ? -6 : 6);
              return (
                <g key={idx}>
                  {idx > 0 && (
                    <line 
                      x1={40 + (idx - 1) * 30} 
                      y1={70 + ((idx - 1) % 2 === 0 ? -6 : 6)} 
                      x2={cx} 
                      y2={cy} 
                      stroke={primaryAccent} 
                      strokeWidth="2" 
                    />
                  )}
                  <polygon
                    points={`${cx},${cy - 12} ${cx + 10},${cy - 6} ${cx + 10},${cy + 6} ${cx},${cy + 12} ${cx - 10},${cy + 6} ${cx - 10},${cy - 6}`}
                    fill="#172224"
                    stroke={primaryAccent}
                    strokeWidth="1.5"
                  />
                  <text x={cx} y={cy + 3.5} fill={primaryAccent} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    D{idx + 1}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Daily Challenger: 5-Letter Lexicon Quadrant */}
        {artworkType === 'word-matrix' && (
          <g>
            {['C', 'O', 'D', 'E', 'R'].map((char, i) => (
              <g key={i}>
                <rect
                  x={32 + i * 28}
                  y="48"
                  width="24"
                  height="28"
                  rx="4"
                  fill={i < 4 ? primaryAccent : '#1C2729'}
                  stroke={primaryAccent}
                  strokeWidth="1.5"
                />
                <text
                  x={44 + i * 28}
                  y="67"
                  fill={i < 4 ? '#111719' : primaryAccent}
                  fontSize="13"
                  fontWeight="900"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {char}
                </text>
              </g>
            ))}
            <text x="100" y="105" fill={secondaryAccent} fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="2">
              VERIFIED 5-LETTER SOLVE
            </text>
          </g>
        )}

        {/* 6. Mental Calculator: High-Frequency Arithmetic Wave */}
        {artworkType === 'arithmetic-wave' && (
          <g>
            <circle cx="100" cy="70" r="45" stroke={gridMuted} strokeWidth="1" strokeDasharray="3 3" />
            <path d="M30 90 Q 60 30 100 70 T 170 50" stroke={secondaryAccent} strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M30 60 Q 65 110 100 70 T 170 80" stroke={primaryAccent} strokeWidth="2" fill="none" />
            <text x="50" y="45" fill={primaryAccent} fontSize="14" fontWeight="bold" fontFamily="monospace">∑</text>
            <text x="145" y="45" fill={primaryAccent} fontSize="14" fontWeight="bold" fontFamily="monospace">√x</text>
            <text x="100" y="115" fill={primaryAccent} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              14+ OPS / 60 SEC
            </text>
          </g>
        )}

        {/* 7. First Blood: Dual Crossed Terminal Swords */}
        {artworkType === 'crossed-swords' && (
          <g>
            <circle cx="100" cy="70" r="46" stroke={gridMuted} strokeWidth="1" />
            {/* Sword 1 */}
            <line x1="55" y1="25" x2="145" y2="115" stroke={primaryAccent} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="37" x2="65" y2="22" stroke={secondaryAccent} strokeWidth="2" strokeLinecap="round" />
            {/* Sword 2 */}
            <line x1="145" y1="25" x2="55" y2="115" stroke={primaryAccent} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="135" y1="22" x2="150" y2="37" stroke={secondaryAccent} strokeWidth="2" strokeLinecap="round" />
            {/* Center terminal shield */}
            <polygon points="100,50 118,65 112,90 100,98 88,90 82,65" fill="#141A1C" stroke={primaryAccent} strokeWidth="1.5" />
            <text x="100" y="78" fill={primaryAccent} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              &gt;_
            </text>
          </g>
        )}

        {/* 8. Algorithm Ace: Binary Search Tree / Graph Traversal */}
        {artworkType === 'binary-tree' && (
          <g>
            {/* Tree edges */}
            <line x1="100" y1="35" x2="65" y2="65" stroke={primaryAccent} strokeWidth="2" />
            <line x1="100" y1="35" x2="135" y2="65" stroke={secondaryAccent} strokeWidth="1.5" />
            <line x1="65" y1="65" x2="45" y2="100" stroke={primaryAccent} strokeWidth="2" />
            <line x1="65" y1="65" x2="85" y2="100" stroke={primaryAccent} strokeWidth="2" />
            <line x1="135" y1="65" x2="115" y2="100" stroke={secondaryAccent} strokeWidth="1.5" />
            <line x1="135" y1="65" x2="155" y2="100" stroke={secondaryAccent} strokeWidth="1.5" />
            
            {/* Tree nodes */}
            {[{ x: 100, y: 35, v: '50' }, { x: 65, y: 65, v: '25' }, { x: 135, y: 65, v: '75' }, { x: 45, y: 100, v: '10' }, { x: 85, y: 100, v: '30' }, { x: 115, y: 100, v: '60' }, { x: 155, y: 100, v: '90' }].map((node, i) => (
              <g key={i}>
                <circle cx={node.x} cy={node.y} r="9" fill="#141A1C" stroke={i <= 4 ? primaryAccent : secondaryAccent} strokeWidth="1.8" />
                <text x={node.x} y={node.y + 3.5} fill={primaryAccent} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {node.v}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 9. Bug Slayer: Circuit Chip & Debug Trace */}
        {artworkType === 'silicon-bug' && (
          <g>
            {/* Main Processor Die */}
            <rect x="65" y="35" width="70" height="70" rx="6" fill="#162022" stroke={primaryAccent} strokeWidth="1.8" />
            {/* Pins */}
            {[0, 1, 2, 3].map((p) => (
              <g key={p}>
                <line x1="52" y1={45 + p * 16} x2="65" y2={45 + p * 16} stroke={primaryAccent} strokeWidth="1.5" />
                <line x1="135" y1={45 + p * 16} x2="148" y2={45 + p * 16} stroke={primaryAccent} strokeWidth="1.5" />
                <line x1={75 + p * 16} y1="22" x2={75 + p * 16} y2="35" stroke={primaryAccent} strokeWidth="1.5" />
                <line x1={75 + p * 16} y1="105" x2={75 + p * 16} y2="118" stroke={primaryAccent} strokeWidth="1.5" />
              </g>
            ))}
            {/* Bug Target Crosshair */}
            <circle cx="100" cy="70" r="18" stroke={secondaryAccent} strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M92 70 L98 76 L108 64" stroke={primaryAccent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="100" y="124" fill={primaryAccent} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              0 RUNTIME ERRORS
            </text>
          </g>
        )}

        {/* 10. Arena Champion: Hexagonal Grandmaster Crest */}
        {artworkType === 'arena-crest' && (
          <g>
            {/* Rotating shield aura */}
            <polygon points="100,20 150,48 150,92 100,120 50,92 50,48" stroke={primaryAccent} strokeWidth="2" fill="#161F22" />
            <polygon points="100,28 142,52 142,88 100,112 58,88 58,52" stroke={secondaryAccent} strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="100,38 132,56 132,84 100,102 68,84 68,56" fill={primaryAccent} opacity="0.15" />
            {/* Trophy Icon */}
            <path d="M85 55 L115 55 L110 75 Q 100 85 90 75 Z" fill={primaryAccent} />
            <path d="M96 82 L104 82 L104 92 L96 92 Z" fill={primaryAccent} />
            <rect x="92" y="92" width="16" height="4" rx="1" fill={primaryAccent} />
            <text x="100" y="112" fill={primaryAccent} fontSize="8" fontWeight="black" textAnchor="middle" fontFamily="monospace">
              1250+ ELO
            </text>
          </g>
        )}

        {/* 11. Perfect Submission: Monaco Test Suite Pass */}
        {artworkType === 'monaco-check' && (
          <g>
            <rect x="35" y="25" width="130" height="90" rx="8" fill="#141C1E" stroke={primaryAccent} strokeWidth="1.8" />
            {/* Header bar */}
            <line x1="35" y1="45" x2="165" y2="45" stroke={gridMuted} strokeWidth="1" />
            <circle cx="45" cy="35" r="3" fill="#E36C72" />
            <circle cx="55" cy="35" r="3" fill="#E5A33D" />
            <circle cx="65" cy="35" r="3" fill="#36B98A" />
            <text x="100" y="38" fill={gridMuted} fontSize="8" textAnchor="middle" fontFamily="monospace">
              test_suite.spec.ts
            </text>
            {/* Test checklist rows */}
            {[0, 1, 2].map((row) => (
              <g key={row}>
                <circle cx="50" cy={60 + row * 18} r="5" fill="#36B98A" />
                <path d="M48 60 L50 62 L53 58" stroke="#111719" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="62" y={57 + row * 18} width={60 + row * 12} height="6" rx="2" fill="#243336" />
                <text x="150" y={63 + row * 18} fill={primaryAccent} fontSize="7" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  4ms
                </text>
              </g>
            ))}
          </g>
        )}

        {/* 12. Unstoppable: Triple Accelerated Momentum Vector */}
        {artworkType === 'momentum-vector' && (
          <g>
            <circle cx="100" cy="70" r="50" stroke={gridMuted} strokeWidth="1" strokeDasharray="3 3" />
            <path d="M50 85 L90 45 L105 60 L145 25" stroke={primaryAccent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="145,25 133,26 142,35" fill={primaryAccent} />
            {/* Momentum ripples */}
            <path d="M45 95 L85 55 L100 70 L140 35" stroke={secondaryAccent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M40 105 L80 65 L95 80 L135 45" stroke={secondaryAccent} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
            <text x="100" y="115" fill={primaryAccent} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              3-WIN STREAK RECORD
            </text>
          </g>
        )}

        {/* 13. Weekend Gauntlet Champion: Heavy Tournament Shield */}
        {artworkType === 'gauntlet-shield' && (
          <g>
            <polygon points="100,22 145,40 135,100 100,122 65,100 55,40" fill="#182326" stroke={primaryAccent} strokeWidth="2" />
            <polygon points="100,34 135,48 126,92 100,110 74,92 65,48" stroke={secondaryAccent} strokeWidth="1" strokeDasharray="2 2" />
            {/* Gauntlet emblem */}
            <path d="M85 52 L115 52 L115 78 L100 90 L85 78 Z" fill={primaryAccent} opacity="0.8" />
            <text x="100" y="74" fill="#111719" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              W
            </text>
            <text x="100" y="105" fill={primaryAccent} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              GAUNTLET
            </text>
          </g>
        )}

        {/* 14. Global Puzzle Invitational: World Wireframe Crown */}
        {artworkType === 'world-globe' && (
          <g>
            <circle cx="100" cy="70" r="44" stroke={primaryAccent} strokeWidth="1.8" />
            {/* Meridian lines */}
            <ellipse cx="100" cy="70" rx="20" ry="44" stroke={secondaryAccent} strokeWidth="1" />
            <line x1="56" y1="70" x2="144" y2="70" stroke={secondaryAccent} strokeWidth="1" />
            <line x1="65" y1="48" x2="135" y2="48" stroke={secondaryAccent} strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="65" y1="92" x2="135" y2="92" stroke={secondaryAccent} strokeWidth="0.8" strokeDasharray="2 2" />
            {/* Global Star */}
            <polygon points="100,56 103,66 113,66 105,72 108,82 100,76 92,82 95,72 87,66 97,66" fill={primaryAccent} />
          </g>
        )}

        {/* 15. Season 1 Champion: Laurels & Monolith */}
        {artworkType === 'season-laurel' && (
          <g>
            {/* Monolith Pillar */}
            <rect x="88" y="32" width="24" height="72" rx="4" fill="#192426" stroke={primaryAccent} strokeWidth="2" />
            <text x="100" y="74" fill={primaryAccent} fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="monospace">
              S1
            </text>
            {/* Wreath Laurels */}
            <path d="M60 95 C 45 65 65 35 84 35" stroke={secondaryAccent} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M140 95 C 155 65 135 35 116 35" stroke={secondaryAccent} strokeWidth="2" strokeLinecap="round" fill="none" />
            <text x="100" y="118" fill={primaryAccent} fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">
              CHAMPION
            </text>
          </g>
        )}

        {/* 16. Community Clash Winner: P2P Network Mesh */}
        {artworkType === 'peer-network' && (
          <g>
            {/* Network edges */}
            <line x1="100" y1="70" x2="60" y2="45" stroke={primaryAccent} strokeWidth="1.5" />
            <line x1="100" y1="70" x2="140" y2="45" stroke={primaryAccent} strokeWidth="1.5" />
            <line x1="100" y1="70" x2="60" y2="95" stroke={secondaryAccent} strokeWidth="1.5" />
            <line x1="100" y1="70" x2="140" y2="95" stroke={secondaryAccent} strokeWidth="1.5" />
            <line x1="60" y1="45" x2="140" y2="45" stroke={gridMuted} strokeWidth="1" strokeDasharray="2 2" />
            <line x1="60" y1="95" x2="140" y2="95" stroke={gridMuted} strokeWidth="1" strokeDasharray="2 2" />

            {/* Nodes */}
            <circle cx="60" cy="45" r="7" fill="#141A1C" stroke={secondaryAccent} strokeWidth="1.5" />
            <circle cx="140" cy="45" r="7" fill="#141A1C" stroke={secondaryAccent} strokeWidth="1.5" />
            <circle cx="60" cy="95" r="7" fill="#141A1C" stroke={secondaryAccent} strokeWidth="1.5" />
            <circle cx="140" cy="95" r="7" fill="#141A1C" stroke={secondaryAccent} strokeWidth="1.5" />
            {/* Center Winner Hub */}
            <circle cx="100" cy="70" r="14" fill="#1B2628" stroke={primaryAccent} strokeWidth="2.5" />
            <path d="M96 70 L99 73 L105 67" stroke={primaryAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

      </svg>
    </div>
  );
};
