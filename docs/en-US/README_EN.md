<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../docs/svg/head_light.svg">
    <source media="(prefers-color-scheme: light)" srcset="../../docs/svg/head_dark.svg">
    <img src="../../docs/svg/head_dark.svg" alt="Moodify Logo" width="500" height="200" />
  </picture>
  
  <h1>Moodify</h1>
  <p><strong>AI-Powered Intelligent Music Recommendation System</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Vue.js-3.4.0+-4FC08D" alt="Vue.js" />
    <img src="https://img.shields.io/badge/Vite-5.0.0+-646CFF" alt="Vite" />
    <img src="https://img.shields.io/badge/SCSS-1.69.0+-CC6699" alt="SCSS" />
    <img src="https://img.shields.io/badge/GSAP-3.12.0+-88CE02" alt="GSAP" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
    <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version" />
  </p>

  <h5><a href="../../README.md">简体中文</a> | English</h5>
  
  <p>
    <a href="#about">About</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#core-features">Core Features</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#development-guide">Development Guide</a> •
    <a href="#license-declaration">License Declaration</a> •
    <a href="#acknowledgments">Acknowledgments</a>
  </p>
</div>

---

## About

Moodify is an innovative music recommendation frontend application designed to analyze user emotional expressions through advanced AI technology and intelligently recommend music that best matches their current mood. Built with Vue 3 as the core framework and combined with modern frontend technology stack, it provides users with a smooth, intuitive, and delightful interactive experience. This repository is the frontend implementation of Moodify. If you want to learn about the backend, please visit [Sheldon-Xiao/moodify]().

- **Design Philosophy** We firmly believe that music is the carrier of emotions, and every mood has its perfect musical companion. Traditional music recommendation systems often rely on user's historical playback records or simple category tags, while Moodify aims to break through these limitations by understanding users' real emotional needs and creating truly personalized and emotionally-driven music recommendation experiences. Whether you're feeling joyful on a sunny afternoon or contemplative during late night hours, Moodify can find the music that perfectly matches your current emotional state.

- **Technical Innovation** The project employs natural language processing technology to understand users' emotional descriptions, combines Canvas dynamic rendering technology to display emotional states in real-time, and provides precise recommendation results through complex music feature matching algorithms. The entire system pays attention to every detail of user experience, from interface design to interactive animations, reflecting the highest standards of modern web applications.

> Sheldon's Words:
> 
> The initial purpose of this project was just to complete a course assignment, while also satisfying my personal love for music. I originally wanted to just get by with it, but as time went on, I found this idea more and more interesting, and it did recommend a lot of good music for me during my emotional ups and downs. With the efforts of me and AI code ~~(basically AI helping)~~, Moodify gradually evolved into a complete application. Now, I hope to open source it and let more people participate in perfecting this project together.

## Getting Started

### Environment Requirements

Before starting to use Moodify, please ensure your development environment meets the following requirements:

- **Node.js Version** >= 16.0.0 (Latest LTS version recommended)
- **npm Version** >= 7.0.0 (or package managers like yarn, pnpm)
- **Browser Support** Chrome >= 88, Firefox >= 85, Safari >= 14, Edge >= 88

### Installation Steps

```bash
# Clone the project locally
git clone https://github.com/yourusername/moodify.git
cd moodify

# Navigate to frontend directory
cd frontend

# Install project dependencies
npm install

# Start development server
npm run dev

# Access the application in browser
# Default address: http://localhost:3000
```

### Quick Start

To simplify the development process, we provide an automated startup script that automatically detects environment, installs dependencies, and starts services:

```bash
# Use automated startup script (recommended)
node start.js
```

This script automatically handles environment checking, dependency installation, port detection, and other tasks to ensure the application starts smoothly.

### Configuration Instructions

The project uses environment variables for configuration management. Copy the `.env.example` file to `.env` and modify configurations as needed:

```bash
# API service address
VITE_API_URL=http://localhost:8000

# Enable debug mode
VITE_DEBUG=true

# Application title
VITE_APP_TITLE=Moodify
```

## Core Features

### Emotion Recognition Interface

Moodify's core functionality is analyzing user emotional expressions through natural language processing technology. Users can describe their current mood in any language and any way, and the system will intelligently recognize the emotional colors and provide real-time visual feedback.

- **Supported Emotion Types** The system supports various complex emotional states including happiness, sadness, excitement, calmness, anger, anxiety, longing, satisfaction, and more. The system can not only recognize basic emotions but also understand the intensity and subtle differences of emotions. For example, "a little happy" and "very excited" will be recognized as different degrees of positive emotions.

- **Intelligent Semantic Understanding** The system employs advanced NLP technology to understand various expressions, including direct emotional descriptions ("I'm very happy"), implicit emotional expressions ("What a beautiful sunny day"), and complex emotional combinations ("happy with a touch of reluctance").

### Intelligent Music Recommendation

Based on user emotion analysis results, Moodify intelligently matches the most suitable music works. The recommendation algorithm comprehensively considers multiple dimensions of music features to ensure high matching between recommendation results and user emotions.

- **Multi-dimensional Matching Algorithm** The system not only considers basic music categories (such as pop, rock, classical, etc.) but also deeply analyzes the emotional characteristics of music, including tempo, tonality, energy level, and emotional color. This multi-dimensional analysis ensures the precision of recommendation results.

- **Personalized Optimization** As users spend more time with the system, the algorithm learns user music preferences and continuously optimizes recommendation results. The system remembers the types of music users like in different emotional states, making recommendations increasingly personalized.

- **Real-time Music Preview** Users can directly preview recommended music clips in the interface to quickly determine if they match their current mood. The preview function supports seamless switching, providing smooth listening experiences.

### Responsive Interface Design

Moodify adopts a completely responsive design philosophy to ensure optimal user experiences across various devices.

- **Cross-device Compatibility** Whether on desktop computers, tablets, or mobile phones, the interface automatically adapts to screen sizes while maintaining optimal visual effects and operational experiences.

- **Modern Visual Design** The design adopts Glassmorphism style combined with dark themes and rainbow gradient color systems, creating visual experiences that are both modern and warm.

- **Accessibility Support** The interface design fully considers accessibility, supporting keyboard navigation, screen readers, and other assistive functions to ensure all users can use it smoothly.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Vue components
│   │   ├── core/           # Core functionality components
│   │   ├── layout/         # Layout components
│   │   └── views/          # Page views
│   ├── composables/        # Composable functions
│   ├── stores/            # Pinia state management
│   ├── router/            # Vue Router
│   └── assets/            # Static assets
├── doc/                   # Documentation resources
├── vite.config.js        # Vite configuration
└── package.json          # Project dependencies
```

## Development Guide

Want to contribute code to the Moodify project? Please check our detailed development guide:

[![Contributing Guide](https://img.shields.io/badge/📝_Contributing-Guide-blue?style=for-the-badge)](CONTRIBUTING_EN.md)

The development guide contains complete contribution workflows, code standards, testing requirements and other information to help you quickly get started with project development.

## License Declaration

### MIT License

This project is open-sourced under the MIT License. The MIT License is a permissive open-source license that allows you to freely use, modify, and distribute the code of this project, whether for commercial or non-commercial purposes.

**What You Can Do**
Use this project's code to develop your own applications. Modify the code to meet your needs. Integrate the code into your commercial products. Redistribute the code (while retaining original license declarations).

**What You Need to Do**
Retain original copyright declarations and license text in your project. If you distribute modified code, you need to clearly mark the modifications you made.

**Responsibilities We Don't Bear**
This project is provided "as is" without any express or implied warranties. Authors are not responsible for any losses that may result from using this project.

For complete license text, please refer to the [LICENSE](LICENSE) file in the project root directory.

### Third-party Dependencies

This project uses multiple open-source libraries and tools, and we express heartfelt gratitude to the authors and maintainers of these projects. All third-party dependency license information can be found in the corresponding package.json files.

## Acknowledgments

The birth of Moodify is inseparable from the support and contributions of the entire open-source community. We particularly thank the following projects and organizations:

- [pqoqubbw/icons](https://github.com/pqoqubbw/icons) - pqoqubbw's icon source code provided us with inspiration and materials for the homepage dynamic emotions.
- [nikitatkachenko/19332-spotify-songs](https://www.kaggle.com/datasets/nikitatkachenko/19332-spotify-songs) - Nikita Tkachenko's Spotify song audio features dataset provided valuable data support for our music recommendation algorithm.
- [maltegrosse/8-m-spotify-tracks-genre-audio-features](https://www.kaggle.com/datasets/maltegrosse/8-m-spotify-tracks-genre-audio-features) - Malte Grosse's Spotify track database provided us with more comprehensive music feature data, helping us optimize our recommendation algorithm.

### Community Contributors

Although Moodify is still a young project, we have already received valuable feedback and suggestions from the community. Every issue, every discussion, and every star is recognition and encouragement for our work.

**Special Thanks**
Thanks to all users who provided feedback in the early stages of the project. Thanks to those developers who helped test and discover problems. Thanks to community members who provided suggestions and improvement opinions for the project.
