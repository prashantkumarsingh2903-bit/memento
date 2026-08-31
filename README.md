# Memento — Multimodal AI Journal & Reflection

> **Capture → Reflect → Understand → Remember**  
> A calm, personal, emotionally intelligent, and privacy-first multimodal journaling web application.

---

## 🌟 Key Features

- **🎙️ Dedicated Voice Journaling**: Real-time Web Audio API soundwave frequency visualizer, `MediaRecorder` capture with pause/resume, and live streaming speech-to-text transcription via the Web Speech API.
- **📹 Dedicated Video Journaling**: Live camera preview viewfinder, recording timer, pause/resume, and automated client-side canvas thumbnail generation.
- **✍️ Distraction-Free Writing**: Markdown formatting toolbar, mood tracking, photo attachments, and custom tagging.
- **🧠 Empathetic AI Reflection Assistant**: Compassionate, non-diagnostic reflection synthesis ("What I noticed", "Themes", "Questions for yourself").
- **📊 Long-Term Insights Dashboard**: Journey summary metrics, recurring theme frequencies, behavioral pattern observations, and cherished memories.
- **🔒 100% Local-First & Private**: Metadata stored in `localStorage`, heavy binary audio/video Blobs stored in **IndexedDB** (`idb`). No telemetry or unsolicited cloud uploads.
- **📦 Data Portability**: One-click JSON backup export/restore, and formatted Markdown (`.md`) journal export.
- **🎨 Editorial Design System**: Warm neutral palette (terracotta, sage, warm paper), Lora serif typography, Plus Jakarta Sans interface, and Dark/Light/System theme support.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom warm theme tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Local Persistence**: `localStorage` + `IndexedDB` via [`idb`](https://github.com/jakearchibald/idb)
- **Audio/Video**: Native Web Audio API (`AnalyserNode`), `MediaRecorder`, `getUserMedia`, and Web Speech API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/prashantkumarsingh2903-bit/memento.git
cd memento

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📄 License

MIT License. Designed with care for personal reflection and mindfulness.
