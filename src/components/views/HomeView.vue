<template>
  <div class="home-view">
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
}

.emoji-container {
  width: 300px;
  height: 300px;
  margin-bottom: 3rem;
  transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
  
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
  .input-panel {
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
}
</style>
