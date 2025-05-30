<template>
  <div class="app-container">
    <!-- 顶部渐变条 -->
    <GradientHeader />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import GradientHeader from './GradientHeader.vue'
import { onMounted } from 'vue'

onMounted(() => {
  // 确保页面不可滚动
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
})
</script>

<style lang="scss" scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #121212;
  position: relative;
  overflow: hidden;
  
  // 确保容器填满整个视口
  min-height: 100vh;
  max-height: 100vh;
}

.main-content {
  position: relative;
  width: 100%;
  height: 100vh;
  padding-top: 10vh; // 为顶部渐变条留出空间
  z-index: 5;
  
  // 确保内容区域正确定位
  display: flex;
  flex-direction: column;
}

// 背景装饰圆圈
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.03;
  animation: float-decoration 20s ease-in-out infinite;
  
  &.circle-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #FFD166, transparent);
    top: 20%;
    left: -10%;
    animation-delay: 0s;
  }
  
  &.circle-2 {
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, #EF476F, transparent);
    top: 50%;
    right: -15%;
    animation-delay: -7s;
  }
  
  &.circle-3 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, #06D6A0, transparent);
    bottom: 10%;
    left: 50%;
    animation-delay: -14s;
  }
}

@keyframes float-decoration {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

// 响应式设计
@media (max-width: 767px) {
  .decoration-circle {
    &.circle-1 {
      width: 200px;
      height: 200px;
    }
    
    &.circle-2 {
      width: 300px;
      height: 300px;
    }
    
    &.circle-3 {
      width: 150px;
      height: 150px;
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .decoration-circle {
    &.circle-1 {
      width: 250px;
      height: 250px;
    }
    
    &.circle-2 {
      width: 375px;
      height: 375px;
    }
    
    &.circle-3 {
      width: 175px;
      height: 175px;
    }
  }
}

// 确保在所有屏幕尺寸下都没有滚动条
@media screen and (max-height: 600px) {
  .main-content {
    height: 100vh;
    overflow: hidden;
  }
}

// 添加边缘渐变效果
.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 70%,
    rgba(0, 0, 0, 0.2) 100%
  );
  pointer-events: none;
  z-index: 2;
}

// 添加细微的噪点纹理
.app-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
  background-size: 20px 20px;
  opacity: 0.03;
  pointer-events: none;
  z-index: 2;
}
</style>
