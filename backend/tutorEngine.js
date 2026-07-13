// backend/tutorEngine.js
// Tutor Engine Schema — implemented once, applies to ALL case studies.
// Content creators never touch this file.
// Updated to match Case Study Schema v1.1

module.exports = {

  // ─── Engine Config ─────────────────────────────────────
  engine: {
    version:        1,
    // gemini-2.5-flash retired for new API keys (404 with AQ.* keys).
    // gemini-3.5-flash is Google's recommended replacement (May 2026).
    // fallbackModel used when the primary returns 404 or 503.
    model:          "gemini-3.5-flash",
    fallbackModel:  "gemini-3.1-flash-lite",
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
      forcePause:   true,
      // The trigger statement lands as a TWO-BEAT moment:
      //   beat 1 - surface the statement, wait for the learner to acknowledge
      //   beat 2 - validate their reaction, bridge into discovery
      // The controller will NOT advance to discovery until the learner has
      // produced a substantive reaction (not just "yes" / "wow" / "ok").
      // See minAcknowledgmentWords in transitions config below.
      requiresAcknowledgment: true
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
      check: "learner_acknowledged_the_problem",
      // v1.1: The trigger statement is a pedagogical beat, not a passing
      // question. We require BOTH a scale signal AND a minimum word count
      // so the learner is forced to actually sit with the discomfort
      // instead of just typing "ok" to advance. The Socratic contract
      // depends on this moment landing.
      conditions: [
        "learner_response_contains_scale_signal",
        "learner_response_acknowledges_discomfort",
        "minimum_acknowledgment_length"
      ],
      minAcknowledgmentWords: 6
    },

    discovery_to_programmingMapping: {
      check: "learner_expressed_grouping_intent",
      // v1.1: discovery is where the learner articulates the insight.
      // A single-word "yes" or "yeah" is a wave-through, not articulation.
      // Require the grouping vocabulary AND a minimum word count so the
      // learner has to express the idea in their own words.
      conditions: [
        "learner_response_contains_grouping_signal",
        "minimum_articulation_length"
      ],
      minArticulationWords: 5
    },

    programmingMapping_to_practice: {
      check: "learner_acknowledged_understanding",
      // v1.1: same fix as discovery. "okay" / "i see" are acks, not
      // articulation. Require >= 5 words so the learner has to say
      // something real about how the syntax maps to their insight.
      conditions: [
        "learner_response_contains_understanding_signal",
        "minimum_articulation_length"
      ],
      minArticulationWords: 5
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
      // Persona-voice fallback messages. These are shown to the LEARNER
      // when something technical goes wrong (rate-limit, timeout, parse
      // failure). The job of these strings is to make infrastructure
      // failures invisible to the learner while still letting them continue.
      // Never leak SDK error codes, "429", "rate-limit", "Gemini", etc.
      // The learner just needs to feel the tutor paused to think.
      error:     "Give me a moment — I'm thinking that one through. Could you rephrase what you just said, in your own words?",
      timeout:   "That one took me a beat longer than I'd like. Let's pick it back up — what were you saying?",
      unknown:   "Hmm, I want to make sure I'm following you. Could you say that a different way?",
      rateLimit: "Hold on a sec — I'm gathering my thoughts. Your last message is safe with me. Try sending it again in a moment."
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