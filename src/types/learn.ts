// Types for DEVARENA Social DSA Learning Experience
export type LearningStage = 'foundation' | 'data-structures' | 'algorithms' | 'advanced';

export interface StageMeta {
  id: LearningStage;
  title: string;
  tagline: string;
  description: string;
  color: string;
  accentBg: string;
  borderAccent: string;
}

export interface TopicLesson {
  id: string;
  title: string;
  duration: string; // e.g. "5 mins"
  summary: string;
}

export interface InteractiveVisualizationConfig {
  type: 'array-traverse' | 'two-pointers' | 'sliding-window' | 'binary-search' | 'stack' | 'tree-traversal' | 'dp-grid';
  title: string;
  description: string;
  initialState: any;
  steps: {
    description: string;
    highlightIndices?: number[];
    pointers?: { label: string; index: number; color?: string }[];
    treeActiveNode?: string;
    dpMatrixRow?: number;
    dpMatrixCol?: number;
    explanation: string;
  }[];
}

export interface DSARoadmapTopic {
  id: string;
  title: string;
  stage: LearningStage;
  icon: string;
  description: string;
  prerequisites: string[];
  timeComplexity: string;
  spaceComplexity: string;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  problemIds: string[];
  conceptExplanation: string;
  keyInvariants: string[];
  codeExamples: {
    python: string;
    cpp: string;
    java: string;
    javascript?: string;
  };
  commonPatterns: string[];
  commonMistakes: string[];
  interviewTips: string[];
  lessons: TopicLesson[];
  visualization: InteractiveVisualizationConfig;
}

export type LearningActivityType = 
  | 'problem_solved' 
  | 'lesson_completed' 
  | 'topic_completed' 
  | 'stage_completed' 
  | 'streak_milestone' 
  | 'discussion_posted';

export interface LearningActivityEvent {
  id: string;
  type: LearningActivityType;
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  points: number;
  topicId?: string;
  topicTitle?: string;
  problemId?: string;
  problemTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  details?: string;
}

export interface DayContribution {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  problemsSolved: number;
  topicsStudied: number;
  lessonsCompleted: number;
  events: LearningActivityEvent[];
}

export interface AnnualHeatmapData {
  year: number;
  totalContributions: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  weeks: DayContribution[][]; // 52 or 53 weeks, each 7 days
  monthHeaders: { month: string; weekIndex: number }[];
}

export interface SocialLearningPost {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    headline: string;
    rating: number;
  };
  type: 'topic_completed' | 'problem_streak' | 'stage_milestone' | 'sheet_progress' | 'explanation_share';
  title: string;
  content: string;
  topicId?: string;
  topicTitle?: string;
  problemId?: string;
  problemTitle?: string;
  stageId?: LearningStage;
  timestamp: string;
  timeAgo: string;
  likes: number;
  hasLiked?: boolean;
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
  }[];
  tags: string[];
  verified: boolean;
}

export interface FellowLearner {
  id: string;
  name: string;
  username: string;
  avatar: string;
  headline: string;
  currentTopic: string;
  topicProgress: number;
  currentSheet: string;
  streak: number;
  problemsSolved: number;
  isFollowing: boolean;
  sharedTopicId: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  category: 'topics' | 'problems' | 'streak' | 'stage' | 'sheet';
  description: string;
  icon: string;
  requiredCount: number;
  currentCount: number;
  achieved: boolean;
  achievedDate?: string;
  badge: string;
}

