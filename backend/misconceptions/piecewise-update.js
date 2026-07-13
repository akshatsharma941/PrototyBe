// backend/misconceptions/piecewise-update.js
// Misconception: "Just change the one field of the record that needs updating"

module.exports = {
  id: "piecewise-update",

  tag: "immutability",
  family: "data-organisation",

  misconception: {
    text:          "If the train number is wrong on the slip, just cross it out and write the new number. If the seats count drops, just change the seats number on the same slip.",
    whyItFeelsTrue:"Pens are for correcting mistakes. In the physical world, crossing out a number and writing over it is the natural fix. The slip stays the slip - only one part of it changes.",
    whyItFails:    "When Priya crosses out '12952' and writes '12137' on the same slip, the slip is no longer the slip it was. It has lost its identity - it is now a half-old, half-new record. The next clerk who picks it up cannot tell whether the train name on the slip still matches the train number on it. The slip has become untrustworthy. The right move is to throw the slip away and write a fresh, complete slip.",
    failsAt:       "When multiple pieces of information belong together as one identity, and changing one piece in place corrupts the meaning of the others. When the same record needs to be re-shared, re-printed, or re-validated after any field changes."
  },

  questions: [
    "Priya crossed out 12952 and wrote 12137 on the same slip. The train name on the slip still says 'Mumbai Rajdhani'. Is the slip now for the Rajdhani, or for the new train 12137? Which piece is telling the truth?",
    "If two clerks now look at the slip - one sees the train number, one sees the train name - do they agree on which train this slip is for?",
    "What if instead of crossing out, Priya threw the slip in the bin and wrote a fresh, complete slip from scratch? Is there any information she would lose?",
    "When Priya needs to update the seat count, does she change 'seats: 4' to 'seats: 3' on the same slip, or does she write a brand-new slip with 'seats: 3'?"
  ],

  hint: "Crossing out a number and writing over it keeps the paper but loses the truth. A fresh slip costs one extra piece of paper - but the paper is now fully correct, fully readable, fully trustworthy.",

  signals: {
    reached: [
      "the slip is no longer the same slip",
      "i would lose the old value",
      "you have to replace the whole thing",
      "changing one part corrupts the others",
      "it's not just one field - it's an identity",
      "a fresh slip is more trustworthy",
      "the pieces belong together, you can't just swap one"
    ],
    notYet: [
      "just change the one number",
      "cross it out and overwrite",
      "the slip is still the same slip",
      "i only need to update one field"
    ]
  }
};