const seedData = [
  {
    title: "The Cricket Scoreboard",
    description: "Arjun plays cricket in a local league. Every Sunday after a match, he writes down the scores of all eleven players. With 11 players, the notebook works fine. But then the league expands to 80 players across multiple teams, and he needs to track 10 matches per season — 800 individual scores. He needs to find highest scorers, calculate averages, and compare teams. His notebook has all the data, but answering even simple questions takes hours.",
    requiredConcepts: ["Variables", "Data Organisation", "Grouping Related Values"],
    targetInsight: "Discover that storing related values under individual variable names breaks at scale — and that grouping them under one name solves the problem.",
    followUpQuestions: [
      "What other real-world situations have the same structure as Arjun's problem?",
      "How would a teacher's markbook face the same challenge?",
      "What if you needed to track scores across 10 seasons instead of one?"
    ],
    pythonTopics: ["variables", "lists", "data types"],
    starterCode: "# Store all 11 players' scores\n# Then find the highest score\n# Then calculate the team average",
    testCases: []
  },
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
