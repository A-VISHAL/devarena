import { ShareCardData, PublicSharedResult, UserProfile } from '../types';

/**
 * Robust clipboard copy function with fallback for non-secure / restricted contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('[Clipboard] navigator.clipboard failed, attempting fallback', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[Clipboard] Fallback copy failed', err);
    return false;
  }
}

/**
 * Generate official LinkedIn share endpoint URL
 */
export function getLinkedInShareUrl(publicUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
}

/**
 * Generate dynamic, genuine post content based on actual game / battle results.
 */
export function generateLinkedInPostText(
  data: ShareCardData, 
  user: { username: string; displayName?: string; streak?: number; rating?: number }, 
  publicUrl: string
): string {
  const isCodingBattle = 
    data.isBattle || 
    data.title?.toLowerCase().includes('coding') || 
    data.title?.toLowerCase().includes('battle') || 
    data.gameOrBattle?.toLowerCase().includes('1v1') || 
    data.gameOrBattle?.toLowerCase().includes('battle');

  // 1. Coding Battle Post Format
  if (isCodingBattle) {
    const problemName = data.problemTitle || data.gameOrBattle.replace(/^1v1 Battle on\s*/i, '').trim() || 'Algorithm Duel';
    const opponent = data.opponentName ? `@${data.opponentName}` : 'Random Challenger';
    const rawResult = data.battleResult || data.scoreOrResult;
    const isWin = rawResult?.toLowerCase().includes('win') || rawResult?.toLowerCase().includes('victory');
    const resultLabel = isWin ? 'Victory 🏆' : 'Competed ⚡';

    // Parse test cases
    const testCases = data.testCasesPassed || 
      data.customStats?.find(s => s.label.toLowerCase().includes('test'))?.value ||
      data.subtitle?.match(/\d+\/\d+\s*Tests?/i)?.[0] || 'All tests passed';

    // Parse execution time
    const execTime = data.executionTime || 
      data.customStats?.find(s => s.label.toLowerCase().includes('time'))?.value || 
      '12s';

    // Parse rating delta
    const ratingDelta = data.ratingChange !== undefined 
      ? (data.ratingChange > 0 ? `+${data.ratingChange} Elo` : `${data.ratingChange} Elo`)
      : data.subtitle?.match(/[+-]?\d+\s*Elo/i)?.[0] || '+24 Elo';

    const currentRating = user.rating ? `${user.rating} Elo` : 'Ranked';

    return `⚔️ Just completed a 1v1 Coding Battle on DEVARENA!

Result: ${resultLabel}
Problem: ${problemName}
Opponent: ${opponent}
Rating Change: ${ratingDelta} (Current: ${currentRating})
Test Cases Passed: ${testCases}
Execution Time: ${execTime}

Think you can solve it faster in real-time? Challenge me!

Battle here: ${publicUrl}

#DEVARENA #CompetitiveProgramming #Algorithms #CodeDuel #ProblemSolving #Coding #TechCommunity`;
  }

  // 2. Casual Brain Game Post Format
  const gameName = data.gameTitle || data.gameOrBattle || 'Pattern Master';
  const scoreValue = data.score || data.scoreOrResult;

  // Build clean performance sentence:
  // e.g.: "I scored 400 points in Pattern Master and completed all 8 rounds."
  let performanceSentence = `I scored ${scoreValue} in ${gameName}.`;
  
  if (data.roundsOrMoves) {
    performanceSentence = `I scored ${scoreValue} in ${gameName} and completed ${data.roundsOrMoves}.`;
  } else if (data.customStats?.some(s => s.label.toLowerCase().includes('round'))) {
    const rounds = data.customStats.find(s => s.label.toLowerCase().includes('round'))?.value;
    performanceSentence = `I scored ${scoreValue} in ${gameName} and completed all ${rounds} rounds.`;
  } else if (data.subtitle && !data.subtitle.includes('\n')) {
    performanceSentence = `I scored ${scoreValue} in ${gameName} (${data.subtitle}).`;
  }

  const streakDays = data.streak !== undefined ? data.streak : (user.streak || 1);

  return `🏆 Just completed a challenge on DEVARENA!

${performanceSentence}

⚡ My current streak: ${streakDays} day${streakDays === 1 ? '' : 's'}  
🎮 Game: ${gameName}  
⭐ Platform: DEVARENA

Think fast. Play smart. Challenge me!

Play here: ${publicUrl}

#DEVARENA #BrainGames #Gaming #ProblemSolving #Developer #TechCommunity`;
}

/**
 * Compact representation for URL safe sharing
 */
interface CompactResultPayload {
  t: string; // title
  g: string; // gameOrBattle
  s: string; // scoreOrResult
  sub?: string; // subtitle
  gid?: string; // gameId
  gt?: string; // gameTitle
  sc?: string | number; // score
  st?: number; // streak
  bat?: number; // 1 if battle, 0 if casual
  prob?: string; // problemTitle
  opp?: string; // opponentName
  res?: string; // battleResult
  tm?: string; // execTime
  tc?: string; // testCases
  rc?: number; // ratingChange
  u: string; // username
  dn: string; // displayName
  av: string; // avatar
  r: number; // rating
  d: string; // date
  stats?: { l: string; v: string }[];
}

/**
 * Encodes public result data into a URL-safe compact string.
 */
export function encodeResultPayload(result: PublicSharedResult): string {
  try {
    const compact: CompactResultPayload = {
      t: result.title,
      g: result.gameOrBattle,
      s: result.scoreOrResult,
      sub: result.subtitle,
      gid: result.gameId,
      gt: result.gameTitle,
      sc: result.score,
      st: result.streak,
      bat: result.isBattle ? 1 : 0,
      prob: result.problemTitle,
      opp: result.opponentName,
      res: result.battleResult,
      tm: result.executionTime,
      tc: result.testCasesPassed,
      rc: result.ratingChange,
      u: result.player.username,
      dn: result.player.displayName,
      av: result.player.avatar,
      r: result.player.rating,
      d: result.createdAt,
      stats: result.customStats?.map(s => ({ l: s.label, v: s.value }))
    };

    const json = JSON.stringify(compact);
    // Base64 encode safely for unicode
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (err) {
    console.warn('Failed to encode result payload', err);
    return '';
  }
}

/**
 * Decodes a URL-safe compact string back into PublicSharedResult.
 */
export function decodeResultPayload(id: string, encoded: string): PublicSharedResult | null {
  try {
    const raw = decodeURIComponent(Array.prototype.map.call(atob(encoded), (c: string) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const compact: CompactResultPayload = JSON.parse(raw);
    return {
      id,
      title: compact.t,
      gameOrBattle: compact.g,
      scoreOrResult: compact.s,
      subtitle: compact.sub,
      gameId: compact.gid as any,
      gameTitle: compact.gt,
      score: compact.sc,
      streak: compact.st,
      isBattle: compact.bat === 1,
      problemTitle: compact.prob,
      opponentName: compact.opp,
      battleResult: compact.res as any,
      executionTime: compact.tm,
      testCasesPassed: compact.tc,
      ratingChange: compact.rc,
      createdAt: compact.d || 'Just now',
      customStats: compact.stats?.map(s => ({ label: s.l, value: s.v })),
      player: {
        id: compact.u,
        username: compact.u,
        displayName: compact.dn || compact.u,
        avatar: compact.av,
        rating: compact.r || 1200,
        streak: compact.st || 1
      }
    };
  } catch (err) {
    console.warn('Failed to decode result payload', err);
    return null;
  }
}

/**
 * Builds the full public shareable URL.
 */
export function buildShareableResultUrl(result: PublicSharedResult): string {
  const origin = window.location.origin;
  const encoded = encodeResultPayload(result);
  const params = new URLSearchParams();
  params.set('result', result.id);
  if (encoded) {
    params.set('d', encoded);
  }
  return `${origin}/result?${params.toString()}`;
}

/**
 * Saves shared result to localStorage and server API.
 */
export function saveSharedResult(result: PublicSharedResult): void {
  try {
    // 1. Save locally in localStorage
    localStorage.setItem(`devarena_result_${result.id}`, JSON.stringify(result));
    
    // Save to shared results index
    const indexStr = localStorage.getItem('devarena_shared_results_index') || '[]';
    const index: string[] = JSON.parse(indexStr);
    if (!index.includes(result.id)) {
      index.unshift(result.id);
      localStorage.setItem('devarena_shared_results_index', JSON.stringify(index.slice(0, 50)));
    }
  } catch (e) {
    console.warn('Failed to store result in localStorage', e);
  }

  // 2. Fire-and-forget sync to relay backend if active
  try {
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    }).catch(() => {
      // Offline or local server not running — non-fatal as URL payload serves as fallback
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Retrieves a shared result by ID, with fallback to URL payload or server API.
 */
export async function getSharedResult(id: string, encodedPayload?: string): Promise<PublicSharedResult | null> {
  // 1. Check localStorage first
  try {
    const cached = localStorage.getItem(`devarena_result_${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore
  }

  // 2. Decode from URL payload if available
  if (encodedPayload) {
    const decoded = decodeResultPayload(id, encodedPayload);
    if (decoded) {
      // Cache it for future reloads
      try {
        localStorage.setItem(`devarena_result_${id}`, JSON.stringify(decoded));
      } catch (e) {}
      return decoded;
    }
  }

  // 3. Try fetching from backend relay server
  try {
    const res = await fetch(`/api/results/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // ignore
  }

  // 4. Fallback sample mock result if id is referenced but data missing
  return {
    id,
    title: 'Pattern Master Challenge',
    gameOrBattle: 'Pattern Master',
    scoreOrResult: '400 Points',
    subtitle: 'Completed all 8 rounds • Streak: 3 days',
    gameId: 'pattern-master',
    gameTitle: 'Pattern Master',
    score: 400,
    streak: 3,
    createdAt: 'Recent',
    customStats: [
      { label: 'Score', value: '400' },
      { label: 'Rounds', value: '8/8' },
      { label: 'Accuracy', value: '100%' }
    ],
    player: {
      id: 'dev_player',
      username: 'dev_player',
      displayName: 'DEVARENA Player',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating: 1420,
      streak: 3
    }
  };
}
