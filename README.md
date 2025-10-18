# Derive AI-CAD Platform

An AI-powered CAD platform that enables users to create 3D models through natural language commands. By integrating LLM technology with FreeCAD's kernel, Derive eliminates the traditional CAD learning curve and enables rapid prototyping.

## 🚀 Core Value Proposition

Transform the CAD workflow from complex menu-driven operations to conversational design:
**"Design a rectangular electronics enclosure, 100×60×40 mm"** → instant parametric 3D model ready for export and manufacturing.

## 🎯 Target Users

- **Primary**: Engineers and early-stage builders (including student engineers)
- **Secondary**: Students learning CAD/design  
- **Tertiary**: Makers, hardware startups, rapid prototyping teams

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **3D Rendering**: Three.js
- **UI Components**: Custom components following Apple's translucent design language
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **AI Integration**: Google Gemini API
- **CAD Engine**: FreeCAD (containerized Python environment)
- **Database**: PostgreSQL for metadata, AWS S3 for CAD files
- **Queue System**: Redis for AI job processing

## 📁 Project Structure

```
derive/
├── frontend/                 # React TypeScript application
├── backend/                  # Node.js Express server
├── cad-engine/               # FreeCAD integration
├── shared/                   # Shared types and utilities
├── docs/                     # Documentation
└── deployment/               # Infrastructure as code
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker
- PostgreSQL
- Redis

### Installation

1. Clone the repository
```bash
git clone https://github.com/HumfDev/Leafylitics.git
cd Leafylitics
```

2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

## 🎨 Design Philosophy

**Apple-inspired liquid glass aesthetic with a clean, futuristic laboratory feel**

- Pure white to soft light gradient backgrounds
- Translucent glass panels with backdrop blur
- Smooth animations and physics-based interactions
- High contrast text for accessibility

## 📊 Success Metrics

- Time from concept to exportable CAD: < 10 minutes
- User retention: Monthly active usage of AI commands
- Technical: <30s AI generation time, 30-60 FPS viewport interaction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://derive-ai-cad.vercel.app) (Coming Soon)
- [Documentation](https://docs.derive-ai-cad.com) (Coming Soon)
- [Discord Community](https://discord.gg/derive-ai-cad) (Coming Soon)
