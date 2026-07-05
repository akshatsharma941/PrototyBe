// backend/tutorEngine.js
// Tutor Engine Schema — implemented once, applies to ALL case studies.
// Content creators never touch this file.
// Updated to match Case Study Schema v1.1

module.exports = {

  // ─── Engine Config ─────────────────────────────────────
  engine: {
    version:        1,
    // gemini-1.5-flash retired (404). gemini-2.0-flash / -lite / -pro are
    // returning 429 quota-exceeded on this key, but gemini-2.5-flash still
    // has free-tier headroom. Use it.
    model:          "gemini-2.5-flash",
    temperature:    0.7,
    responseFormat: "json",
    timeout:        30000
  },

  // ─── Phase Definitions ─────────────────────────────────
  // Order matters — learner passes through phases in sequence.
  // mustAdvance: false means the phase can be skipped.

  phases: {
    observation: {
      order:        1,
      name:         "observation",
      label:        "Observe",
      description:  "Learner reads the scenario and states what they notice",
      mustAdvance:  true,
      minTurns:     1
    },

    firstAttempt: {
      order:        2,
      name:         "firstAttempt",
      label:        "First Attempt",
      description:  "Learner proposes their natural, intuitive solution",
      mustAdvance:  true,
      minTurns:     1
    },

    guidedQuestions: {
      order:        3,
      name:         "guidedQuestions",
      label:        "Guided Exploration",
      description:  "Socratic questions expose weaknesses in the learner's current model",
      mustAdvance:  true,
      minTurns:     1
    },

    cognitiveTrigger: {
      order:        4,
      name:         "cognitiveTrigger",
      label:        "Cognitive Conflict",
      description:  "The moment the learner's model breaks",
      mustAdvance:  true,
      minTurns:     1,
      forcePause:   true
    },

    discovery: {
      order:        5,
      name:         "discovery",
      label:        "Discovery",
      description:  "Learner reaches the insight through a Socratic bridge",
      mustAdvance:  true,
      minTurns:     1
    },

    programmingMapping: {
      order:        6,
      name:         "programmingMapping",
      label:        "Programming Mapping",
      description:  "Connect the discovered concept to Python syntax",
      mustAdvance:  true,
      minTurns:     1
    },

    practice: {
      order:        7,
      name:         "practice",
      label:        "Practice",
      description:  "Learner writes their first code",
      mustAdvance:  false,
      minTurns:     0
    },

    reflection: {
      order:        8,
      name:         "reflection",
      label:        "Reflection",
      description:  "Metacognitive consolidation and confidence rating",
      mustAdvance:  false,
      minTurns:     0
    }
  },

  // ─── Transition Rules ──────────────────────────────────
  // Generic conditions for phase-to-phase advancement.
  // The tutorController evaluates these using case study content
  // and the learner's response.

  transitions: {
    observation_to_firstAttempt: {
      check: "learner_mentioned_data_elements"
      // Learner mentioned names, numbers, scores, players, entries
    },

    firstAttempt_to_guidedQuestions: {
      check: "learner_proposed_an_approach"
      // Learner described a labelling or organisation strategy
    },

    guidedQuestions_to_cognitiveTrigger: {
      check:   "learner_showed_scale_awareness",
      // Requires: (a) min guided questions answered AND (b) scale signal in response
      conditions: ["min_guided_questions_asked", "learner_response_contains_scale_signal"]
    },

    cognitiveTrigger_to_discovery: {
      check: "learner_acknowledged_the_problem"
      // Learner said something like "that's too many", "I can't manage that", "this is impossible"
    },

    discovery_to_programmingMapping: {
      check: "learner_expressed_grouping_intent"
      // Learner said yes, group, together, same name, same place, etc.
    },

    programmingMapping_to_practice: {
      check: "learner_acknowledged_understanding"
      // Learner said okay, I see, that makes sense, etc.
    },

    practice_to_reflection: {
      check: "task_attempted_or_skipped"
    }
  },

  // ─── Retry and Hint Logic ───────────────────────────────
  retry: {
    maxAttemptsPerQuestion: 3,

    hintLevels: [
      {
        after:    1,
        message:  "Let's look at this together. re-read the last question."
      },
      {
        after:    2,
        message:  "Try thinking about it from the perspective of the notebook — where would the entry physically be?"
      },
      {
        after:    3,
        message:  "Here is a hint from the misconception library: [hint]"
      }
    ],

    offTrack: {
      phrases:   ["unrelated to the scenario", "answering a different question", "asking about syntax early"],
      redirect:  "Let's step back. The question I asked was about [topic]. What do you think?"
    }
  },

  // ─── Tutor Persona ──────────────────────────────────────
  persona: {
    name:  "PyBe Tutor",
    style: "Socratic, warm, precise. Like a senior developer mentoring a junior — never gives the answer, always finds the right question.",

    rules: [
      "Never reveal the solution directly. Ask toward it.",
      "Ask ONE question at a time. Wait for the response.",
      "If the learner is silent or stuck, use the misconception hint.",
      "If the learner reaches the insight, validate it clearly before advancing.",
      "Do not rush any phase. Let the discomfort land.",
      "When the learner struggles, fall back to the guidedQuestions[].ifStuck field."
    ],

    fallback: {
      error:     "I had trouble processing that. Could you try rephrasing?",
      timeout:   "I ran out of time thinking about that. Let's continue.",
      unknown:   "I'm not sure I understood that correctly. Could you say it differently?",
      rateLimit: "The AI tutor is currently busy (rate-limit reached). Please wait a few seconds and try again — your last message is still saved."
    }
  },

  // ─── Response Format ────────────────────────────────────
  response: {
    required: ["message", "phase", "status"],
    optional: ["questionIndex", "misconceptionHint", "phaseProgress", "isLastQuestion"],

    statusValues: {
      "needs_guidance":   "Tutor should continue asking questions in this phase",
      "insight_reached":  "Learner reached the insight — advance to next phase",
      "phase_complete":   "Current phase done — advance to next phase",
      "session_complete": "All phases finished — end the session",
      "retry":            "Learner is stuck — offer a hint and retry"
    }
  }
};