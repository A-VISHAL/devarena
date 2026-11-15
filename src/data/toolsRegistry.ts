import { DeveloperToolMeta, ToolCategoryInfo } from '../types/tools';

export const TOOL_CATEGORIES: ToolCategoryInfo[] = [
  {
    id: 'dsa',
    name: 'DSA & Algorithms',
    description: 'Interactive visualizers, complexity analysis, and classical algorithm patterns.',
    iconName: 'GitBranch',
    count: 4
  },
  {
    id: 'utilities',
    name: 'Code Utilities',
    description: 'Formatting, regex verification, and client-side safe JavaScript execution.',
    iconName: 'Code2',
    count: 3
  },
  {
    id: 'data',
    name: 'Data & Database',
    description: 'In-browser SQL playground with sample databases and CSV table processors.',
    iconName: 'Database',
    count: 2
  },
  {
    id: 'productivity',
    name: 'Developer Productivity',
    description: 'Unix timestamps, Base64, URL encoding, cryptographic hashes, and color conversion.',
    iconName: 'Zap',
    count: 5
  }
];

export const DEVELOPER_TOOLS: DeveloperToolMeta[] = [
  // ========================================================
  // 1. DSA & ALGORITHMS
  // ========================================================
  {
    id: 'sorting-visualizer',
    title: 'Sorting Visualizer',
    tagline: 'Interactive step-by-step sorting algorithm animator',
    description: 'Visualize Bubble, Selection, Insertion, Merge, Quick, and Heap sort with speed controls, comparison metrics, and complexity breakdowns.',
    category: 'dsa',
    categoryName: 'DSA & Algorithms',
    iconName: 'BarChart3',
    badge: 'Popular',
    popular: true,
    tags: ['sorting', 'algorithms', 'visualizer', 'bubble sort', 'quick sort', 'merge sort'],
    urlPath: '/app/tools?tool=sorting-visualizer'
  },
  {
    id: 'binary-search',
    title: 'Binary Search Visualizer',
    tagline: 'Low, Mid, and High pointer tracking on sorted ranges',
    description: 'Step through logarithmic search on custom or generated sorted arrays. Highlights discarded halves and counts total iterations.',
    category: 'dsa',
    categoryName: 'DSA & Algorithms',
    iconName: 'Search',
    badge: 'Essential',
    popular: true,
    tags: ['binary search', 'search', 'divide and conquer', 'logarithmic', 'pointers'],
    urlPath: '/app/tools?tool=binary-search'
  },
  {
    id: 'big-o-analyzer',
    title: 'Big O Complexity Analyzer',
    tagline: 'Static pattern-based time & space complexity estimator',
    description: 'Inspect loop nesting, recursive divide-and-conquer structures, and branch trees to understand asymptotic runtime curves.',
    category: 'dsa',
    categoryName: 'DSA & Algorithms',
    iconName: 'TrendingUp',
    popular: true,
    tags: ['big o', 'complexity', 'time complexity', 'space complexity', 'analysis'],
    urlPath: '/app/tools?tool=big-o-analyzer'
  },
  {
    id: 'dsa-patterns',
    title: 'DSA Pattern Visualizer',
    tagline: 'Interactive demos for 9 core algorithmic paradigms',
    description: 'Interactive step-by-step execution for Two Pointers, Sliding Window, Fast/Slow Pointers, Monotonic Stack, BFS, DFS, and DP.',
    category: 'dsa',
    categoryName: 'DSA & Algorithms',
    iconName: 'Workflow',
    badge: '9 Patterns',
    popular: true,
    tags: ['two pointers', 'sliding window', 'bfs', 'dfs', 'monotonic stack', 'dp'],
    urlPath: '/app/tools?tool=dsa-patterns'
  },

  // ========================================================
  // 2. CODE UTILITIES
  // ========================================================
  {
    id: 'json-formatter',
    title: 'JSON Formatter & Validator',
    tagline: 'Prettify, minify, and validate JSON data in real time',
    description: 'Format JSON with customizable indentation, minify for payload efficiency, and identify syntax errors with line/column pointers.',
    category: 'utilities',
    categoryName: 'Code Utilities',
    iconName: 'FileJson',
    popular: true,
    tags: ['json', 'formatter', 'minify', 'validator', 'prettify', 'parser'],
    urlPath: '/app/tools?tool=json-formatter'
  },
  {
    id: 'regex-tester',
    title: 'Regex Tester & Cheatsheet',
    tagline: 'Safe real-time regular expression tester with capture groups',
    description: 'Test patterns against strings with live highlight match feedback, capture groups table, ReDoS safeguards, and common regex presets.',
    category: 'utilities',
    categoryName: 'Code Utilities',
    iconName: 'Regex',
    popular: true,
    tags: ['regex', 'regular expression', 'testing', 'pattern matching', 'string'],
    urlPath: '/app/tools?tool=regex-tester'
  },
  {
    id: 'js-playground',
    title: 'JavaScript Playground',
    tagline: 'In-browser JS code execution & console sandbox',
    description: 'Run JavaScript snippets directly in the browser with captured console output, error stacks, runtime benchmarking, and preset demos.',
    category: 'utilities',
    categoryName: 'Code Utilities',
    iconName: 'Play',
    tags: ['javascript', 'playground', 'sandbox', 'console', 'repl', 'execution'],
    urlPath: '/app/tools?tool=js-playground'
  },

  // ========================================================
  // 3. DATA & DATABASE
  // ========================================================
  {
    id: 'sql-playground',
    title: 'SQL Playground',
    tagline: 'In-browser SQLite engine with sample relational tables',
    description: 'Execute SELECT, INSERT, UPDATE, DELETE, and JOIN queries against pre-seeded users and orders tables with zero setup.',
    category: 'data',
    categoryName: 'Data & Database',
    iconName: 'Database',
    badge: 'Interactive',
    popular: true,
    tags: ['sql', 'sqlite', 'database', 'queries', 'relational', 'tables'],
    urlPath: '/app/tools?tool=sql-playground'
  },
  {
    id: 'csv-viewer',
    title: 'CSV Viewer & Processor',
    tagline: 'Upload, filter, sort, and export CSV tabular data',
    description: 'Local in-browser CSV parsing with instant multi-column search, sorting, row filters, summary statistics, and clean CSV export.',
    category: 'data',
    categoryName: 'Data & Database',
    iconName: 'Table',
    tags: ['csv', 'excel', 'table', 'data viewer', 'export', 'parser'],
    urlPath: '/app/tools?tool=csv-viewer'
  },

  // ========================================================
  // 4. DEVELOPER PRODUCTIVITY
  // ========================================================
  {
    id: 'timestamp-converter',
    title: 'Unix Timestamp Converter',
    tagline: 'Convert epochs to readable dates and vice-versa',
    description: 'Real-time Unix epoch converter supporting seconds, milliseconds, UTC ISO 8601, local timezone, and relative times.',
    category: 'productivity',
    categoryName: 'Developer Productivity',
    iconName: 'Clock',
    popular: true,
    tags: ['timestamp', 'unix', 'epoch', 'date', 'utc', 'timezone'],
    urlPath: '/app/tools?tool=timestamp-converter'
  },
  {
    id: 'base64-converter',
    title: 'Base64 Encoder / Decoder',
    tagline: 'Fast client-side Base64 string encoding and decoding',
    description: 'Encode text to Base64 and decode Base64 back to plain text. Includes URL-safe mode, byte size counters, and validation.',
    category: 'productivity',
    categoryName: 'Developer Productivity',
    iconName: 'Binary',
    tags: ['base64', 'encode', 'decode', 'binary', 'ascii', 'converter'],
    urlPath: '/app/tools?tool=base64-converter'
  },
  {
    id: 'url-converter',
    title: 'URL Encoder & Query Parser',
    tagline: 'URL encode/decode and inspect query parameter keys',
    description: 'Encode and decode URI components safely. Automatically breaks down query strings into an interactive key-value inspector.',
    category: 'productivity',
    categoryName: 'Developer Productivity',
    iconName: 'Link',
    tags: ['url', 'uri', 'encode', 'decode', 'query params', 'parser'],
    urlPath: '/app/tools?tool=url-converter'
  },
  {
    id: 'hash-generator',
    title: 'Cryptographic Hash Generator',
    tagline: 'SHA-256, SHA-384, SHA-512 with native Web Crypto',
    description: 'Compute cryptographic checksums entirely client-side using the browser Web Crypto API. Zero server transmissions.',
    category: 'productivity',
    categoryName: 'Developer Productivity',
    iconName: 'ShieldCheck',
    tags: ['hash', 'sha256', 'sha512', 'sha384', 'crypto', 'checksum'],
    urlPath: '/app/tools?tool=hash-generator'
  },
  {
    id: 'color-converter',
    title: 'Color Converter & Studio',
    tagline: 'HEX, RGB, HSL conversions with contrast checking',
    description: 'Convert between HEX, RGB, HSL, and HSV. Includes live swatch preview, WCAG contrast ratio calculations, and palettes.',
    category: 'productivity',
    categoryName: 'Developer Productivity',
    iconName: 'Palette',
    tags: ['color', 'hex', 'rgb', 'hsl', 'contrast', 'picker', 'palette'],
    urlPath: '/app/tools?tool=color-converter'
  }
];

export const getToolById = (id: string): DeveloperToolMeta | undefined => {
  return DEVELOPER_TOOLS.find(t => t.id === id);
};

export const getRelatedTools = (currentId: string, limit: number = 3): DeveloperToolMeta[] => {
  const current = getToolById(currentId);
  if (!current) return DEVELOPER_TOOLS.slice(0, limit);
  
  const sameCategory = DEVELOPER_TOOLS.filter(t => t.id !== currentId && t.category === current.category);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  
  const others = DEVELOPER_TOOLS.filter(t => t.id !== currentId && t.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
};

