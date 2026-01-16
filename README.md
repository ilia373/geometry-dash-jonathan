# 🎮 Geometry Dash Clone

<div align="center">

![Geometry Dash Banner](https://img.shields.io/badge/🎯_Geometry_Dash-Clone-00ff88?style=for-the-badge&labelColor=1a1a2e)

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff?style=flat-square&logo=vite)](https://vite.dev/)

**A modern, feature-rich Geometry Dash clone built with React and TypeScript**

[Play Now](#-getting-started) • [Features](#-features) • [Game Mechanics](#-game-mechanics) • [Skins](#-skin-shop)

</div>

---

## 🎯 About

A browser-based rhythm platformer inspired by Geometry Dash. Navigate your cube through challenging obstacle courses, collect coins, unlock skins, and try to beat all the levels!

```
╔══════════════════════════════════════════════════════════════╗
║  ▓▓▓▓▓▓                                          ▲           ║
║  ▓ 🟩 ▓      🪙         🪙              ▲       ▲▲▲          ║
║  ▓▓▓▓▓▓                               ▲▲▲     ▲▲▲▲▲         ║
║ ═══════════════════════════════════════════════════════════  ║
║                    ► TAP TO JUMP ◄                           ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎮 **Multiple Levels** | 3 unique levels with increasing difficulty |
| 🪙 **Coin System** | Collect coins during gameplay to spend in the shop |
| 🎨 **100+ Skins** | Customize your cube with flags, game characters, animals & more |
| 🔒 **Unlockable Content** | Purchase skins with collected coins (200+ coins each) |
| 💾 **Progress Saving** | All progress saved to localStorage |
| 🎵 **Sound Effects** | Immersive audio feedback |
| ✨ **Modern UI** | Glass-morphism design with smooth animations |

---

## 🎮 Game Mechanics

### Controls
- **Space / Click / Tap** - Jump
- **Hold** - Continuous jumping
- **ESC** - Pause game

### Obstacles
| Obstacle | Description |
|----------|-------------|
| 🔺 **Spikes** | Instant death on contact |
| 📦 **Platforms** | Solid ground to land on |
| 🪙 **Coins** | Collect for currency |

### Physics
- Constant horizontal scrolling speed
- Gravity-based jumping with smooth arcs
- Ground detection and collision system
- Progressive difficulty across levels

---

## 🛍️ Skin Shop

Unlock and equip over **100 unique skins** across 8 categories:

| Category | Count | Examples |
|----------|-------|----------|
| 🎨 **Default** | 6 | Original, Neon Blue, Hot Pink |
| 🏳️ **Flags** | 21 | USA 🇺🇸, UK 🇬🇧, Japan 🇯🇵, Brazil 🇧🇷 |
| 🎮 **Games** | 20 | Minecraft ⛏️, Among Us 📮, Mario 🍄 |
| 🐾 **Animals** | 20 | Panda 🐼, Tiger 🐯, Unicorn 🦄 |
| 🚗 **Cars** | 15 | Ferrari 🏎️, Tesla ⚡, Police 🚔 |
| 🍕 **Food** | 10 | Pizza 🍕, Sushi 🍣, Donut 🍩 |
| 🚀 **Space** | 5 | Galaxy 🌌, Moon 🌙, Sun ☀️ |
| ✨ **Special** | 5 | Rainbow 🌈, Disco 🪩, Diamond 💎 |

> 💡 **Default skins are free!** Other skins cost 200 coins (some special skins cost more)

---

## 📁 Project Structure

```
geometry-dash-jonathan/
├── src/
│   ├── components/
│   │   ├── Game.tsx          # Main game canvas & logic
│   │   ├── Menu.tsx          # Main menu with level selection
│   │   └── SkinSelector.tsx  # Skin shop interface
│   │
│   ├── constants/
│   │   └── gameConfig.ts     # Level definitions & obstacles
│   │
│   ├── types/
│   │   ├── game.ts           # Game state interfaces
│   │   └── skins.ts          # Skin definitions (100+ skins)
│   │
│   ├── utils/
│   │   ├── gamePhysics.ts    # Collision & physics engine
│   │   ├── gameRenderer.ts   # Canvas rendering functions
│   │   ├── skinManager.ts    # Skin selection & unlocking
│   │   ├── walletManager.ts  # Coin balance management
│   │   ├── progressManager.ts # Level progress tracking
│   │   └── soundManager.ts   # Audio system
│   │
│   ├── App.tsx               # Root component & routing
│   └── main.tsx              # Entry point
│
├── public/
│   └── sounds/               # Audio files
│
└── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ilia373/geometry-dash-jonathan.git

# Navigate to project
cd geometry-dash-jonathan

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to play!

### Build for Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript 5.8
- **Build Tool:** Vite 7.3
- **Rendering:** HTML5 Canvas
- **Styling:** CSS3 with Glass-morphism
- **Storage:** localStorage for persistence

---

## 🎯 Game Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Menu.tsx  │  │  Game.tsx   │  │  SkinSelector.tsx   │  │
│  │             │  │             │  │                     │  │
│  │ • Levels    │  │ • Canvas    │  │ • 100+ Skins        │  │
│  │ • Coins     │  │ • Physics   │  │ • Purchase System   │  │
│  │ • Progress  │  │ • Renderer  │  │ • Categories        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │                    Utils Layer                       │    │
│  │  walletManager │ skinManager │ progressManager      │    │
│  │  gamePhysics   │ gameRenderer │ soundManager        │    │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │                  localStorage                        │    │
│  │  • geometry-dash-wallet (coins)                     │    │
│  │  • geometry-dash-selected-skin                      │    │
│  │  • geometry-dash-unlocked-skins                     │    │
│  │  • geometry-dash-progress                           │    │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 License

MIT License - feel free to use this project for learning and fun!

---

<div align="center">

**Made with ❤️ and lots of ☕**

⭐ Star this repo if you enjoyed playing!

</div>

