export const mockLevels = [
  {
    id: "lvl-1",
    title: "The Basics of Tracking",
    description: "Begin your journey. Learn to keep track of information in the real world and discover the fundamentals of memory.",
    levelNumber: 1,
    missions: [
      {
        id: "mis-1-1",
        title: "The Coffee Shop Tracker",
        description: "You run a small coffee shop. You need to keep track of how many cups of coffee you sell today to calculate your daily revenue. How will you remember and update this count?",
        learningObjectives: [
          "Understand how to store data",
          "Learn how to update stored data over time"
        ],
        possibleConcepts: ["variables", "assignment", "integers"],
        difficulty: "Easy",
        xpReward: 100,
        testCases: [
          { input: '', expectedOutput: '0' },
          { input: '', expectedOutput: '1' }
        ],
        lessonSummary: "You successfully tracked state by assigning a changing value to a variable.",
        intuitionBuilt: "Memory is just a named box where you can update the contents over time."
      },
      {
        id: "mis-1-2",
        title: "The VIP Guest List",
        description: "You are hosting an exclusive event. You need a way to store the name of the most important VIP guest so you can greet them properly when they arrive.",
        learningObjectives: [
          "Store text-based information",
          "Retrieve stored information"
        ],
        possibleConcepts: ["variables", "strings"],
        difficulty: "Easy",
        xpReward: 120,
        lessonSummary: "You stored and retrieved text data efficiently.",
        intuitionBuilt: "Strings allow you to persist and reference textual information by name."
      }
    ]
  },
  {
    id: "lvl-2",
    title: "Branching Paths",
    description: "Face scenarios that require making choices. Master the art of decision making based on specific rules.",
    levelNumber: 2,
    missions: [
      {
        id: "mis-2-1",
        title: "The Night Club Bouncer",
        description: "You are a bouncer at an exclusive club. You must verify if a guest is 18 or older to let them in. If they are younger, you must deny entry. What is your decision process?",
        learningObjectives: [
          "Define specific conditions for actions",
          "Execute alternative actions when conditions fail"
        ],
        possibleConcepts: ["conditionals", "if-else", "booleans"],
        difficulty: "Easy",
        xpReward: 150,
        lessonSummary: "You implemented logic that diverges based on a specific boolean condition.",
        intuitionBuilt: "Programs can make decisions and choose different paths based on true/false evaluations."
      },
      {
        id: "mis-2-2",
        title: "The Discount Engine",
        description: "A customer is checking out of your online store. If they spend over $100, they get a 20% discount. Otherwise, they pay the normal price. How do you calculate their final total?",
        learningObjectives: [
          "Use conditions to modify data",
          "Perform mathematical operations based on rules"
        ],
        possibleConcepts: ["conditionals", "math operators", "if-else"],
        difficulty: "Medium",
        xpReward: 200,
        lessonSummary: "You combined conditional logic with mathematical operations.",
        intuitionBuilt: "You can conditionally manipulate data values based on real-world rules."
      }
    ]
  },
  {
    id: "lvl-3",
    title: "The Factory Floor",
    description: "Repetitive tasks are boring and error-prone. Learn how to automate actions efficiently without repeating yourself.",
    levelNumber: 3,
    missions: [
      {
        id: "mis-3-1",
        title: "The Payroll Processor",
        description: "You have a stack of 50 employee timesheets. You need to calculate the weekly pay for each employee one by one. Describe the process you would follow to complete this task for everyone.",
        learningObjectives: [
          "Understand how to repeat a process",
          "Define the stopping condition for a repetitive task"
        ],
        possibleConcepts: ["loops", "iteration", "while loops"],
        difficulty: "Medium",
        xpReward: 250,
        lessonSummary: "You executed a repetitive action with a clear stopping condition.",
        intuitionBuilt: "Instead of repeating code, you can define a loop that continues until a condition is met."
      },
      {
        id: "mis-3-2",
        title: "The Password Cracker",
        description: "You forgot the 3-digit pin to your suitcase. You decide to try every single combination starting from 000 up to 999 until it opens. How would you systematically do this?",
        learningObjectives: [
          "Execute a process a specific number of times",
          "Keep track of an iterating sequence"
        ],
        possibleConcepts: ["for loops", "range", "iteration"],
        difficulty: "Medium",
        xpReward: 300,
        lessonSummary: "You systematically iterated over a defined range of possibilities.",
        intuitionBuilt: "Iteration allows you to easily walk through sequences without manual intervention."
      }
    ]
  }
];
