<template>
  <div class="progress-loader">
    <!-- 进度条容器 -->
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${progress}%` }"
        ></div>
        <div class="progress-glow" :style="{ left: `${progress}%` }"></div>
      </div>
    </div>
    
    <!-- 进度文本 -->
    <div class="progress-text">
      {{ currentStageText }}
    </div>
    
    <!-- 进度百分比 -->
    <div class="progress-percentage">
      {{ Math.round(progress) }}%
    </div>
    
    <!-- 流动光效背景 -->
    <div class="flowing-background"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAnimationStore } from '@/stores/animations'

const props = defineProps({
  duration: {
    type: Number,
    default: 5000 // 5秒完成
  },
  autoStart: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['progress', 'stage-change', 'complete'])

const store = useAnimationStore()

// 响应式数据
const progress = ref(0)
const currentStage = ref(0)
const isRunning = ref(false)

// 进度阶段配置
const stages = [
  { range: [0, 30], text: "AI解析情绪中..." },
  { range: [30, 70], text: "匹配音频特征..." },
  { range: [70, 100], text: "生成个性歌单..." }
]

// 计算当前阶段文本
const currentStageText = computed(() => {
  return stages[currentStage.value]?.text || stages[0].text
})

// 动画定时器
let animationTimer = null
let stageCheckTimer = null

onMounted(() => {
  if (props.autoStart) {
    startProgress()
  }
})

onUnmounted(() => {
  stopProgress()
})

// 监听进度变化
watch(progress, (newProgress) => {
  // 检查阶段变化
  checkStageChange(newProgress)
  
  // 更新store
  store.updateProcessing(newProgress, currentStageText.value)
  
  // 发射进度事件
  emit('progress', newProgress)
  
  // 检查完成
  if (newProgress >= 100) {
    completeProgress()
  }
})

// 检查阶段变化
const checkStageChange = (progressValue) => {
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    if (progressValue >= stage.range[0] && progressValue < stage.range[1]) {
      if (currentStage.value !== i) {
        currentStage.value = i
        emit('stage-change', i, stage.text)
      }
      break
    }
  }
  
  // 处理最后阶段
  if (progressValue >= 70 && currentStage.value !== 2) {
    currentStage.value = 2
    emit('stage-change', 2, stages[2].text)
  }
}

// 开始进度
const startProgress = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  progress.value = 0
  currentStage.value = 0
  
  const startTime = Date.now()
  const animate = () => {
    if (!isRunning.value) return
    
    const elapsed = Date.now() - startTime
    const progressPercent = Math.min((elapsed / props.duration) * 100, 100)
    
    // 添加一些随机波动使进度更自然
    const variation = Math.sin(elapsed / 200) * 2
    progress.value = Math.min(progressPercent + variation, 100)
    
    if (progress.value < 100) {
      animationTimer = requestAnimationFrame(animate)
    }
  }
  
  animate()
}

// 停止进度
const stopProgress = () => {
  isRunning.value = false
  if (animationTimer) {
    cancelAnimationFrame(animationTimer)
    animationTimer = null
  }
  if (stageCheckTimer) {
    clearTimeout(stageCheckTimer)
    stageCheckTimer = null
  }
}

// 完成进度
const completeProgress = () => {
  stopProgress()
  progress.value = 100
  currentStage.value = 2
  
  setTimeout(() => {
    emit('complete')
  }, 500) // 延迟一点显示完成状态
}

// 重置进度
const resetProgress = () => {
  stopProgress()
  progress.value = 0
  currentStage.value = 0
}

// 设置进度
const setProgress = (value) => {
  progress.value = Math.max(0, Math.min(100, value))
}

// 跳转到指定阶段
const jumpToStage = (stageIndex) => {
  if (stageIndex >= 0 && stageIndex < stages.length) {
    const stage = stages[stageIndex]
    progress.value = stage.range[0]
    currentStage.value = stageIndex
  }
}

// 暴露方法给父组件
defineExpose({
  startProgress,
  stopProgress,
  resetProgress,
  setProgress,
  jumpToStage,
  completeProgress
})
</script>

<style lang="scss" scoped>
.progress-loader {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 80vw;
  margin: 0 auto;
  padding: 2rem;
  z-index: 10;
}

.progress-container {
  width: 100%;
  position: relative;
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD166, #EF476F, #06D6A0);
  background-size: 200% 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: flowing-gradient 3s linear infinite;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
    animation: shine 2s ease-in-out infinite;
  }
}

.progress-glow {
  position: absolute;
  top: -2px;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, rgba(255, 209, 102, 0.8), transparent);
  border-radius: 50%;
  transform: translateX(-50%);
  transition: left 0.3s ease;
  animation: pulse-glow 1s ease-in-out infinite alternate;
}

@keyframes flowing-gradient {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@keyframes shine {
  0%, 100% {
    opacity: 0;
    transform: translateX(-20px);
  }
  50% {
    opacity: 1;
    transform: translateX(0px);
  }
}

@keyframes pulse-glow {
  from {
    opacity: 0.6;
    transform: translateX(-50%) scale(1);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1.2);
  }
}

.progress-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  @media (max-width: 767px) {
    font-size: 1rem;
  }
}

.progress-percentage {
  font-size: 0.9rem;
  color: #FFD166;
  font-weight: 500;
  text-align: center;
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
}

.flowing-background {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 209, 102, 0.05),
    rgba(239, 71, 111, 0.05),
    rgba(6, 214, 160, 0.05),
    transparent
  );
  animation: flow-across 4s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes flow-across {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

// 阶段特定样式
.progress-loader {
  &.stage-0 .progress-fill {
    background: linear-gradient(90deg, #FFD166, #FFA726);
  }
  
  &.stage-1 .progress-fill {
    background: linear-gradient(90deg, #EF476F, #E91E63);
  }
  
  &.stage-2 .progress-fill {
    background: linear-gradient(90deg, #06D6A0, #4CAF50);
  }
}

// 完成状态
.progress-loader.completed {
  .progress-fill {
    animation: completion-flash 0.5s ease-out;
  }
  
  .progress-text {
    color: #06D6A0;
    animation: text-glow 0.5s ease-out;
  }
}

@keyframes completion-flash {
  0% {
    box-shadow: 0 0 0 rgba(6, 214, 160, 0);
  }
  50% {
    box-shadow: 0 0 20px rgba(6, 214, 160, 0.8);
  }
  100% {
    box-shadow: 0 0 0 rgba(6, 214, 160, 0);
  }
}

@keyframes text-glow {
  0% {
    text-shadow: 0 0 0 rgba(6, 214, 160, 0);
  }
  50% {
    text-shadow: 0 0 10px rgba(6, 214, 160, 0.8);
  }
  100% {
    text-shadow: 0 0 0 rgba(6, 214, 160, 0);
  }
}

// 错误状态
.progress-loader.error {
  .progress-fill {
    background: linear-gradient(90deg, #EF476F, #F44336);
    animation: error-pulse 0.5s ease-in-out infinite alternate;
  }
  
  .progress-text {
    color: #EF476F;
  }
}

@keyframes error-pulse {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 767px) {
  .progress-loader {
    max-width: 90vw;
    padding: 1.5rem;
  }
  
  .progress-bar {
    height: 6px;
  }
  
  .progress-glow {
    width: 10px;
    height: 10px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .progress-loader {
    max-width: 85vw;
  }
}

// 暗黑模式优化
@media (prefers-color-scheme: dark) {
  .progress-bar {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .progress-text {
    color: rgba(255, 255, 255, 0.95);
  }
}

// 减少动画效果（用户偏好）
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    animation: none;
  }
  
  .progress-glow {
    animation: none;
  }
  
  .flowing-background {
    animation: none;
  }
}
</style>
