<template>
  <div class="home-view">
    <!-- 动态背景装饰 -->
    <div class="background-decorations">
      <!-- 浮动几何形状 -->
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
        <div class="shape shape-7"></div>
        <div class="shape shape-8"></div>
      </div>
      
      <!-- 渐变光球 -->
      <div class="gradient-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
      </div>
      
      <!-- 音符装饰 -->
      <div class="music-notes">
        <span class="note note-1">♪</span>
        <span class="note note-2">♫</span>
        <span class="note note-3">♪</span>
        <span class="note note-4">♬</span>
        <span class="note note-5">♫</span>
        <span class="note note-6">♪</span>
        <span class="note note-7">♬</span>
        <span class="note note-8">♫</span>
      </div>
      
      <!-- 粒子效果 -->
      <div class="particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
        <div class="particle particle-7"></div>
        <div class="particle particle-8"></div>
        <div class="particle particle-9"></div>
        <div class="particle particle-10"></div>
      </div>
    </div>

    <!-- 中央引导区域 -->
    <div class="central-guide">
      <!-- 动态表情 -->
      <div 
        class="emoji-container"
        :class="{ 'small': isInputActive }"
      >
        <DynamicEmoji
          ref="emojiRef"
          :mood="currentMood"
          :is-small="isInputActive"
          @ready="handleEmojiReady"
          @mood-change="handleMoodChange"
        />
      </div>
      
      <!-- 情绪输入面板 -->
      <div class="input-panel">
        <EmotionInput
          ref="emotionInputRef"
          @start="handleInputStart"
          @submit="handleEmotionSubmit"
          @blur="handleInputBlur"
          @focus="handleInputFocus"
        />
      </div>
    </div>
    
    <!-- 进度加载区域 -->
    <Transition name="fade" appear>
      <div 
        class="progress-section" 
        v-if="showProgress"
      >
        <ProgressLoader
          ref="progressRef"
          :duration="5000"
          :auto-start="false"
          @progress="handleProgress"
          @stage-change="handleStageChange"
          @complete="handleProcessComplete"
        />
        
        <!-- 情绪分析摘要 -->
        <div class="emotion-analysis" v-if="emotionAnalysis">
          {{ emotionAnalysis }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAnimationStore } from '@/stores/animations'
import DynamicEmoji from '@/components/core/DynamicEmoji.vue'
import EmotionInput from '@/components/core/EmotionInput.vue'
import ProgressLoader from '@/components/core/ProgressLoader.vue'

const emit = defineEmits(['emotion-submitted', 'processing-complete'])

const store = useAnimationStore()

// 组件引用
const emojiRef = ref(null)
const emotionInputRef = ref(null)
const progressRef = ref(null)

// 响应式数据
const currentMood = ref('happy')
const isEmojiReady = ref(false)
const submittedEmotion = ref('')

// 计算属性
const isInputActive = computed(() => store.isInputActive)
const isProcessing = computed(() => store.isProcessing)
const showProgress = computed(() => isProcessing.value)
const emotionAnalysis = computed(() => store.emotionAnalysis)

onMounted(() => {
  // 初始化状态
  store.resetState()
})

// 监听处理状态变化
watch(isProcessing, (newValue) => {
  if (newValue && progressRef.value) {
    // 开始进度条动画
    nextTick(() => {
      progressRef.value.startProgress()
    })
  }
})

// 处理表情准备就绪
const handleEmojiReady = (renderer) => {
  isEmojiReady.value = true
  console.log('Emoji renderer ready:', renderer)
}

// 处理心情变化
const handleMoodChange = (mood) => {
  currentMood.value = mood
  console.log('Mood changed to:', mood)
}

// 处理输入开始
const handleInputStart = () => {
  console.log('Input started')
}

// 处理情绪提交
const handleEmotionSubmit = (emotionText) => {
  submittedEmotion.value = emotionText
  
  // 分析用户输入的情绪
  const analyzedEmotion = analyzeEmotion(emotionText)
  
  // 更新表情状态
  if (emojiRef.value) {
    emojiRef.value.updateMood(analyzedEmotion.mood)
  }
  
  // 设置情绪分析结果
  const analysis = `根据「${emotionText}」匹配到「${analyzedEmotion.label}」`
  store.setEmotionAnalysis(analysis)
  
  // 开始处理
  store.setProcessing(true)
  
  // 发射事件给父组件
  emit('emotion-submitted', {
    text: emotionText,
    mood: analyzedEmotion.mood,
    emotions: analyzedEmotion.emotions,
    analysis: analysis
  })
  
  console.log('Emotion submitted:', emotionText)
}

// 处理输入失焦
const handleInputBlur = () => {
  console.log('Input blurred')
}

// 处理输入聚焦
const handleInputFocus = () => {
  console.log('Input focused')
}

// 处理进度更新
const handleProgress = (progress) => {
  console.log('Progress:', progress + '%')
}

// 处理阶段变化
const handleStageChange = (stage, text) => {
  console.log('Stage changed:', stage, text)
}

// 处理处理完成
const handleProcessComplete = () => {
  console.log('Processing complete')
  
  // 发射完成事件
  emit('processing-complete', {
    emotion: submittedEmotion.value,
    mood: currentMood.value
  })
}

// 情绪分析函数
const analyzeEmotion = (text) => {
  const emotionKeywords = {
    happy: {
      keywords: ['开心', '快乐', '兴奋', '愉快', '高兴', '喜悦', '欢乐', '满足', '幸福'],
      mood: 'happy',
      label: '快乐'
    },
    sad: {
      keywords: ['难过', '伤心', '沮丧', '失落', '悲伤', '痛苦', '忧郁', '低落'],
      mood: 'sad',
      label: '悲伤'
    },
    calm: {
      keywords: ['平静', '放松', '安静', '宁静', '舒缓', '淡定', '冷静', '安详'],
      mood: 'calm',
      label: '平静'
    },
    excited: {
      keywords: ['激动', '兴奋', '热情', '狂欢', '疯狂', '亢奋', '刺激'],
      mood: 'excited',
      label: '兴奋'
    },
    melancholy: {
      keywords: ['忧郁', '怀念', '思念', '孤独', '寂寞', '惆怅', '怀旧'],
      mood: 'melancholy',
      label: '忧郁'
    },
    energetic: {
      keywords: ['充满活力', '有精神', '活跃', '动感', '有力量', '精力充沛'],
      mood: 'excited',
      label: '充满活力'
    }
  }
  
  const lowerText = text.toLowerCase()
  let matchedEmotions = []
  let primaryMood = 'happy'
  let primaryLabel = '快乐'
  
  // 检查关键词匹配
  for (const [emotion, config] of Object.entries(emotionKeywords)) {
    const hasMatch = config.keywords.some(keyword => 
      lowerText.includes(keyword)
    )
    
    if (hasMatch) {
      matchedEmotions.push(emotion)
      primaryMood = config.mood
      primaryLabel = config.label
    }
  }
  
  // 如果没有匹配，根据文本长度和内容进行简单推测
  if (matchedEmotions.length === 0) {
    if (lowerText.includes('!') || lowerText.includes('！')) {
      primaryMood = 'excited'
      primaryLabel = '兴奋'
      matchedEmotions.push('excited')
    } else if (lowerText.includes('...') || lowerText.includes('。。。')) {
      primaryMood = 'melancholy'
      primaryLabel = '忧郁'
      matchedEmotions.push('melancholy')
    } else {
      primaryMood = 'happy'
      primaryLabel = '快乐'
      matchedEmotions.push('happy')
    }
  }
  
  return {
    mood: primaryMood,
    label: primaryLabel,
    emotions: matchedEmotions,
    confidence: matchedEmotions.length > 0 ? 0.8 : 0.5
  }
}

// 重置视图状态
const resetView = () => {
  submittedEmotion.value = ''
  currentMood.value = 'happy'
  
  if (emotionInputRef.value) {
    emotionInputRef.value.resetInput()
  }
  
  if (emojiRef.value) {
    emojiRef.value.updateMood('happy')
  }
  
  store.resetState()
}

// 暴露方法给父组件
defineExpose({
  resetView,
  analyzeEmotion,
  setMood: (mood) => {
    currentMood.value = mood
    if (emojiRef.value) {
      emojiRef.value.updateMood(mood)
    }
  }
})
</script>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  padding: 2rem;
  overflow: hidden;
  
  // 保持原来的静态背景色 - 移除颜色变化动画
  // 继承父容器的背景，不添加额外的背景
  
  @media (max-width: 767px) {
    padding: 1rem;
  }
}

// 背景装饰容器
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

// 浮动几何形状
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 20%;
  right: 15%;
  animation-delay: -2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 8%;
  animation-delay: -4s;
}

.shape-4 {
  width: 45px;
  height: 45px;
  top: 60%;
  right: 8%;
  animation-delay: -1s;
}

.shape-5 {
  width: 70px;
  height: 70px;
  top: 40%;
  left: 5%;
  animation-delay: -3s;
}

.shape-6 {
  width: 55px;
  height: 55px;
  bottom: 10%;
  right: 20%;
  animation-delay: -5s;
}

.shape-7 {
  width: 90px;
  height: 90px;
  top: 5%;
  left: 50%;
  animation-delay: -6s;
}

.shape-8 {
  width: 35px;
  height: 35px;
  bottom: 30%;
  right: 40%;
  animation-delay: -7s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(15px) rotate(240deg);
  }
}

// 渐变光球
.gradient-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: orbFloat 12s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.4) 0%, transparent 70%);
  top: 5%;
  right: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(78, 205, 196, 0.4) 0%, transparent 70%);
  bottom: 15%;
  left: 5%;
  animation-delay: -4s;
}

.orb-3 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 206, 84, 0.4) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -8s;
}

.orb-4 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%);
  top: 70%;
  right: 30%;
  animation-delay: -6s;
}

@keyframes orbFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(-20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(15px, -15px) scale(0.9);
  }
  75% {
    transform: translate(-10px, 20px) scale(1.05);
  }
}

// 音符装饰
.music-notes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.note {
  position: absolute;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.3);
  animation: noteFloat 10s ease-in-out infinite;
}

.note-1 {
  top: 15%;
  left: 20%;
  animation-delay: 0s;
}

.note-2 {
  top: 25%;
  right: 25%;
  animation-delay: -2s;
}

.note-3 {
  bottom: 30%;
  left: 15%;
  animation-delay: -4s;
}

.note-4 {
  top: 50%;
  right: 10%;
  animation-delay: -6s;
}

.note-5 {
  bottom: 15%;
  right: 35%;
  animation-delay: -8s;
}

.note-6 {
  top: 35%;
  left: 30%;
  animation-delay: -3s;
}

.note-7 {
  bottom: 40%;
  right: 15%;
  animation-delay: -5s;
}

.note-8 {
  top: 60%;
  left: 40%;
  animation-delay: -7s;
}

@keyframes noteFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
}

// 粒子效果
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 15s linear infinite;
}

.particle-1 { top: 10%; left: 10%; animation-delay: 0s; }
.particle-2 { top: 20%; left: 80%; animation-delay: -3s; }
.particle-3 { top: 30%; left: 60%; animation-delay: -6s; }
.particle-4 { top: 40%; left: 20%; animation-delay: -9s; }
.particle-5 { top: 50%; left: 90%; animation-delay: -12s; }
.particle-6 { top: 60%; left: 40%; animation-delay: -2s; }
.particle-7 { top: 70%; left: 70%; animation-delay: -5s; }
.particle-8 { top: 80%; left: 30%; animation-delay: -8s; }
.particle-9 { top: 90%; left: 50%; animation-delay: -11s; }
.particle-10 { top: 85%; left: 10%; animation-delay: -14s; }

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

.central-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  transition: all 0.6s ease;
  z-index: 2;
}

.emoji-container {
  width: 300px;
  height: 300px;
  margin-bottom: 3rem;
  transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  // 添加发光效果
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &.small {
    width: 150px;
    height: 150px;
    margin-bottom: 1rem;
    transform: translateY(-20vh);
  }
  
  @media (max-width: 767px) {
    width: 250px;
    height: 250px;
    margin-bottom: 2rem;
    
    &.small {
      width: 120px;
      height: 120px;
      transform: translateY(-25vh);
    }
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 275px;
    height: 275px;
    
    &.small {
      width: 135px;
      height: 135px;
      transform: translateY(-28vh);
    }
  }
}

.input-panel {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  transition: all 0.6s ease;
}

.progress-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 600px;
  z-index: 20;
  
  @media (max-width: 767px) {
    max-width: 90%;
  }
}

.emotion-analysis {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  backdrop-filter: blur(10px);
  
  @media (max-width: 767px) {
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;
    margin-top: 1.5rem;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 状态相关样式
.home-view {
  &.processing {
    .central-guide {
      filter: blur(2px);
      opacity: 0.7;
      pointer-events: none;
    }
  }
}

// 响应式布局调整
@media (max-height: 700px) {
  .emoji-container {
    width: 200px;
    height: 200px;
    margin-bottom: 2rem;
    
    &.small {
      width: 100px;
      height: 100px;
      margin-bottom: 0.5rem;
      transform: translateY(-20vh);
    }
  }
}

@media (max-height: 600px) {
  .home-view {
    padding: 1rem;
  }
  
  .emoji-container {
    width: 150px;
    height: 150px;
    margin-bottom: 1.5rem;
    
    &.small {
      width: 80px;
      height: 80px;
      transform: translateY(-15vh);
    }
  }
  
  .input-panel {
    min-height: 150px;
  }
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .central-guide,
  .emoji-container,
  .input-panel,
  .shape,
  .orb,
  .note,
  .particle {
    animation: none;
    transition: none;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .emotion-analysis {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: white;
  }
  
  .emoji-container {
    border: 3px solid rgba(255, 255, 255, 0.5);
  }
}
</style>
