// backend/seedData.js
//
// Case Study Schema v1.1 — Cricket Scoreboard
// Content creators: this file contains educational content only.
// The tutor engine reads this and handles all phase transitions automatically.
// Do not add engine configuration here.
//
const seedData = [
  {
    // ══════════════════════════════════════════════════════
    // CASE STUDY 1 — Cricket Scoreboard (v1.1 schema)
    // ══════════════════════════════════════════════════════

    id: "cricket-scoreboard",
    title: "The Cricket Scoreboard",
    subtitle: "When the scoreboard grows faster than the system",
    description: "Arjun manages cricket scores for a local league. What starts as 11 players becomes 80 — and 800 score entries. The obvious approach stops working.",
    author: "PyBe Content Team",
    difficulty: "beginner",
    estimatedMin: 25,
    tags: ["lists", "variables", "grouping", "scale"],

    // ─── Learning Objectives ────────────────────────────
    objectives: [
      { id: "obj-1", label: "Recognise when a problem needs grouped data storage" },
      { id: "obj-2", label: "Explain why multiple variables break down at scale" },
      { id: "obj-3", label: "Use a List to store multiple values under one name" }
    ],

    // ─── Prerequisites ──────────────────────────────────
    prerequisites: [],

    // ─── The Story ──────────────────────────────────────
    story: {
      setting:     "A local cricket league in Mumbai",
      protagonist: "Arjun, the league's data entry clerk",
      situation:   "Track scores for 80 players across 10 matches per season",
      tension:     "800 individual score entries — even simple questions take hours to answer",
      emotion:     "Frustrated that the obvious approach stops working"
    },

    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt: "What do you notice about what Arjun is managing?",
      whatToNotice: [
        "Player names and their scores",
        "The scale is growing — more players, more matches",
        "Entries are numbered and organised in sequence"
      ],
      notYetReady: [
        "Only mentions cricket technique, not data management",
        "Talks about winning and losing, not scores and entries"
      ]
    },

    // ─── Phase 2: First Attempt ─────────────────────────
    firstAttempt: {
      prompt:    "Arjun starts writing: score1 = 23, score2 = 8, score3 = 45... How would you organise all 80 players' scores?",
      modelGood: "Creates one label per player: player1, runs1, player2, runs2... — or similar numbered grouping approach",
      modelWeak: "Suggests writing everything in a list on paper, or using Excel rows and columns",
      reveals:   "The learner's first instinct reveals their mental model — are they thinking about naming, sequence, or grouping?"
    },

    // ─── Phase 3: Guided Questions ──────────────────────
    // Each question references a misconception from backend/misconceptions/ by ID.
    // Order matters — questions are asked sequentially.
    guidedQuestions: [
      {
        question: "Vikram's score was entered wrong — 18, not 8. How do you find the exact line to fix?",
        targetsMisconception: "naming-collision",
        topic: "correction difficulty",
        order: 1,
        ifStuck: "Show me how Vikram's entries appear in the notebook. Where exactly is the wrong number written?"
      },
      {
        question: "If Rohit scored in 10 matches this season — how many separate score entries does he have? Where are they in the notebook?",
        targetsMisconception: "naming-collision",
        topic: "grouping awareness",
        order: 2,
        ifStuck: "How many lines of the notebook does Rohit take up? Which lines have his name on them?"
      },
      {
        question: "There are 80 players and 10 matches per season. How many individual score entries is that in total?",
        targetsMisconception: "scale-failure",
        topic: "scale awareness",
        order: 3,
        ifStuck: "80 players, 10 matches each. What is 80 multiplied by 10?"
      },
      {
        question: "Two new players join mid-season. Where do their entries go? Do you need to renumber existing entries?",
        targetsMisconception: "static-structure",
        topic: "rigidity of numbered labels",
        order: 4,
        ifStuck: "If a new player is inserted between player5 and player6, what happens to player6's label? And player7's? And all the ones after?"
      }
    ],

    // ─── Phase 4: Cognitive Trigger ─────────────────────
    cognitiveTrigger: {
      statement:        "80 players × 10 matches per season = 800 individual score entries in the notebook",
      presentationNote: "Pause after saying the number. Let the silence land. Do not rush.",
      pauseRequired:    true,
      learnerReady:     "Surprise, frustration, or recognition that 800 is too many to manage well",
      learnerNotYet:    "They say 'okay, just write more labels' without feeling the weight of it"
    },

    // ─── Phase 5: Discovery ─────────────────────────────
    discovery: {
      bridgeQuestion: "If all of Vikram's scores belong together — should they also be stored together?",
      hint:            "Think about where Vikram's scores appear in the notebook. Are they near each other — or scattered with gaps and other players between them?"
    },

    // ─── Phase 6: Programming Mapping ───────────────────
    programmingMapping: {
      introduction: "What you've just described has a name in Python. It's called a List.",
      pythonCode:   "scores = [23, 8, 45, 12, 0, 31, 17, 5, 29, 11, 38]",
      symbols: [
        { symbol: "scores",    meaning: "One name for the entire collection of values" },
        { symbol: "=",         meaning: "The collection on the right is stored under this name" },
        { symbol: "[",         meaning: "The collection begins here" },
        { symbol: "23, 8, 45", meaning: "Values, separated by commas, in the order they were recorded" },
        { symbol: "]",         meaning: "The collection ends here" }
      ],
      miniTask:     "Store the prices of five fruits in a list called fruit_prices. Example: apple = 30"
    },

    // ─── Phase 7: Practice ──────────────────────────────
    practice: [
      {
        task:       "Store five of your favourite movies in a list called movies",
        starterCode: "# Your code here\nmovies = ",
        hint:       "Start with: movies = [ then add your five movie names in quotes, separated by commas, then close with ]"
      }
    ],

    // ─── Phase 8: Reflection ────────────────────────────
    reflection: {
      questions: [
        "Why wasn't one variable enough for all of Rohit's scores?",
        "What did the List solve that multiple variables could not?",
        "When would you use a List in your own life?",
        "How has your thinking about data organisation changed?"
      ],
      confidenceSurvey: [
        {
          conceptId:    "obj-1",
          conceptLabel: "Grouping related values",
          prompt:       "How confident do you feel about knowing when to use grouping in data?"
        },
        {
          conceptId:    "obj-2",
          conceptLabel: "Scale awareness",
          prompt:       "How confident are you about recognising when scale breaks an approach?"
        },
        {
          conceptId:    "obj-3",
          conceptLabel: "Python List",
          prompt:       "How confident do you feel about writing your first Python List?"
        }
      ],
      optional: false
    },

    // ─── Extension ──────────────────────────────────────
    extension: {
      title:       "The Attendance Register",
      description: "A teacher needs to track attendance for 35 students across 200 school days. Each day has 35 attendance entries. Design how you'd organise this data — in words, not code.",
      format:      "Describe your approach in full sentences. No Python required yet.",
      sparks: [
        "How many total attendance entries is that?",
        "What does each entry need to record?",
        "How would you find all the absences for one student quickly?"
      ]
    }
  },

  // ══════════════════════════════════════════════════════
  // CASE STUDY 2 — The Student Report Card
  // Teaches: Dictionaries — grouping by key instead of by position
  // Prerequisite: Cricket Scoreboard (Lists)
  // ══════════════════════════════════════════════════════

  {
    id: "student-report-card",
    title: "The Student Report Card",
    subtitle: "When finding one student's marks takes too long",
    description: "Priya is a class teacher with 45 students. Each student has 5 subject marks. She needs totals, averages, and failure lists. Her current system keeps everything but finding one student's results takes forever.",
    author: "PyBe Content Team",
    difficulty: "beginner",
    estimatedMin: 25,
    tags: ["dictionaries", "grouping", "lookup", "keys"],

    // ─── Learning Objectives ────────────────────────────
    objectives: [
      { id: "obj-1", label: "Recognise when data needs to be looked up by name rather than position" },
      { id: "obj-2", label: "Explain why lists alone cannot solve the lookup problem at scale" },
      { id: "obj-3", label: "Use a Dictionary to store and retrieve values by a named key" }
    ],

    // ─── Prerequisites ──────────────────────────────────
    prerequisites: [
      { caseStudyId: "cricket-scoreboard", reason: "Must understand grouping related values before learning name-based grouping" }
    ],

    // ─── The Story ──────────────────────────────────────
    story: {
      setting:     "A secondary school in Pune",
      protagonist: "Priya, a Class 9 class teacher",
      situation:   "Track 5 subject marks for 45 students and generate report cards",
      tension:     "225 individual mark entries — a parent calls asking for their child's total and Priya has to search through the entire notebook",
      emotion:     "Anxious that a simple lookup takes 10 minutes of page-flipping"
    },

    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt:       "What do you notice about what Priya is managing?",
      whatToNotice: [
        "Student names and their 5 subject marks",
        "Each student has multiple pieces of data attached to their name",
        "She needs to look up students by name frequently"
      ],
      notYetReady: [
        "Only mentions grading or exams, not data management",
        "Talks about teaching, not about organising marks"
      ]
    },

    // ─── Phase 2: First Attempt ─────────────────────────
    firstAttempt: {
      prompt:    "Priya writes the marks like this: student1_marks = [72, 85, 61, 90, 74]. She creates a new label for each student. Priya has 45 students. Show me — what does this system look like for the first few students? Write it out in your own words.",
      modelGood: "Describes the pattern: student1 has one label, student2 has another, each pointing to a list of 5 marks",
      modelWeak: "Suggests using Excel or a table — which is a valid start but sidesteps the design question",
      reveals:   "The learner's instinct is position-based. student1, student2 — each label is a slot number, not a name."
    },

    // ─── Phase 3: Guided Questions ──────────────────────
    guidedQuestions: [
      {
        question: "A parent calls and asks: 'What is Ayaan's total?' Priya looks at student23_marks. What must Priya know FIRST before she can look up student23_marks?",
        targetsMisconception: "position-based-lookup",
        topic: "lookup difficulty",
        order: 1,
        ifStuck: "Priya opens the marks notebook and looks for student23_marks. But to find student23_marks, she first has to find which student number is Ayaan. Where does that information live?"
      },
      {
        question: "There are 45 students and 5 subjects. How many individual mark entries does Priya have in total?",
        targetsMisconception: "scale-failure",
        topic: "scale awareness",
        order: 2,
        ifStuck: "45 students, 5 subjects each. What is 45 multiplied by 5?"
      },
      {
        question: "A new student, Farah, joins the class. Where does her entry go?",
        targetsMisconception: "static-structure",
        topic: "rigidity of numbered labels",
        order: 3,
        ifStuck: "Does she go at the end of the list? What label does she get?"
      },
      {
        question: "If Priya uses the name directly in the marks section — Ayaan_marks instead of student23_marks — does she still need the name-to-number list?",
        targetsMisconception: "position-based-lookup",
        topic: "eliminating the lookup step",
        order: 4,
        ifStuck: "If Ayaan_marks exists directly, what does Priya type to find Ayaan's marks? Does she need to know Ayaan's number at all?"
      }
    ],

    // ─── Phase 4: Cognitive Trigger ─────────────────────
    cognitiveTrigger: {
      statement:        "45 students × 5 subjects = 225 individual mark entries. A parent calls for their child's result. Priya has 225 entries to search through.",
      presentationNote: "Pause after saying the number. Let the learner feel the weight of searching 225 entries by roll number.",
      pauseRequired:    true,
      learnerReady:     "Frustration or recognition that finding one student's marks in 225 entries is slow and error-prone",
      learnerNotYet:    "They say 'just keep a register' or 'just number them faster'"
    },

    // ─── Phase 5: Discovery ─────────────────────────────
    discovery: {
      bridgeQuestion: "Instead of numbering students — student1, student2, student3 — what if Priya just used their actual names as the label? student_Ayaan, student_Farah, student_Zara. Would that help?",
      hint:            "If Priya searches for 'Ayaan' directly — not 'student23' — does she need to know what number Ayaan is?"
    },

    // ─── Phase 6: Programming Mapping ───────────────────
    programmingMapping: {
      introduction: "What you've described — using a student's actual name as the label — is how a Dictionary works in Python. It's a collection of labelled values.",
      pythonCode:   "marks = {\n    'Ayaan': [72, 85, 61, 90, 74],\n    'Farah': [88, 91, 74, 65, 82],\n    'Zara':  [55, 60, 71, 48, 59]\n}",
      symbols: [
        { symbol: "marks",       meaning: "One name for the entire collection of labelled data" },
        { symbol: "{",           meaning: "The dictionary begins here" },
        { symbol: "'Ayaan':",    meaning: "Ayaan is the key — the label that identifies this entry" },
        { symbol: "[72, 85...]", meaning: "Ayaan's 5 subject marks — the value associated with the key 'Ayaan'" },
        { symbol: ",",          meaning: "Separates each key-value pair" },
        { symbol: "}",           meaning: "The dictionary ends here" }
      ],
      miniTask:     "Store the prices of three fruits in a dictionary called fruit_prices. Use the fruit name as the key. Example: apples = 30"
    },

    // ─── Phase 7: Practice ──────────────────────────────
    practice: [
      {
        task:       "Store the marks for three students in a dictionary called student_marks. Use names as keys, lists of 3 marks as values.",
        starterCode: "# Your code here\nstudent_marks = ",
        hint:       "Start with: student_marks = { 'Rahul': [80, 75, 90], ... }"
      }
    ],

    // ─── Phase 8: Reflection ────────────────────────────
    reflection: {
      questions: [
        "In the List system, how did Priya find a student's marks?",
        "In the Dictionary system, how does Priya find a student's marks?",
        "What is the difference between 'looking up by position' and 'looking up by name'?",
        "When would you choose a Dictionary over a List?"
      ],
      confidenceSurvey: [
        {
          conceptId:    "obj-1",
          conceptLabel: "Name-based lookup",
          prompt:       "How confident do you feel about knowing when to use a name-based lookup?"
        },
        {
          conceptId:    "obj-2",
          conceptLabel: "Dictionary vs List",
          prompt:       "How confident do you feel about explaining why a List is not enough for lookups?"
        },
        {
          conceptId:    "obj-3",
          conceptLabel: "Python Dictionary",
          prompt:       "How confident do you feel about writing your first Python Dictionary?"
        }
      ],
      optional: false
    },

    // ─── Extension ──────────────────────────────────────
    extension: {
      title:       "The Library Catalogue",
      description: "A school librarian tracks 500 books. Each book has a title, author, year published, and genre. Design how you'd organise this data so that searching for a book by title is instant.",
      format:      "Describe your approach in full sentences. No Python required yet.",
      sparks: [
        "How would you look up a specific book — by title or by position?",
        "How many different ways might someone want to search the catalogue?",
        "Would a Dictionary help here? Why?"
      ]
    }
  },

  // ══════════════════════════════════════════════════════
  // EXISTING CASE STUDIES — unchanged
  // Uses old schema (pre-v1.1). tutorController handles gracefully.
  // ══════════════════════════════════════════════════════

  {
    title: "The Bakery Checkout",
    description: "You're building a checkout system for a bakery. A customer buys 3 croissants ($2.50 each) and 2 coffees ($3.00 each). Write a program to calculate the total cost.",
    requiredConcepts: ["Variables", "Basic Arithmetic"],
    targetInsight: "Understand how to store values in variables and use operators to compute a total.",
    followUpQuestions: ["How would you apply a 10% discount to the total?", "What if the user inputs the number of items?"],
    pythonTopics: ["variables", "math", "data types"],
    starterCode: "croissant_price = 2.50\ncoffee_price = 3.00\n\n# Calculate total here",
    testCases: [
      { input: "", expectedOutput: "13.5" }
    ]
  },
  {
    title: "Age Verification System",
    description: "A website requires users to be at least 18 years old to create an account. Write a program that checks an 'age' variable and prints 'Access Granted' or 'Access Denied'.",
    requiredConcepts: ["Conditionals", "Comparison Operators"],
    targetInsight: "Learn to use if/else statements to control the flow of the program based on conditions.",
    followUpQuestions: ["What happens if the age is exactly 18?", "How can you add a message for users under 13?"],
    pythonTopics: ["if statements", "booleans"],
    starterCode: "age = 16\n\n# Add your conditional logic here",
    testCases: [
      { input: "16", expectedOutput: "Access Denied" },
      { input: "20", expectedOutput: "Access Granted" }
    ]
  },
  {
    title: "Inventory Stock Checker",
    description: "A store has a list of items in stock: ['Apples', 'Bananas', 'Oranges', 'Milk']. Write a program that loops through the list and prints 'Item in stock: <item>'.",
    requiredConcepts: ["Lists", "For Loops"],
    targetInsight: "Understand iteration and how to access elements in a collection sequentially.",
    followUpQuestions: ["How would you only print items that start with 'A'?", "What if you want to count the total number of items?"],
    pythonTopics: ["lists", "loops", "string formatting"],
    starterCode: "inventory = ['Apples', 'Bananas', 'Oranges', 'Milk']\n\n# Loop through the list here",
    testCases: [
      { input: "", expectedOutput: "Item in stock: Apples\nItem in stock: Bananas\nItem in stock: Oranges\nItem in stock: Milk" }
    ]
  }
];

module.exports = seedData;