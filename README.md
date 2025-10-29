# Grand Thef t'Auto: Burnley Edition 🚗💨

A full GTA-style game set in East Lancashire featuring Burnley, Blackburn, and surrounding areas. Drive around Lancashire, complete missions, buy properties, engage in combat, and build your criminal empire!

## 🎮 Features

### Core Gameplay
- **Open World**: 2400x2400 map with camera following system
- **Authentic Locations**: Turf Moor, Ewood Park, M65 motorway, and more
- **Dynamic World**: Day/night cycle, weather effects, NPC traffic

### Combat System
- **5 Weapons**: Fists, Cricket Bat, Pistol, Shotgun, Rifle
- **Realistic Physics**: Bullet trajectories with visual trails
- **Skill Progression**: Improve shooting, strength, and stealth

### Property Empire
- **6 Properties**: Buy pubs, businesses, safe houses across Lancashire
- **Passive Income**: Earn money automatically from owned properties
- **Strategic Locations**: From Burnley to Blackburn

### Character Progression
- **Skills**: Driving, Shooting, Strength that improve with use
- **Stats**: Health, Armor, Stamina tracking
- **Gang Reputation**: Build respect with different factions

### Mission System
- **10 Diverse Missions**:
  - Timed deliveries and heists
  - Chase sequences
  - Race challenges
  - Property acquisition goals
  - Skill challenges

### Additional Features
- **Territory Control**: Visual gang territories across the map
- **Radio Stations**: BBC Radio Lancashire, Claret FM, Rovers Radio, Northern Soul FM
- **Save/Load System**: Persist your progress with localStorage
- **Time Cycle**: 24-hour clock affecting gameplay and visuals

## 🎯 Controls

| Key | Action |
|-----|--------|
| **WASD** | Drive vehicle |
| **Arrow Keys** | Alternative driving controls |
| **F** | Shoot/Attack |
| **Q** | Switch weapon |
| **E** | Steal vehicle |
| **R** | Change radio station |
| **B** | Buy property (when nearby) |
| **SPACE** | Horn |
| **F5** | Save game |
| **F9** | Load game |

## 🚀 Deployment to Vercel

### Quick Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/beckletts/gtaburnleh)

### Manual Deployment

1. **Fork or clone this repository**

2. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to your Vercel account
   - Select your project name
   - Confirm the settings

### GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `beckletts/gtaburnleh`
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

Your game will be live at: `https://your-project-name.vercel.app`

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/beckletts/gtaburnleh.git
cd gtaburnleh

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The game will be available at `http://localhost:5173`

## 📦 Project Structure

```
burnley-gta/
├── src/
│   ├── GrandThefTAuto.jsx  # Main game component
│   ├── App.jsx              # App wrapper
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── dist/                    # Production build (generated)
├── vercel.json             # Vercel configuration
├── vite.config.js          # Build configuration
└── package.json            # Dependencies
```

## 🎨 Technologies

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Canvas API**: Game rendering
- **Lucide React**: UI icons
- **LocalStorage**: Save game persistence

## 🎭 Game Lore

Set in the heart of East Lancashire, you start as a boy racer in Burnley. Navigate the rivalry between Burnley and Blackburn, build your criminal empire, and become the most respected figure in Lancashire. Complete missions across iconic locations like Turf Moor, Ewood Park, and the M65 motorway.

## 🐛 Known Issues

- Mobile controls not yet implemented (desktop only)
- Audio is visual-only (no actual sound effects)

## 📝 Future Enhancements

- [ ] Mobile touch controls
- [ ] Multiplayer mode
- [ ] More missions and storylines
- [ ] Additional vehicles
- [ ] Weather system
- [ ] Achievement system
- [ ] Leaderboards

## 📜 License

MIT License - Feel free to modify and distribute

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 👨‍💻 Credits

Built with [Claude Code](https://claude.com/claude-code)

---

**Enjoy your criminal career in Lancashire! 🏴󠁧󠁢󠁥󠁮󠁧󠁿**
