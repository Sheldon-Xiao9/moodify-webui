<template>
  <div class="dynamic-emoji" ref="containerRef">
    <canvas 
      ref="canvasRef"
      class="emoji-canvas"
      :class="{ 'small-size': isSmall }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createEmojiRenderer } from '@/assets/scripts/canvasRenderer'
import { useAnimationStore } from '@/stores/animations'

const props = defineProps({
  mood: {
    type: String,
    default: 'happy'
  },
  isSmall: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['ready', 'mood-change'])

const store = useAnimationStore()
const containerRef = ref(null)
const canvasRef = ref(null)
let renderer = null

onMounted(async () => {
  await nextTick()
  initRenderer()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (renderer) {
    renderer.destroy()
    renderer = null
  }
  window.removeEventListener('resize', handleResize)
})

// 监听心情变化
watch(() => props.mood, (newMood) => {
  if (renderer) {
    renderer.updateMood(newMood)
    emit('mood-change', newMood)
  }
})

// 监听尺寸变化
watch(() => props.isSmall, () => {
  nextTick(() => {
    if (renderer) {
      renderer.resize()
    }
  })
})

// 初始化渲染器
const initRenderer = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  
  // 设置画布尺寸
  updateCanvasSize()
  
  // 创建渲染器
  renderer = createEmojiRenderer(canvas, {
    parallaxStrength: props.interactive ? 0.02 : 0,
    breathingSpeed: 0.003,
    glowIntensity: 0.3,
    colorCycle: !props.isSmall
  })
  
  // 设置初始心情
  renderer.updateMood(props.mood)
  
  emit('ready', renderer)
}

// 更新画布尺寸
const updateCanvasSize = () => {
  if (!canvasRef.value || !containerRef.value) return
  
  const container = containerRef.value
  const canvas = canvasRef.value
  const rect = container.getBoundingClientRect()
  
  const size = props.isSmall 
    ? Math.min(rect.width, rect.height, 200)
    : Math.min(rect.width, rect.height, 800)
  
  canvas.width = size
  canvas.height = size
  canvas.style.width = size + 'px'
  canvas.style.height = size + 'px'
}

// 处理窗口大小变化
const handleResize = () => {
  updateCanvasSize()
  if (renderer) {
    renderer.resize()
  }
}

// 暴露方法给父组件
const updateMood = (mood) => {
  if (renderer) {
    renderer.updateMood(mood)
  }
}

const startAnimation = () => {
  if (renderer) {
    renderer.startAnimation()
  }
}

const stopAnimation = () => {
  if (renderer) {
    renderer.stopAnimation()
  }
}

defineExpose({
  updateMood,
  startAnimation,
  stopAnimation,
  renderer: () => renderer
})
</script>

<style lang="scss" scoped>
.dynamic-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.emoji-canvas {
  transition: all 0.3s ease;
  border-radius: 50%;
  cursor: pointer;
  
  // 添加轻微的阴影
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  // 悬停效果
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
  }
  
  // 小尺寸样式
  &.small-size {
    max-width: 200px;
    max-height: 200px;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

// 响应式设计
@media (max-width: 767px) {
  .emoji-canvas {
    max-width: 280px;
    max-height: 280px;
    
    &.small-size {
      max-width: 140px;
      max-height: 140px;
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .emoji-canvas {
    max-width: 350px;
    max-height: 350px;
    
    &.small-size {
      max-width: 170px;
      max-height: 170px;
    }
  }
}

@media (min-width: 1024px) {
  .emoji-canvas {
    max-width: 450px;
    max-height: 450px;
    
    &.small-size {
      max-width: 200px;
      max-height: 200px;
    }
  }
}

// 动画状态
.dynamic-emoji {
  &.animate-in {
    animation: fadeInScale 0.6s ease-out;
  }
  
  &.animate-out {
    animation: fadeOutScale 0.4s ease-in;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOutScale {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

// 加载状态
.dynamic-emoji.loading {
  .emoji-canvas {
    opacity: 0.5;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

// 错误状态
.dynamic-emoji.error {
  .emoji-canvas {
    opacity: 0.3;
    filter: grayscale(100%);
  }
}

// 添加光晕效果
.emoji-canvas.glow {
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  from {
    box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
  }
  to {
    box-shadow: 0 0 30px rgba(255, 209, 102, 0.6);
  }
}
</style>
