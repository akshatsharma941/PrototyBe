// backend/misconceptions/static-structure.js
// Misconception: "Inserting in the middle just means renumbering"

module.exports = {
  id: "static-structure",

  tag: "structure",
  family: "data-organisation",

  misconception: {
    text:          "If a new player joins mid-season, you just insert them and renumber everything after",
    whyItFeelsTrue:"Renumbering is a familiar task. It is just bookkeeping. One-time effort",
    whyItFails:    "At 80 players, renumbering means touching every single line after the insertion point. One new player might require changing 40 line numbers. What if 5 players join?",
    failsAt:       "When the data is dynamic — players join, leave, transfer — and renumbering becomes a recurring nightmare"
  },

  questions: [
    "A new player joins between player5 and player6. What lines need to change? How many lines is that?",
    "What if 5 new players joined this season? How many lines would you renumber?",
    "If a player leaves mid-season, do you remove their entries or leave gaps? What does removing do to the numbering?"
  ],

  hint: "Renumbering once is manageable. Renumbering every time a player joins or leaves — is that still a small task?",

  signals: {
    reached: [
      "renumbering every time is a nightmare",
      "what if 10 players join",
      "it's not a one-time cost, it's every time",
      "the numbering is inherently fragile"
    ],
    notYet: [
      "you just do it once",
      "it's not that many lines",
      "you can use gaps"
    ]
  }
};