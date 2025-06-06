# Moodify 开发文档

本文档提供了 Moodify 前端应用的完整开发指南。

## 开发环境

### 必要开发工具清单

#### 核心运行时
- **Node.js**: >= 16.0.0 (推荐使用 [Node.js LTS](https://nodejs.org/))
- **npm**: >= 7.0.0 (跟随 Node.js 安装)

#### 浏览器开发工具
- **Chrome DevTools** (推荐)

### 依赖安装命令

```bash
# 在项目根目录 frontend/ 执行
npm install
```

### 初始化操作

#### 1. 环境变量配置
```bash
# 在项目根目录 frontend/ 执行
cp .env.example .env.development
```

编辑 `.env.development` 文件：
```bash
# API 基础 URL (开发环境)
VITE_API_BASE_URL=http://localhost:8000

# 应用信息
VITE_APP_TITLE=Moodify - 情绪音乐推荐
VITE_APP_DESCRIPTION=基于情绪的智能音乐推荐系统

# Spotify API 配置 (从 https://developer.spotify.com/dashboard 获取)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# 开发配置
VITE_ENABLE_MOCK=true
VITE_LOG_LEVEL=debug
```

#### 2. 代码规范检查
```bash
# 在项目根目录 frontend/ 执行
npm run lint
```

## 工作流

### 启动开发模式命令

#### 方式一：标准启动
```bash
# 在项目根目录 frontend/ 执行
npm run dev
```

#### 方式二：自动化启动（推荐）
```bash
# 在项目根目录 frontend/ 执行
node start.js
```

**访问地址**: http://localhost:3000

### 代码热加载规则

#### 自动重载的文件类型
- **Vue 组件** (.vue): 实时更新，保持组件状态
- **JavaScript/TypeScript** (.js, .ts): 模块热替换
- **SCSS/CSS** (.scss, .css): 样式注入，无需刷新页面
- **环境变量** (.env.*): 需要重启开发服务器

#### 需要手动重启的情况
- 修改 `vite.config.js` 配置文件
- 修改 `package.json` 依赖
- 新增/删除环境变量
- 修改路径别名配置

**重启命令**:
```bash
# 在项目根目录 frontend/ 执行
# 停止服务: Ctrl+C
npm run dev
```

### 测试运行命令

#### 代码质量检查
```bash
# 在项目根目录 frontend/ 执行

# ESLint 检查
npm run lint

# 代码格式化
npm run format

# 生产构建测试
npm run build
```

#### 手动功能测试
```bash
# 在项目根目录 frontend/ 执行

# 构建并预览
npm run build
npm run preview
```

## 项目结构

### 核心目录职责说明

```
frontend/
├── src/                          # 源代码目录
│   ├── components/               # Vue 组件
│   │   ├── core/                # 核心业务组件：情绪输入、动态表情、音乐卡片等
│   │   ├── layout/              # 布局组件：页面容器、头部、背景等
│   │   └── views/               # 页面视图：首页、结果页等路由组件
│   ├── composables/             # 组合式函数：动画控制器、音频播放器等可复用逻辑
│   ├── stores/                  # Pinia 状态管理：全局状态如动画状态
│   ├── router/                  # Vue Router：路由配置和导航逻辑
│   └── assets/                  # 静态资源目录
│       ├── styles/              # SCSS 样式：变量、混入、动画等
│       └── scripts/             # 工具脚本：Canvas 渲染器等
├── docs/                        # 项目文档：开发指南、部署指南等
├── vite.config.js              # Vite 构建配置：路径别名、代理、优化等
├── package.json                # 项目依赖和脚本定义
├── start.js                    # 自动化启动脚本：环境检查、依赖安装
└── .env.example                # 环境变量模板：API配置、功能开关等
```

### 核心文件路径

#### 应用入口
- **`src/main.js`**: 应用启动入口，注册全局组件和插件
- **`index.html`**: HTML 模板文件
- **`src/App.vue`**: 根组件，包含路由出口

#### 主要配置文件
- **`vite.config.js`**: Vite 构建工具配置
- **`src/router/index.js`**: 路由配置文件
- **`src/assets/styles/variables.scss`**: 全局样式变量

#### 核心业务组件
- **`src/components/core/EmotionInput.vue`**: 情绪输入组件
- **`src/components/core/DynamicEmoji.vue`**: 动态表情组件
- **`src/components/core/MusicCard.vue`**: 音乐卡片组件

## 调试支持

### 诊断工具使用方式

#### Vue Devtools 使用
1. 安装 [Vue.js devtools](https://devtools.vuejs.org/) 浏览器扩展
2. 在开发模式下打开浏览器开发者工具
3. 切换到 "Vue" 标签页查看组件树和状态

#### Chrome DevTools 调试
```javascript
// 在组件中添加调试断点
export default {
  methods: {
    handleEmotionSubmit() {
      debugger; // 断点位置
      // 处理逻辑
    }
  }
}
```

#### Vite 开发服务器信息
```bash
# 查看详细构建信息
npm run dev -- --debug

# 查看依赖预构建信息
npm run dev -- --force
```

### 常见错误解决方案

| 问题现象 | 解决命令 |
|---------|----------|
| 端口被占用 | `lsof -ti:3000 \| xargs kill -9` |
| 依赖冲突 | `rm -rf node_modules package-lock.json && npm install` |
| 热更新失效 | `npm run dev -- --force` |
| 样式不生效 | `npm run format && npm run dev` |
| 组件未注册 | 检查 `src/main.js` 中的组件导入 |
| 路由404错误 | 检查 `src/router/index.js` 路由配置 |
| API请求失败 | `curl http://localhost:8000/health` |
| 构建失败 | `npm run lint -- --fix && npm run build` |

### 性能调试

#### Vite 构建分析
```bash
# 在项目根目录 frontend/ 执行

# 检查构建产物大小
du -sh dist/
ls -lah dist/assets/
```

#### 浏览器性能分析
1. 打开 Chrome DevTools
2. 切换到 "Performance" 标签
3. 点击录制按钮进行操作
4. 分析 JavaScript 执行、渲染性能

#### 内存泄漏检测
```javascript
// 在组件中监控内存使用
export default {
  mounted() {
    console.log('Memory usage:', performance.memory);
  },
  beforeUnmount() {
    // 清理定时器、事件监听器等
    clearInterval(this.timer);
    window.removeEventListener('resize', this.handleResize);
  }
}
```

## 开发规范

### 组件开发规范

#### 1. 组件命名与组织

项目组件应按功能分类放置在不同目录中：

- **核心业务组件**（如情绪输入、动态表情、音乐卡片等）应放在 `components/core/` 目录
- **布局相关组件**（如头部、容器等）放在 `components/layout/` 目录
- **页面级组件**（目前是主页与结果展示页）放在 `components/views/` 目录

```
components/
├── core/              # 核心功能组件
│   ├── DynamicEmoji.vue
│   └── EmotionInput.vue
├── layout/            # 布局组件
│   └── GradientHeader.vue
└── views/             # 页面视图组件
    └── HomeView.vue
```
新增组件时，请使用PascalCase命名法（如EmotionInput.vue），并根据组件职责选择合适的目录。

#### 2. Props 定义规范
```javascript
// ✅ 好的 Props 定义
props: {
  emotion: {
    type: String,
    required: true,
    validator: (value) => {
      return ['happy', 'sad', 'excited', 'calm'].includes(value)
    }
  },
  animationSpeed: {
    type: Number,
    default: 1.0,
    validator: (value) => value > 0 && value <= 5
  }
}

// ❌ 避免这样定义
props: ['emotion', 'speed']
```

#### 3. 事件命名规范
```javascript
// ✅ 使用 kebab-case 命名事件
this.$emit('emotion-change', newEmotion)
this.$emit('animation-complete', animationData)

// ❌ 避免 camelCase
this.$emit('emotionChange', newEmotion)
```

### SCSS 样式规范

#### 1. 文件组织
```scss
// variables.scss - 全局变量
$primary-color: #6366f1;
$animation-duration: 0.3s;

// mixins.scss - 可复用混入
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// components/EmotionInput.scss - 组件样式
.emotion-input {
  @include flex-center;
  
  &__field {
    border: 1px solid $primary-color;
    
    &--focused {
      box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
    }
  }
}
```

#### 2. BEM 命名约定
```scss
// 块 (Block)
.emotion-input { }

// 元素 (Element)
.emotion-input__field { }
.emotion-input__label { }

// 修饰符 (Modifier)
.emotion-input--disabled { }
.emotion-input__field--error { }
```

### 安全规范

#### 1. 输入验证
```javascript
// ✅ 验证用户输入
function validateEmotionInput(input) {
  // 长度限制
  if (input.length > 100) return false
  
  // 特殊字符检查
  const dangerousChars = /<script|javascript:|onload=/i
  if (dangerousChars.test(input)) return false
  
  return true
}

// ❌ 直接使用未验证的输入
element.innerHTML = userInput
```

#### 2. API 安全
```javascript
// ✅ 使用环境变量存储敏感信息
const API_KEY = import.meta.env.VITE_MUSIC_API_KEY

// ❌ 硬编码敏感信息
const API_KEY = 'sk-1234567890abcdef'
```

### 可访问性规范

#### 1. ARIA 标签
```vue
<template>
  <!-- ✅ 提供清晰的 ARIA 标签 -->
  <input
    type="text"
    aria-label="情绪输入框"
    :aria-describedby="helpTextId"
    :aria-invalid="hasError"
    role="textbox"
  />
  
  <!-- ✅ 状态提示 -->
  <div
    :id="helpTextId"
    aria-live="polite"
    role="status"
  >
    {{ statusMessage }}
  </div>
</template>
```

#### 2. 键盘导航
```javascript
// ✅ 支持键盘操作
onKeyDown(event) {
  switch (event.key) {
    case 'Enter':
      this.submitEmotion()
      break
    case 'Escape':
      this.clearInput()
      break
    case 'Tab':
      // 允许默认 Tab 行为
      break
  }
}
```

### 第三方工具链接

- **Vue.js**: https://vuejs.org/
- **Vite**: https://vitejs.dev/
- **GSAP**: https://greensock.com/gsap/
- **Howler.js**: https://howlerjs.com/
- **Pinia**: https://pinia.vuejs.org/
- **Vue Router**: https://router.vuejs.org/
- **ESLint**: https://eslint.org/
- **Prettier**: https://prettier.io/
- **Sass**: https://sass-lang.com/

---

**提示**: 如果在开发过程中遇到问题，请参考[部署文档](deployment.md)或在 GitHub Issues 中提问。
