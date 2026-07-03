// backend/misconceptions/position-based-lookup.js
// Misconception: "Looking up by position number is the natural way to access data"

module.exports = {
  id: "position-based-lookup",

  tag: "lookup",
  family: "data-organisation",

  misconception: {
    text:          "If I know a student's roll number — student23 — I can find their marks quickly. The numbering system is the access path.",
    whyItFeelsTrue:"In a notebook, pages are numbered. In a list, position 1, 2, 3 is how you find things. Roll numbers are like page numbers.",
    whyItFails:    "To look up by position you must first know the position. But the position is not what the parent knows — they know the name. The position is an internal detail Priya has to maintain. And if a student transfers, all subsequent positions shift.",
    failsAt:       "When the person asking doesn't know the position — they only know the name. When students transfer in or out and positions change."
  },

  questions: [
    "What does Priya need to know before she can look up Ayaan's marks? Does she need to remember that Ayaan is student23?",
    "If a parent asks for 'Ayaan's total' — does Ayaan know his own roll number? Does the parent?",
    "If Ayaan transfers to another school and is removed from the register — what happens to student24, student25, and all the students after him? Do their numbers change?"
  ],

  hint: "The roll number is an internal label Priya maintains. The name is what everyone — parents, students, other teachers — naturally uses. Which one should be the access path?",

  signals: {
    reached: [
      "you need to know the roll number first",
      "names are what people know, not roll numbers",
      "if a student transfers the numbers change",
      "the roll number is an internal detail",
      "the parent doesn't know student23"
    ],
    notYet: [
      "just remember the roll number",
      "roll numbers are fine for lookups",
      "you can learn the numbers"
    ]
  }
};