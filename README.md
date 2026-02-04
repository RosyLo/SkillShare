# SlashX - Skill Sharing Platform

A modern skill-sharing platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Feed of User Posts**: Browse posts from community members, learners, experiences, and services
- **User Profiles**: View user ratings, roles, and locations
- **Search & Discovery**: Find skills and filter by location
- **Popular Topics**: Discover trending hashtags and topics
- **Responsive Design**: Clean, modern UI that works on all devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── Header.tsx      # Top navigation header
│   ├── TabNavigation.tsx # Category tabs
│   ├── PostCard.tsx    # Individual post component
│   └── Sidebar.tsx     # Search and discovery sidebar
└── package.json
```

## License

© 2024 Slash Skill
