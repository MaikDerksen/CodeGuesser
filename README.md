# Code Guesser 🧠

Code Guesser is an interactive web game that challenges you to identify the programming language from a given code snippet. The snippets are intentionally obfuscated based on a selected difficulty level, making the game a fun test of your language-syntax knowledge.

![Code Guesser Screenshot](https://placehold.co/800x600.png)
*(Replace this with a screenshot of your application)*

## Features ✨

- **Dynamic Code Snippets**: Fetches unique code snippets for a wide variety of programming languages.
- **Variable Difficulty**: Four difficulty levels to test your skills:
    - **EASY**: Multi-line, properly indented snippet with full syntax highlighting.
    - **MEDIUM**: Multi-line, properly indented snippet in plain text with no highlighting.
    - **HARD**: A single-line snippet with all non-essential whitespace removed.
    - **HARDCORE**: A single-line snippet with no whitespace and 1-3 random tokens replaced with underscores (`_`).
- **Instant Difficulty Switching**: Change the difficulty of the current snippet on the fly without losing your round.
- **Stats Tracking**: Keep track of your score, streak, and win percentage (stored in your browser's local storage).
- **Responsive Design**: Play on any device, from a desktop to a mobile phone.
- **AI-Powered**: Leverages Google's Generative AI (via Genkit) to generate and transform the code snippets in real-time.

## Tech Stack 🛠️

This project is built with a modern, type-safe, and performant tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI**: [Genkit (Google's Generative AI Toolkit)](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started 🚀

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or another package manager like yarn or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/code-guesser.git
    cd code-guesser
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Google AI API key. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    The application runs on two processes: the Next.js frontend and the Genkit AI server.

    - **Start the Genkit server in one terminal:**
      ```bash
      npm run genkit:watch
      ```
    - **Start the Next.js server in another terminal:**
      ```bash
      npm run dev
      ```

5.  **Open the application:**
    Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

## How It Works 🤖

The core logic of the game is powered by a Genkit flow defined in `src/ai/flows/generate-code-snippet.ts`. This flow uses a prompt to instruct a Google AI model (Gemini) to generate a code snippet and format it according to the rules for the selected difficulty.

The frontend, built with Next.js and React, calls this flow via a Server Action (`src/app/actions.ts`). The state is managed using React hooks, and the UI is built with reusable components from ShadCN.
