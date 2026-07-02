# PyBe Prototype

PyBe is a MERN-stack prototype aimed at teaching Python through reasoning-first learning. 

## Project Structure
The repository is split into two main directories:
- `frontend/`: React + Vite application featuring a Monaco editor and React Router.
- `backend/`: Node.js + Express application with MongoDB Atlas, integrating Gemini API and Piston API.

## Installation Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (for database)
- Gemini API Key (for AI Tutor)
- Access to a Piston API instance (for code execution)

### 1. Setup Backend
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install express mongoose dotenv cors axios
npm install --save-dev nodemon
```

Start the backend server:
```bash
npm run dev
# (Optional) You can add a dev script to your backend/package.json:
# "scripts": { "dev": "nodemon server.js" }
```

### 2. Setup Frontend
Open another terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm install react-router-dom @monaco-editor/react
```

Start the frontend development server:
```bash
npm run dev
```

## End-to-End Flow
The prototype is now fully functional and supports the complete learner journey:
1. **Home Page (`/`)**: Displays all available Case Studies fetched dynamically from MongoDB.
2. **Case Study Overview (`/case-study/:id`)**: Presents the scenario and learning objectives before any code is written.
3. **AI Tutor Session (`/tutor/:id`)**: A split-screen chat interface powered by Gemini. The IDE is locked while the student explains their reasoning. Once the AI detects the core insight is reached, the student is allowed to proceed.
4. **Coding Challenge (`/challenge/:id`)**: A full-screen IDE using Monaco Editor. Students can write code, manually run it via the **Piston API**, or submit it for grading against hidden test cases. 
5. **Deterministic Evaluation**: The backend runs the code against MongoDB test cases and parses runtime errors (Syntax, Indentation, Name, etc.) and logic errors to provide concept-specific retry hints *without* using AI.

## Final Status
- **Frontend**: React + Vite, React Router, Monaco Editor, Lucide Icons, Custom CSS Glassmorphism Design System.
- **Backend**: Node.js, Express, Mongoose, Gemini SDK.
- **External Services**: MongoDB Atlas (Data), Gemini 1.5 Flash (Tutor), Piston API (Execution).
