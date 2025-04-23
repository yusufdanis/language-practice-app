# Language Practice App

A simple web application built with React and TypeScript to help users practice English vocabulary using definitions.

## Features

-   Displays English definitions.
-   Requires users to select the matching English word from multiple choices.
-   Provides feedback on correct/incorrect answers.
-   Shows Turkish translations and definitions.
-   Session-based learning (10 questions per session).
-   Mobile-first responsive design.

## Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm (or yarn/pnpm)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd language-practice-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

```bash
npm run dev
```

This will start the Vite development server, usually at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

This command bundles the application into the `dist` directory for deployment.

## Data Source

The vocabulary data is sourced from the `definitions.json` file located in the project root. This file contains an array of objects, each with the following structure:

```json
{
  "word_en": "EnglishWord",
  "definition_en": "English definition of the word.",
  "word_tr": "TurkishEquivalent",
  "definition_tr": "Turkish definition or explanation."
}
```
