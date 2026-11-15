import { DSARoadmapTopic, StageMeta } from '../types/learn';

export const LEARNING_STAGES: StageMeta[] = [
  {
    id: 'foundation',
    title: '1. Foundation',
    tagline: 'Core Memory & Invariant Mastery',
    description: 'Master fundamental memory layouts, pointers, contiguous buffers, and linear invariants before advancing.',
    color: '#00E5FF',
    accentBg: 'rgba(0, 229, 255, 0.1)',
    borderAccent: 'rgba(0, 229, 255, 0.3)'
  },
  {
    id: 'data-structures',
    title: '2. Data Structures',
    tagline: 'Non-Linear & Hierarchical Architectures',
    description: 'Conquer node graphs, hierarchical tree structures, heaps, priority buffers, and prefix search tries.',
    color: '#FFAD42',
    accentBg: 'rgba(255, 173, 66, 0.1)',
    borderAccent: 'rgba(255, 173, 66, 0.3)'
  },
  {
    id: 'algorithms',
    title: '3. Algorithms',
    tagline: 'Optimization, Search & Divide-and-Conquer',
    description: 'Learn logarithmic pruning, exhaustive state exploration, greedy heuristics, and structural recursion.',
    color: '#B5FF4A',
    accentBg: 'rgba(181, 255, 74, 0.1)',
    borderAccent: 'rgba(181, 255, 74, 0.3)'
  },
  {
    id: 'advanced',
    title: '4. Advanced',
    tagline: 'Complex State Machines & Network Topologies',
    description: 'Deep dive into state transitions, memoization, shortest-path algorithms, bit magic, and complex DAGs.',
    color: '#E056FD',
    accentBg: 'rgba(224, 86, 253, 0.1)',
    borderAccent: 'rgba(224, 86, 253, 0.3)'
  }
];

export const COMPREHENSIVE_DSA_ROADMAP: DSARoadmapTopic[] = [
  // =========================================================================
  // STAGE 1: FOUNDATION
  // =========================================================================
  {
    id: 'arrays',
    title: 'Arrays & Vectors',
    stage: 'foundation',
    icon: 'Layers',
    description: 'Fundamental contiguous data structure. Master iteration, in-place manipulation, prefix sums, and Kadane algorithm.',
    prerequisites: ['Basic Programming Syntax'],
    timeComplexity: 'Access: O(1), Search: O(N), Insert/Delete: O(N)',
    spaceComplexity: 'O(N)',
    difficultyBreakdown: { easy: 5, medium: 4, hard: 1 },
    problemIds: ['two-sum', 'maximum-subarray', 'product-of-array-except-self'],
    conceptExplanation: 'Arrays store elements in contiguous memory locations, granting direct O(1) random access via index arithmetic. Key operations revolve around in-place modifications to save auxiliary memory and prefix accumulations for fast interval queries.',
    keyInvariants: [
      'Contiguous allocation guarantees cache locality and O(1) index access.',
      'Prefix sums: prefix[i] = prefix[i-1] + nums[i], allowing O(1) subarray sums.',
      'Kadane algorithm maintains current running sum and global max in single pass.'
    ],
    codeExamples: {
      python: `def max_sub_array(nums: list[int]) -> int:
    max_sum = current_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      cpp: `int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0], currentSum = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    return maxSum;
}`,
      java: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0], currentSum = nums[0];
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`
    },
    commonPatterns: ['Prefix Sum Accumulation', 'Kadane Maximum Subarray', 'In-Place Swap & Partition'],
    commonMistakes: [
      'Off-by-one errors on boundary conditions (0-indexed vs length).',
      'Creating redundant copies of slices instead of using pointer indices.',
      'Assuming array is sorted when applying two pointers.'
    ],
    interviewTips: [
      'Always clarify if the input can contain negative numbers before choosing Kadane.',
      'Mention cache locality and O(1) random indexing in your opening explanation.'
    ],
    lessons: [
      { id: 'arr-1', title: 'Memory Contiguity & Index Offsets', duration: '4 mins', summary: 'How hardware cache lines favor contiguous memory buffers.' },
      { id: 'arr-2', title: 'Prefix Sums for Range Queries', duration: '6 mins', summary: 'Precomputing prefix tables to answer range queries in O(1).' },
      { id: 'arr-3', title: 'Kadane Dynamic Subarray Invariant', duration: '7 mins', summary: 'Deciding whether to extend the previous subarray or start fresh.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Kadane Subarray Exploration',
      description: 'Observe running sum decision at each index',
      initialState: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      steps: [
        { description: 'Start at index 0. Current sum = -2, Max sum = -2', highlightIndices: [0], explanation: 'Initialize running sum with first element.' },
        { description: 'Index 1 (value 1): 1 > (-2 + 1), reset current sum to 1', highlightIndices: [1], explanation: 'Discard negative prefix because starting anew yields higher sum.' },
        { description: 'Index 3 (value 4): Current sum jumps to 4', highlightIndices: [3], explanation: 'Strong positive element establishes new peak window.' },
        { description: 'Indices 3 to 6: Window [4, -1, 2, 1] accumulates to peak 6', highlightIndices: [3, 4, 5, 6], explanation: 'Optimal subarray found with sum 6.' }
      ]
    }
  },
  {
    id: 'strings',
    title: 'Strings & Parsing',
    stage: 'foundation',
    icon: 'Type',
    description: 'String manipulation, palindromes, anagram detection, ASCII hashing, and rolling matching.',
    prerequisites: ['Arrays & Vectors'],
    timeComplexity: 'Access: O(1), Search: O(N*M), Compare: O(N)',
    spaceComplexity: 'O(N)',
    difficultyBreakdown: { easy: 4, medium: 5, hard: 1 },
    problemIds: ['valid-palindrome', 'valid-anagram', 'group-anagrams'],
    conceptExplanation: 'Strings are character sequences. In languages like Python and Java, strings are immutable, making in-place modifications impossible without converting to lists or character arrays.',
    keyInvariants: [
      'Character frequency tables of size 26 or 128 enable O(1) anagram verification.',
      'Symmetric two-pointer scan from opposite ends tests palindrome symmetry in O(N).',
      'StringBuilder/join avoid O(N^2) memory reallocation from repeated concatenation.'
    ],
    codeExamples: {
      python: `def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t): return False
    counts = [0] * 26
    for c1, c2 in zip(s, t):
        counts[ord(c1) - ord('a')] += 1
        counts[ord(c2) - ord('a')] -= 1
    return all(x == 0 for x in counts)`,
      cpp: `bool isAnagram(string s, string t) {
    if (s.size() != t.size()) return false;
    int counts[26] = {0};
    for (int i = 0; i < s.size(); ++i) {
        counts[s[i] - 'a']++;
        counts[t[i] - 'a']--;
    }
    for (int x : counts) if (x != 0) return false;
    return true;
}`,
      java: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] counts = new int[26];
    for (int i = 0; i < s.length(); i++) {
        counts[s.charAt(i) - 'a']++;
        counts[t.charAt(i) - 'a']--;
    }
    for (int x : counts) if (x != 0) return false;
    return true;
}`
    },
    commonPatterns: ['26-bucket Frequency Hashing', 'Bidirectional Palindrome Check', 'Rolling Hash'],
    commonMistakes: [
      'String concatenation in loops causing O(N^2) memory allocation.',
      'Failing to ignore non-alphanumeric characters in palindrome problems.',
      'Not validating string length early before frequency counting.'
    ],
    interviewTips: [
      'Confirm character set: ASCII (128), lower English (26), or full Unicode.',
      'Note immutability trade-offs explicitly when choosing between join and StringBuilder.'
    ],
    lessons: [
      { id: 'str-1', title: 'Immutability & Memory Footprint', duration: '4 mins', summary: 'Why repeated string concatenation degrades to O(N^2).' },
      { id: 'str-2', title: 'Fixed Array ASCII Hashing', duration: '5 mins', summary: 'Using int[26] instead of heavy HashMaps for lower constant factors.' },
      { id: 'str-3', title: 'Two-Pointer Palindrome Validation', duration: '5 mins', summary: 'Skipping punctuation and validating mirror symmetry.' }
    ],
    visualization: {
      type: 'two-pointers',
      title: 'Two-Pointer Palindrome Convergence',
      description: 'Left and right pointers compare characters inward',
      initialState: ['r', 'a', 'c', 'e', 'c', 'a', 'r'],
      steps: [
        { description: 'Pointers start at outer ends: r === r', highlightIndices: [0, 6], pointers: [{ label: 'L', index: 0 }, { label: 'R', index: 6 }], explanation: 'Both ends match, increment left and decrement right.' },
        { description: 'Pointers move inward: a === a', highlightIndices: [1, 5], pointers: [{ label: 'L', index: 1 }, { label: 'R', index: 5 }], explanation: 'Second layer matches.' },
        { description: 'Pointers meet at center: e', highlightIndices: [3], pointers: [{ label: 'L=R', index: 3 }], explanation: 'Single center element reached. String is verified palindrome!' }
      ]
    }
  },
  {
    id: 'hashing',
    title: 'Hashing & Hash Tables',
    stage: 'foundation',
    icon: 'Hash',
    description: 'Fast O(1) lookup tables, collision resolution, hash maps, frequency trackers, and hash sets.',
    prerequisites: ['Arrays & Vectors'],
    timeComplexity: 'Insert/Lookup/Delete: O(1) average, O(N) worst case',
    spaceComplexity: 'O(N)',
    difficultyBreakdown: { easy: 4, medium: 4, hard: 0 },
    problemIds: ['two-sum', 'valid-anagram'],
    conceptExplanation: 'Hash tables map keys to values via deterministic hash functions. By storing previously visited elements, problems with O(N^2) double loops can be reduced to single-pass O(N) algorithms.',
    keyInvariants: [
      'Complement lookup: store seen element index and query target - current in O(1).',
      'Hash collisions resolved via chaining or open addressing.',
      'Space-time trade-off: using O(N) memory to drop time complexity by a factor of N.'
    ],
    codeExamples: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) return {seen[complement], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
      java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[] {seen.get(complement), i};
        }
        seen.put(nums[i], i);
    }
    return new int[] {};
}`
    },
    commonPatterns: ['Complement Tracking', 'Frequency Counting Map', 'Seen Set for Cycles'],
    commonMistakes: [
      'Using the same element twice (e.g. nums[i] matching itself).',
      'Neglecting hash collision overhead in adversarial test cases.',
      'Modifying keys while stored in the hash table.'
    ],
    interviewTips: [
      'State the average case O(1) and worst case O(N) collision trade-off.',
      'Highlight how the hash map enables a single-pass solution.'
    ],
    lessons: [
      { id: 'hash-1', title: 'Hash Function & Collision Mechanics', duration: '5 mins', summary: 'Buckets, modulo hashing, and collision resolution techniques.' },
      { id: 'hash-2', title: 'The Complement Search Invariant', duration: '6 mins', summary: 'Transforming double loops into single pass lookup tables.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Two Sum Single-Pass Complement Search',
      description: 'Mapping value -> index in real time',
      initialState: [2, 7, 11, 15],
      steps: [
        { description: 'i=0, num=2: target 9 - 2 = 7 not in map. Store {2: 0}', highlightIndices: [0], explanation: 'Add first element to map and continue.' },
        { description: 'i=1, num=7: target 9 - 7 = 2 FOUND at index 0!', highlightIndices: [1], explanation: 'Pair found: [0, 1] sums to 9.' }
      ]
    }
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    stage: 'foundation',
    icon: 'GitCommit',
    description: 'Converging or directional pointers used to eliminate nested loops from O(N^2) to O(N).',
    prerequisites: ['Arrays & Vectors'],
    timeComplexity: 'Time: O(N), Space: O(1)',
    spaceComplexity: 'O(1)',
    difficultyBreakdown: { easy: 3, medium: 5, hard: 1 },
    problemIds: ['container-with-most-water', '3sum', 'trapping-rain-water'],
    conceptExplanation: 'Two pointers traverse a sequence from different positions or speeds. When applied to sorted arrays or bounded optimization problems (like container width), they guarantee that unpromising states are safely skipped without backtracking.',
    keyInvariants: [
      'Opposite ends convergence: shrink pointer at the smaller boundary to seek taller heights.',
      'Fast & slow runner (Floyd Tortoise and Hare) detects cycles and finds midpoints.',
      'Eliminates inner loop by taking advantage of monotonic ordering.'
    ],
    codeExamples: {
      python: `def max_area(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water`,
      cpp: `int maxArea(vector<int>& height) {
    int left = 0, right = height.size() - 1, maxWater = 0;
    while (left < right) {
        int width = right - left;
        int h = min(height[left], height[right]);
        maxWater = max(maxWater, width * h);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`,
      java: `public int maxArea(int[] height) {
    int left = 0, right = height.length - 1, maxWater = 0;
    while (left < right) {
        int width = right - left;
        int h = Math.min(height[left], height[right]);
        maxWater = Math.max(maxWater, width * h);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`
    },
    commonPatterns: ['Opposite Ends Shrinkage', 'Fast & Slow Runner', 'Sorted Partitioning'],
    commonMistakes: [
      'Moving both pointers simultaneously when only one boundary should move.',
      'Applying two-pointer sorted technique to unsorted inputs.',
      'Missing the while (left < right) loop termination condition.'
    ],
    interviewTips: [
      'Prove why moving the shorter line is safe: moving the taller line can never increase water area.',
      'Mention O(1) space efficiency compared to hash map methods.'
    ],
    lessons: [
      { id: 'tp-1', title: 'Opposite Direction Invariants', duration: '5 mins', summary: 'Why moving the limiting boundary is always mathematically sound.' },
      { id: 'tp-2', title: 'Container with Most Water Proof', duration: '6 mins', summary: 'Step-by-step invariant justification.' }
    ],
    visualization: {
      type: 'two-pointers',
      title: 'Container Boundary Shrinkage',
      description: 'Moving the smaller height pointer inward',
      initialState: [1, 8, 6, 2, 5, 4, 8, 3, 7],
      steps: [
        { description: 'Left=0 (1), Right=8 (7): Area = 8 * min(1, 7) = 8. Height 1 is limiting.', highlightIndices: [0, 8], pointers: [{ label: 'L', index: 0 }, { label: 'R', index: 8 }], explanation: 'Advance Left pointer because 1 cannot produce larger area.' },
        { description: 'Left=1 (8), Right=8 (7): Area = 7 * min(8, 7) = 49! New peak.', highlightIndices: [1, 8], pointers: [{ label: 'L', index: 1 }, { label: 'R', index: 8 }], explanation: 'Peak candidate found. Advance Right pointer.' },
        { description: 'Left=1 (8), Right=6 (8): Area = 5 * 8 = 40.', highlightIndices: [1, 6], pointers: [{ label: 'L', index: 1 }, { label: 'R', index: 6 }], explanation: 'Both walls tall, best overall container is 49.' }
      ]
    }
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    stage: 'foundation',
    icon: 'Maximize2',
    description: 'Dynamic or fixed sub-array windows that expand and contract to optimize search.',
    prerequisites: ['Two Pointers', 'Hashing & Hash Tables'],
    timeComplexity: 'Time: O(N), Space: O(K)',
    spaceComplexity: 'O(K) where K is unique character count',
    difficultyBreakdown: { easy: 2, medium: 6, hard: 2 },
    problemIds: ['longest-substring-without-repeating'],
    conceptExplanation: 'Sliding window maintains a continuous sub-range [left, right] that expands to satisfy an invariant and contracts from the left to restore validity or minimize window size.',
    keyInvariants: [
      'Expand right pointer to absorb new elements.',
      'Contract left pointer while window contains duplicates or violates bounds.',
      'Each element enters and leaves the window at most once, guaranteeing O(2N) = O(N) time.'
    ],
    codeExamples: {
      python: `def length_of_longest_substring(s: str) -> int:
    char_map = {}
    left = max_len = 0
    for right, c in enumerate(s):
        if c in char_map and char_map[c] >= left:
            left = char_map[c] + 1
        char_map[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      cpp: `int lengthOfLongestSubstring(string s) {
    vector<int> charMap(128, -1);
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.size(); ++right) {
        if (charMap[s[right]] >= left) {
            left = charMap[s[right]] + 1;
        }
        charMap[s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      java: `public int lengthOfLongestSubstring(String s) {
    int[] charMap = new int[128];
    Arrays.fill(charMap, -1);
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (charMap[c] >= left) {
            left = charMap[c] + 1;
        }
        charMap[c] = right;
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`
    },
    commonPatterns: ['Dynamic Window with Hash Map', 'Fixed Window Accumulator', 'At Most K Elements'],
    commonMistakes: [
      'Not updating left pointer far enough when duplicates occur.',
      'Assuming nested while loop makes it O(N^2) instead of amortized O(N).',
      'Forgetting to reset window state when clearing conditions.'
    ],
    interviewTips: [
      'Explain the amortized complexity: left and right pointers each move at most N times.',
      'Store character indices to jump the left pointer in a single step.'
    ],
    lessons: [
      { id: 'sw-1', title: 'Fixed vs Variable Windows', duration: '5 mins', summary: 'Understanding when window size is invariant vs dynamically bounded.' },
      { id: 'sw-2', title: 'Amortized O(N) Proof', duration: '5 mins', summary: 'Why nested loops remain linear overall.' }
    ],
    visualization: {
      type: 'sliding-window',
      title: 'Dynamic Non-Repeating Window',
      description: 'Expanding right and jumping left on collision',
      initialState: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'],
      steps: [
        { description: 'Right expands: [a, b, c]. Window size = 3', highlightIndices: [0, 1, 2], pointers: [{ label: 'L', index: 0 }, { label: 'R', index: 2 }], explanation: 'All characters unique.' },
        { description: 'Right hits second "a": jump Left to index 1. Window = [b, c, a]', highlightIndices: [1, 2, 3], pointers: [{ label: 'L', index: 1 }, { label: 'R', index: 3 }], explanation: 'Collision resolved by jumping past previous "a".' },
        { description: 'Max non-repeating substring length remains 3', highlightIndices: [1, 2, 3], pointers: [{ label: 'L', index: 1 }, { label: 'R', index: 3 }], explanation: 'Window slides to completion.' }
      ]
    }
  },

  // =========================================================================
  // STAGE 2: DATA STRUCTURES
  // =========================================================================
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    stage: 'data-structures',
    icon: 'Link',
    description: 'Non-contiguous node chains with pointers. Master reversals, cycle detection, and merges.',
    prerequisites: ['Arrays & Vectors'],
    timeComplexity: 'Access: O(N), Insert/Delete: O(1) once node is located',
    spaceComplexity: 'O(1) auxiliary',
    difficultyBreakdown: { easy: 3, medium: 4, hard: 1 },
    problemIds: ['valid-parentheses'],
    conceptExplanation: 'Linked lists chain nodes containing values and next pointer references. Because memory is dynamically allocated, insertions and deletions do not require moving adjacent elements.',
    keyInvariants: [
      'Dummy head node eliminates edge cases when modifying the list head.',
      'Three-pointer reversal: prev, curr, next to reverse in a single pass without extra memory.',
      'Floyd cycle finding: if slow moves 1 step and fast moves 2 steps, they must meet in a cycle.'
    ],
    codeExamples: {
      python: `def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      cpp: `ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *curr = head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
      java: `public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`
    },
    commonPatterns: ['Dummy Head Sentinel', 'Prev-Curr-Next In-Place Reversal', 'Slow & Fast Pointers'],
    commonMistakes: [
      'Losing reference to next node before redirecting current next pointer.',
      'Failing to handle null head or single-node edge cases.',
      'Creating memory leaks in C++ by not releasing unlinked nodes.'
    ],
    interviewTips: [
      'Always draw out pointer arrows on scratch paper before coding.',
      'Mention that dummy heads make code cleaner and eliminate special casing for head deletions.'
    ],
    lessons: [
      { id: 'll-1', title: 'The Dummy Node Pattern', duration: '4 mins', summary: 'Preventing null reference errors when mutating head pointers.' },
      { id: 'll-2', title: 'Iterative vs Recursive Reversal', duration: '6 mins', summary: 'Trade-offs between O(1) iterative space and recursive call stack.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Three-Pointer Reversal',
      description: 'Redirecting pointer arrows in-place',
      initialState: [1, 2, 3, 4, 5],
      steps: [
        { description: 'Prev = null, Curr = 1, Next = 2', highlightIndices: [0], explanation: 'Save next node before redirecting 1 -> null.' },
        { description: '1 -> null. Move Prev = 1, Curr = 2', highlightIndices: [1], explanation: 'First link inverted.' },
        { description: '2 -> 1 -> null. Move Prev = 2, Curr = 3', highlightIndices: [2], explanation: 'Second link inverted.' },
        { description: 'Reversal complete: 5 -> 4 -> 3 -> 2 -> 1 -> null', highlightIndices: [4], explanation: 'Prev now points to new head of reversed list.' }
      ]
    }
  },
  {
    id: 'stacks-queues',
    title: 'Stacks and Queues',
    stage: 'data-structures',
    icon: 'Server',
    description: 'LIFO (Stack) and FIFO (Queue) architectures, monotonic stacks, and breadth-first search queues.',
    prerequisites: ['Arrays & Vectors', 'Linked Lists'],
    timeComplexity: 'Push/Pop: O(1), Peek: O(1)',
    spaceComplexity: 'O(N)',
    difficultyBreakdown: { easy: 3, medium: 5, hard: 1 },
    problemIds: ['valid-parentheses'],
    conceptExplanation: 'Stacks enforce Last-In-First-Out ordering, ideal for matching nested parenthesis, backtracking history, and monotonic range queries. Queues enforce First-In-First-Out ordering, forming the backbone of graph level-order search.',
    keyInvariants: [
      'Parenthesis balance: matching opening and closing tokens in LIFO sequence.',
      'Monotonic stack: elements maintain monotonic increasing or decreasing order to find next greater elements in O(N).',
      'Queue FIFO ensures nodes are explored level-by-level in breadth-first search.'
    ],
    codeExamples: {
      python: `def is_valid_parentheses(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`,
      cpp: `bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (mapping.count(c)) {
            if (st.empty() || st.top() != mapping[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}`,
      java: `public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}`
    },
    commonPatterns: ['Bracket Matching', 'Monotonic Increasing Stack', 'BFS Queue Engine'],
    commonMistakes: [
      'Popping from an empty stack leading to underflow errors.',
      'Forgetting to check if stack is completely empty at the end.',
      'Using slow array unshift/shift instead of deque for queue operations.'
    ],
    interviewTips: [
      'In Java, prefer Deque/ArrayDeque over legacy Stack class for better performance.',
      'Mention how monotonic stacks achieve O(N) total runtime by popping each element once.'
    ],
    lessons: [
      { id: 'stk-1', title: 'LIFO Mechanics & Parsing', duration: '5 mins', summary: 'Validating nested syntactic structures with stacks.' },
      { id: 'stk-2', title: 'The Monotonic Stack Invariant', duration: '7 mins', summary: 'Finding next greater/smaller elements in single pass.' }
    ],
    visualization: {
      type: 'stack',
      title: 'Parentheses Stack Evaluation',
      description: 'Matching brackets via push and pop',
      initialState: ['(', '{', '}', ')'],
      steps: [
        { description: 'Token "(": Push onto stack', highlightIndices: [0], explanation: 'Stack = ["("]' },
        { description: 'Token "{": Push onto stack', highlightIndices: [1], explanation: 'Stack = ["(", "{"]' },
        { description: 'Token "}": Matches top "{"! Pop stack', highlightIndices: [2], explanation: 'Stack = ["("]' },
        { description: 'Token ")": Matches top "("! Pop stack. Stack is empty.', highlightIndices: [3], explanation: 'All brackets closed validly!' }
      ]
    }
  },
  {
    id: 'trees',
    title: 'Binary Trees',
    stage: 'data-structures',
    icon: 'GitBranch',
    description: 'Hierarchical node graphs with at most two children. Traversals, depths, ancestors, and balances.',
    prerequisites: ['Recursion & Backtracking'],
    timeComplexity: 'Traversal: O(N), Search/Height: O(H) where H = log N to N',
    spaceComplexity: 'O(H) recursion stack',
    difficultyBreakdown: { easy: 4, medium: 6, hard: 2 },
    problemIds: ['maximum-subarray'],
    conceptExplanation: 'Binary trees represent hierarchical structures. Algorithms heavily rely on structural recursion: the solution to the tree is a function of the solution to its left and right subtrees.',
    keyInvariants: [
      'DFS traversals: Pre-order (Root-L-R), In-order (L-Root-R), Post-order (L-R-Root).',
      'BFS level order traversal uses a queue to inspect one depth layer at a time.',
      'Tree height determines recursion stack depth: O(log N) balanced, O(N) skewed.'
    ],
    codeExamples: {
      python: `def max_depth(root) -> int:
    if not root: return 0
    left_depth = max_depth(root.left)
    right_depth = max_depth(root.right)
    return 1 + max(left_depth, right_depth)`,
      cpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`,
      java: `public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`
    },
    commonPatterns: ['Subtree Divide & Conquer', 'Level-by-Level BFS', 'Lowest Common Ancestor'],
    commonMistakes: [
      'Missing base case (null root) causing stack overflow.',
      'Confusing tree height (edges) with node depth (nodes).',
      'Not considering skewed binary trees degrading to linked lists.'
    ],
    interviewTips: [
      'Always identify which traversal order matches the problem: bottom-up results require post-order.',
      'Check if problem can be solved with pure recursion before introducing helper global states.'
    ],
    lessons: [
      { id: 'tree-1', title: 'Tree DFS Traversal Orders', duration: '6 mins', summary: 'When to choose pre-order, in-order, or post-order recursion.' },
      { id: 'tree-2', title: 'Level-Order Traversal with Queues', duration: '6 mins', summary: 'Iterating tree breadth with queue snapshot sizes.' }
    ],
    visualization: {
      type: 'tree-traversal',
      title: 'Divide & Conquer Depth Computation',
      description: 'Recursively finding max subtree height',
      initialState: { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } },
      steps: [
        { description: 'Root node 3: query left subtree (9) and right subtree (20)', treeActiveNode: '3', explanation: 'Start divide and conquer.' },
        { description: 'Left child 9: leaf node, returns depth 1', treeActiveNode: '9', explanation: 'Base case returns 1.' },
        { description: 'Right child 20: has children 15 and 7, max child depth 1, returns 2', treeActiveNode: '20', explanation: 'Right subtree depth is 2.' },
        { description: 'Root computes: 1 + max(1, 2) = 3 total depth', treeActiveNode: '3', explanation: 'Max depth of binary tree is 3.' }
      ]
    }
  },
  {
    id: 'bst',
    title: 'Binary Search Trees',
    stage: 'data-structures',
    icon: 'Binary',
    description: 'Ordered binary trees where left subtree is strictly less, and right is strictly greater.',
    prerequisites: ['Binary Trees'],
    timeComplexity: 'Search/Insert/Delete: Average O(log N), Worst O(N)',
    spaceComplexity: 'O(H)',
    difficultyBreakdown: { easy: 3, medium: 4, hard: 1 },
    problemIds: ['two-sum'],
    conceptExplanation: 'Binary Search Trees enforce the binary search property at every node: left.val < root.val < right.val. An in-order traversal of a valid BST always yields elements in strictly ascending sorted order.',
    keyInvariants: [
      'In-order traversal of BST yields sorted values.',
      'Range boundary validation: pass minVal and maxVal down recursive tree calls.',
      'Search operation eliminates one entire half of the tree at each decision point.'
    ],
    codeExamples: {
      python: `def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')) -> bool:
    if not root: return True
    if not (min_val < root.val < max_val): return False
    return (is_valid_bst(root.left, min_val, root.val) and 
            is_valid_bst(root.right, root.val, max_val))`,
      cpp: `bool isValidBST(TreeNode* root, long minVal = LONG_MIN, long maxVal = LONG_MAX) {
    if (!root) return true;
    if (root->val <= minVal || root->val >= maxVal) return false;
    return isValidBST(root->left, minVal, root->val) && 
           isValidBST(root->right, root->val, maxVal);
}`,
      java: `public boolean isValidBST(TreeNode root) {
    return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
}
private boolean validate(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
}`
    },
    commonPatterns: ['In-Order Traversal Validation', 'BST Bound Checking', 'Lowest Common Ancestor by Value'],
    commonMistakes: [
      'Only checking that root.left.val < root.val, neglecting descendants violating ancestors.',
      'Using integer bounds causing overflow on extreme values (-2^31 or 2^31 - 1).',
      'Forgetting that BST values must be strictly distinct (no duplicates unless defined).'
    ],
    interviewTips: [
      'Always pass (min, max) range bounds down recursion rather than only checking immediate children.',
      'Remember that in-order traversal visits nodes in sorted order.'
    ],
    lessons: [
      { id: 'bst-1', title: 'The BST Ordering Invariant', duration: '5 mins', summary: 'Why checking local parent-child pairs is insufficient.' },
      { id: 'bst-2', title: 'In-Order Traversal Magic', duration: '6 mins', summary: 'Flattening trees to sorted streams without extra sorting.' }
    ],
    visualization: {
      type: 'tree-traversal',
      title: 'BST Range Propagation',
      description: 'Bounding valid subtrees with min and max constraints',
      initialState: { val: 5, left: { val: 3 }, right: { val: 7 } },
      steps: [
        { description: 'Root 5: valid range (-inf, +inf)', treeActiveNode: '5', explanation: 'Root is valid.' },
        { description: 'Left child 3: inherits range (-inf, 5)', treeActiveNode: '3', explanation: '3 < 5, valid.' },
        { description: 'Right child 7: inherits range (5, +inf)', treeActiveNode: '7', explanation: '7 > 5, valid. Entire tree is valid BST.' }
      ]
    }
  },
  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    stage: 'data-structures',
    icon: 'Database',
    description: 'Complete binary tree maintaining min or max property. Essential for top-k elements.',
    prerequisites: ['Binary Trees'],
    timeComplexity: 'Peek: O(1), Push/Pop: O(log N), Heapify: O(N)',
    spaceComplexity: 'O(N)',
    difficultyBreakdown: { easy: 2, medium: 5, hard: 2 },
    problemIds: ['maximum-subarray'],
    conceptExplanation: 'Heaps are complete binary trees implemented over contiguous arrays where every parent is smaller (min-heap) or larger (max-heap) than its children. They allow constant-time access to extremums and logarithmic insertions.',
    keyInvariants: [
      'Top-K largest elements: maintain a min-heap of size K. Smaller elements get evicted in O(N log K).',
      'Median of stream: partition numbers into max-heap (lower half) and min-heap (upper half).',
      'Parent at index (i-1)//2, left child at 2i + 1, right child at 2i + 2.'
    ],
    codeExamples: {
      python: `import heapq
def find_kth_largest(nums: list[int], k: int) -> int:
    min_heap = []
    for num in nums:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    return min_heap[0]`,
      cpp: `int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) minHeap.pop();
    }
    return minHeap.top();
}`,
      java: `public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}`
    },
    commonPatterns: ['Top-K Elements Window', 'Dual Heap Running Median', 'Merge K Sorted Streams'],
    commonMistakes: [
      'Using a max-heap for top-k largest elements instead of a min-heap (wasting O(N log N)).',
      'Remembering that Python heapq is min-heap by default (negate for max-heap).',
      'Assuming heap elements are fully sorted instead of partially ordered.'
    ],
    interviewTips: [
      'Compare Top-K Min-Heap O(N log K) to Quickselect O(N) average.',
      'Explicitly state the array mapping formulas for binary heaps.'
    ],
    lessons: [
      { id: 'hp-1', title: 'Array Representation of Complete Trees', duration: '5 mins', summary: 'Formulaic parent-child relationships in flat arrays.' },
      { id: 'hp-2', title: 'Top-K Min-Heap Filter Pattern', duration: '6 mins', summary: 'Limiting heap size to K to drop time complexity.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Top-K Min-Heap Eviction',
      description: 'Preserving only K largest elements in size-K heap',
      initialState: [3, 2, 1, 5, 6, 4],
      steps: [
        { description: 'Insert 3, 2: heap = [2, 3]', highlightIndices: [0, 1], explanation: 'Min-heap maintains smallest at root.' },
        { description: 'Insert 1: heap = [1, 3, 2]. Size exceeds K=2, evict 1.', highlightIndices: [2], explanation: 'Smallest element 1 popped out.' },
        { description: 'Insert 5, 6, 4: final heap contains [5, 6]. 2nd largest is 5!', highlightIndices: [3, 4], explanation: 'Top-2 largest preserved in O(N log K).' }
      ]
    }
  },
  {
    id: 'tries',
    title: 'Tries (Prefix Trees)',
    stage: 'data-structures',
    icon: 'Network',
    description: 'Tree structures for rapid prefix lookups, autocomplete engines, and word validation.',
    prerequisites: ['Binary Trees', 'Strings & Parsing'],
    timeComplexity: 'Insert/Search: O(L) where L is key length',
    spaceComplexity: 'O(N * L * Alphabet)',
    difficultyBreakdown: { easy: 1, medium: 4, hard: 2 },
    problemIds: ['longest-substring-without-repeating'],
    conceptExplanation: 'A Trie (Prefix Tree) is an m-ary tree where each node represents a character. Shared prefixes overlap along paths, enabling prefix queries in O(L) time regardless of dictionary size.',
    keyInvariants: [
      'Prefix sharing: words starting with the same letters share the same ancestor path.',
      'isEndOfWord boolean marks complete dictionary words.',
      'Search time depends strictly on word length L, completely independent of total words N.'
    ],
    codeExamples: {
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_end = True`,
      cpp: `struct TrieNode {
    TrieNode* children[26] = {nullptr};
    bool isEnd = false;
};
class Trie {
    TrieNode* root = new TrieNode();
public:
    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx]) node->children[idx] = new TrieNode();
            node = node->children[idx];
        }
        node->isEnd = true;
    }
};`,
      java: `class Trie {
    private class Node {
        Node[] children = new Node[26];
        boolean isEnd = false;
    }
    private Node root = new Node();
    public void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) node.children[idx] = new Node();
            node = node.children[idx];
        }
        node.isEnd = true;
    }
}`
    },
    commonPatterns: ['Prefix Matching', 'Wildcard Search with DFS', 'Bitwise Trie for Max XOR'],
    commonMistakes: [
      'Forgetting to set isEnd = true upon finishing word insertion.',
      'High memory consumption with sparse 26-pointer arrays (use HashMaps if sparse).',
      'Confusing startsWith (prefix match) with search (exact word match).'
    ],
    interviewTips: [
      'Highlight how Tries outperform HashMaps when querying common prefixes or autocomplete.',
      'Mention memory optimizations like Ternary Search Trees or radix trees.'
    ],
    lessons: [
      { id: 'tri-1', title: 'Prefix Node Linkage', duration: '5 mins', summary: 'Sharing common ancestor paths between vocabulary words.' },
      { id: 'tri-2', title: 'Autocomplete Traversal', duration: '6 mins', summary: 'Navigating to prefix node and running DFS for completions.' }
    ],
    visualization: {
      type: 'tree-traversal',
      title: 'Trie Word Path Insertion',
      description: 'Inserting "app" and "apple"',
      initialState: { val: 'root', left: { val: 'a', left: { val: 'p', left: { val: 'p (end)' } } } },
      steps: [
        { description: 'Insert "app": root -> a -> p -> p (isEnd=true)', treeActiveNode: 'p (end)', explanation: 'Chain created and marked as valid word.' },
        { description: 'Insert "apple": reuse shared prefix "app", add l -> e (isEnd=true)', treeActiveNode: 'apple', explanation: 'Shared prefix saves redundant storage.' }
      ]
    }
  },

  // =========================================================================
  // STAGE 3: ALGORITHMS
  // =========================================================================
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    stage: 'algorithms',
    icon: 'ArrowUpDown',
    description: 'Merge Sort, Quick Sort, Counting Sort, and custom comparator predicates.',
    prerequisites: ['Arrays & Vectors', 'Recursion & Backtracking'],
    timeComplexity: 'Comparison Sort: O(N log N), Non-Comparison: O(N)',
    spaceComplexity: 'O(1) to O(N)',
    difficultyBreakdown: { easy: 3, medium: 4, hard: 1 },
    problemIds: ['two-sum', '3sum'],
    conceptExplanation: 'Sorting establishes monotonic ordering across items. Most advanced problems (Greedy, Two Pointers, Binary Search) require sorting as a preprocessing step.',
    keyInvariants: [
      'Divide and conquer: Merge Sort splits into halves and merges in O(N).',
      'Partitioning: Quick Sort places pivot in final position and recursively partitions.',
      'Stability: stable sorts preserve the relative order of equal keys.'
    ],
    codeExamples: {
      python: `def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i]); i += 1
        else:
            res.append(right[j]); j += 1
    res.extend(left[i:]); res.extend(right[j:])
    return res`,
      cpp: `void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    // merge step
}`,
      java: `public void mergeSort(int[] arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    // merge step
}`
    },
    commonPatterns: ['Interval End-Time Sorting', 'Custom Lambda Comparator', 'Two-Way Partition'],
    commonMistakes: [
      'Quick Sort worst-case O(N^2) on sorted inputs without randomized pivot.',
      'Incurring O(N) auxiliary space in Merge Sort without reusing buffers.',
      'Violating strict weak ordering in custom comparator functions.'
    ],
    interviewTips: [
      'Know why comparison sorts cannot exceed the Omega(N log N) theoretical lower bound.',
      'Explain when Counting Sort or Radix Sort can achieve O(N) runtime.'
    ],
    lessons: [
      { id: 'srt-1', title: 'Divide and Conquer Sorting', duration: '6 mins', summary: 'Logarithmic tree splits and linear merge phases.' },
      { id: 'srt-2', title: 'Custom Comparators in Practice', duration: '5 mins', summary: 'Sorting objects by multiple fields.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Merge Sort Two-Finger Merge',
      description: 'Zipping two sorted halves together',
      initialState: [2, 5, 8, 1, 3, 7],
      steps: [
        { description: 'Left=[2, 5, 8], Right=[1, 3, 7]: compare 2 vs 1 -> pick 1', highlightIndices: [0, 3], explanation: '1 is smaller, append to result.' },
        { description: 'Compare 2 vs 3 -> pick 2', highlightIndices: [0, 4], explanation: '2 is smaller, append to result.' },
        { description: 'Complete merge: [1, 2, 3, 5, 7, 8]', highlightIndices: [0, 1, 2, 3, 4, 5], explanation: 'Sorted in linear time.' }
      ]
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    stage: 'algorithms',
    icon: 'Search',
    description: 'Logarithmic search on monotonic spaces. Divide and conquer on value or predicate space.',
    prerequisites: ['Arrays & Vectors', 'Sorting Algorithms'],
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    difficultyBreakdown: { easy: 4, medium: 5, hard: 1 },
    problemIds: ['binary-search', 'two-sum'],
    conceptExplanation: 'Binary Search repeatedly halves the candidate search space by inspecting the midpoint. It applies not just to sorted arrays, but to any monotonic boolean predicate function f(x).',
    keyInvariants: [
      'Midpoint overflow protection: mid = low + ((high - low) // 2).',
      'Search space invariant: the target is guaranteed to lie within [low, high].',
      'Binary search on answer: when verifying an answer takes O(N), finding the optimal answer takes O(N log(Range)).'
    ],
    codeExamples: {
      python: `def binary_search(nums: list[int], target: int) -> int:
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = low + ((high - low) >> 1)
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      cpp: `int search(vector<int>& nums, int target) {
    int low = 0, high = nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      java: `public int search(int[] nums, int target) {
    int low = 0, high = nums.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
    commonPatterns: ['Exact Target Lookup', 'Lower Bound & Upper Bound (Bisect)', 'Search on Answer Predicate'],
    commonMistakes: [
      'Integer overflow with (low + high) / 2 in C++ and Java.',
      'Infinite loop caused by improper low = mid vs low = mid + 1.',
      'Off-by-one errors with while (low < high) vs while (low <= high).'
    ],
    interviewTips: [
      'Always use low + (high - low) / 2 and mention why (prevents integer 32-bit overflow).',
      'Look for keywords: "minimum maximum", "maximum minimum", or "allocation" — they hint at Binary Search on Answer.'
    ],
    lessons: [
      { id: 'bs-1', title: 'The Midpoint Invariant', duration: '5 mins', summary: 'Protecting against overflow and ensuring halving progress.' },
      { id: 'bs-2', title: 'Binary Search on Answer Space', duration: '7 mins', summary: 'Testing boolean predicates across continuous or discrete bounds.' }
    ],
    visualization: {
      type: 'binary-search',
      title: 'Halving Search Space',
      description: 'Locating target 7 in sorted array',
      initialState: [1, 3, 5, 7, 9, 11, 13],
      steps: [
        { description: 'Low=0 (1), High=6 (13): Mid=3 (7). Target 7 equals Mid!', highlightIndices: [3], pointers: [{ label: 'MID', index: 3 }], explanation: 'Target found in first probe.' }
      ]
    }
  },
  {
    id: 'recursion',
    title: 'Recursion',
    stage: 'algorithms',
    icon: 'Repeat',
    description: 'Structural self-invocation, call stack mechanics, base cases, and divide-and-conquer.',
    prerequisites: ['Foundation'],
    timeComplexity: 'Branching Factor ^ Depth',
    spaceComplexity: 'O(Depth) call stack',
    difficultyBreakdown: { easy: 3, medium: 4, hard: 1 },
    problemIds: ['climbing-stairs'],
    conceptExplanation: 'Recursion solves problems by breaking them into smaller instances of the same problem. Every recursive function must define clear termination base cases to prevent stack overflow.',
    keyInvariants: [
      'Base cases return immediately without making further calls.',
      'Each recursive call must strictly move state closer to the base case.',
      'The operating system call stack holds local variables and return addresses.'
    ],
    codeExamples: {
      python: `def climb_stairs_rec(n: int) -> int:
    if n <= 2: return n
    return climb_stairs_rec(n - 1) + climb_stairs_rec(n - 2)`,
      cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    return climbStairs(n - 1) + climbStairs(n - 2);
}`,
      java: `public int climbStairs(int n) {
    if (n <= 2) return n;
    return climbStairs(n - 1) + climbStairs(n - 2);
}`
    },
    commonPatterns: ['Divide & Conquer', 'Subproblem Recurrence', 'Tree Branching'],
    commonMistakes: [
      'Missing base case causing Maximum Call Stack Exceeded.',
      'Redundant overlapping subproblems (exponential tree explosion).',
      'Passing large structures by value in languages like C++.'
    ],
    interviewTips: [
      'Draw the recursion tree on a whiteboard to visualize branching factor and overlapping calls.',
      'State stack space complexity: recursion is never O(1) space due to OS call frames.'
    ],
    lessons: [
      { id: 'rec-1', title: 'The Anatomy of a Recursive Frame', duration: '5 mins', summary: 'Understanding how return pointers and local variables stack up.' },
      { id: 'rec-2', title: 'Recursion Trees & Branching Factors', duration: '6 mins', summary: 'Calculating Big-O from tree width and depth.' }
    ],
    visualization: {
      type: 'tree-traversal',
      title: 'Fibonacci Recursion Tree',
      description: 'Visualizing exponential duplicate branches',
      initialState: { val: 'f(4)', left: { val: 'f(3)', left: { val: 'f(2)' }, right: { val: 'f(1)' } }, right: { val: 'f(2)' } },
      steps: [
        { description: 'f(4) branches into f(3) and f(2)', treeActiveNode: 'f(4)', explanation: 'Notice f(2) is evaluated twice.' },
        { description: 'Exponential branching: 2^N tree calls occur without caching.', treeActiveNode: 'f(2)', explanation: 'Highlights the immediate need for Dynamic Programming memoization.' }
      ]
    }
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    stage: 'algorithms',
    icon: 'CornerUpLeft',
    description: 'Exhaustive state space tree exploration with choose, explore, and unchoose mechanics.',
    prerequisites: ['Recursion'],
    timeComplexity: 'O(2^N) or O(N!)',
    spaceComplexity: 'O(N) recursion depth',
    difficultyBreakdown: { easy: 1, medium: 6, hard: 3 },
    problemIds: ['climbing-stairs'],
    conceptExplanation: 'Backtracking systematically builds candidates to a solution and abandons a candidate ("backtracks") as soon as it determines that the candidate cannot possibly lead to a valid solution.',
    keyInvariants: [
      'Template: Choose element -> Recurse/Explore -> Unchoose (Undo state mutation).',
      'Pruning: check bounding conditions early to prune dead subtrees before diving deeper.',
      'State restoration ensures subsequent branches start with a pristine environment.'
    ],
    codeExamples: {
      python: `def subsets(nums: list[int]) -> list[list[int]]:
    result = []
    def backtrack(start: int, current: list[int]):
        result.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])      # Choose
            backtrack(i + 1, current)    # Explore
            current.pop()                # Unchoose
    backtrack(0, [])
    return result`,
      cpp: `vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    auto backtrack = [&](auto& self, int start) -> void {
        result.push_back(current);
        for (int i = start; i < nums.size(); ++i) {
            current.push_back(nums[i]);
            self(self, i + 1);
            current.pop_back();
        }
    };
    backtrack(backtrack, 0);
    return result;
}`,
      java: `public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(0, nums, new ArrayList<>(), result);
    return result;
}
private void backtrack(int start, int[] nums, List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));
    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        backtrack(i + 1, nums, current, result);
        current.remove(current.size() - 1);
    }
}`
    },
    commonPatterns: ['Subsets & Power Set', 'Permutations with Visited Set', 'Combinations & Target Sum'],
    commonMistakes: [
      'Forgetting to create a copy of the candidate list when appending to final result.',
      'Failing to undo the state mutation (omitting pop/unmark).',
      'Missing base case checks causing infinite recursion.'
    ],
    interviewTips: [
      'Emphasize the choose-explore-unchoose lifecycle clearly in your communication.',
      'Point out pruning optimizations: explain how early validation cuts thousands of useless calls.'
    ],
    lessons: [
      { id: 'bt-1', title: 'The Choose-Explore-Unchoose Blueprint', duration: '6 mins', summary: 'Building the universal backtracking skeleton.' },
      { id: 'bt-2', title: 'State Pruning & Branch Cutting', duration: '6 mins', summary: 'Avoiding infeasible subtrees early.' }
    ],
    visualization: {
      type: 'tree-traversal',
      title: 'Subset State Space Exploration',
      description: 'Building all subsets of [1, 2]',
      initialState: { val: '[]', left: { val: '[1]', left: { val: '[1, 2]' } }, right: { val: '[2]' } },
      steps: [
        { description: 'Start with empty subset []', treeActiveNode: '[]', explanation: 'Root state recorded.' },
        { description: 'Choose 1: candidate is [1]', treeActiveNode: '[1]', explanation: 'Recurse deeper.' },
        { description: 'Choose 2: candidate is [1, 2]', treeActiveNode: '[1, 2]', explanation: 'Leaf reached, pop 2 and backtrack.' },
        { description: 'Pop 1. Choose 2: candidate is [2]', treeActiveNode: '[2]', explanation: 'Alternative branch explored cleanly.' }
      ]
    }
  },
  {
    id: 'greedy',
    title: 'Greedy Algorithms',
    stage: 'algorithms',
    icon: 'TrendingUp',
    description: 'Making locally optimal choices at each stage to discover a guaranteed global optimum.',
    prerequisites: ['Sorting Algorithms', 'Arrays & Vectors'],
    timeComplexity: 'Usually O(N log N) dominated by sorting',
    spaceComplexity: 'O(1) to O(N)',
    difficultyBreakdown: { easy: 3, medium: 5, hard: 1 },
    problemIds: ['best-time-to-buy-and-sell-stock', 'container-with-most-water'],
    conceptExplanation: 'Greedy algorithms build up a solution piece by piece, always choosing the next piece that offers the most immediate benefit. Unlike DP, greedy never reconsiders choices once made.',
    keyInvariants: [
      'Greedy choice property: a globally optimal solution can be arrived at by making locally optimal choices.',
      'Optimal substructure: an optimal solution to the problem contains optimal solutions to subproblems.',
      'Usually preceded by sorting elements by end-time, profit ratio, or coordinate.'
    ],
    codeExamples: {
      python: `def max_profit(prices: list[int]) -> int:
    min_price = float('inf')
    max_p = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_p:
            max_p = p - min_price
    return max_p`,
      cpp: `int maxProfit(vector<int>& prices) {
    int minPrice = INT_MAX, maxP = 0;
    for (int p : prices) {
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > maxP) maxP = p - minPrice;
    }
    return maxP;
}`,
      java: `public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, maxP = 0;
    for (int p : prices) {
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > maxP) maxP = p - minPrice;
    }
    return maxP;
}`
    },
    commonPatterns: ['Interval Scheduling by End Time', 'Running Minimum / Maximum', 'Gas Station Circular Greedy'],
    commonMistakes: [
      'Applying greedy to problems where local decisions trap the algorithm into a suboptimal local maximum.',
      'Failing to formally prove or justify why greedy choice works.',
      'Sorting by start time instead of end time in interval scheduling.'
    ],
    interviewTips: [
      'Always justify the greedy choice property: explain why taking the best local step does not compromise the future.',
      'Mention that greedy algorithms typically run in O(N log N) or O(N), saving memory compared to DP.'
    ],
    lessons: [
      { id: 'grd-1', title: 'When Does Greedy Work?', duration: '5 mins', summary: 'Understanding the exchange argument and matroid properties.' },
      { id: 'grd-2', title: 'Interval Scheduling & Sorting', duration: '6 mins', summary: 'Selecting max non-overlapping intervals.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Greedy Minimum Valley Tracking',
      description: 'Tracking lowest buy price to maximize sell profit',
      initialState: [7, 1, 5, 3, 6, 4],
      steps: [
        { description: 'Day 0 (7): minPrice = 7, profit = 0', highlightIndices: [0], explanation: 'Initial observation.' },
        { description: 'Day 1 (1): 1 < 7 -> update lowest buy price to 1!', highlightIndices: [1], explanation: 'New optimal buy day locked in.' },
        { description: 'Day 4 (6): sell at 6 - 1 = profit 5 (Global Peak!)', highlightIndices: [4], explanation: 'Max profit 5 achieved in single pass.' }
      ]
    }
  },

  // =========================================================================
  // STAGE 4: ADVANCED
  // =========================================================================
  {
    id: 'graphs',
    title: 'Graphs & Networks',
    stage: 'advanced',
    icon: 'Network',
    description: 'Vertices and edges. BFS shortest paths, DFS connected components, topological sorting, and Dijkstra.',
    prerequisites: ['Stacks and Queues', 'Trees'],
    timeComplexity: 'BFS/DFS: O(V + E), Dijkstra: O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    difficultyBreakdown: { easy: 1, medium: 7, hard: 3 },
    problemIds: ['number-of-islands'],
    conceptExplanation: 'Graphs model relationships between entities using vertices and edges. Algorithms explore connectivity, detect cycles, find shortest paths, and order dependent tasks.',
    keyInvariants: [
      'Adjacency list is preferred for sparse graphs: O(V + E) space.',
      'Visited array/set is mandatory to avoid infinite cycles in cyclical graphs.',
      'Topological Sort (Kahn Algorithm) resolves prerequisite DAG dependencies using indegree tracking.'
    ],
    codeExamples: {
      python: `def num_islands(grid: list[list[str]]) -> int:
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0' # Mark visited
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`,
      cpp: `int numIslands(vector<vector<char>>& grid) {
    if (grid.empty()) return 0;
    int rows = grid.size(), cols = grid[0].size(), count = 0;
    auto dfs = [&](auto& self, int r, int c) -> void {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '0';
        self(self, r + 1, c); self(self, r - 1, c); self(self, r, c + 1); self(self, r, c - 1);
    };
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            if (grid[r][c] == '1') { count++; dfs(dfs, r, c); }
        }
    }
    return count;
}`,
      java: `public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;
    int count = 0;
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) {
            if (grid[r][c] == '1') { count++; dfs(grid, r, c); }
        }
    }
    return count;
}
private void dfs(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
    grid[r][c] = '0';
    dfs(grid, r + 1, c); dfs(grid, r - 1, c); dfs(grid, r, c + 1); dfs(grid, r, c - 1);
}`
    },
    commonPatterns: ['Grid Flood Fill DFS/BFS', 'Kahn In-Degree Topological Sort', 'Dijkstra Min-Heap Shortest Path'],
    commonMistakes: [
      'Forgetting to mark nodes as visited immediately upon adding to queue in BFS, causing duplicate queueing.',
      'Using Adjacency Matrix on sparse graphs wasting O(V^2) memory.',
      'Assuming Dijkstra works with negative edge weights (requires Bellman-Ford).'
    ],
    interviewTips: [
      'Clearly specify graph representation: Directed vs Undirected, Weighted vs Unweighted.',
      'In grid problems, mutating the grid in-place to 0 or 2 avoids allocating a separate visited matrix.'
    ],
    lessons: [
      { id: 'grp-1', title: 'Adjacency Lists vs Matrices', duration: '5 mins', summary: 'Memory trade-offs in sparse and dense graphs.' },
      { id: 'grp-2', title: 'Cycle Detection in Directed Graphs', duration: '7 mins', summary: 'Three-color state flags (White, Gray, Black).' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'Island Sinking Flood Fill',
      description: 'DFS sinks adjacent land cells into water',
      initialState: [1, 1, 0, 0, 1],
      steps: [
        { description: 'Cell 0 is land "1": increment island count to 1 and trigger flood fill', highlightIndices: [0], explanation: 'New island discovered.' },
        { description: 'Flood fill visits cell 1: marks cell 0 and 1 as water "0"', highlightIndices: [0, 1], explanation: 'Adjacent land sunk.' },
        { description: 'Cell 4 is separate land "1": increment island count to 2', highlightIndices: [4], explanation: 'Second disconnected island counted.' }
      ]
    }
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    stage: 'advanced',
    icon: 'Cpu',
    description: 'Overlapping subproblems and optimal substructure. Top-down memoization, bottom-up tabulation, and space reduction.',
    prerequisites: ['Recursion', 'Arrays & Vectors'],
    timeComplexity: 'Number of States * Transitions per State',
    spaceComplexity: 'Table Size or O(1) space optimization',
    difficultyBreakdown: { easy: 2, medium: 7, hard: 3 },
    problemIds: ['climbing-stairs', 'coin-change', 'house-robber'],
    conceptExplanation: 'Dynamic Programming breaks complex problems into overlapping subproblems, solving each subproblem exactly once and caching the result. It converts exponential O(2^N) recursion trees into polynomial O(N) or O(N^2) algorithms.',
    keyInvariants: [
      'State definition: clearly define what dp[i] or dp[i][j] represents.',
      'Recurrence relation: formula transitioning from smaller states to current state.',
      'Rolling variables: if dp[i] only depends on dp[i-1] and dp[i-2], reduce space from O(N) to O(1).'
    ],
    codeExamples: {
      python: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; ++i) {
        for (int coin : coins) {
            if (i - coin >= 0) {
                dp[i] = min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (i - coin >= 0) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`
    },
    commonPatterns: ['1D Array State (Fibonacci/Robber)', '0/1 and Unbounded Knapsack', '2D Grid Walk (Unique Paths)'],
    commonMistakes: [
      'Incorrect base case initialization (e.g. setting dp[0] to infinity instead of 0).',
      'Iterating in wrong direction in knapsack causing elements to be reused illegally.',
      'Failing to notice space optimization opportunities.'
    ],
    interviewTips: [
      'Write the mathematical recurrence equation explicitly on paper before writing code.',
      'Show the evolution from brute-force recursion -> memoization -> bottom-up table -> space optimization.'
    ],
    lessons: [
      { id: 'dp-1', title: 'Recognizing Optimal Substructure', duration: '6 mins', summary: 'Differentiating problems solvable by DP from greedy problems.' },
      { id: 'dp-2', title: 'Top-Down vs Bottom-Up Trade-offs', duration: '6 mins', summary: 'Comparing recursion stack limits to iterative caches.' },
      { id: 'dp-3', title: 'Memory Optimization via Rolling States', duration: '5 mins', summary: 'Compressing full tables to two variables.' }
    ],
    visualization: {
      type: 'dp-grid',
      title: 'Coin Change Minimum Transition',
      description: 'Tabulating min coins for amount 0 through 5 with coins [1, 2, 5]',
      initialState: [0, 1, 1, 2, 2, 1],
      steps: [
        { description: 'dp[0] = 0 (0 coins to make $0)', highlightIndices: [0], dpMatrixCol: 0, explanation: 'Base case established.' },
        { description: 'dp[1] = min(dp[0] + 1) = 1 coin', highlightIndices: [1], dpMatrixCol: 1, explanation: 'Using coin 1.' },
        { description: 'dp[2] = min(dp[1]+1, dp[0]+1) = 1 coin', highlightIndices: [2], dpMatrixCol: 2, explanation: 'Using coin 2.' },
        { description: 'dp[5] = min(dp[4]+1, dp[3]+1, dp[0]+1) = 1 coin ($5)', highlightIndices: [5], dpMatrixCol: 5, explanation: 'Optimal answer found with 1 coin.' }
      ]
    }
  },
  {
    id: 'bit-manipulation',
    title: 'Bit Manipulation',
    stage: 'advanced',
    icon: 'Binary',
    description: 'Binary operations, XOR tricks, bitmask state representations, and bitwise arithmetic.',
    prerequisites: ['Foundation'],
    timeComplexity: 'O(1) CPU instructions',
    spaceComplexity: 'O(1)',
    difficultyBreakdown: { easy: 3, medium: 4, hard: 1 },
    problemIds: ['two-sum'],
    conceptExplanation: 'Bit manipulation directly operates on bits at the hardware register level. XOR properties (x ^ x = 0, x ^ 0 = x) allow finding missing or unique elements in O(1) space, while bitmasks compress subset states into single integers.',
    keyInvariants: [
      'XOR identity: a ^ a = 0 and a ^ 0 = a. Commutative and associative.',
      'Brian Kernighan algorithm: n & (n - 1) clears the lowest set bit in O(set bits).',
      'Bitmask state: 1 << i checks or toggles the presence of item i in a subset.'
    ],
    codeExamples: {
      python: `def single_number(nums: list[int]) -> int:
    result = 0
    for num in nums:
        result ^= num
    return result`,
      cpp: `int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) result ^= num;
    return result;
}`,
      java: `public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) result ^= num;
    return result;
}`
    },
    commonPatterns: ['XOR Cancellation', 'Brian Kernighan Bit Counting', 'Bitmask Subset Representation'],
    commonMistakes: [
      'Operator precedence: addition (+) has higher precedence than bitwise shifts (<<, >>).',
      'Negative numbers and sign extension with arithmetic right shifts (>> vs >>> in Java).',
      'Integer overflow when shifting past bit width (1 << 31).'
    ],
    interviewTips: [
      'Always wrap bitwise expressions in parentheses: (n & (1 << i)) != 0.',
      'Point out that bitwise operations execute in a single CPU cycle with zero auxiliary memory.'
    ],
    lessons: [
      { id: 'bit-1', title: 'The XOR Cancellation Property', duration: '4 mins', summary: 'How pairs self-annihilate to leave isolated elements.' },
      { id: 'bit-2', title: 'Kernighan Bit Clearing Invariant', duration: '5 mins', summary: 'Counting set bits proportional only to active bits.' }
    ],
    visualization: {
      type: 'array-traverse',
      title: 'XOR Unique Element Isolation',
      description: 'Canceling duplicate pairs: [4, 1, 2, 1, 2]',
      initialState: [4, 1, 2, 1, 2],
      steps: [
        { description: 'Start result = 0 ^ 4 = 4', highlightIndices: [0], explanation: 'Initialize with first element.' },
        { description: '4 ^ 1 ^ 2 ^ 1 = (1 ^ 1) cancels out, leaving 4 ^ 2', highlightIndices: [1, 3], explanation: 'Pair of 1s eliminated.' },
        { description: '4 ^ 2 ^ 2 = (2 ^ 2) cancels out, leaving 4!', highlightIndices: [2, 4], explanation: 'Isolated non-duplicate 4 found in O(N) time and O(1) space.' }
      ]
    }
  },
  {
    id: 'advanced-algorithms',
    title: 'Advanced Algorithms',
    stage: 'advanced',
    icon: 'Sparkles',
    description: 'Disjoint Set Union (Union-Find), Segment Trees, Fenwick Trees, and String KMP.',
    prerequisites: ['Graphs & Networks', 'Trees'],
    timeComplexity: 'Union-Find: O(alpha(N)) amortized nearly O(1)',
    spaceComplexity: 'O(N)',
    difficultyBreakdown: { easy: 0, medium: 4, hard: 4 },
    problemIds: ['number-of-islands'],
    conceptExplanation: 'Advanced competitive structures handle dynamic graph connectivity, fast range updates, and linear pattern matching. Disjoint Set Union (DSU) maintains dynamic partition sets with near-constant time operations via path compression.',
    keyInvariants: [
      'Union-Find with path compression: parent[x] = find(parent[x]) flattens tree height.',
      'Union by rank/size keeps shallow trees, yielding inverse Ackermann O(alpha(N)) runtime.',
      'Segment Tree answers range queries and range updates in O(log N).'
    ],
    codeExamples: {
      python: `class UnionFind:
    def __init__(self, size):
        self.parent = list(range(size))
        self.rank = [0] * size
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x]) # Path compression
        return self.parent[x]
    def union(self, x, y):
        root_x, root_y = self.find(x), self.find(y)
        if root_x == root_y: return False
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        else:
            self.parent[root_y] = root_x
            if self.rank[root_x] == self.rank[root_y]: self.rank[root_x] += 1
        return True`,
      cpp: `class UnionFind {
    vector<int> parent, rank;
public:
    UnionFind(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (rank[rx] < rank[ry]) parent[rx] = ry;
        else {
            parent[ry] = rx;
            if (rank[rx] == rank[ry]) rank[rx]++;
        }
        return true;
    }
};`,
      java: `class UnionFind {
    int[] parent, rank;
    public UnionFind(int n) {
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    public int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    public boolean union(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (rank[rx] < rank[ry]) parent[rx] = ry;
        else {
            parent[ry] = rx;
            if (rank[rx] == rank[ry]) rank[rx]++;
        }
        return true;
    }
}`
    },
    commonPatterns: ['Dynamic Graph Connectivity', 'Kruskal Minimum Spanning Tree', 'Redundant Connection Detection'],
    commonMistakes: [
      'Omitting path compression which allows trees to degrade into O(N) linked lists.',
      'Unifying elements without finding their set roots first.',
      'Not maintaining connected component count appropriately during union.'
    ],
    interviewTips: [
      'Explain that alpha(N) is the inverse Ackermann function, which is <= 4 for all practical universe sizes.',
      'Identify when DSU is preferred over BFS/DFS: dynamic edges added online.'
    ],
    lessons: [
      { id: 'adv-1', title: 'Path Compression & Inverse Ackermann', duration: '6 mins', summary: 'Flattening tree structures on find queries.' },
      { id: 'adv-2', title: 'Union by Rank Optimizations', duration: '5 mins', summary: 'Merging smaller sets into larger sets.' }
    ],
    visualization: {
      type: 'tree-traversal',
      title: 'Path Compression Flattening',
      description: 'Directing all visited nodes straight to root',
      initialState: { val: 'Root 0', left: { val: 'Node 1', left: { val: 'Node 2' } } },
      steps: [
        { description: 'Deep chain: 2 -> 1 -> 0', treeActiveNode: 'Node 2', explanation: 'Traverse upward to find root 0.' },
        { description: 'Path compression links 2 directly to 0 and 1 directly to 0', treeActiveNode: 'Root 0', explanation: 'Subsequent lookups take O(1) time.' }
      ]
    }
  }
];

