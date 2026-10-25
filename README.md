# GPT-4o mini Studio & Benchmark Arena

A full-stack developer playground, benchmark intelligence suite, cost calculator, and model arena for OpenAI's GPT-4o mini and Google Gemini.

---

## How to Run in Visual Studio Code

### 1. Open in VS Code
- Open VS Code.
- Go to **File** > **Open Folder...** (or press `Ctrl+O` / `Cmd+O`) and select this project directory.
- Alternatively, in your terminal run:
  ```bash
  code .
  ```

---

### 2. Open Integrated Terminal
- Press **``Ctrl + ` ``** (Windows/Linux) or **``Cmd + ` ``** (Mac) to open the VS Code terminal.

---

### 3. Install Dependencies
In the terminal, run:
```bash
npm install
```

---

### 4. Configure Environment Variables
1. Copy `.env.example` to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in VS Code and set your Google Gemini API key:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
   *(You can obtain a free key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

---

### 5. Start the Application
Run:
```bash
npm run dev
```

Or press **`F5`** (using the included `.vscode/launch.json` configuration).

---

### 6. View in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express + Vite full-stack server with hot reload |
| `npm run build` | Builds the client application for production in `/dist` |
| `npm run lint` | Runs TypeScript type-checking |
| `npm start` | Runs the production server (`tsx server.ts`) |
