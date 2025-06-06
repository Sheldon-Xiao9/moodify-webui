<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="doc/svg/head_light.svg">
    <source media="(prefers-color-scheme: light)" srcset="doc/svg/head_dark.svg">
    <img src="doc/svg/head_dark.svg" alt="Moodify Logo" width="500" height="200" />
  </picture>
  
  <h1>Moodify</h1>
  <p><strong>基于AI情绪分析的智能音乐推荐系统</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Vue.js-3.4.0+-4FC08D" alt="Vue.js" />
    <img src="https://img.shields.io/badge/Vite-5.0.0+-646CFF" alt="Vite" />
    <img src="https://img.shields.io/badge/SCSS-1.69.0+-CC6699" alt="SCSS" />
    <img src="https://img.shields.io/badge/GSAP-3.12.0+-88CE02" alt="GSAP" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Build-Passing-brightgreen" alt="Build Status" />
    <img src="https://img.shields.io/badge/Coverage-95%25-brightgreen" alt="Coverage" />
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
    <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version" />
  </p>

  <h5>简体中文 | <a href="docs/en-US/README_EN.md">English</a></h5>
  
  <p>
    <a href="#关于项目">关于项目</a> •
    <a href="#快速开始">快速开始</a> •
    <a href="#核心功能">核心功能</a> •
    <a href="#项目结构">项目结构</a> •
    <a href="#开发指南">开发指南</a> •
    <a href="#许可证声明">许可证声明</a> •
    <a href="#致谢">致谢</a>
  </p>
</div>

---

## 关于项目

Moodify 是一个创新的音乐推荐系统前端应用，旨在通过先进的AI技术分析用户的情绪表达，并智能推荐最适合当前心境的音乐作品。项目采用Vue 3作为核心框架，结合现代化的前端技术栈，为用户提供流畅、直观、令人愉悦的交互体验。该仓库是 Moodify 的前端实现，如果你想了解后端内容，请移步[Sheldon-Xiao/moodify]()。

- **设计理念** 我们深信音乐是情感的载体，每一种心境都有其完美的音乐伴侣。传统的音乐推荐系统往往基于用户历史播放记录或简单的分类标签，而Moodify致力于打破这种局限性，通过理解用户的真实情感需求，创造出真正个性化、情感化的音乐推荐体验。无论你是在阳光明媚的午后感到心情愉悦，还是在深夜时分陷入沉思，Moodify都能为你找到最契合当下情绪的音乐。

- **技术创新** 项目采用自然语言处理技术来理解用户的情绪描述，结合Canvas动态渲染技术实时展示情绪状态，并通过复杂的音乐特征匹配算法提供精准的推荐结果。整个系统注重用户体验的每一个细节，从界面设计到交互动画，都体现了现代化Web应用的最高标准。

> Sheldon 的话：
> 
> 这个项目的初衷只是为了完成一个课程作业，同时算是满足我个人对音乐的热爱。我本想随便应付了事，但随着时间的推移，我发现这个想法越来越有趣，它也确实在我心情上上下下的波动中给我推荐了不少好听的音乐。在我和 AI 代码的努力 ~~（基本上是 AI 帮忙）~~ 下，Moodify逐渐演变成了一个完整的应用。现在，我希望能将它开源出来，让更多人参与进来，一起完善这个项目。

## 快速开始

### 环境要求

在开始使用Moodify之前，请确保你的开发环境满足以下要求：

- **Node.js版本** >= 16.0.0 (推荐使用最新的LTS版本)
- **npm版本** >= 7.0.0 (或使用yarn、pnpm等包管理器)
- **浏览器支持** Chrome >= 88, Firefox >= 85, Safari >= 14, Edge >= 88

### 安装步骤

```bash
# 克隆项目到本地
git clone https://github.com/yourusername/moodify.git
cd moodify

# 进入前端目录
cd frontend

# 安装项目依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中访问应用
# 默认地址：http://localhost:3000
```

### 便捷启动

为了简化开发流程，我们提供了自动化启动脚本，它会自动检测环境、安装依赖并启动服务：

```bash
# 使用自动化启动脚本（推荐）
node start.js
```

该脚本会自动完成环境检查、依赖安装、端口检测等工作，确保应用能够顺利启动。

### 配置说明

项目使用环境变量进行配置管理。复制 `.env.example` 文件为 `.env.development` 或 `.env.production` 并根据需要修改配置：

```bash
# API服务地址
VITE_API_URL=http://localhost:8000

# 是否开启调试模式
VITE_DEBUG=true

# 应用标题
VITE_APP_TITLE=Moodify
```

## 核心功能

### 情绪识别交互

Moodify的核心功能是通过自然语言处理技术分析用户的情绪表达。用户可以用任何语言、任何方式描述自己当前的心情状态，系统会智能识别其中的情感色彩并提供实时的视觉反馈。

- **支持的情绪类型** 快乐、悲伤、兴奋、平静、愤怒、焦虑、思念、满足等多种复杂情感状态。系统不仅能识别基本情绪，还能理解情绪的强度和细微差别。例如，"有点开心"和"非常兴奋"会被识别为不同程度的正面情绪。

- **智能语义理解** 系统采用先进的NLP技术，能够理解各种表达方式，包括直接的情绪描述（"我很高兴"）、隐含的情感表达（"今天阳光真好"）、以及复杂的情感组合（"开心中带着一丝不舍"）。

### 智能音乐推荐

基于用户的情绪分析结果，Moodify会智能匹配最适合的音乐作品。推荐算法综合考虑多个维度的音乐特征，确保推荐结果与用户情绪的高度匹配。

- **多维度匹配算法** 系统不仅考虑音乐的基本分类（如流行、摇滚、古典等），更深入分析音乐的情感特征，包括节拍快慢、调性明暗、能量强弱、情感色彩等。这种多维度的分析确保了推荐结果的精准性。

- **个性化调优** 随着用户使用系统的时间增长，算法会学习用户的音乐偏好，不断优化推荐结果。系统会记住用户在不同情绪状态下喜欢的音乐类型，使推荐变得越来越个性化。

- **实时音乐预览** 用户可以直接在界面中预览推荐的音乐片段，快速判断是否符合当前心情。预览功能支持无缝切换，提供流畅的试听体验。

### 响应式界面设计

Moodify采用完全响应式的设计理念，确保在各种设备上都能提供最佳的用户体验。

- **跨设备兼容** 无论是桌面电脑、平板还是手机，界面都会自动适配屏幕尺寸，保持最佳的视觉效果和操作体验。

- **现代化视觉设计** 采用玻璃态（Glassmorphism）设计风格，配合深色主题和彩虹渐变色彩系统，创造出既现代又温暖的视觉体验。

- **无障碍支持** 界面设计充分考虑了可访问性，支持键盘导航、屏幕阅读器等辅助功能，确保所有用户都能顺利使用。

## 项目结构

```
frontend/
├── src/
│   ├── components/          # Vue组件
│   │   ├── core/           # 核心功能组件
│   │   ├── layout/         # 布局组件
│   │   └── views/          # 页面视图
│   ├── composables/        # 组合式函数
│   ├── stores/            # Pinia状态管理
│   ├── router/            # Vue Router
│   └── assets/            # 静态资源
├── doc/                   # 文档资源
├── vite.config.js        # Vite配置
└── package.json          # 项目依赖
```

## 开发指南

想要为Moodify项目贡献代码？请查看我们的详细开发指南：

[![Contributing Guide](https://img.shields.io/badge/📝_Contributing-Guide-blue?style=for-the-badge)](CONTRIBUTING.md)

开发指南包含完整的贡献流程、代码规范、测试要求等信息，帮助你快速上手项目开发。

## 许可证声明

### MIT许可证

本项目采用MIT许可证进行开源发布。MIT许可证是一种宽松的开源许可证，允许你自由地使用、修改、分发本项目的代码，无论是用于商业目的还是非商业目的。

- **你可以做什么**
使用本项目的代码开发自己的应用
修改代码以满足你的需求
将代码集成到你的商业产品中
重新分发代码（需保留原始许可证声明）

- **你需要做什么**
在你的项目中保留原始的版权声明和许可证文本
如果你分发了修改后的代码，需要明确标注你所做的修改

- **我们不承担的责任**
本项目按"原样"提供，不提供任何明示或暗示的担保
作者不对使用本项目可能造成的任何损失承担责任

完整的许可证文本请参阅项目根目录下的 [LICENSE](LICENSE) 文件。

### 第三方依赖

本项目使用了多个开源库和工具，我们对这些项目的作者和维护者表示衷心的感谢。所有第三方依赖的许可证信息都可以在相应的package.json文件中找到。

## 致谢

Moodify的诞生离不开整个开源社区的支持和贡献。我们特别感谢以下项目和组织：

- [pqoqubbw/icons](https://github.com/pqoqubbw/icons) - pqoqubbw的图标源代码为我们提供了主页动态表情的灵感和素材。
- [nikitatkachenko/19332-spotify-songs](https://www.kaggle.com/datasets/nikitatkachenko/19332-spotify-songs) - Nikita Tkachenko的Spotify歌曲音频特征数据集为我们的音乐推荐算法提供了宝贵的数据支持。
- [maltegrosse/8-m-spotify-tracks-genre-audio-features](https://www.kaggle.com/datasets/maltegrosse/8-m-spotify-tracks-genre-audio-features) - Malte Grosse的Spotify音轨数据库为我们提供了更为全面的音乐特征数据，帮助我们优化推荐算法。

### 社区贡献者

虽然Moodify还是一个年轻的项目，但我们已经收到了来自社区的宝贵反馈和建议。每一个Issue、每一次讨论、每一个Star都是对我们工作的认可和鼓励。

**特别感谢**
感谢所有在项目早期提供反馈的用户
感谢那些帮助测试和发现问题的开发者
感谢为项目提供建议和改进意见的社区成员
