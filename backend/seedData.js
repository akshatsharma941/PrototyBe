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
  // CASE STUDY 2 — The Tiffin Service Inventory
  // Teaches: Dictionaries — grouping by key instead of by position
  // Prerequisite: Cricket Scoreboard (Lists)
  // ══════════════════════════════════════════════════════

  {
    id: "tiffin-service-inventory",
    title: "The Tiffin Service Inventory",
    subtitle: "When checking one ingredient takes 20 minutes",
    description: "Meera runs a tiffin service from her kitchen in Bangalore. Every morning she cooks for 30 families. Her pantry notebook lists 30 ingredients with quantities. But finding whether she has enough turmeric — without scrolling through everything — takes too long.",
    author: "PyBe Content Team",
    difficulty: "beginner",
    estimatedMin: 25,
    tags: ["dictionaries", "grouping", "lookup", "keys"],

    // ─── Learning Objectives ────────────────────────────
    objectives: [
      { id: "obj-1", label: "Recognise when data needs to be looked up by a name you already know" },
      { id: "obj-2", label: "Explain why position-based storage fails when you know the name but not the position" },
      { id: "obj-3", label: "Use a Dictionary to store and retrieve values by a named key" }
    ],

    // ─── Prerequisites ──────────────────────────────────
    prerequisites: [
      { caseStudyId: "cricket-scoreboard", reason: "Must understand grouping related values before learning name-based grouping" }
    ],

    // ─── The Story ──────────────────────────────────────
    story: {
      setting:     "A home kitchen in Bangalore",
      protagonist: "Meera, who runs a tiffin service cooking for 30 families",
      situation:   "Track 30 pantry ingredients — names, quantities, and daily usage",
      tension:     "Every morning, Meera's phone rings with ingredient queries. 'Do you have enough turmeric?' She opens her notebook and starts flipping pages.",
      emotion:     "Exhausted from the daily page-flipping, even though the data is right there"
    },

    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt:       "What do you notice about what Meera is managing?",
      whatToNotice: [
        "30 ingredients, each with a name and a quantity",
        "The notebook is organised with numbered entries",
        "Meera gets asked about specific ingredients — by name — many times a day"
      ],
      notYetReady: [
        "Only talks about cooking or food, not about information retrieval",
        "Mentions the physical kitchen setup"
      ]
    },

    // ─── Phase 2: First Attempt ─────────────────────────
    firstAttempt: {
      prompt:    "Meera's notebook looks like this:\n\nitem1 = 'turmeric powder', qty1 = '200g'\nitem2 = 'red chilli powder', qty2 = '500g'\nitem3 = 'coriander powder', qty3 = '300g'\n\nShe has 30 ingredients like this. Show me — in your own words — what pattern do you see? What happens when Meera wants to find a specific ingredient?",
      modelGood: "Describes the pattern: numbered slots, each holding an ingredient name and quantity",
      modelWeak: "Suggests using an app or Excel — sidesteps the design problem",
      reveals:   "The learner sees the numbered-entry pattern but hasn't yet felt the lookup problem."
    },

    // ─── Phase 3: Guided Questions ──────────────────────
    guidedQuestions: [
      {
        question: "A customer calls at 7 AM and asks: 'Do you have enough red chilli powder for today's orders?' Meera opens her notebook. She sees item1, item2, item3... up to item30. How does she find which item number is 'red chilli powder'?",
        targetsMisconception: "position-based-lookup",
        topic: "the lookup step that shouldn't exist",
        order: 1,
        ifStuck: "The notebook has item1 through item30. To find red chilli powder, Meera reads item1, then item2, then item3... until she finds the right one. How many entries might she read before finding it?"
      },
      {
        question: "Meera has 30 ingredients in her notebook. A new ingredient — 'garam masala' — arrives. Where does it go in the notebook?",
        targetsMisconception: "static-structure",
        topic: "where new entries land",
        order: 2,
        ifStuck: "Does 'garam masala' go at the end as item31? Does anything else change in the notebook?"
      },
      {
        question: "If Meera writes 'red_chilli_powder' directly in the notebook instead of 'item2' — and writes the quantity right next to it — does she still need to search through item1, item2, item3 to find it?",
        targetsMisconception: "position-based-lookup",
        topic: "can the search be bypassed entirely",
        order: 3,
        ifStuck: "If the notebook had 'red_chilli_powder: 500g' written directly — not as item2 — what would Meera do when a customer asks about red chilli powder?"
      }
    ],

    // ─── Phase 4: Cognitive Trigger ─────────────────────
    cognitiveTrigger: {
      statement:        "30 ingredients. Every morning, Meera answers 15 to 20 calls asking about specific ingredients. Each call takes up to 2 minutes of searching. That's up to 40 minutes of page-flipping before she even starts cooking.",
      presentationNote: "Let the number sink in. 40 minutes. Not because the data is missing — but because the data doesn't know what to call itself.",
      pauseRequired:    true,
      learnerReady:     "Recognises the frustration — 40 minutes of searching before cooking begins, just because the notebook entries don't carry their own name",
      learnerNotYet:    "Suggests 'use an app' or 'keep it more organised' — treating the symptom, not the structure"
    },

    // ─── Phase 5: Discovery ─────────────────────────────
    discovery: {
      bridgeQuestion: "What if every ingredient in the notebook already had its own name written on it — and Meera just had to read the name to find it? What if item2 didn't exist — and instead the notebook just said:\n\n'turmeric powder: 200g\nred chilli powder: 500g\ncoriander powder: 300g'?",
      hint:            "When Meera opens the notebook and sees the word 'turmeric powder' written directly on the page — does she need to know what number it is? Or does she just read it?"
    },

    // ─── Phase 6: Programming Mapping ───────────────────
    programmingMapping: {
      introduction: "What you just described is how a Dictionary works in Python. Each entry has a name — a key — that the notebook carries with it. You don't search by number. You search by name.",
      pythonCode:   "stock = {\n    'turmeric powder':    '200g',\n    'red chilli powder':  '500g',\n    'coriander powder':   '300g',\n    'garam masala':       '400g'\n}",
      symbols: [
        { symbol: "stock",                meaning: "One name for the entire pantry collection" },
        { symbol: "{",                    meaning: "The dictionary begins here" },
        { symbol: "'turmeric powder':",   meaning: "'turmeric powder' is the key — the name Meera already knows" },
        { symbol: "'200g'",               meaning: "The quantity — the value stored under that key" },
        { symbol: ",",                   meaning: "Separates each key-value pair" },
        { symbol: "}",                    meaning: "The dictionary ends here" }
      ],
      miniTask:     "Store the stock levels of three fruits in a dictionary called fruit_stock. Use the fruit name as the key and the quantity as the value. Example: apples = '2kg'"
    },

    // ─── Phase 7: Practice ──────────────────────────────
    practice: [
      {
        task:       "Store the prices of three books in a dictionary called book_prices. Use the book title as the key and the price as the value.",
        starterCode: "# Your code here\nbook_prices = ",
        hint:       "Start with: book_prices = { 'Wings of Fire': 299, ... }"
      }
    ],

    // ─── Phase 8: Reflection ────────────────────────────
    reflection: {
      questions: [
        "In Meera's old notebook system — item1, item2, item3 — what did she have to know before she could find red chilli powder?",
        "In the new system — 'red chilli powder': '500g' — what does Meera need to know before she can find red chilli powder?",
        "What is the difference between searching by position and searching by name?",
        "In your own life, is there something you look up by name — not by number — that would benefit from this structure?"
      ],
      confidenceSurvey: [
        {
          conceptId:    "obj-1",
          conceptLabel: "When to use a named key",
          prompt:       "How confident do you feel about knowing when to look up data by name rather than position?"
        },
        {
          conceptId:    "obj-2",
          conceptLabel: "Why positions aren't enough",
          prompt:       "How confident do you feel about explaining why position-based storage breaks down?"
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
      title:       "The Neighbourhood Hardware Store",
      description: "Farooq runs a small hardware store. He has 200 products — each with a name, category, stock count, and price. A customer walks in and asks: 'Do you have a 10mm drill bit?' Farooq needs to check stock in seconds. Design how he'd organise this.",
      format:      "Describe your approach in full sentences. No Python required yet.",
      sparks: [
        "What does Farooq know when the customer walks in? A name or a number?",
        "How many different things might a customer search by — name, category, size, brand?",
        "Would a Dictionary be enough here, or would it need something more?"
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