<template>
  <div class="home-view">
    <!-- 动态背景装饰 -->
    <DynamicBackground variant="home" />

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
          :auto-start="true"
          @progress="handleProgress"
          @stage-change="handleStageChange"
          @complete="handleProcessComplete"
        />
        
        <!-- AI返回的情绪分析结果 - 只在100%完成后显示 -->
        <div class="emotion-analysis" v-if="showAIResult && aiEmotionResult">
          AI识别情绪：{{ aiEmotionResult }}
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
import DynamicBackground from '@/components/core/DynamicBackground.vue'

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
const aiEmotionResult = ref('')
const showAIResult = ref(false)
const currentProgress = ref(0)

// 测试模式开关 - 可以通过环境变量或配置控制
const isTestMode = ref(import.meta.env.DEV || !import.meta.env.VITE_API_URL)

// 计算属性
const isInputActive = computed(() => store.isInputActive)
const isProcessing = computed(() => store.isProcessing)
const showProgress = computed(() => isProcessing.value)

onMounted(() => {
  // 初始化状态
  store.resetState()
  console.log('HomeView mounted, test mode:', isTestMode.value)
})

// 监听处理状态变化
watch(isProcessing, (newValue) => {
  if (newValue) {
    // 重置AI结果显示状态
    showAIResult.value = false
    console.log('Processing started, progress loader will auto-start')
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
const handleEmotionSubmit = async (emotionText) => {
  submittedEmotion.value = emotionText
  
  // 开始处理
  store.setProcessing(true)
  
  // 发射事件给父组件
  emit('emotion-submitted', {
    text: emotionText
  })
  
  console.log('Emotion submitted:', emotionText)
  
  // 启动AI分析处理（后台进行）
  processEmotionWithAI(emotionText)
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
  currentProgress.value = progress
  console.log('Progress:', progress + '%')
}

// 处理阶段变化
const handleStageChange = (stage, text) => {
  console.log('Stage changed:', stage, text)
}

// 处理处理完成（进度条到达100%）
const handleProcessComplete = () => {
  console.log('Processing complete')
  
  // 只有在进度条完成后才显示AI结果
  if (aiEmotionResult.value) {
    showAIResult.value = true
    // 根据AI返回的情绪更新表情
    updateEmojiByAIResult(aiEmotionResult.value)
  } else if (isTestMode.value) {
    // 测试模式：如果AI结果还没返回，使用默认值
    console.log('Test mode: using default emotion result')
    aiEmotionResult.value = '快乐'
    showAIResult.value = true
    updateEmojiByAIResult('快乐')
  }
  
  // 发射完成事件
  emit('processing-complete', {
    emotion: submittedEmotion.value,
    aiResult: aiEmotionResult.value,
    mood: currentMood.value
  })
}

// AI情绪分析处理函数
const processEmotionWithAI = async (emotionText) => {
  try {
    if (isTestMode.value) {
      // 测试模式：使用模拟的AI分析
      console.log('Running in test mode - using mock AI analysis')
      const mockAIResult = await mockAIAnalysis(emotionText)
      aiEmotionResult.value = mockAIResult.emotion
    } else {
      // 生产模式：实际的后端调用逻辑
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: emotionText })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      aiEmotionResult.value = data.emotion
    }
    
  } catch (error) {
    console.error('AI情绪分析失败:', error)
    // 错误处理：使用默认情绪
    aiEmotionResult.value = isTestMode.value ? '快乐' : '中性'
  }
}

// 模拟AI分析的测试函数
const mockAIAnalysis = async (text) => {
  // 模拟API调用延迟（通常在3-4秒内完成，确保在进度条完成前）
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // 模拟AI返回的情绪词库 - 只使用canvasRenderer支持的5种表情
  const emotionKeywords = {
    '快乐': ['开心', '高兴', '愉快', '喜悦', '幸福', '满足', '开朗'],
    '悲伤': ['难过', '伤心', '沮丧', '失落', '痛苦', '忧郁', '孤独'],
    '愤怒': ['生气', '愤怒', '恼火', '暴躁', '烦躁', '不爽', '愤慨'],
    '兴奋': ['激动', '兴奋', '热情', '狂欢', '疯狂', '亢奋', '刺激', '振奋'],
    '烦躁': ['烦躁', '烦恼', '不耐烦', '厌倦', '郁闷', '无聊', '焦躁']
  }
  
  const lowerText = text.toLowerCase()
  
  // 简单的关键词匹配
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const hasMatch = keywords.some(keyword => lowerText.includes(keyword))
    if (hasMatch) {
      return {
        emotion: emotion,
        confidence: 0.85,
        songs: [] // 后端会返回匹配的歌曲列表
      }
    }
  }
  
  // 默认返回
  return {
    emotion: '快乐',
    confidence: 0.5,
    songs: []
  }
}

// 根据AI返回结果更新表情 - 只使用canvasRenderer支持的5种表情
const updateEmojiByAIResult = (emotion) => {
  const emotionToMoodMap = {
    '快乐': 'happy',
    '悲伤': 'sad', 
    '愤怒': 'angry',
    '兴奋': 'excited',
    '烦躁': 'annoyed'
  }
  
  const mood = emotionToMoodMap[emotion] || 'happy'
  currentMood.value = mood
  
  if (emojiRef.value) {
    emojiRef.value.updateMood(mood)
  }
}

// 重置视图状态
const resetView = () => {
  submittedEmotion.value = ''
  aiEmotionResult.value = ''
  showAIResult.value = false
  currentProgress.value = 0
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
  setMood: (mood) => {
    // 只允许设置canvasRenderer支持的表情
    const validMoods = ['happy', 'sad', 'angry', 'excited', 'annoyed']
    if (validMoods.includes(mood)) {
      currentMood.value = mood
      if (emojiRef.value) {
        emojiRef.value.updateMood(mood)
      }
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
  
  @media (max-width: 767px) {
    padding: 1rem;
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
  // 添加渐入动画
  animation: fadeInUp 0.5s ease-out;
  
  @media (max-width: 767px) {
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;
    margin-top: 1.5rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  .input-panel {
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
