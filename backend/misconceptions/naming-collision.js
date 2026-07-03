// backend/misconceptions/naming-collision.js
// Misconception: "Better variable names will fix the organisation problem"

module.exports = {
  id: "naming-collision",

  tag: "naming",
  family: "data-organisation",

  misconception: {
    text:          "If I rename score1 to RohitsScore, the system will be organised enough",
    whyItFeelsTrue:"Renaming feels like solving the problem. The notebook looks neater",
    whyItFails:    "Renaming changes the label. It does not change how values relate to each other. At 80 players, you still cannot answer 'team average' in one step",
    failsAt:       "When you need to process, search, compare, or aggregate the group as a whole"
  },

  questions: [
    "You renamed score1 to RohitsScore. What changed in the notebook? What did NOT change?",
    "If Rohit played 10 matches, how many separate entries does he have? Can you find his best score in one step?",
    "If you renamed everything perfectly — RohitScore, VikramScore, SameerScore — could you find the team average? Why or why not?"
  ],

  hint: "Renaming changes the label on the box. But does it change what is inside the box? Does it change how all of Rohit's scores relate to each other?",

  signals: {
    reached: [
      "the structure is the same",
      "naming doesn't change the data",
      "I still have 80 separate entries",
      "it's still just labels",
      "I can't process them together"
    ],
    notYet: [
      "if I rename everything it'll be fine",
      "I just need better labels",
      "score1, score2 should be RohitScore1, RohitScore2"
    ]
  }
};