// backend/misconceptions/scale-failure.js
// Misconception: "What works for 5 items works for 50"

module.exports = {
  id: "scale-failure",

  tag: "scale",
  family: "data-organisation",

  misconception: {
    text:          "It works fine for 11 players. It'll work for 80 too — just more of the same",
    whyItFeelsTrue:"11 players worked perfectly. The system is sound. Scale is just more quantity, not a new problem",
    whyItFails:    "At 80 players the problem is not quantity — it is structure. More of the wrong structure does not become the right structure",
    failsAt:       "When the time to search, correct, or compare exceeds what a human can manage"
  },

  questions: [
    "11 players worked fine. What exactly worked? What specifically was easy about it?",
    "What is the difference between '11 players is slow' and '80 players is impossible'? Where is the breaking point?",
    "If Arjun had 200 players, would the problem be 'twice as hard' or 'a completely different kind of problem'?"
  ],

  hint: "11 players = 22 lines. 80 players = 160 lines. At what point does 'more lines' become 'a fundamentally different problem'?",

  signals: {
    reached: [
      "it's not about more, it's about structure",
      "at some point the approach itself breaks",
      "80 is different in kind, not just amount",
      "you can't scale your way out of a structural problem"
    ],
    notYet: [
      "just hire more people to enter data",
      "80 isn't that many",
      "faster typing solves it"
    ]
  }
};