# Life RPG

A gamified productivity app that turns everyday tasks into an RPG-style progression system. Complete quests, build streaks, grow your character, manage your stats, unlock cosmetics, and turn real-life habits into a rewarding game loop.

<div align="center">

![Life RPG](https://img.shields.io/badge/Life%20RPG-Productivity%20Adventure-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%2B%20Auth-3ECF8E?style=for-the-badge&logo=supabase)

[Live Demo](https://web-project-fayaz-khan.vercel.app/) •
[Project Repository](https://github.com/fayaz786sret/life-rpg)

</div>

---

## Overview

Life RPG is a habit and task management app designed to make personal productivity feel fun, rewarding, and motivating. Instead of checking off plain to-dos, users level up a character, gain XP, manage attributes, unlock cosmetic rewards, and build momentum through streaks and progression.

This project is built for both real-world personal productivity and hackathon/demo scenarios, with features like:

- Quest-based task tracking
- XP and leveling progression
- Character stats and attribute growth
- Stored progress with Supabase or local demo mode
- Bazaar/shop system for cosmetics and upgrades
- Instant quick-play demo access
- Responsive UI for desktop and mobile

---

## Why this project matters

Productivity apps often fail because they feel transactional. Life RPG changes that by making progress visible, game-like, and emotionally rewarding.

Users stay engaged because they can:

- see measurable progress in real time
- understand how effort affects their character
- unlock rewards and cosmetic identity through consistent habits
- stay motivated through streaks and milestone-based rewards
- experience social-style progression without needing complex infrastructure

---

## Key Features

### Quest system
- Create, edit, complete, and delete quests
- Categorize by difficulty and goal type
- Earn XP and gold as quests are completed
- Track progress in a dynamic board interface

### Progression and leveling
- Non-linear leveling curve
- Character growth tied to quest completion
- Rewards and feedback through modals and toast notifications
- Unlock milestones and visual progression states

### Attributes and stats
- Strength
- Intellect
- Creativity
- Charisma
- Vitality
- Dexterity

These stats evolve based on the types of tasks users complete, making the app feel more like an RPG than a traditional checklist tool.

### Streak tracking
- Daily consistency rewards
- Bonus XP for active streaks
- Better long-term habit retention through momentum-based incentives

### Bazaar / shop system
- Purchase themes, avatars, and badges
- Equip active items from inventory
- New cosmetics tied to in-game currency and progression
- Persistence across sessions

### Authentication and demo mode
- Email/password sign up and sign in
- Google and Facebook OAuth support
- Friendly error handling for provider setup issues
- Instant Demo Play option for evaluators, judges, and hackathon demos

### Responsive user experience
- Mobile-friendly layout
- Keyboard-support friendly interactions
- Accessible UI patterns
- Smooth animations and game-like feedback

---

## Tech Stack

### Frontend
- React 19
- Vite 8
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend and persistence
- Supabase
- PostgreSQL
- Auth + real-time session handling

### Build and tooling
- Vite
- PostCSS
- Autoprefixer
- npm

---

## Architecture Overview

The app follows a lightweight single-page architecture with clear state boundaries:

- Authentication is handled through a dedicated auth context
- Game progression and inventory logic live in a gameplay context
- UI components render task board, dashboard, shop, and character panels
- Supabase provides persistence for real accounts and user data
- Demo mode stores user state locally when Supabase is not configured

This separation keeps gameplay logic organized while making it easier to swap between persistent and local storage modes.

---

## Project Structure

```bash
life-rpg/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx
│   │   ├── Dashboard/
│   │   │   ├── CharacterPanel.jsx
│   │   │   ├── Header.jsx
│   │   │   └── StatsPanel.jsx
│   │   ├── Tasks/
│   │   │   ├── EditTaskModal.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   ├── Shop/
│   │   │   └── ShopPage.jsx
│   │   └── UI/
│   │       └── LevelUpModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── GameContext.jsx
│   ├── lib/
│   │   ├── rpgSystem.js
│   │   └── supabase.js
│   ├── pages/
│   │   └── DashboardPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
├── README.md
└── index.html
```

---

## Getting Started

### Prerequisites

Before you begin, make sure you have:

- Node.js 18 or later
- npm 9 or later
- A Supabase project (optional for demo mode)

### 1. Clone the repository

```bash
git clone https://github.com/fayaz786sret/life-rpg.git
cd life-rpg
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If you do not configure Supabase, the app still works in Demo Mode using local browser storage.

### 4. Database setup

Open your Supabase project and run the SQL schema from:

```bash
supabase/schema.sql
```

This creates the tables and policies needed for the app's profiles, tasks, inventory, and progression state.

### 5. OAuth setup (optional)

If you want Google or Facebook sign-in to work, configure the provider in Supabase:

1. Open Supabase Dashboard
2. Go to Authentication → Providers
3. Enable Google / Facebook
4. Add the required client ID and secret
5. Set correct redirect URLs

If provider credentials are not configured, Supabase will return an OAuth error. The app includes friendly handling for this flow so testers still get useful feedback instead of a confusing redirect failure.

### 6. Run locally

```bash
npm run dev
```

Open the local app in your browser at:

```bash
http://localhost:5173
```

### 7. Production build

```bash
npm run build
npm run preview
```

---

## Demo / Quick-Play Mode

Life RPG includes an Instant Demo Play mode for hackathons, evaluations, and reviewer testing.

This mode allows anyone to:

- enter without email verification
- avoid OAuth provider setup friction
- use the app immediately
- test quest completion, leveling, rewards, and shop flows

The demo state persists in local storage for quick validation and user testing.

---

## Deployment

### Vercel

This project is configured for Vercel deployment and can be used as a static Vite app.

Required environment variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set these under:

- Project → Settings → Environment Variables

Then redeploy the application.

### Live Demo

```bash
https://web-project-fayaz-khan.vercel.app/
```

---

## Environment Variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | No, for demo mode only |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | No, for demo mode only |

See `.env.example` for a ready-to-use template.

---

## Security and Data Notes

The project includes:

- secure Supabase auth integrations
- row-level security schema support
- local demo fallback when credentials are unavailable
- demonstration-friendly handling for failed OAuth provider setup

This means the app can be safely used in both development and reviewer/demo environments.

---

## Future Enhancements

Planned opportunities include:

- social sharing of achievements
- recurring quests and habits
- leaderboard or community progression
- seasonal event systems
- richer visual animations and particle effects

---

## License

This project is licensed under the MIT License.

---

## Credits

Built as a passion project to combine productivity, gamification, and personal habit-building in a polished web experience.

---

## Support

If you want to run this project locally or contribute improvements, feel free to fork the repository and start from the included setup instructions.
