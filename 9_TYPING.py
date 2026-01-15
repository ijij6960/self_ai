from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer


HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Glass Typing Challenge</title>
  <style>
    :root {
      color-scheme: dark;
      --glass-bg: rgba(15, 25, 45, 0.45);
      --glass-border: rgba(255, 255, 255, 0.18);
      --glass-highlight: rgba(255, 255, 255, 0.22);
      --accent: #7de3ff;
      --accent-strong: #5d9bff;
      --warning: #ff6b6b;
      --success: #50fa7b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: "SF Pro Display", "Helvetica Neue", system-ui, -apple-system, sans-serif;
    }

    body {
      min-height: 100vh;
      background: radial-gradient(circle at top left, #2c5364 0%, #203a43 45%, #0f2027 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #f8f9ff;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 45%),
        radial-gradient(circle at 80% 0%, rgba(125, 227, 255, 0.28), transparent 40%),
        radial-gradient(circle at 80% 90%, rgba(93, 155, 255, 0.2), transparent 45%);
      filter: blur(0px);
      z-index: -1;
    }

    .app {
      width: min(1100px, 100%);
      display: grid;
      grid-template-columns: minmax(240px, 320px) 1fr;
      gap: 24px;
    }

    .glass {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 24px;
      backdrop-filter: blur(18px);
      box-shadow: 0 30px 60px rgba(5, 12, 24, 0.5);
    }

    .sidebar h1 {
      font-size: 26px;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }

    .sidebar p {
      font-size: 14px;
      color: rgba(248, 249, 255, 0.72);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .stat {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 14px;
    }

    .stat:last-child {
      border-bottom: none;
    }

    .stat span:last-child {
      font-weight: 600;
      color: var(--accent);
      font-size: 18px;
    }

    .main {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .toolbar button,
    .toolbar select {
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
      padding: 10px 18px;
      background: rgba(20, 30, 60, 0.4);
      color: inherit;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toolbar button:hover,
    .toolbar select:hover {
      border-color: var(--glass-highlight);
      transform: translateY(-1px);
    }

    .toolbar button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .prompt {
      font-size: 22px;
      line-height: 1.6;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .prompt-text {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      font-weight: 500;
    }

    .prompt-text span {
      padding: 2px 0;
      border-bottom: 2px solid transparent;
    }

    .prompt-text span.correct {
      color: var(--success);
    }

    .prompt-text span.incorrect {
      color: var(--warning);
      border-bottom-color: var(--warning);
    }

    .prompt-text span.active {
      border-bottom-color: var(--accent);
    }

    .input-area {
      width: 100%;
      min-height: 110px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(10, 18, 36, 0.5);
      color: inherit;
      padding: 16px;
      font-size: 18px;
      resize: none;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .input-area:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(93, 155, 255, 0.2);
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: rgba(248, 249, 255, 0.65);
    }

    .badge {
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(125, 227, 255, 0.15);
      color: var(--accent);
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .app {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="backdrop"></div>
  <div class="app">
    <aside class="glass sidebar">
      <h1>English Typing Flow</h1>
      <p>
        Focus on rhythm and accuracy. Each prompt is designed to feel like a calm, Apple-inspired
        glassmorphism dashboard.
      </p>
      <div class="stat">
        <span>WPM</span>
        <span id="wpm">0</span>
      </div>
      <div class="stat">
        <span>Accuracy</span>
        <span id="accuracy">100%</span>
      </div>
      <div class="stat">
        <span>Time</span>
        <span id="time">0s</span>
      </div>
      <div class="stat">
        <span>Completed</span>
        <span id="completed">0</span>
      </div>
    </aside>

    <main class="main glass">
      <div class="toolbar">
        <button id="start">Start Session</button>
        <button id="next" disabled>Next Prompt</button>
        <select id="difficulty">
          <option value="easy">Easy flow</option>
          <option value="medium" selected>Focused mode</option>
          <option value="hard">Deep focus</option>
        </select>
        <span class="badge" id="status">Ready</span>
      </div>
      <section class="prompt">
        <div class="prompt-text" id="prompt"></div>
        <textarea class="input-area" id="input" placeholder="Start typing here..." disabled></textarea>
      </section>
      <div class="footer">
        <span>Tip: Keep your shoulders relaxed and let the words flow.</span>
        <span id="progress">0 / 0</span>
      </div>
    </main>
  </div>

  <script>
    const prompts = {
      easy: [
        "Soft light drifts across the desk as the morning begins.",
        "A calm rhythm of keys makes the task feel effortless.",
        "Typing slowly at first helps build perfect accuracy."
      ],
      medium: [
        "Glass reflections shimmer while the cursor waits for deliberate input.",
        "Focus on each word, letting mistakes fade with steady correction.",
        "Keep a smooth pace and watch the letters align with the prompt."
      ],
      hard: [
        "Precision matters: every keystroke should mirror the sentence ahead.",
        "The glow of the interface stays serene even as speed increases.",
        "Stay composed and let consistent breathing guide your typing flow."
      ]
    };

    const state = {
      currentText: "",
      startTime: null,
      timer: null,
      completed: 0,
      completedChars: 0,
      completedMistakes: 0,
      currentTyped: 0,
      currentMistakes: 0
    };

    const promptEl = document.getElementById("prompt");
    const inputEl = document.getElementById("input");
    const startBtn = document.getElementById("start");
    const nextBtn = document.getElementById("next");
    const difficultyEl = document.getElementById("difficulty");
    const statusEl = document.getElementById("status");
    const wpmEl = document.getElementById("wpm");
    const accuracyEl = document.getElementById("accuracy");
    const timeEl = document.getElementById("time");
    const completedEl = document.getElementById("completed");
    const progressEl = document.getElementById("progress");

    const updateStats = () => {
      if (!state.startTime) return;
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - state.startTime) / 1000));
      const minutes = elapsedSeconds / 60;
      const totalTyped = state.completedChars + state.currentTyped;
      const totalMistakes = state.completedMistakes + state.currentMistakes;
      const grossWpm = Math.round((totalTyped / 5) / minutes);
      const accuracy = totalTyped === 0
        ? 100
        : Math.max(0, Math.round(((totalTyped - totalMistakes) / totalTyped) * 100));
      wpmEl.textContent = grossWpm;
      accuracyEl.textContent = `${accuracy}%`;
      timeEl.textContent = `${elapsedSeconds}s`;
    };

    const startTimer = () => {
      if (state.timer) clearInterval(state.timer);
      state.timer = setInterval(updateStats, 500);
    };

    const renderPrompt = (text) => {
      promptEl.innerHTML = "";
      [...text].forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        promptEl.appendChild(span);
      });
      progressEl.textContent = `0 / ${text.length}`;
    };

    const pickPrompt = () => {
      const pool = prompts[difficultyEl.value];
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const loadPrompt = () => {
      state.currentText = pickPrompt();
      inputEl.value = "";
      state.currentTyped = 0;
      state.currentMistakes = 0;
      renderPrompt(state.currentText);
      statusEl.textContent = "Typing";
      nextBtn.disabled = true;
      inputEl.focus();
    };

    const startSession = () => {
      state.completed = 0;
      state.completedChars = 0;
      state.completedMistakes = 0;
      state.currentTyped = 0;
      state.currentMistakes = 0;
      completedEl.textContent = "0";
      state.startTime = Date.now();
      startTimer();
      inputEl.disabled = false;
      loadPrompt();
    };

    const updatePromptStyles = (typedValue) => {
      const chars = promptEl.querySelectorAll("span");
      let mistakes = 0;
      chars.forEach((charSpan, index) => {
        const typedChar = typedValue[index];
        charSpan.classList.remove("correct", "incorrect", "active");
        if (typedChar == null) {
          if (index === typedValue.length) {
            charSpan.classList.add("active");
          }
          return;
        }
        if (typedChar === charSpan.textContent) {
          charSpan.classList.add("correct");
        } else {
          charSpan.classList.add("incorrect");
          mistakes += 1;
        }
      });
      state.currentMistakes = mistakes;
      state.currentTyped = typedValue.length;
      progressEl.textContent = `${typedValue.length} / ${state.currentText.length}`;
    };

    inputEl.addEventListener("input", (event) => {
      const value = event.target.value;
      updatePromptStyles(value);
      if (value.length >= state.currentText.length) {
        if (value === state.currentText) {
          state.completed += 1;
          completedEl.textContent = state.completed;
          state.completedChars += state.currentText.length;
          state.completedMistakes += state.currentMistakes;
          state.currentTyped = 0;
          state.currentMistakes = 0;
          statusEl.textContent = "Completed";
          nextBtn.disabled = false;
          inputEl.disabled = true;
        }
      }
    });

    startBtn.addEventListener("click", () => {
      startSession();
    });

    nextBtn.addEventListener("click", () => {
      inputEl.disabled = false;
      loadPrompt();
    });

    difficultyEl.addEventListener("change", () => {
      statusEl.textContent = "Ready";
    });
  </script>
</body>
</html>
"""


class TypingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in ("/", "/index.html"):
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")
            return
        content = HTML.encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main():
    server = HTTPServer(("0.0.0.0", 8000), TypingHandler)
    print("Serving typing game on http://localhost:8000")
    server.serve_forever()


if __name__ == "__main__":
    main()
