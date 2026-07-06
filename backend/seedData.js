// backend/seedData.js
//
// Case Study Schema v1.1 - Cricket Scoreboard
// Content creators: this file contains educational content only.
// The tutor engine reads this and handles all phase transitions automatically.
// Do not add engine configuration here.
//
const seedData = [
  {
    // ══════════════════════════════════════════════════════
    // CASE STUDY 1 - Cricket Scoreboard (v1.1 schema)
    // ══════════════════════════════════════════════════════

    id: "cricket-scoreboard",
    title: "The Cricket Scoreboard",
    subtitle: "When the scoreboard grows faster than the system",
    description: "Arjun manages cricket scores for a local league. At first he records each player's score in its own labelled slot, which works fine for the first 11 players. But when the league expands to 80 players across 10 matches, he is suddenly staring at 800 individual score entries. When the obvious approach of giving every score its own name stops working, what should Arjun try instead?",
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
      tension:     "800 individual score entries - even simple questions take hours to answer",
      emotion:     "Frustrated that the obvious approach stops working"
    },

    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt: "What do you notice about what Arjun is managing?",
      expectedKeywords: [
        // Domain vocabulary for cricket-scoreboard's "what data is here"
        "player", "players", "score", "scores", "runs", "name", "names",
        "data", "number", "numbers", "label", "labels", "entry", "entries",
        "team", "teams", "match", "matches"
      ],
      whatToNotice: [
        "Player names and their scores",
        "The scale is growing - more players, more matches",
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
      modelGood: "Creates one label per player: player1, runs1, player2, runs2... - or similar numbered grouping approach",
      modelWeak: "Suggests writing everything in a list on paper, or using Excel rows and columns",
      reveals:   "The learner's first instinct reveals their mental model - are they thinking about naming, sequence, or grouping?"
    },

    // ─── Phase 3: Guided Questions ──────────────────────
    // Each question references a misconception from backend/misconceptions/ by ID.
    // Order matters - questions are asked sequentially.
    guidedQuestions: [
      {
        question: "Vikram's score was entered wrong - 18, not 8. How do you find the exact line to fix?",
        targetsMisconception: "naming-collision",
        topic: "correction difficulty",
        order: 1,
        ifStuck: "Show me how Vikram's entries appear in the notebook. Where exactly is the wrong number written?"
      },
      {
        question: "If Rohit scored in 10 matches this season - how many separate score entries does he have? Where are they in the notebook?",
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
      bridgeQuestion: "If all of Vikram's scores belong together - should they also be stored together?",
      hint:            "Think about where Vikram's scores appear in the notebook. Are they near each other - or scattered with gaps and other players between them?"
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
      description: "A teacher needs to track attendance for 35 students across 200 school days, which works out to 35 attendance entries every single day. When the school year ends, the teacher needs to find every absence for one student across the full 200 days. How should she organise the register so this kind of search takes seconds rather than hours?",
      format:      "Describe your approach in full sentences. No Python required yet.",
      sparks: [
        "How many total attendance entries is that?",
        "What does each entry need to record?",
        "How would you find all the absences for one student quickly?"
      ]
    }
  },

  // ══════════════════════════════════════════════════════
  // CASE STUDY 2 - The Tiffin Service Orders
  // Teaches: Dictionaries - grouping by key instead of by position
  // Prerequisite: Cricket Scoreboard (Lists)
  // ══════════════════════════════════════════════════════

  {
    id: "tiffin-service-orders",
    title: "The Tiffin Service Orders",
    subtitle: "When finding one customer's order takes too long",
    description: "Meera runs a tiffin service from her home in Bangalore. Every day she prepares 30 lunch tiffins for 30 different customers, and each one goes to a specific address in a specific city such as Mumbai, Delhi, Pune, or Kochi. When a customer calls to modify their order, Meera has to find their entry in her notebook, but she does not know which page number Mumbai is on. When the customer tells her their name and city instead of a page number, how should Meera reorganise the notebook so she can find them quickly?",
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
      protagonist: "Meera, who runs a tiffin service cooking 30 tiffins daily",
      situation:   "Track 30 daily tiffin orders - city destination, delivery address, tiffin count, and time",
      tension:     "Every afternoon a regular calls to modify their order. Meera opens her notebook and starts flipping. She knows the city - Mumbai, Delhi, Pune - but doesn't know which page number it is.",
      emotion:     "Exhausted from page-flipping through 30 entries just to find one customer's city"
    },

    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt:       "What do you notice about what Meera is managing?",
      expectedKeywords: [
        // Domain vocabulary for tiffin-service-orders's "what data is here"
        "order", "orders", "customer", "customers", "address", "city",
        "cities", "tiffin", "tiffins", "count", "name", "names", "data",
        "number", "numbers", "delivery", "phone", "time"
      ],
      whatToNotice: [
        "30 orders, each going to a different city",
        "Each order has: city name, delivery address, tiffin count, and time",
        "Meera gets called by customers who say their city name - 'I'm in Mumbai', 'I'm in Delhi'"
      ],
      notYetReady: [
        "Only talks about cooking or food",
        "Mentions the physical kitchen or food quality"
      ]
    },

    // ─── Phase 2: First Attempt ─────────────────────────
    firstAttempt: {
      prompt:    "Meera's notebook looks like this:\n\norder1 = 'Mumbai',   addr1 = '12 MG Road, Mumbai',    count1 = 3, time1 = '12:30 PM'\norder2 = 'Delhi',    addr2 = '45 CP, New Delhi',      count2 = 5, time2 = '1:00 PM'\norder3 = 'Kochi',    addr3 = '7 Marine Drive, Kochi', count3 = 2, time3 = '1:30 PM'\n\n...up to order30. Show me - in your own words - what pattern do you see? What happens when a customer calls and says 'I'm in Mumbai'? How does Meera find Mumbai in the notebook?",
      modelGood: "Describes the pattern: numbered orders, each holding a city name and delivery details",
      modelWeak: "Suggests using an app or Excel",
      reveals:   "The learner sees the numbered-entry pattern. The lookup problem is hiding in plain sight."
    },

    // ─── Phase 3: Guided Questions ──────────────────────
    guidedQuestions: [
      {
        question: "A customer calls and says: 'I'm in Mumbai, can you add 2 more tiffins for today?' Meera opens her notebook. She sees order1, order2, order3... up to order30. How does she find which order number is Mumbai?",
        targetsMisconception: "position-based-lookup",
        topic: "the lookup step that shouldn't exist",
        order: 1,
        ifStuck: "The notebook has order1 through order30. To find Mumbai, Meera reads order1, then order2, then order3... until she finds the city name. How many entries might she read before finding it?"
      },
      {
        question: "Meera has 30 orders. A new customer - Priya in Chennai - calls for the first time. Where does her entry go? Does anything else in the notebook change?",
        targetsMisconception: "static-structure",
        topic: "where new entries land",
        order: 2,
        ifStuck: "Does Priya go at the end as order31? Does anything before it change?"
      },
      {
        question: "If Meera wrote the city name directly in the notebook - 'Mumbai' instead of order1, 'Delhi' instead of order2 - does she still need to search through order1, order2, order3 to find a city?",
        targetsMisconception: "position-based-lookup",
        topic: "can the search be bypassed entirely",
        order: 3,
        ifStuck: "If the notebook said 'Mumbai: 12 MG Road, 3 tiffins, 12:30 PM' directly - not as order1 - what does Meera do when a Mumbai customer calls?"
      }
    ],

    // ─── Phase 4: Cognitive Trigger ─────────────────────
    cognitiveTrigger: {
      statement:        "30 orders. Every afternoon, 10 to 15 regular customers call to check or modify their tiffins. Each call takes 2 to 3 minutes of page-flipping to find the right city. That's up to 45 minutes of searching every single day - just to find one customer's entry.",
      presentationNote: "Let the number land. 45 minutes. Not because the data is missing - but because the notebook entries don't carry their own city name.",
      pauseRequired:    true,
      learnerReady:     "Recognises the frustration - 45 minutes of searching every afternoon, just because order1 doesn't tell Meera what city it is",
      learnerNotYet:    "Suggests 'use an app' or 'keep it more organised' - treating the symptom, not the structure"
    },

    // ─── Phase 5: Discovery ─────────────────────────────
    discovery: {
      bridgeQuestion: "What if the notebook already had the city name written directly on it - and Meera just had to read the city name to find the entry? What if order1 didn't exist - and instead the notebook just said:\n\n'Mumbai: 12 MG Road, 3 tiffins, 12:30 PM'\n'Delhi: 45 CP, 5 tiffins, 1:00 PM'\n'Kochi: 7 Marine Drive, 2 tiffins, 1:30 PM'?",
      hint:            "When Meera opens the notebook and sees the word 'Mumbai' written directly on the page - does she need to know what number Mumbai is? Or does she just read it?"
    },

    // ─── Phase 6: Programming Mapping ───────────────────
    programmingMapping: {
      introduction: "What you just described is how a Dictionary works in Python. Each entry has a name - a key - that the notebook carries with it. You don't search by number. You search by name.",
      pythonCode:   "orders = {\n    'Mumbai': {'address': '12 MG Road',   'count': 3, 'time': '12:30 PM'},\n    'Delhi':  {'address': '45 CP',         'count': 5, 'time': '1:00 PM'},\n    'Kochi':  {'address': '7 Marine Drive', 'count': 2, 'time': '1:30 PM'}\n}",
      symbols: [
        { symbol: "orders",                meaning: "One name for the entire orders collection" },
        { symbol: "{",                     meaning: "The dictionary begins here" },
        { symbol: "'Mumbai':",             meaning: "'Mumbai' is the key - the name Meera already knows from the phone call" },
        { symbol: "{'address': ...}",      meaning: "All the order details for Mumbai - the value stored under the key 'Mumbai'" },
        { symbol: ",",                    meaning: "Separates each key-value pair" },
        { symbol: "}",                     meaning: "The dictionary ends here" }
      ],
      miniTask:     "Store the prices of three fruits in a dictionary called fruit_prices. Use the fruit name as the key and the price as the value. Example: apples = 30"
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
        "In Meera's old notebook - order1, order2, order3 - what did she have to know before she could find Mumbai?",
        "In the new system - 'Mumbai': {'address': ...} - what does Meera need to know before she can find Mumbai?",
        "What is the difference between searching by position and searching by name?",
        "In your own life, is there something you look up by name - not by number - that would benefit from this structure?"
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
      title:       "The Neighbourhood Salon",
      description: "Aditi runs a small salon with 25 appointments every day, and each appointment carries a client name, a service type, a time, and a phone number. When a client calls and says 'This is Priya, I have an appointment at 3 PM, can I reschedule?' Aditi needs to find Priya's appointment in seconds, not in minutes. How should Aditi organise today's list so that the lookup by client name is instant?",
      format:      "Describe your approach in full sentences. No Python required yet.",
      sparks: [
        "What does the client know when they call? A name or an appointment number?",
        "How many different ways might Aditi want to look up an appointment - by name, by time, by service?",
        "Would a Dictionary be enough here, or would it need something more?"
      ]
    }
  },

  // ══════════════════════════════════════════════════════
  // EXISTING CASE STUDIES - unchanged
  // Uses old schema (pre-v1.1). tutorController handles gracefully.
  // ══════════════════════════════════════════════════════

  {
    id:    "bakery-checkout",
    title: "The Bakery Checkout",
    subtitle: "Variables hold the price, arithmetic finds the total",
    description: "You are building a checkout system for a small bakery. A customer buys 3 croissants at $2.50 each and 2 coffees at $3.00 each, and the program has to compute the total cost for the till. Before you write any code, what variables would you create, and how would you combine them to print the correct total?",
    requiredConcepts: ["Variables", "Basic Arithmetic"],
    targetInsight: "Understand how to store values in variables and use operators to compute a total.",
    followUpQuestions: ["How would you apply a 10% discount to the total?", "What if the user inputs the number of items?"],
    pythonTopics: ["variables", "math", "data types"],
    starterCode: "croissant_price = 2.50\ncoffee_price = 3.00\n\n# Calculate total here",
    testCases: [
      { input: "", expectedOutput: "13.5" }
    ],
    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt: "Before we write any code, what information is hiding inside this problem? What numbers do we need to remember, and what numbers do we need to compute?",
      expectedKeywords: [
        // Domain vocabulary for bakery-checkout's "what data is here"
        "price", "prices", "cost", "total", "item", "items",
        "quantity", "quantities", "count", "number", "numbers",
        "croissant", "croissants", "coffee", "coffees",
        "data", "value", "values", "subtotal"
      ],
      whatToNotice: [
        "Two separate prices - $2.50 for a croissant, $3.00 for a coffee",
        "Two quantities - 3 croissants and 2 coffees",
        "A relationship: total = (3 \u00d7 2.50) + (2 \u00d7 3.00)"
      ],
      notYetReady: [
        "Jumps straight to writing code without identifying the inputs",
        "Only mentions the answer (the total) without naming the parts that combine to make it"
      ]
    }
  },
  {
    id:    "age-verification-system",
    title: "Age Verification System",
    subtitle: "A single condition decides who gets in",
    description: "A website requires users to be at least 18 years old before they can create an account. The program should read an age variable and print either 'Access Granted' or 'Access Denied'. Before you write the if-statement, what condition should decide whether the user is allowed in?",
    requiredConcepts: ["Conditionals", "Comparison Operators"],
    targetInsight: "Learn to use if/else statements to control the flow of the program based on conditions.",
    followUpQuestions: ["What happens if the age is exactly 18?", "How can you add a message for users under 13?"],
    pythonTopics: ["if statements", "booleans"],
    starterCode: "age = 16\n\n# Add your conditional logic here",
    testCases: [
      { input: "16", expectedOutput: "Access Denied" },
      { input: "20", expectedOutput: "Access Granted" }
    ],
    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt: "What is the rule this program is enforcing, and what piece of data is the rule checking against?",
      expectedKeywords: [
        // Domain vocabulary for age-verification-system's "what data is here"
        "age", "ages", "year", "years", "old", "young", "eighteen",
        "18", "number", "numbers", "data", "threshold", "limit",
        "rule", "check", "condition", "allowed", "denied", "granted"
      ],
      whatToNotice: [
        "The program reads one piece of data - the user's age",
        "There is one threshold - 18 - that splits allowed from denied",
        "The output is one of two fixed messages, decided by a single comparison"
      ],
      notYetReady: [
        "Only describes how to write the if-statement without naming the threshold",
        "Confuses the comparison (>= 18) with the action (print message)"
      ]
    }
  },
  {
    id:    "inventory-stock-checker",
    title: "Inventory Stock Checker",
    subtitle: "A list holds many items, a loop visits each one",
    description: "A store keeps its in-stock items in a Python list: ['Apples', 'Bananas', 'Oranges', 'Milk']. The program needs to walk through the list and print 'Item in stock: <item>' for every entry. Before you write the loop, what is the smallest piece of code that can print just the first item?",
    requiredConcepts: ["Lists", "For Loops"],
    targetInsight: "Understand iteration and how to access elements in a collection sequentially.",
    followUpQuestions: ["How would you only print items that start with 'A'?", "What if you want to count the total number of items?"],
    pythonTopics: ["lists", "loops", "string formatting"],
    starterCode: "inventory = ['Apples', 'Bananas', 'Oranges', 'Milk']\n\n# Loop through the list here",
    testCases: [
      { input: "", expectedOutput: "Item in stock: Apples\nItem in stock: Bananas\nItem in stock: Oranges\nItem in stock: Milk" }
    ],
    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt: "Look at the data the program starts with. What shape does it take, and what would the smallest piece of code that prints just one item look like?",
      expectedKeywords: [
        // Domain vocabulary for inventory-stock-checker's "what data is here"
        "list", "lists", "item", "items", "inventory", "stock",
        "in stock", "loop", "loops", "each", "every", "all",
        "first", "walk", "through", "print", "data", "name", "names"
      ],
      whatToNotice: [
        "The data is a Python list - a single collection holding many items",
        "The order matters: items are visited one after another, starting at the first",
        "Printing one item (the smallest step) hints at why we need a loop to handle many"
      ],
      notYetReady: [
        "Skips past the data shape and goes straight to writing a for-loop",
        "Doesn't notice that there is a single collection, not many separate variables"
      ]
    }
  },

  // ══════════════════════════════════════════════════════
  // CASE STUDY 3 - The Attendance Register
  // Teaches: Lists - one name, many students
  // When "8 became 42", one piece of paper stopped being enough.
  // ══════════════════════════════════════════════════════

  {
    id: "attendance-register",

    title: "The Attendance Register",
    subtitle: "When one piece of paper is no longer enough",
    description: "Arjun is covering Mrs. Iyer's homeroom. On Monday there are 8 students and one printed sheet of names. By Wednesday the names have spilled onto three sheets. On Friday the homeroom merges with another section for a school assembly and there are 42 students. The teacher next door turns to Arjun and says, 'Just give me the list.' Arjun looks at his three sheets and says, 'I don't have a list. I have a pile.' What should Arjun have done differently on Monday to be ready for Friday?",
    requiredConcepts: ["Lists", "Variables"],
    targetInsight: "A list is one name for many things. When more than one thing belongs together, give the group one name instead of many.",
    followUpQuestions: [
      "If a new student joins on Friday, what does Arjun do to add them?",
      "How would Arjun answer 'how many students?' on Wednesday? On Friday?",
      "Why did the teacher say 'the list' and not 'the sheets'?"
    ],
    pythonTopics: ["lists", "len", "append", "indexing"],
    starterCode: "students = []\n\n# Add the 8 students from Monday\n# Then answer: how many students does Arjun have?",
    testCases: [
      { input: "", expectedOutput: "8" }
    ],

    // ─── Learning Objectives ────────────────────────────
    objectives: [
      { id: "obj-1", label: "Recognise when many things belong together" },
      { id: "obj-2", label: "Explain why separate variables break down at scale" },
      { id: "obj-3", label: "Use a Python List to store multiple values under one name" }
    ],

    // ─── The Story ──────────────────────────────────────
    story: {
      setting:     "A school homeroom, Monday through Friday",
      protagonist: "Arjun, the substitute teacher for the week",
      situation:   "Track attendance as new students keep joining throughout the week",
      tension:     "By Friday there are 42 students and Arjun is holding three pieces of paper - and a teacher is waiting for 'the list'",
      emotion:     "The quiet panic of realising the obvious approach has stopped working in front of someone"
    },

    // ─── Phase 1: Observation ───────────────────────────
    observation: {
      prompt: "What is Arjun keeping track of, and how is he keeping track of it?",
      expectedKeywords: [
        "student", "students", "name", "names", "attendance",
        "paper", "papers", "sheet", "sheets", "page", "pages",
        "list", "pile", "register", "roster", "class"
      ],
      whatToNotice: [
        "Arjun is tracking one kind of thing - student names",
        "The number of names grew across the week - 8, then 10, then 14, then 42",
        "The way he tracks them also grew - one sheet, two sheets, three sheets"
      ],
      notYetReady: [
        "Only talks about attendance rules or school policy",
        "Mentions the principal or the assembly but not the data being managed"
      ]
    },

    // ─── Phase 2: First Attempt ─────────────────────────
    firstAttempt: {
      prompt: "If you were Arjun on Monday and you only had a blank piece of paper - no printed sheet - how would you record the 8 students? What would you write down?",
      modelGood: "Writes down the names - one per line - and says 'the paper holds the names'",
      modelWeak: "Suggests using an app, or memorising the names, or asking each student to introduce themselves",
      reveals: "The learner's instinct about what 'recording many of the same kind of thing' looks like before they have a word for it"
    },

    // ─── Phase 3: Guided Questions ──────────────────────
    guidedQuestions: [
      {
        question: "On Wednesday Arjun ran out of room on the first sheet. He grabbed a second piece of paper. Then a third. How many sheets does Arjun have to hold in his head at once now?",
        targetsMisconception: "static-structure",
        topic: "when one container stops being enough",
        order: 1,
        ifStuck: "Three sheets. To answer 'is Aarav here today?', Arjun has to look at all three. How does he know which sheet to look at first?"
      },
      {
        question: "On Friday a teacher asks, 'How many students are here today?' Arjun has three sheets. How does he answer that question?",
        targetsMisconception: "scale-failure",
        topic: "counting across many pieces",
        order: 2,
        ifStuck: "Arjun has to count the names on sheet 1, then sheet 2, then sheet 3, then add them. What if he loses his place on sheet 2?"
      },
      {
        question: "A new student walks in on Friday. Arjun has to add her name. Where does she go - sheet 1, sheet 2, or sheet 3? Does Arjun have to decide, or does it not matter?",
        targetsMisconception: "static-structure",
        topic: "where new entries land",
        order: 3,
        ifStuck: "Pick the sheet that has the most space. But what if a teacher later asks, 'is Meera in this class?' - which sheet does Arjun check first?"
      },
      {
        question: "The teacher said 'the list'. She didn't say 'the sheets'. What do you think she meant by that word?",
        targetsMisconception: "naming-collision",
        topic: "one name for many things",
        order: 4,
        ifStuck: "If the teacher wanted 'the sheets', she would have said 'the sheets'. Why did she say 'the list'? What was she expecting Arjun to hand her?"
      }
    ],

    // ─── Phase 4: Cognitive Trigger ─────────────────────
    cognitiveTrigger: {
      statement:        "On Monday Arjun had 8 names on one sheet. By Friday he had 42 names on three sheets - and a teacher waiting for one thing he did not have.",
      presentationNote: "Say the numbers slowly. Eight. Then ten. Then fourteen. Then forty-two. Then the silence of a teacher waiting.",
      pauseRequired:    true,
      learnerReady:     "Recognises that 'three sheets' is not the same kind of thing as 'one list' - and feels the gap",
      learnerNotYet:    "Says 'just merge the sheets' or 'write smaller' - solving the symptom, not the structure"
    },

    // ─── Phase 5: Discovery ─────────────────────────────
    discovery: {
      bridgeQuestion: "If Arjun could give all the students one name - just one word that refers to every student at once - what would he call it? And what could he ask that one name?",
      hint:            "Pretend Arjun invents a word. He calls the whole class 'roster'. Now he can ask 'how big is the roster?' and 'is Aarav in the roster?' and 'add Meera to the roster'. One name. Many questions."
    },

    // ─── Phase 6: Programming Mapping ───────────────────
    programmingMapping: {
      introduction: "What you just described has a name in Python. It's called a List. One name. Many things. Many questions answered in one line.",
      pythonCode:   "students = [\"Aarav\", \"Diya\", \"Ishaan\", \"Priya\", \"Rohan\", \"Kabir\", \"Anaya\", \"Vivaan\"]",
      symbols: [
        { symbol: "students",                meaning: "One name for the entire class - Arjun's 'roster'" },
        { symbol: "=",                        meaning: "Everything on the right is now stored under this one name" },
        { symbol: "[",                        meaning: "The list begins here" },
        { symbol: "\"Aarav\", \"Diya\", ...", meaning: "Names, separated by commas, in the order Arjun recorded them" },
        { symbol: "]",                        meaning: "The list ends here" }
      ],
      miniTask:     "Add Sara and Arjun-S to the end of the students list. Then print the total count of students using len()."
    },

    // ─── Phase 7: Practice ──────────────────────────────
    practice: [
      {
        task:       "Build the attendance register for Monday. Store the 8 students in a list called students. Then print how many students there are.",
        starterCode: "# Your code here\nstudents = ",
        hint:       "Start with: students = [\"Aarav\", \"Diya\", ...]. Then on a new line write: print(len(students))"
      },
      {
        task:       "Two students join on Tuesday - Sara and another Arjun. Use append to add them to the same list. Print the new count.",
        starterCode: "students = [\"Aarav\", \"Diya\", \"Ishaan\", \"Priya\", \"Rohan\", \"Kabir\", \"Anaya\", \"Vivaan\"]\n\n# Your code here",
        hint:       "students.append(\"Sara\") adds Sara to the end. Do the same for the second student. Then print(len(students))."
      },
      {
        task:       "The teacher asks, 'is Aarav in this class?' Write one line that answers the question.",
        starterCode: "students = [\"Aarav\", \"Diya\", \"Ishaan\", \"Priya\", \"Rohan\", \"Kabir\", \"Ananya\", \"Vivaan\"]\n\n# Your code here",
        hint:       "Use: \"Aarav\" in students  -  Python will say True or False"
      }
    ],

    // ─── Phase 8: Reflection ────────────────────────────
    reflection: {
      questions: [
        "On Wednesday Arjun had three sheets. On Friday he had a pile. What is the difference between a pile and a list?",
        "If you had to explain Lists to a friend who has never coded, what would you say?",
        "In your own life, where do you already keep a list? What would happen if you had to remember all of it in your head instead?",
        "Why did the teacher say 'the list' and not 'the sheets'?"
      ],
      confidenceSurvey: [
        {
          conceptId:    "obj-1",
          conceptLabel: "Recognising when many things belong together",
          prompt:       "How confident do you feel about knowing when to group things under one name?"
        },
        {
          conceptId:    "obj-2",
          conceptLabel: "Why multiple variables stop working",
          prompt:       "How confident are you about explaining why separate variables break at scale?"
        },
        {
          conceptId:    "obj-3",
          conceptLabel: "Python List",
          prompt:       "How confident do you feel about writing your first Python List?"
        }
      ],
      optional: false
    }
  }
];

module.exports = seedData;