// Comprehensive Production LeetCode DSA Problem Collection for DEVARENA
import { CodingProblem } from '../types';

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    "id": "two-sum",
    "leetcodeNumber": 1,
    "title": "Two Sum",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "acceptanceRate": "52.8%",
    "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    "inputFormat": "nums: number[], target: number",
    "outputFormat": "number[] (indices [i, j])",
    "examples": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[0, 1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        "input": "nums = [3, 2, 4], target = 6",
        "output": "[1, 2]"
      },
      {
        "input": "nums = [3, 3], target = 6",
        "output": "[0, 1]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    "hints": [
      "A really brute force way would be to search for all possible pairs of numbers but that would be slow. Can you think of something faster?",
      "Can we use a hash map to store elements we've seen so far and find the complement target - num in O(1) time?"
    ],
    "relatedTopics": [
      "Array",
      "Hash Table"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Microsoft",
      "Apple",
      "Uber"
    ],
    "functionName": "twoSum",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      "typescript": "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      "python": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.find(complement) != map.end()) {\n                return { map[complement], i };\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            2,
            7,
            11,
            15
          ],
          9
        ],
        "expected": [
          0,
          1
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            3,
            2,
            4
          ],
          6
        ],
        "expected": [
          1,
          2
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            3,
            3
          ],
          6
        ],
        "expected": [
          0,
          1
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            1,
            5,
            8,
            12,
            19
          ],
          20
        ],
        "expected": [
          0,
          4
        ],
        "isHidden": true
      },
      {
        "input": [
          [
            -3,
            4,
            3,
            90
          ],
          0
        ],
        "expected": [
          0,
          2
        ],
        "isHidden": true
      }
    ]
  },
  {
    "id": "valid-parentheses",
    "leetcodeNumber": 20,
    "title": "Valid Parentheses",
    "difficulty": "Easy",
    "category": "Stacks",
    "acceptanceRate": "40.5%",
    "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    "inputFormat": "s: string",
    "outputFormat": "boolean",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true"
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true"
      },
      {
        "input": "s = \"(]\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    "hints": [
      "Use a stack to keep track of opening brackets.",
      "When encountering a closing bracket, check if it matches the top element of the stack."
    ],
    "relatedTopics": [
      "String",
      "Stack"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta",
      "Google",
      "PayPal"
    ],
    "functionName": "isValid",
    "starterCode": {
      "javascript": "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let ch of s) {\n    if (ch === '(' || ch === '{' || ch === '[') {\n      stack.push(ch);\n    } else {\n      if (stack.pop() !== map[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}",
      "typescript": "function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };\n  for (const ch of s) {\n    if (ch in map) {\n      if (stack.pop() !== map[ch]) return false;\n    } else {\n      stack.push(ch);\n    }\n  }\n  return stack.length === 0;\n}",
      "python": "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
      "java": "class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '{' || c == '[') st.push(c);\n            else {\n                if (st.empty()) return false;\n                if (c == ')' && st.top() != '(') return false;\n                if (c == '}' && st.top() != '{') return false;\n                if (c == ']' && st.top() != '[') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          "()"
        ],
        "expected": true,
        "isHidden": false
      },
      {
        "input": [
          "()[]{}"
        ],
        "expected": true,
        "isHidden": false
      },
      {
        "input": [
          "(]"
        ],
        "expected": false,
        "isHidden": false
      },
      {
        "input": [
          "([{}])"
        ],
        "expected": true,
        "isHidden": true
      },
      {
        "input": [
          "]"
        ],
        "expected": false,
        "isHidden": true
      }
    ]
  },
  {
    "id": "best-time-to-buy-and-sell-stock",
    "leetcodeNumber": 121,
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "acceptanceRate": "53.6%",
    "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    "inputFormat": "prices: number[]",
    "outputFormat": "number",
    "examples": [
      {
        "input": "prices = [7, 1, 5, 3, 6, 4]",
        "output": "5",
        "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        "input": "prices = [7, 6, 4, 3, 1]",
        "output": "0",
        "explanation": "In this case, no transactions are done and max profit = 0."
      }
    ],
    "constraints": [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    "hints": [
      "Track the minimum price seen so far as you iterate through the array.",
      "At each step, calculate the potential profit if you were to sell today: price - min_price."
    ],
    "relatedTopics": [
      "Array",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta",
      "Google",
      "Apple",
      "Uber"
    ],
    "functionName": "maxProfit",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} prices\n * @return {number}\n */\nfunction maxProfit(prices) {\n  let minPrice = Infinity;\n  let maxProfit = 0;\n  for (let p of prices) {\n    if (p < minPrice) minPrice = p;\n    else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n  }\n  return maxProfit;\n}",
      "typescript": "function maxProfit(prices: number[]): number {\n  let minPrice = Infinity;\n  let maxProfit = 0;\n  for (const p of prices) {\n    if (p < minPrice) minPrice = p;\n    else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n  }\n  return maxProfit;\n}",
      "python": "def maxProfit(prices):\n    min_p, max_p = float('inf'), 0\n    for p in prices:\n        if p < min_p:\n            min_p = p\n        elif p - min_p > max_p:\n            max_p = p - min_p\n    return max_p",
      "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        int min = Integer.MAX_VALUE, max = 0;\n        for (int p : prices) {\n            if (p < min) min = p;\n            else if (p - min > max) max = p - min;\n        }\n        return max;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minP = INT_MAX, maxP = 0;\n        for (int p : prices) {\n            minP = min(minP, p);\n            maxP = max(maxP, p - minP);\n        }\n        return maxP;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            7,
            1,
            5,
            3,
            6,
            4
          ]
        ],
        "expected": 5,
        "isHidden": false
      },
      {
        "input": [
          [
            7,
            6,
            4,
            3,
            1
          ]
        ],
        "expected": 0,
        "isHidden": false
      },
      {
        "input": [
          [
            2,
            4,
            1
          ]
        ],
        "expected": 2,
        "isHidden": true
      },
      {
        "input": [
          [
            3,
            2,
            6,
            5,
            0,
            3
          ]
        ],
        "expected": 4,
        "isHidden": true
      }
    ]
  },
  {
    "id": "valid-palindrome",
    "leetcodeNumber": 125,
    "title": "Valid Palindrome",
    "difficulty": "Easy",
    "category": "Two Pointers",
    "acceptanceRate": "46.8%",
    "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    "inputFormat": "s: string",
    "outputFormat": "boolean",
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true",
        "explanation": "\"amanaplanacanalpanama\" is a palindrome."
      },
      {
        "input": "s = \"race a car\"",
        "output": "false",
        "explanation": "\"raceacar\" is not a palindrome."
      }
    ],
    "constraints": [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters."
    ],
    "hints": [
      "Use two pointers: one at the start and one at the end.",
      "Skip non-alphanumeric characters and compare lowercase versions."
    ],
    "relatedTopics": [
      "Two Pointers",
      "String"
    ],
    "companies": [
      "Meta",
      "Microsoft",
      "Amazon",
      "Apple"
    ],
    "functionName": "isPalindrome",
    "starterCode": {
      "javascript": "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  let l = 0, r = clean.length - 1;\n  while (l < r) {\n    if (clean[l] !== clean[r]) return false;\n    l++; r--;\n  }\n  return true;\n}",
      "typescript": "function isPalindrome(s: string): boolean {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  let l = 0, r = clean.length - 1;\n  while (l < r) {\n    if (clean[l] !== clean[r]) return false;\n    l++; r--;\n  }\n  return true;\n}",
      "python": "def isPalindrome(s):\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]",
      "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++; r--;\n        }\n        return true;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        int l = 0, r = s.size() - 1;\n        while (l < r) {\n            while (l < r && !isalnum(s[l])) l++;\n            while (l < r && !isalnum(s[r])) r--;\n            if (tolower(s[l]) != tolower(s[r])) return false;\n            l++; r--;\n        }\n        return true;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          "A man, a plan, a canal: Panama"
        ],
        "expected": true,
        "isHidden": false
      },
      {
        "input": [
          "race a car"
        ],
        "expected": false,
        "isHidden": false
      },
      {
        "input": [
          " "
        ],
        "expected": true,
        "isHidden": true
      },
      {
        "input": [
          "0P"
        ],
        "expected": false,
        "isHidden": true
      }
    ]
  },
  {
    "id": "valid-anagram",
    "leetcodeNumber": 242,
    "title": "Valid Anagram",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "acceptanceRate": "64.7%",
    "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "inputFormat": "s: string, t: string",
    "outputFormat": "boolean",
    "examples": [
      {
        "input": "s = \"anagram\", t = \"nagaram\"",
        "output": "true"
      },
      {
        "input": "s = \"rat\", t = \"car\"",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    "hints": [
      "What if the lengths of s and t are different?",
      "Can you count character frequencies with a size-26 integer array?"
    ],
    "relatedTopics": [
      "Hash Table",
      "String",
      "Sorting"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Adobe",
      "Goldman Sachs"
    ],
    "functionName": "isAnagram",
    "starterCode": {
      "javascript": "/**\n * @param {string} s\n * @param {string} t\n * @return {boolean}\n */\nfunction isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let c of s) count[c] = (count[c] || 0) + 1;\n  for (let c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}",
      "typescript": "function isAnagram(s: string, t: string): boolean {\n  if (s.length !== t.length) return false;\n  const count: Record<string, number> = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}",
      "python": "def isAnagram(s, t):\n    if len(s) != len(t): return False\n    return sorted(s) == sorted(t)",
      "java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - 'a']++;\n        for (char c : t.toCharArray()) if (--count[c - 'a'] < 0) return false;\n        return true;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        vector<int> count(26, 0);\n        for (char c : s) count[c - 'a']++;\n        for (char c : t) if (--count[c - 'a'] < 0) return false;\n        return true;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          "anagram",
          "nagaram"
        ],
        "expected": true,
        "isHidden": false
      },
      {
        "input": [
          "rat",
          "car"
        ],
        "expected": false,
        "isHidden": false
      },
      {
        "input": [
          "a",
          "ab"
        ],
        "expected": false,
        "isHidden": true
      }
    ]
  },
  {
    "id": "binary-search",
    "leetcodeNumber": 704,
    "title": "Binary Search",
    "difficulty": "Easy",
    "category": "Binary Search",
    "acceptanceRate": "57.3%",
    "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`.\n\nIf `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    "inputFormat": "nums: number[], target: number",
    "outputFormat": "number (index or -1)",
    "examples": [
      {
        "input": "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        "output": "4",
        "explanation": "9 exists in nums and its index is 4"
      },
      {
        "input": "nums = [-1, 0, 3, 5, 9, 12], target = 2",
        "output": "-1",
        "explanation": "2 does not exist in nums so return -1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order."
    ],
    "hints": [
      "Use left and right pointers and calculate mid = left + Math.floor((right - left) / 2) to prevent overflow.",
      "If nums[mid] == target, return mid. If nums[mid] < target, left = mid + 1. Else right = mid - 1."
    ],
    "relatedTopics": [
      "Array",
      "Binary Search"
    ],
    "companies": [
      "Microsoft",
      "Google",
      "Meta",
      "Amazon",
      "Uber"
    ],
    "functionName": "search",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const mid = Math.floor((l + r) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) l = mid + 1;\n    else r = mid - 1;\n  }\n  return -1;\n}",
      "typescript": "function search(nums: number[], target: number): number {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const mid = Math.floor((l + r) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) l = mid + 1;\n    else r = mid - 1;\n  }\n  return -1;\n}",
      "python": "def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        if nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1",
      "java": "class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return -1;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return -1;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          9
        ],
        "expected": 4,
        "isHidden": false
      },
      {
        "input": [
          [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          2
        ],
        "expected": -1,
        "isHidden": false
      },
      {
        "input": [
          [
            5
          ],
          5
        ],
        "expected": 0,
        "isHidden": true
      }
    ]
  },
  {
    "id": "maximum-subarray",
    "leetcodeNumber": 53,
    "title": "Maximum Subarray",
    "difficulty": "Medium",
    "category": "Dynamic Programming",
    "acceptanceRate": "50.7%",
    "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    "inputFormat": "nums: number[]",
    "outputFormat": "number (maximum contiguous sum)",
    "examples": [
      {
        "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        "output": "6",
        "explanation": "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        "input": "nums = [1]",
        "output": "1"
      },
      {
        "input": "nums = [5,4,-1,7,8]",
        "output": "23"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "hints": [
      "Kadane's algorithm: At each index, decide whether to add the current number to the existing subarray or start a new subarray at current index.",
      "curSum = Math.max(nums[i], curSum + nums[i])"
    ],
    "relatedTopics": [
      "Array",
      "Divide and Conquer",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Apple",
      "LinkedIn"
    ],
    "functionName": "maxSubArray",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  let cur = nums[0], max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}",
      "typescript": "function maxSubArray(nums: number[]): number {\n  let cur = nums[0], max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}",
      "python": "def maxSubArray(nums):\n    cur = max_sum = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        max_sum = max(max_sum, cur)\n    return max_sum",
      "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        int cur = nums[0], max = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            cur = Math.max(nums[i], cur + nums[i]);\n            max = Math.max(max, cur);\n        }\n        return max;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int cur = nums[0], maxS = nums[0];\n        for (size_t i = 1; i < nums.size(); ++i) {\n            cur = max(nums[i], cur + nums[i]);\n            maxS = max(maxS, cur);\n        }\n        return maxS;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            -2,
            1,
            -3,
            4,
            -1,
            2,
            1,
            -5,
            4
          ]
        ],
        "expected": 6,
        "isHidden": false
      },
      {
        "input": [
          [
            1
          ]
        ],
        "expected": 1,
        "isHidden": false
      },
      {
        "input": [
          [
            5,
            4,
            -1,
            7,
            8
          ]
        ],
        "expected": 23,
        "isHidden": false
      },
      {
        "input": [
          [
            -1
          ]
        ],
        "expected": -1,
        "isHidden": true
      }
    ]
  },
  {
    "id": "longest-substring-without-repeating",
    "leetcodeNumber": 3,
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "category": "Sliding Window",
    "acceptanceRate": "34.9%",
    "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
    "inputFormat": "s: string",
    "outputFormat": "number (maximum substring length)",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with the length of 3."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1"
      },
      {
        "input": "s = \"pwwkew\"",
        "output": "3"
      }
    ],
    "constraints": [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    "hints": [
      "Use a sliding window with left and right pointers and a Set or Map to track characters in the current window.",
      "When a duplicate character is encountered, advance the left pointer until the duplicate is evicted."
    ],
    "relatedTopics": [
      "Hash Table",
      "String",
      "Sliding Window"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Bloomberg"
    ],
    "functionName": "lengthOfLongestSubstring",
    "starterCode": {
      "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n  const set = new Set();\n  let left = 0, max = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) {\n      set.delete(s[left++]);\n    }\n    set.add(s[r]);\n    max = Math.max(max, r - left + 1);\n  }\n  return max;\n}",
      "typescript": "function lengthOfLongestSubstring(s: string): number {\n  const set = new Set<string>();\n  let left = 0, max = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) {\n      set.delete(s[left++]);\n    }\n    set.add(s[r]);\n    max = Math.max(max, r - left + 1);\n  }\n  return max;\n}",
      "python": "def lengthOfLongestSubstring(s):\n    seen = set()\n    l, res = 0, 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        res = max(res, r - l + 1)\n    return res",
      "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Set<Character> set = new HashSet<>();\n        int l = 0, max = 0;\n        for (int r = 0; r < s.length(); r++) {\n            while (set.contains(s.charAt(r))) set.remove(s.charAt(l++));\n            set.add(s.charAt(r));\n            max = Math.max(max, r - l + 1);\n        }\n        return max;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_set<char> set;\n        int l = 0, maxLen = 0;\n        for (int r = 0; r < s.size(); ++r) {\n            while (set.count(s[r])) set.erase(s[l++]);\n            set.insert(s[r]);\n            maxLen = max(maxLen, r - l + 1);\n        }\n        return maxLen;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          "abcabcbb"
        ],
        "expected": 3,
        "isHidden": false
      },
      {
        "input": [
          "bbbbb"
        ],
        "expected": 1,
        "isHidden": false
      },
      {
        "input": [
          "pwwkew"
        ],
        "expected": 3,
        "isHidden": false
      },
      {
        "input": [
          ""
        ],
        "expected": 0,
        "isHidden": true
      }
    ]
  },
  {
    "id": "container-with-most-water",
    "leetcodeNumber": 11,
    "title": "Container With Most Water",
    "difficulty": "Medium",
    "category": "Two Pointers",
    "acceptanceRate": "55.4%",
    "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\nNotice that you may not slant the container.",
    "inputFormat": "height: number[]",
    "outputFormat": "number (maximum volume)",
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49",
        "explanation": "The lines are at index 1 and 8 with heights 8 and 7, width 7 -> 7 * 7 = 49."
      },
      {
        "input": "height = [1,1]",
        "output": "1"
      }
    ],
    "constraints": [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    "hints": [
      "Start with maximum width (pointers at 0 and n - 1).",
      "The container height is bounded by the shorter line. Advance the pointer with the shorter line to potentially find a taller line."
    ],
    "relatedTopics": [
      "Array",
      "Two Pointers",
      "Greedy"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Adobe",
      "Flipkart"
    ],
    "functionName": "maxArea",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height) {\n  let l = 0, r = height.length - 1, max = 0;\n  while (l < r) {\n    const w = r - l;\n    const h = Math.min(height[l], height[r]);\n    max = Math.max(max, w * h);\n    if (height[l] < height[r]) l++;\n    else r--;\n  }\n  return max;\n}",
      "typescript": "function maxArea(height: number[]): number {\n  let l = 0, r = height.length - 1, max = 0;\n  while (l < r) {\n    const w = r - l;\n    const h = Math.min(height[l], height[r]);\n    max = Math.max(max, w * h);\n    if (height[l] < height[r]) l++;\n    else r--;\n  }\n  return max;\n}",
      "python": "def maxArea(height):\n    l, r, res = 0, len(height) - 1, 0\n    while l < r:\n        res = max(res, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return res",
      "java": "class Solution {\n    public int maxArea(int[] height) {\n        int l = 0, r = height.length - 1, max = 0;\n        while (l < r) {\n            max = Math.max(max, Math.min(height[l], height[r]) * (r - l));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return max;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int l = 0, r = height.size() - 1, maxA = 0;\n        while (l < r) {\n            maxA = max(maxA, min(height[l], height[r]) * (r - l));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return maxA;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            1,
            8,
            6,
            2,
            5,
            4,
            8,
            3,
            7
          ]
        ],
        "expected": 49,
        "isHidden": false
      },
      {
        "input": [
          [
            1,
            1
          ]
        ],
        "expected": 1,
        "isHidden": false
      },
      {
        "input": [
          [
            4,
            3,
            2,
            1,
            4
          ]
        ],
        "expected": 16,
        "isHidden": true
      }
    ]
  },
  {
    "id": "3sum",
    "leetcodeNumber": 15,
    "title": "3Sum",
    "difficulty": "Medium",
    "category": "Two Pointers",
    "acceptanceRate": "34.6%",
    "description": "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
    "inputFormat": "nums: number[]",
    "outputFormat": "number[][]",
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1,-1,2],[-1,0,1]]"
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]"
      }
    ],
    "constraints": [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    "hints": [
      "Sort the array first to make duplicate elimination easy.",
      "Iterate through nums as the first element, then use two pointers on the remainder of the array."
    ],
    "relatedTopics": [
      "Array",
      "Two Pointers",
      "Sorting"
    ],
    "companies": [
      "Meta",
      "Amazon",
      "Apple",
      "Google",
      "Microsoft"
    ],
    "functionName": "threeSum",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nfunction threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const sum = nums[i] + nums[l] + nums[r];\n      if (sum === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (sum < 0) l++;\n      else r--;\n    }\n  }\n  return res;\n}",
      "typescript": "function threeSum(nums: number[]): number[][] {\n  nums.sort((a, b) => a - b);\n  const res: number[][] = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const sum = nums[i] + nums[l] + nums[r];\n      if (sum === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (sum < 0) l++;\n      else r--;\n    }\n  }\n  return res;\n}",
      "python": "def threeSum(nums):\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l+1]: l += 1\n                while l < r and nums[r] == nums[r-1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return res",
      "java": "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s == 0) {\n                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (s < 0) l++; else r--;\n            }\n        }\n        return res;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        for (int i = 0; i < (int)nums.size() - 2; ++i) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = nums.size() - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s == 0) {\n                    res.push_back({nums[i], nums[l], nums[r]});\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (s < 0) l++; else r--;\n            }\n        }\n        return res;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        ],
        "expected": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            0,
            1,
            1
          ]
        ],
        "expected": [],
        "isHidden": false
      },
      {
        "input": [
          [
            0,
            0,
            0
          ]
        ],
        "expected": [
          [
            0,
            0,
            0
          ]
        ],
        "isHidden": true
      }
    ]
  },
  {
    "id": "climbing-stairs",
    "leetcodeNumber": 70,
    "title": "Climbing Stairs",
    "difficulty": "Easy",
    "category": "Dynamic Programming",
    "acceptanceRate": "52.4%",
    "description": "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    "inputFormat": "n: number",
    "outputFormat": "number",
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "1 step + 1 step or 2 steps."
      },
      {
        "input": "n = 3",
        "output": "3",
        "explanation": "1+1+1, 1+2, or 2+1."
      }
    ],
    "constraints": [
      "1 <= n <= 45"
    ],
    "hints": [
      "To reach step n, you must arrive from step n-1 or step n-2.",
      "This is the Fibonacci sequence: f(n) = f(n-1) + f(n-2)."
    ],
    "relatedTopics": [
      "Math",
      "Dynamic Programming",
      "Memoization"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Adobe",
      "Microsoft"
    ],
    "functionName": "climbStairs",
    "starterCode": {
      "javascript": "/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}",
      "typescript": "function climbStairs(n: number): number {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}",
      "python": "def climbStairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b",
      "java": "class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int c = a + b;\n            a = b;\n            b = c;\n        }\n        return b;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; ++i) {\n            int c = a + b;\n            a = b;\n            b = c;\n        }\n        return b;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          2
        ],
        "expected": 2,
        "isHidden": false
      },
      {
        "input": [
          3
        ],
        "expected": 3,
        "isHidden": false
      },
      {
        "input": [
          4
        ],
        "expected": 5,
        "isHidden": true
      },
      {
        "input": [
          5
        ],
        "expected": 8,
        "isHidden": true
      }
    ]
  },
  {
    "id": "coin-change",
    "leetcodeNumber": 322,
    "title": "Coin Change",
    "difficulty": "Medium",
    "category": "Dynamic Programming",
    "acceptanceRate": "44.2%",
    "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an infinite number of each kind of coin.",
    "inputFormat": "coins: number[], amount: number",
    "outputFormat": "number (minimum coins or -1)",
    "examples": [
      {
        "input": "coins = [1,2,5], amount = 11",
        "output": "3",
        "explanation": "11 = 5 + 5 + 1"
      },
      {
        "input": "coins = [2], amount = 3",
        "output": "-1"
      },
      {
        "input": "coins = [1], amount = 0",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4"
    ],
    "hints": [
      "Use bottom-up dynamic programming with an array dp of size amount + 1 initialized to amount + 1.",
      "For each coin c, dp[i] = Math.min(dp[i], dp[i - c] + 1)."
    ],
    "relatedTopics": [
      "Array",
      "Dynamic Programming",
      "Breadth-First Search"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Adobe",
      "Flipkart"
    ],
    "functionName": "coinChange",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let c of coins) {\n    for (let i = c; i <= amount; i++) {\n      dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
      "typescript": "function coinChange(coins: number[], amount: number): number {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (const c of coins) {\n    for (let i = c; i <= amount; i++) {\n      dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
      "python": "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
      "java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int c : coins) {\n            for (int i = c; i <= amount; i++) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int c : coins) {\n            for (int i = c; i <= amount; ++i) dp[i] = min(dp[i], dp[i - c] + 1);\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            1,
            2,
            5
          ],
          11
        ],
        "expected": 3,
        "isHidden": false
      },
      {
        "input": [
          [
            2
          ],
          3
        ],
        "expected": -1,
        "isHidden": false
      },
      {
        "input": [
          [
            1
          ],
          0
        ],
        "expected": 0,
        "isHidden": true
      }
    ]
  },
  {
    "id": "product-of-array-except-self",
    "leetcodeNumber": 238,
    "title": "Product of Array Except Self",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "acceptanceRate": "66.1%",
    "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.",
    "inputFormat": "nums: number[]",
    "outputFormat": "number[]",
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "[24,12,8,6]"
      },
      {
        "input": "nums = [-1,1,0,-3,3]",
        "output": "[0,0,9,0,0]"
      }
    ],
    "constraints": [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "The input is generated such that answer[i] is guaranteed to fit in a 32-bit integer."
    ],
    "hints": [
      "Think about prefix products and suffix products.",
      "First pass: compute prefix product of all elements to the left. Second pass: compute suffix product from the right."
    ],
    "relatedTopics": [
      "Array",
      "Prefix Sum"
    ],
    "companies": [
      "Amazon",
      "Meta",
      "Microsoft",
      "Apple",
      "Google"
    ],
    "functionName": "productExceptSelf",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction productExceptSelf(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < n; i++) {\n    res[i] = prefix;\n    prefix *= nums[i];\n  }\n  let postfix = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    res[i] *= postfix;\n    postfix *= nums[i];\n  }\n  return res;\n}",
      "typescript": "function productExceptSelf(nums: number[]): number[] {\n  const n = nums.length;\n  const res = new Array(n).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < n; i++) {\n    res[i] = prefix;\n    prefix *= nums[i];\n  }\n  let postfix = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    res[i] *= postfix;\n    postfix *= nums[i];\n  }\n  return res;\n}",
      "python": "def productExceptSelf(nums):\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    postfix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= postfix\n        postfix *= nums[i]\n    return res",
      "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        int prefix = 1;\n        for (int i = 0; i < n; i++) {\n            res[i] = prefix;\n            prefix *= nums[i];\n        }\n        int postfix = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            res[i] *= postfix;\n            postfix *= nums[i];\n        }\n        return res;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        int n = nums.size();\n        vector<int> res(n, 1);\n        int prefix = 1;\n        for (int i = 0; i < n; ++i) {\n            res[i] = prefix;\n            prefix *= nums[i];\n        }\n        int postfix = 1;\n        for (int i = n - 1; i >= 0; --i) {\n            res[i] *= postfix;\n            postfix *= nums[i];\n        }\n        return res;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": [
          24,
          12,
          8,
          6
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            -1,
            1,
            0,
            -3,
            3
          ]
        ],
        "expected": [
          0,
          0,
          9,
          0,
          0
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            4,
            5,
            1,
            8,
            2
          ]
        ],
        "expected": [
          80,
          64,
          320,
          40,
          160
        ],
        "isHidden": true
      }
    ]
  },
  {
    "id": "number-of-islands",
    "leetcodeNumber": 200,
    "title": "Number of Islands",
    "difficulty": "Medium",
    "category": "Graphs",
    "acceptanceRate": "59.1%",
    "description": "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    "inputFormat": "grid: string[][]",
    "outputFormat": "number",
    "examples": [
      {
        "input": "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
        "output": "1"
      },
      {
        "input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
        "output": "3"
      }
    ],
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'."
    ],
    "hints": [
      "Iterate over every cell. When you find a '1', increment the island count and run a BFS/DFS to sink the island (mark visited cells as '0')."
    ],
    "relatedTopics": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Union Find",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Meta",
      "Bloomberg"
    ],
    "functionName": "numIslands",
    "starterCode": {
      "javascript": "/**\n * @param {string[][]} grid\n * @return {number}\n */\nfunction numIslands(grid) {\n  if (!grid || !grid.length) return 0;\n  let count = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  };\n  for (let r = 0; r < grid.length; r++) {\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}",
      "typescript": "function numIslands(grid: string[][]): number {\n  if (!grid.length) return 0;\n  let count = 0;\n  const dfs = (r: number, c: number) => {\n    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  };\n  for (let r = 0; r < grid.length; r++) {\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}",
      "python": "def numIslands(grid):\n    if not grid: return 0\n    m, n = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count",
      "java": "class Solution {\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int r = 0; r < grid.length; r++) {\n            for (int c = 0; c < grid[0].length; c++) {\n                if (grid[r][c] == '1') { count++; dfs(grid, r, c); }\n            }\n        }\n        return count;\n    }\n    void dfs(char[][] g, int r, int c) {\n        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int count = 0;\n        for (int r = 0; r < grid.size(); ++r) {\n            for (int c = 0; c < grid[0].size(); ++c) {\n                if (grid[r][c] == '1') { count++; dfs(grid, r, c); }\n            }\n        }\n        return count;\n    }\n    void dfs(vector<vector<char>>& g, int r, int c) {\n        if (r < 0 || r >= g.size() || c < 0 || c >= g[0].size() || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r + 1, c); dfs(g, r - 1, c); dfs(g, r, c + 1); dfs(g, r, c - 1);\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        ],
        "expected": 1,
        "isHidden": false
      },
      {
        "input": [
          [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        ],
        "expected": 3,
        "isHidden": false
      }
    ]
  },
  {
    "id": "house-robber",
    "leetcodeNumber": 198,
    "title": "House Robber",
    "difficulty": "Medium",
    "category": "Dynamic Programming",
    "acceptanceRate": "50.9%",
    "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    "inputFormat": "nums: number[]",
    "outputFormat": "number (maximum loot)",
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "4",
        "explanation": "Rob house 1 (money = 1) and house 3 (money = 3). Total = 4."
      },
      {
        "input": "nums = [2,7,9,3,1]",
        "output": "12",
        "explanation": "Rob house 1 (money = 2), 3 (money = 9) and 5 (money = 1). Total = 12."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400"
    ],
    "hints": [
      "At house i, you either rob house i + loot from house i - 2, or you skip house i and keep loot from house i - 1."
    ],
    "relatedTopics": [
      "Array",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Adobe"
    ],
    "functionName": "rob",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction rob(nums) {\n  let rob1 = 0, rob2 = 0;\n  for (let n of nums) {\n    const temp = Math.max(n + rob1, rob2);\n    rob1 = rob2;\n    rob2 = temp;\n  }\n  return rob2;\n}",
      "typescript": "function rob(nums: number[]): number {\n  let rob1 = 0, rob2 = 0;\n  for (const n of nums) {\n    const temp = Math.max(n + rob1, rob2);\n    rob1 = rob2;\n    rob2 = temp;\n  }\n  return rob2;\n}",
      "python": "def rob(nums):\n    rob1, rob2 = 0, 0\n    for n in nums:\n        rob1, rob2 = rob2, max(n + rob1, rob2)\n    return rob2",
      "java": "class Solution {\n    public int rob(int[] nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int n : nums) {\n            int temp = Math.max(n + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int n : nums) {\n            int temp = max(n + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            1,
            2,
            3,
            1
          ]
        ],
        "expected": 4,
        "isHidden": false
      },
      {
        "input": [
          [
            2,
            7,
            9,
            3,
            1
          ]
        ],
        "expected": 12,
        "isHidden": false
      },
      {
        "input": [
          [
            2,
            1,
            1,
            2
          ]
        ],
        "expected": 4,
        "isHidden": true
      }
    ]
  },
  {
    "id": "group-anagrams",
    "leetcodeNumber": 49,
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "acceptanceRate": "68.2%",
    "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "inputFormat": "strs: string[]",
    "outputFormat": "string[][]",
    "examples": [
      {
        "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"
      },
      {
        "input": "strs = [\"\"]",
        "output": "[[\"\"]]"
      },
      {
        "input": "strs = [\"a\"]",
        "output": "[[\"a\"]]"
      }
    ],
    "constraints": [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters."
    ],
    "hints": [
      "Use the sorted string or a character count tuple as the hash map key."
    ],
    "relatedTopics": [
      "Array",
      "Hash Table",
      "String",
      "Sorting"
    ],
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft",
      "Apple"
    ],
    "functionName": "groupAnagrams",
    "starterCode": {
      "javascript": "/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nfunction groupAnagrams(strs) {\n  const map = {};\n  for (let s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}",
      "typescript": "function groupAnagrams(strs: string[]): string[][] {\n  const map: Record<string, string[]> = {};\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}",
      "python": "def groupAnagrams(strs):\n    from collections import defaultdict\n    mp = defaultdict(list)\n    for s in strs:\n        mp[tuple(sorted(s))].append(s)\n    return list(mp.values())",
      "java": "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> map = new HashMap<>();\n        for (String s : strs) {\n            char[] ch = s.toCharArray();\n            Arrays.sort(ch);\n            String k = new String(ch);\n            map.computeIfAbsent(k, x -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(map.values());\n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        unordered_map<string, vector<string>> mp;\n        for (auto& s : strs) {\n            string t = s;\n            sort(t.begin(), t.end());\n            mp[t].push_back(s);\n        }\n        vector<vector<string>> res;\n        for (auto& p : mp) res.push_back(p.second);\n        return res;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            "eat",
            "tea",
            "tan",
            "ate",
            "nat",
            "bat"
          ]
        ],
        "expected": [
          [
            "eat",
            "tea",
            "ate"
          ],
          [
            "tan",
            "nat"
          ],
          [
            "bat"
          ]
        ],
        "isHidden": false
      },
      {
        "input": [
          [
            ""
          ]
        ],
        "expected": [
          [
            ""
          ]
        ],
        "isHidden": false
      }
    ]
  },
  {
    "id": "trapping-rain-water",
    "leetcodeNumber": 42,
    "title": "Trapping Rain Water",
    "difficulty": "Hard",
    "category": "Two Pointers",
    "acceptanceRate": "61.2%",
    "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    "inputFormat": "height: number[]",
    "outputFormat": "number (units of water trapped)",
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6",
        "explanation": "The elevation map traps 6 units of rain water."
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9"
      }
    ],
    "constraints": [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    "hints": [
      "Use two pointers moving inwards, tracking leftMax and rightMax.",
      "The water trapped at index i is determined by min(leftMax, rightMax) - height[i]."
    ],
    "relatedTopics": [
      "Array",
      "Two Pointers",
      "Dynamic Programming",
      "Stack",
      "Monotonic Stack"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Goldman Sachs"
    ],
    "functionName": "trap",
    "starterCode": {
      "javascript": "/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n  let l = 0, r = height.length - 1;\n  let leftMax = 0, rightMax = 0, water = 0;\n  while (l < r) {\n    if (height[l] < height[r]) {\n      if (height[l] >= leftMax) leftMax = height[l];\n      else water += leftMax - height[l];\n      l++;\n    } else {\n      if (height[r] >= rightMax) rightMax = height[r];\n      else water += rightMax - height[r];\n      r--;\n    }\n  }\n  return water;\n}",
      "typescript": "function trap(height: number[]): number {\n  let l = 0, r = height.length - 1;\n  let leftMax = 0, rightMax = 0, water = 0;\n  while (l < r) {\n    if (height[l] < height[r]) {\n      if (height[l] >= leftMax) leftMax = height[l];\n      else water += leftMax - height[l];\n      l++;\n    } else {\n      if (height[r] >= rightMax) rightMax = height[r];\n      else water += rightMax - height[r];\n      r--;\n    }\n  }\n  return water;\n}",
      "python": "def trap(height):\n    l, r = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while l < r:\n        if height[l] < height[r]:\n            if height[l] >= left_max: left_max = height[l]\n            else: water += left_max - height[l]\n            l += 1\n        else:\n            if height[r] >= right_max: right_max = height[r]\n            else: water += right_max - height[r]\n            r -= 1\n    return water",
      "java": "class Solution {\n    public int trap(int[] height) {\n        int l = 0, r = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l]; else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r]; else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n}",
      "cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int l = 0, r = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= leftMax) leftMax = height[l]; else water += leftMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rightMax) rightMax = height[r]; else water += rightMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n};"
    },
    "testCases": [
      {
        "input": [
          [
            0,
            1,
            0,
            2,
            1,
            0,
            1,
            3,
            2,
            1,
            2,
            1
          ]
        ],
        "expected": 6,
        "isHidden": false
      },
      {
        "input": [
          [
            4,
            2,
            0,
            3,
            2,
            5
          ]
        ],
        "expected": 9,
        "isHidden": false
      },
      {
        "input": [
          [
            4,
            2,
            3
          ]
        ],
        "expected": 1,
        "isHidden": true
      }
    ]
  }
];
