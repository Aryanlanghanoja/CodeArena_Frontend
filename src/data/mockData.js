// Mock data for the CodeArena platform

export const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array",
    company: "Google",
    acceptanceRate: 49.1,
    status: "solved",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Write your code here
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    company: "Microsoft",
    acceptanceRate: 40.8,
    status: "attempted",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    examples: [
      {
        input: 's = "()"',
        output: "true"
      },
      {
        input: 's = "()[]{}"',
        output: "true"
      },
      {
        input: 's = "(]"',
        output: "false"
      }
    ],
    starterCode: {
      javascript: `function isValid(s) {
    // Write your code here
}`,
      python: `def is_valid(s):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "Linked List",
    company: "Amazon",
    acceptanceRate: 56.9,
    status: null,
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ],
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]"
      }
    ],
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {
    // Write your code here
}`,
      python: `def merge_two_lists(list1, list2):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 4,
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    company: "Facebook",
    acceptanceRate: 47.3,
    status: "solved",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      }
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
    // Write your code here
}`,
      python: `def max_sub_array(nums):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 5,
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    company: "Adobe",
    acceptanceRate: 48.7,
    status: null,
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: [
      "1 <= n <= 45"
    ],
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps"
      }
    ],
    starterCode: {
      javascript: `function climbStairs(n) {
    // Write your code here
}`,
      python: `def climb_stairs(n):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 6,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    topic: "Tree",
    company: "Apple",
    acceptanceRate: 67.1,
    status: "attempted",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]"
      }
    ],
    starterCode: {
      javascript: `function inorderTraversal(root) {
    // Write your code here
}`,
      python: `def inorder_traversal(root):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 7,
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    company: "Netflix",
    acceptanceRate: 58.4,
    status: null,
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of only lowercase English characters."
    ],
    examples: [
      {
        input: 'text1 = "abcde", text2 = "ace"',
        output: "3",
        explanation: 'The longest common subsequence is "ace" and its length is 3.'
      }
    ],
    starterCode: {
      javascript: `function longestCommonSubsequence(text1, text2) {
    // Write your code here
}`,
      python: `def longest_common_subsequence(text1, text2):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        // Write your code here
    }
};`
    }
  },
  {
    id: 8,
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    topic: "Heap",
    company: "Amazon",
    acceptanceRate: 44.9,
    status: null,
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    constraints: [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4"
    ],
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]"
      }
    ],
    starterCode: {
      javascript: `function mergeKLists(lists) {
    // Write your code here
}`,
      python: `def merge_k_lists(lists):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Write your code here
    }
};`
    }
  }
];

export const mockContests = [
  {
    id: 1,
    title: "Weekly Contest 372",
    status: "upcoming",
    startTime: "2024-01-15T14:30:00Z",
    endTime: "2024-01-15T16:00:00Z",
    duration: "1h 30m",
    participants: 0,
    maxParticipants: 1000,
    description: "Weekly programming contest featuring 4 problems of varying difficulty.",
    problems: [
      { title: "Find Missing Number", points: 500, solved: false, attempted: false },
      { title: "String Transformation", points: 1000, solved: false, attempted: false },
      { title: "Tree Path Sum", points: 1500, solved: false, attempted: false },
      { title: "Graph Coloring", points: 2000, solved: false, attempted: false }
    ]
  },
  {
    id: 2,
    title: "Biweekly Contest 120",
    status: "active",
    startTime: "2024-01-14T14:30:00Z",
    endTime: "2024-01-14T16:30:00Z",
    duration: "2h",
    participants: 567,
    maxParticipants: 1500,
    description: "Biweekly contest with challenging algorithmic problems.",
    problems: [
      { title: "Array Manipulation", points: 500, solved: true, attempted: true },
      { title: "Dynamic Programming", points: 1000, solved: false, attempted: true },
      { title: "Graph Algorithms", points: 1500, solved: false, attempted: false },
      { title: "Advanced Data Structures", points: 2000, solved: false, attempted: false }
    ]
  },
  {
    id: 3,
    title: "Monthly Contest December",
    status: "completed",
    startTime: "2023-12-20T14:30:00Z",
    endTime: "2023-12-20T17:30:00Z",
    duration: "3h",
    participants: 1243,
    maxParticipants: 2000,
    description: "Monthly contest with prizes for top performers.",
    problems: [
      { title: "Sorting Algorithms", points: 500, solved: true, attempted: true },
      { title: "Binary Search", points: 1000, solved: true, attempted: true },
      { title: "Backtracking", points: 1500, solved: false, attempted: true },
      { title: "Network Flow", points: 2000, solved: false, attempted: false }
    ]
  },
  {
    id: 4,
    title: "Practice Contest #45",
    status: "upcoming",
    startTime: "2024-01-20T10:00:00Z",
    endTime: "2024-01-20T12:00:00Z",
    duration: "2h",
    participants: 0,
    maxParticipants: 800,
    description: "Practice contest for beginners and intermediate level programmers.",
    problems: [
      { title: "Basic Math", points: 300, solved: false, attempted: false },
      { title: "String Processing", points: 700, solved: false, attempted: false },
      { title: "Greedy Algorithms", points: 1200, solved: false, attempted: false }
    ]
  }
];

export const companies = [
  "Google", "Microsoft", "Amazon", "Facebook", "Apple", "Netflix", "Adobe", "Uber", "Airbnb", "Tesla"
];

export const topics = [
  "Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search",
  "Binary Search", "Tree", "Breadth-First Search", "Two Pointers", "Stack", "Heap", "Graph", "Design",
  "Simulation", "Counting", "Sliding Window", "Union Find", "Linked List", "Ordered Set", "Monotonic Stack",
  "Trie", "Divide and Conquer", "Bitmask", "Queue", "Iterator", "Interactive", "Data Stream", "Brainteaser",
  "Game Theory", "Hash Function", "Rolling Hash", "Shortest Path", "Combinatorics", "Randomized", "Geometry"
];

export const difficulties = ["Easy", "Medium", "Hard"];

export const statusOptions = ["All", "Solved", "Attempted", "Todo"];