// Unified Learning Activity Service for DEVARENA
import { 
  LearningActivityEvent, 
  LearningActivityType, 
  AnnualHeatmapData, 
  DayContribution,
  LearningMilestone
} from '../types/learn';

const STORAGE_KEY = 'devarena_learning_activity_events';
const COMPLETED_LESSONS_KEY = 'devarena_completed_lessons';
const TOPIC_DISCUSSIONS_KEY = 'devarena_topic_discussions';
const FOLLOWED_LEARNERS_KEY = 'devarena_followed_learners';

// Initial realistic seed history leading up to Nov 2026 (respects user streak of 3)
const generateInitialSeedEvents = (): LearningActivityEvent[] => {
  const events: LearningActivityEvent[] = [];
  const today = new Date('2026-11-15T10:00:00Z');

  // helper to generate date string YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // 1. Current 3-day active streak (Nov 13, 14, 15)
  events.push({
    id: 'seed-act-today',
    type: 'problem_solved',
    timestamp: '2026-11-15T08:30:00Z',
    date: '2026-11-15',
    points: 4,
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    topicId: 'arrays',
    topicTitle: 'Arrays & Vectors',
    details: 'Executed 100% test cases with 12ms latency'
  });
  events.push({
    id: 'seed-act-nov14',
    type: 'lesson_completed',
    timestamp: '2026-11-14T15:20:00Z',
    date: '2026-11-14',
    points: 3,
    topicId: 'two-pointers',
    topicTitle: 'Two Pointers',
    lessonId: 'tp-1',
    lessonTitle: 'Opposite Direction Invariants'
  });
  events.push({
    id: 'seed-act-nov13',
    type: 'problem_solved',
    timestamp: '2026-11-13T19:45:00Z',
    date: '2026-11-13',
    points: 4,
    problemId: 'valid-parentheses',
    problemTitle: 'Valid Parentheses',
    topicId: 'stacks-queues',
    topicTitle: 'Stacks and Queues'
  });

  // 2. Realistic activity across past months of 2026
  const pastDaysOffset = [
    // November
    4, 5, 8, 9, 11,
    // October
    18, 20, 22, 23, 26, 28, 30, 31, 35, 38,
    // September
    45, 48, 50, 52, 55, 59, 62, 65, 68,
    // August
    75, 78, 80, 85, 90, 95,
    // July
    110, 115, 120, 125,
    // June
    140, 145, 150,
    // May
    170, 175, 180,
    // April
    200, 210, 215,
    // March
    230, 240, 245,
    // February
    260, 270,
    // January
    290, 300, 310
  ];

  const problemPool = [
    { id: 'maximum-subarray', title: 'Maximum Subarray', topic: 'arrays', topicTitle: 'Arrays & Vectors' },
    { id: 'binary-search', title: 'Binary Search', topic: 'binary-search', topicTitle: 'Binary Search' },
    { id: 'container-with-most-water', title: 'Container with Most Water', topic: 'two-pointers', topicTitle: 'Two Pointers' },
    { id: 'valid-palindrome', title: 'Valid Palindrome', topic: 'strings', topicTitle: 'Strings & Parsing' },
    { id: 'valid-anagram', title: 'Valid Anagram', topic: 'strings', topicTitle: 'Strings & Parsing' },
    { id: 'climbing-stairs', title: 'Climbing Stairs', topic: 'dynamic-programming', topicTitle: 'Dynamic Programming' }
  ];

  pastDaysOffset.forEach((offset, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const dateStr = formatDate(d);
    const prob = problemPool[idx % problemPool.length];

    events.push({
      id: `seed-act-${offset}`,
      type: idx % 3 === 0 ? 'lesson_completed' : 'problem_solved',
      timestamp: `${dateStr}T14:00:00Z`,
      date: dateStr,
      points: (idx % 4) + 1,
      problemId: prob.id,
      problemTitle: prob.title,
      topicId: prob.topic,
      topicTitle: prob.topicTitle,
      details: 'Verified test run passed'
    });

    // occasional extra activity on the same day for intensity levels 2-4
    if (idx % 4 === 0) {
      events.push({
        id: `seed-act-${offset}-b`,
        type: 'topic_completed',
        timestamp: `${dateStr}T16:30:00Z`,
        date: dateStr,
        points: 5,
        topicId: prob.topic,
        topicTitle: prob.topicTitle
      });
    }
  });

  return events;
};

// 1. Get all recorded learning events
export const getLearningEvents = (): LearningActivityEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading learning events from localStorage', e);
  }

  // Populate seed history
  const initial = generateInitialSeedEvents();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
};

// 2. Record a genuine learning event
export const recordLearningActivity = (
  type: LearningActivityType,
  data: {
    points?: number;
    topicId?: string;
    topicTitle?: string;
    problemId?: string;
    problemTitle?: string;
    lessonId?: string;
    lessonTitle?: string;
    details?: string;
  }
): LearningActivityEvent => {
  const events = getLearningEvents();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Prevent duplicate problem solve event on same problem on same calendar day
  if (type === 'problem_solved' && data.problemId) {
    const existing = events.find(
      e => e.type === 'problem_solved' && e.problemId === data.problemId && e.date === dateStr
    );
    if (existing) {
      return existing; // already recorded today
    }
  }

  // Prevent duplicate lesson completion
  if (type === 'lesson_completed' && data.lessonId) {
    const existing = events.find(
      e => e.type === 'lesson_completed' && e.lessonId === data.lessonId
    );
    if (existing) {
      return existing;
    }
  }

  const defaultPoints = 
    type === 'stage_completed' ? 10 :
    type === 'topic_completed' ? 6 :
    type === 'problem_solved' ? 4 :
    type === 'lesson_completed' ? 3 :
    type === 'streak_milestone' ? 8 : 2;

  const newEvent: LearningActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    timestamp: now.toISOString(),
    date: dateStr,
    points: data.points || defaultPoints,
    topicId: data.topicId,
    topicTitle: data.topicTitle,
    problemId: data.problemId,
    problemTitle: data.problemTitle,
    lessonId: data.lessonId,
    lessonTitle: data.lessonTitle,
    details: data.details
  };

  const updated = [newEvent, ...events];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save learning activity', e);
  }

  return newEvent;
};

// 3. Completed Lessons management
export const getCompletedLessons = (): string[] => {
  try {
    const raw = localStorage.getItem(COMPLETED_LESSONS_KEY);
    return raw ? JSON.parse(raw) : ['arr-1', 'str-1', 'tp-1'];
  } catch {
    return ['arr-1', 'str-1', 'tp-1'];
  }
};

export const markLessonCompleted = (lessonId: string, topicId: string, topicTitle: string, lessonTitle: string): boolean => {
  const current = getCompletedLessons();
  if (current.includes(lessonId)) return false;

  const next = [...current, lessonId];
  try {
    localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(next));
  } catch {}

  recordLearningActivity('lesson_completed', {
    topicId,
    topicTitle,
    lessonId,
    lessonTitle,
    points: 3
  });

  return true;
};

// 4. Calculate Annual Contribution Heatmap (52-53 weeks, 7 rows)
export const getAnnualHeatmapData = (year: number = 2026): AnnualHeatmapData => {
  const events = getLearningEvents();
  
  // Aggregate events by date
  const dateMap = new Map<string, LearningActivityEvent[]>();
  events.forEach(e => {
    const list = dateMap.get(e.date) || [];
    list.push(e);
    dateMap.set(e.date, list);
  });

  // Calculate day boundaries for the given year
  const startOfYear = new Date(`${year}-01-01T00:00:00`);
  const endOfYear = new Date(`${year}-12-31T23:59:59`);
  
  // Align start to the preceding Sunday so week columns are aligned (Sun=0..Sat=6)
  const startSunday = new Date(startOfYear);
  startSunday.setDate(startSunday.getDate() - startSunday.getDay());

  // End alignment: succeeding Saturday
  const endSaturday = new Date(endOfYear);
  endSaturday.setDate(endSaturday.getDate() + (6 - endSaturday.getDay()));

  const weeks: DayContribution[][] = [];
  const monthHeaders: { month: string; weekIndex: number }[] = [];
  let currentWeek: DayContribution[] = [];
  let currentMonthIndex = -1;

  const pointer = new Date(startSunday);
  let weekIdx = 0;

  let totalContributions = 0;
  let activeDays = 0;

  while (pointer <= endSaturday) {
    const dateStr = pointer.toISOString().split('T')[0];
    const isInsideYear = pointer.getFullYear() === year;

    const dayEvents = isInsideYear ? (dateMap.get(dateStr) || []) : [];
    const count = dayEvents.reduce((acc, ev) => acc + (ev.points || 1), 0);
    const problemsSolved = dayEvents.filter(ev => ev.type === 'problem_solved').length;
    const lessonsCompleted = dayEvents.filter(ev => ev.type === 'lesson_completed').length;
    const topicsStudied = new Set(dayEvents.map(ev => ev.topicId).filter(Boolean)).size;

    if (count > 0 && isInsideYear) {
      totalContributions += count;
      activeDays += 1;
    }

    // Determine intensity level (0 to 4)
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0 && isInsideYear) {
      if (count >= 10) intensity = 4;
      else if (count >= 6) intensity = 3;
      else if (count >= 3) intensity = 2;
      else intensity = 1;
    }

    currentWeek.push({
      date: dateStr,
      dayOfWeek: pointer.getDay(),
      count,
      intensity,
      problemsSolved,
      topicsStudied,
      lessonsCompleted,
      events: dayEvents
    });

    // Check for new month start
    if (isInsideYear && pointer.getDate() <= 7 && pointer.getMonth() !== currentMonthIndex) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthHeaders.push({
        month: monthNames[pointer.getMonth()],
        weekIndex: weekIdx
      });
      currentMonthIndex = pointer.getMonth();
    }

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
      weekIdx++;
    }

    pointer.setDate(pointer.getDate() + 1);
  }

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(dateMap);

  return {
    year,
    totalContributions,
    activeDays,
    currentStreak,
    longestStreak,
    weeks,
    monthHeaders
  };
};

// 5. Accurate Streak Calculation using calendar day continuity
export const calculateStreaks = (dateMap: Map<string, LearningActivityEvent[]>): { currentStreak: number; longestStreak: number } => {
  const activeDates = Array.from(dateMap.keys())
    .filter(d => (dateMap.get(d) || []).length > 0)
    .sort();

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate longest streak
  let longest = 1;
  let running = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const prev = new Date(activeDates[i - 1]);
    const curr = new Date(activeDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      running++;
      if (running > longest) longest = running;
    } else if (diffDays > 1) {
      running = 1;
    }
  }

  // Calculate current streak relative to today
  const todayStr = '2026-11-15';
  const yesterdayStr = '2026-11-14';

  let currentStreak = 0;
  if (dateMap.has(todayStr) || dateMap.has(yesterdayStr)) {
    let checkDate = new Date(dateMap.has(todayStr) ? todayStr : yesterdayStr);
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dateMap.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak: Math.max(longest, currentStreak) };
};

// 6. Social Following Storage
export const getFollowedLearners = (): string[] => {
  try {
    const raw = localStorage.getItem(FOLLOWED_LEARNERS_KEY);
    return raw ? JSON.parse(raw) : ['kavya_codes', 'marcus_q'];
  } catch {
    return ['kavya_codes', 'marcus_q'];
  }
};

export const toggleFollowLearner = (username: string): boolean => {
  const current = getFollowedLearners();
  const isFollowing = current.includes(username);
  const next = isFollowing ? current.filter(u => u !== username) : [...current, username];
  try {
    localStorage.setItem(FOLLOWED_LEARNERS_KEY, JSON.stringify(next));
  } catch {}
  return !isFollowing;
};

// 7. Calculate Genuine Milestones
export const getLearningMilestones = (
  problemsSolved: string[],
  topicProgressMap: Record<string, number>,
  currentStreak: number
): LearningMilestone[] => {
  const totalSolved = problemsSolved.length;
  const completedTopicsCount = Object.values(topicProgressMap).filter(p => p >= 100).length;

  return [
    {
      id: 'ms-first-topic',
      title: 'First Topic Mastered',
      category: 'topics',
      description: 'Completed 100% of your inaugural DSA roadmap topic with verified test runs.',
      icon: 'Award',
      requiredCount: 1,
      currentCount: completedTopicsCount,
      achieved: completedTopicsCount >= 1,
      achievedDate: 'Nov 12, 2026',
      badge: 'FOUNDATION'
    },
    {
      id: 'ms-10-problems',
      title: '10 Problems Solved',
      category: 'problems',
      description: 'Built a solid foundation by solving 10 algorithmic problems in Code Arena.',
      icon: 'Code2',
      requiredCount: 10,
      currentCount: Math.min(totalSolved, 10),
      achieved: totalSolved >= 10,
      badge: 'PROBLEM SOLVER'
    },
    {
      id: 'ms-50-problems',
      title: '50 Problems Solved',
      category: 'problems',
      description: 'Deep technical competence spanning linear and hierarchical architectures.',
      icon: 'Trophy',
      requiredCount: 50,
      currentCount: Math.min(totalSolved, 50),
      achieved: totalSolved >= 50,
      badge: 'DSA SPECIALIST'
    },
    {
      id: 'ms-stage-foundation',
      title: 'Foundation Stage Completed',
      category: 'stage',
      description: 'Mastered all 5 foundation topics: Arrays, Strings, Hashing, Two Pointers, and Sliding Window.',
      icon: 'Layers',
      requiredCount: 5,
      currentCount: Math.min(completedTopicsCount, 5),
      achieved: completedTopicsCount >= 5,
      badge: 'STAGE I CERTIFIED'
    },
    {
      id: 'ms-7-day-streak',
      title: '7-Day Learning Streak',
      category: 'streak',
      description: 'Committed code and studied DSA consecutively for 7 full calendar days.',
      icon: 'Flame',
      requiredCount: 7,
      currentCount: Math.min(currentStreak, 7),
      achieved: currentStreak >= 7,
      badge: 'UNBROKEN DISCIPLINE'
    },
    {
      id: 'ms-30-day-streak',
      title: '30-Day Learning Habit',
      category: 'streak',
      description: 'An elite 30-day discipline milestone demonstrated in your contribution graph.',
      icon: 'Zap',
      requiredCount: 30,
      currentCount: Math.min(currentStreak, 30),
      achieved: currentStreak >= 30,
      badge: 'PERSISTENCE MASTER'
    }
  ];
};

