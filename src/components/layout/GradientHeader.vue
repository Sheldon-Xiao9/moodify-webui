<template>
  <header class="gradient-header">
    <div class="gradient-background" />
    <div class="header-content">
      <div class="logo-section">
        <img 
          src="@/assets/logo.svg" 
          alt="Moodify" 
          class="logo-icon"
        />
        <h1 class="app-title">Moodify</h1>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// 在组件挂载时开始动画
onMounted(() => {
  // 渐变动画会通过CSS自动运行
})

onUnmounted(() => {
  // 清理工作
})
</script>

<style lang="scss" scoped>
.gradient-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 10vh;
  z-index: 10;
  overflow: hidden;
}

.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 300%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #FFD166 0%,
    #EF476F 25%,
    #06D6A0 50%,
    #6A7BDB 75%,
    #FFD166 100%
  );
  background-size: 100% 100%;
  animation: gradient-flow 8s ease-in-out infinite;
}

@keyframes gradient-flow {
  0% {
    transform: translateX(0%);
  }
  25% {
    transform: translateX(-8.33%);
  }
  50% {
    transform: translateX(-16.66%);
  }
  75% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(0%);
  }
}

.header-content {
  position: relative;
  z-index: 12;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 2rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  height: 3rem;
  width: auto;
  // 减少SVG图标上移幅度，从-8px调整为-4px
  transform: translateY(-4px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
  
  // 确保SVG颜色保持原始渐变
  & path {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
}

@keyframes float {
  0%, 100% {
    // 在基础上移(-4px)的基础上进行浮动
    transform: translateY(-4px);
  }
  50% {
    // 浮动到稍高位置
    transform: translateY(-7px);
  }
}

.app-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
  margin: 0;
}

// 响应式设计
@media (max-width: 767px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .logo-icon {
    height: 2.5rem;
    // 移动端减少上移幅度，从-6px调整为-3px
    transform: translateY(-3px);
  }
  
  .app-title {
    font-size: 1.4rem;
  }
  
  // 移动端的浮动动画
  @keyframes float {
    0%, 100% {
      transform: translateY(-3px);
    }
    50% {
      transform: translateY(-6px);
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .logo-icon {
    height: 2.8rem;
    // 平板端减少上移幅度，从-7px调整为-3.5px
    transform: translateY(-3.5px);
  }
  
  .app-title {
    font-size: 1.6rem;
  }
  
  // 平板端的浮动动画
  @keyframes float {
    0%, 100% {
      transform: translateY(-3.5px);
    }
    50% {
      transform: translateY(-6.5px);
    }
  }
}

// 添加光晕效果
.logo-section {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

// 垂直渐变遮罩效果 - 从顶部彩色渐变到底部主页背景色
.gradient-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 5%,
    rgba(18, 18, 18, 0.2) 15%,
    rgba(18, 18, 18, 0.6) 30%,
    #121212 60%
  );
  pointer-events: none;
  z-index: 1;
}

// 动态边缘光效
.gradient-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 5%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shine 3s ease-in-out infinite;
  z-index: 2;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}
</style>
