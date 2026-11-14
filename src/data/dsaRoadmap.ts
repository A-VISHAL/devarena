import { DSATopic } from '../types';

export const DSA_TOPICS: DSATopic[] = [
  {
    id: 'arrays',
    title: 'Arrays & Vectors',
    icon: 'Layers',
    description: 'Fundamental contiguous data structure. Master iteration, in-place manipulation, prefix sums, and frequency maps.',
    conceptNotes: [
      'Contiguous memory allocation with O(1) random access.',
      'Insertion and deletion take O(N) unless at the end.',
      'Prefix sums allow O(1) range sum queries.',
      'Kadane algorithm finds maximum subarray in O(N).'
    ],
    timeComplexity: 'Access: O(1), Search: O(N), Insert/Delete: O(N)',
    spaceComplexity: 'O(N)',
    commonPatterns: ['Prefix Sums', 'Kadane Algorithm', 'Two Pointers on Sorted Arrays'],
    problemIds: ['two-sum', 'maximum-subarray']
  },
  {
    id: 'strings',
    title: 'Strings & Parsing',
    icon: 'Type',
    description: 'String manipulation, palindromes, anagram detection, string matching, and sliding windows.',
    conceptNotes: [
      'Immutable in many languages (JS, Python, Java).',
      'Use character frequency arrays (size 26 or 128) for O(1) space tracking.',
      'Trie data structure enables fast prefix searches.',
      'KMP & Rabin-Karp algorithms for pattern matching.'
    ],
    timeComplexity: 'Access: O(1), Search: O(N*M), Compare: O(N)',
    spaceComplexity: 'O(N)',
    commonPatterns: ['Frequency Count', 'Window Expansion', 'Two Pointers Palindrome'],
    problemIds: ['longest-substring-without-repeating']
  },
  {
    id: 'hashing',
    title: 'Hashing & Hash Tables',
    icon: 'Hash',
    description: 'Fast O(1) lookup tables, collision resolution, hash maps, and hash sets.',
    conceptNotes: [
      'Average O(1) insert, delete, and lookup operations.',
      'Key for complement lookups (e.g. target - current).',
      'Rolling hashes allow fast substring fingerprinting.'
    ],
    timeComplexity: 'Insert/Lookup/Delete: O(1) average, O(N) worst case',
    spaceComplexity: 'O(N)',
    commonPatterns: ['Complement Tracking', 'Frequency Counting', 'Seen Set for Cycles'],
    problemIds: ['two-sum']
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    icon: 'GitCommit',
    description: 'Converging or directional pointers used to eliminate nested loops from O(N^2) to O(N).',
    conceptNotes: [
      'Opposite directional pointers on sorted arrays (e.g. left and right).',
      'Fast and slow pointers (Floyd cycle detection).',
      'Greedy shrinkage based on bounding criteria (e.g. Container with Most Water).'
    ],
    timeComplexity: 'Time: O(N), Space: O(1)',
    spaceComplexity: 'O(1)',
    commonPatterns: ['Opposite Ends Shrinkage', 'Fast & Slow Runner', 'Partitioning'],
    problemIds: ['container-with-most-water']
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    icon: 'Maximize2',
    description: 'Dynamic or fixed sub-array windows that expand and contract to optimize search.',
    conceptNotes: [
      'Fixed window: maintain sum/count of k elements by subtracting leaving element and adding entering element.',
      'Variable window: expand right to satisfy condition, contract left to minimize or maintain invariant.'
    ],
    timeComplexity: 'Time: O(N), Space: O(K)',
    spaceComplexity: 'O(K) where K is unique character count',
    commonPatterns: ['Variable Window with Set/Map', 'Fixed Window Accumulation'],
    problemIds: ['longest-substring-without-repeating']
  },
  {
    id: 'stacks-queues',
    title: 'Stacks & Queues',
    icon: 'Server',
    description: 'LIFO (Stack) and FIFO (Queue) architectures, monotonic stacks, and breadth searches.',
    conceptNotes: [
      'Monotonic stack finds next greater / smaller element in O(N).',
      'Parentheses matching and mathematical expression evaluation.',
      'Queue is the core engine of Breadth-First Search (BFS).'
    ],
    timeComplexity: 'Push/Pop: O(1), Peek: O(1)',
    spaceComplexity: 'O(N)',
    commonPatterns: ['Matching Parentheses', 'Monotonic Stack', 'BFS Queue'],
    problemIds: ['valid-parentheses']
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    icon: 'Search',
    description: 'Logarithmic search on monotonic spaces. Divide and conquer on value or predicate.',
    conceptNotes: [
      'Reduces O(N) search space to O(log N) by halving.',
      'Watch out for integer overflow: mid = low + ((high - low) >> 1).',
      'Binary search on answer: search predicate space for optimal threshold.'
    ],
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    commonPatterns: ['Exact Match', 'Lower/Upper Bound', 'Search on Answer Space'],
    problemIds: ['two-sum']
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    icon: 'Link',
    description: 'Non-contiguous node chains with pointers. Reversals, merges, and cycle detections.',
    conceptNotes: [
      'Dummy head node avoids boundary edge cases for head updates.',
      'In-place reversal with prev, curr, next pointers.',
      'Tortoise and Hare algorithm for middle element and cycle detection.'
    ],
    timeComplexity: 'Access: O(N), Insert/Delete: O(1) once node is located',
    spaceComplexity: 'O(1) auxiliary',
    commonPatterns: ['Dummy Head', 'Reversal with 3 Pointers', 'Slow & Fast Pointers'],
    problemIds: ['valid-parentheses']
  },
  {
    id: 'trees',
    title: 'Binary Trees',
    icon: 'GitBranch',
    description: 'Hierarchical node graphs with at most two children. Traversals, depths, and balances.',
    conceptNotes: [
      'DFS: Pre-order (NLR), In-order (LNR - sorted in BST), Post-order (LRN).',
      'BFS: Level-order traversal using a queue.',
      'Divide and conquer recursion on subtrees.'
    ],
    timeComplexity: 'Traversal: O(N), Search/Height: O(H) where H = log N to N',
    spaceComplexity: 'O(H) recursion stack',
    commonPatterns: ['Recursive Subtree', 'Level Order BFS', 'Path Sum Accumulator'],
    problemIds: ['maximum-subarray']
  },
  {
    id: 'bst',
    title: 'Binary Search Trees',
    icon: 'Binary',
    description: 'Ordered binary trees where left subtree is strictly less, and right is strictly greater.',
    conceptNotes: [
      'In-order traversal yields strictly ascending order.',
      'Balanced BST (AVL, Red-Black) guarantees O(log N) operations.',
      'Lowest Common Ancestor (LCA) solved by comparing values to root.'
    ],
    timeComplexity: 'Average: O(log N), Worst: O(N)',
    spaceComplexity: 'O(H)',
    commonPatterns: ['In-Order Validation', 'BST Traversal by Value Comparison'],
    problemIds: ['two-sum']
  },
  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    icon: 'Database',
    description: 'Complete binary tree maintaining min or max property. Essential for top-k elements.',
    conceptNotes: [
      'Min-Heap extracts minimum in O(log N).',
      'Top-K largest elements maintained using a min-heap of size K in O(N log K).',
      'Dijkstra algorithm uses min-heap priority queue.'
    ],
    timeComplexity: 'Peek: O(1), Push/Pop: O(log N), Heapify: O(N)',
    spaceComplexity: 'O(N)',
    commonPatterns: ['Top-K Elements', 'Merge K Sorted Lists', 'Running Median with 2 Heaps'],
    problemIds: ['maximum-subarray']
  },
  {
    id: 'graphs',
    title: 'Graphs & Networks',
    icon: 'Network',
    description: 'Vertices and edges. BFS, DFS, topological sorting, Dijkstra, and cycle detection.',
    conceptNotes: [
      'Representation: Adjacency List (preferred for sparse) vs Adjacency Matrix.',
      'BFS for shortest path in unweighted graph.',
      'DFS with visited states (0=unvisited, 1=visiting, 2=visited) for cycle detection.',
      'Kahn algorithm for topological sorting.'
    ],
    timeComplexity: 'BFS/DFS: O(V + E)',
    spaceComplexity: 'O(V + E)',
    commonPatterns: ['BFS Level Queue', 'DFS Connected Components', 'Topological Sort'],
    problemIds: ['longest-substring-without-repeating']
  },
  {
    id: 'recursion-backtracking',
    title: 'Recursion & Backtracking',
    icon: 'Repeat',
    description: 'Exhaustive state space tree exploration with prune and undo mechanics.',
    conceptNotes: [
      'Base cases prevent infinite recursion.',
      'Pattern: Choose -> Explore -> Unchoose (Backtrack).',
      'Used for combinations, permutations, subsets, and puzzle solving (N-Queens, Sudoku).'
    ],
    timeComplexity: 'Exponential: O(2^N) or O(N!)',
    spaceComplexity: 'O(N) recursion stack',
    commonPatterns: ['Backtracking Template', 'Pruning Infeasible Paths', 'Subset Generation'],
    problemIds: ['climbing-stairs']
  },
  {
    id: 'greedy',
    title: 'Greedy Algorithms',
    icon: 'TrendingUp',
    description: 'Making locally optimal choices at each stage with the hope of finding a global optimum.',
    conceptNotes: [
      'Requires greedy choice property and optimal substructure.',
      'Often involves sorting first by interval end time, cost, or ratio.',
      'Examples: Interval scheduling, Huffman coding, Kruskal MST.'
    ],
    timeComplexity: 'Usually O(N log N) dominated by sorting',
    spaceComplexity: 'O(1) to O(N)',
    commonPatterns: ['Sort and Scan', 'Interval Merging', 'Greedy Selection'],
    problemIds: ['container-with-most-water']
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    icon: 'Cpu',
    description: 'Breaking problems down into overlapping subproblems with memoization and tabulation.',
    conceptNotes: [
      'Identify optimal substructure and overlapping subproblems.',
      'Top-down (recursion + memoization) vs Bottom-up (iterative tabulation).',
      'State space reduction: rolling array technique to reduce space from O(N) to O(1).'
    ],
    timeComplexity: 'Number of States * Transitions per State',
    spaceComplexity: 'Table Size or O(1) optimized',
    commonPatterns: ['1D Array State (Fibonacci/Kadane)', '2D Grid Walk', 'Knapsack Pattern'],
    problemIds: ['maximum-subarray', 'climbing-stairs']
  }
];

