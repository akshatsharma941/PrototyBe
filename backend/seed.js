const mongoose = require('mongoose');
const CaseStudy = require('./models/CaseStudy');
require('dotenv').config();

const seedData = [
  {
    title: "The Bakery Checkout",
    description: "You're building a checkout system for a bakery. A customer buys 3 croissants ($2.50 each) and 2 coffees ($3.00 each). Write a program to calculate the total cost.",
    requiredConcepts: ["Variables", "Basic Arithmetic"],
    targetInsight: "Understand how to store values in variables and use operators to compute a total.",
    followUpQuestions: ["How would you apply a 10% discount to the total?", "What if the user inputs the number of items?"],
    pythonTopics: ["variables", "math", "data types"],
    starterCode: "croissant_price = 2.50\ncoffee_price = 3.00\n\n# Calculate total here",
    testCases: [
      { input: "", expectedOutput: "13.5" } // Or whatever validation fits
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

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pybe')
  .then(async () => {
    console.log('MongoDB connected for seeding...');
    await CaseStudy.deleteMany({});
    console.log('Cleared existing case studies');
    await CaseStudy.insertMany(seedData);
    console.log('Successfully seeded case studies');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
  });
