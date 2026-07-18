# Product Requirements Document: PyBe

## 1. Product Vision
**PyBe** is a next-generation interactive learning platform designed to teach Python by prioritizing computational thinking and reasoning over raw syntax memorization. The core philosophy is: *"Learn to think like a programmer. Python becomes the easy part."*

Unlike traditional platforms that immediately ask users to write code, PyBe utilizes an AI-driven Socratic tutor (named **Pycrates**) to guide learners through the logical formulation of a problem in plain English. Only once the logic is fully articulated does the platform reveal the corresponding Python syntax for implementation.

## 2. Target Audience
- Complete beginners to programming.
- Individuals who struggle with the abstract nature of code syntax and prefer conceptual, logic-first learning.
- Self-taught developers seeking a structured, gamified curriculum.

## 3. Core Features & Requirements

### 3.1. Socratic AI Tutor (Pycrates)
- **Role**: Act as a reasoning-first tutor using the Gemini AI API.
- **Behavior**: Must strictly adhere to Socratic methods. It is explicitly forbidden from providing the final solution or code syntax prematurely.
- **Concept Reveal**: Once the user successfully reasons through the problem, Pycrates unlocks the relevant "Concept" (e.g., Variables, Loops) and transitions to teaching the syntax via a reference panel.
- **Fallback Mode**: In the absence of an API key, the system must gracefully fall back to a hardcoded mock conversation flow to allow offline UI testing.

### 3.2. Curriculum Progression System
- **Structure**: Content is divided into sequential **Levels**, each containing multiple **Missions** (e.g., Level 1: The Basics of Tracking -> Mission: The Coffee Shop Tracker).
- **Gamification Elements**:
  - **XP (Experience Points)**: Awarded upon successful mission completion.
  - **Discovered Concepts**: A dynamic inventory of programming concepts unlocked by the user.
- **Visual Mapping**: A "Level Selection" dashboard featuring an interactive node-based map, indicating locked/unlocked status and percentage completion per level.

### 3.3. Mission Experience (Workspace)
- **Four-Phase Pedagogy**:
  1. **Mission Brief**: The user is presented with a real-world scenario (not a coding puzzle).
  2. **Reasoning Phase**: The user converses with Pycrates in plain English to solve the scenario.
  3. **Python Translation**: Pycrates teaches the syntax to translate the reasoned logic into Python.
  4. **Coding Phase**: The user implements the code.
- **State Management**: Navigating between missions must cleanly remount the workspace, ensuring chat history, code, and phase state are reset for the new context.

### 3.4. Integrated Code Editor & Evaluation Engine
- **Editor**: Embedded code editor (Monaco Editor) with Python syntax highlighting and dark mode theming.
- **Test Execution**: 
  - Code must be sent to the backend execution server.
  - The evaluator must run the user's code against predefined test cases (Input / Expected Output).
  - Validation requires an *exact* string match between the actual output and expected output.
- **Completion Flow**: Upon passing all tests and clicking submit, a "Mission Accomplished" modal overlay appears, summarizing the lesson learned, intuition built, and XP gained, offering seamless routing to the next mission.

## 4. Technical Architecture

### 4.1. Frontend
- **Framework**: React.js / Vite
- **Styling**: Vanilla CSS utilizing modern aesthetics (vibrant accents, dark modes, glassmorphism, dynamic micro-animations).
- **State Management**: React Context (`ProgressContext.jsx`) for global progression data (XP, unlocked levels).

### 4.2. Backend
- **Framework**: Node.js / Express
- **AI Integration**: `@google/generative-ai` SDK (Gemini 1.5 Flash).
- **Code Execution**: Local execution engine endpoint (`/api/execute`) capable of receiving Python code and `stdin`, executing it securely, and returning `stdout`/`stderr`.
- **Database**: MongoDB (via `mongoose` and `mongodb-memory-server` for local development/prototyping).

## 5. Non-Functional Requirements
- **Design Aesthetics**: The UI must feel premium, modern, and engaging. Extensive use of curated HSL color palettes, smooth gradients, and interactive hover states (e.g., the interactive Python snake logo).
- **Performance**: The frontend must remain responsive during AI generation (utilizing loading indicators like *"Pycrates is thinking..."*).
- **Scalability**: The curriculum structure (`mockData.js`) must be designed so it can easily be migrated to a persistent database model in the future without breaking frontend components.
