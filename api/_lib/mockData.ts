// Centralized Mock Data & Deterministic Scheduling for DEVARENA Serverless Functions

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  input: string;
  output: string;
}

export const CENTRAL_DSA_PROBLEMS: DSAProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    input: 'nums = [2, 7, 11, 15], target = 9',
    output: '[0, 1]'
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack and Queue',
    description: 'Given a string s containing just characters "()[]{}", determine if the input string is valid.',
    input: 's = "()[]{}"',
    output: 'true'
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
    input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    output: '6'
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule',
    difficulty: 'Medium',
    category: 'Graphs',
    description: 'There are numCourses courses you have to take. Determine if it is possible to finish all courses (cycle detection).',
    input: 'numCourses = 2, prerequisites = [[1, 0]]',
    output: 'true'
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
    output: '6'
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Design',
    difficulty: 'Medium',
    category: 'Linked Lists & Design',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put.',
    input: 'LRUCache(2); put(1, 1); put(2, 2); get(1);',
    output: '1'
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    input: 'root = [4, 2, 7, 1, 3, 6, 9]',
    output: '[4, 7, 2, 9, 6, 3, 1]'
  },
  {
    id: 'word-search',
    title: 'Word Search (Backtracking)',
    difficulty: 'Medium',
    category: 'Backtracking',
    description: 'Given an m x n grid of characters and a string word, return true if word exists in the grid.',
    input: 'board = [["A","B","C","E"],["S","F","C","S"]], word = "ABCCED"',
    output: 'true'
  }
];

export const CENTRAL_LEADERBOARD = [
  { rank: 1, username: 'algo_zenith', score: 2180, wins: 48, ratingBadge: 'Grandmaster' },
  { rank: 2, username: 'binary_ninja', score: 2045, wins: 42, ratingBadge: 'Master' },
  { rank: 3, username: 'sara_byte', score: 2010, wins: 39, ratingBadge: 'Master' },
  { rank: 4, username: 'kavya_codes', score: 1845, wins: 31, ratingBadge: 'Diamond' },
  { rank: 5, username: 'rohit_algo', score: 1790, wins: 28, ratingBadge: 'Diamond' },
  { rank: 6, username: 'marcus_q', score: 1620, wins: 22, ratingBadge: 'Platinum' }
];

// Deterministic calendar calculation (Day of Year)
export function getDeterministicChallenge(slot: 'morning' | 'evening', date: Date = new Date()): { problem: DSAProblem; challengeNumber: number; slot: 'morning' | 'evening'; dateString: string } {
  // Use Asia/Kolkata date
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const currentUtc = new Date(Date.UTC(year, month, day));
  const dayOfYear = Math.floor((currentUtc.getTime() - startOfYear.getTime()) / 86400000);

  const slotOffset = slot === 'morning' ? 0 : 1;
  const total = CENTRAL_DSA_PROBLEMS.length;
  const index = Math.abs((dayOfYear * 2 + slotOffset) % total);

  const problem = CENTRAL_DSA_PROBLEMS[index];
  const challengeNumber = 100 + (dayOfYear * 2 + slotOffset);

  return {
    problem,
    challengeNumber,
    slot,
    dateString: dateStr
  };
}

