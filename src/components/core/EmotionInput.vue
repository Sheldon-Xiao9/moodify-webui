<template>
  <div class="emotion-input-container">
    <!-- 引导文字 -->
    <div 
      ref="guideTextRef"
      class="guide-text"
      :class="{ 'hidden': isInputActive }"
    >
      来跟我说说你今天的心情吧！
    </div>
    
    <!-- 开始按钮 -->
    <button
      ref="startButtonRef"
      class="start-button btn-circular"
      :class="{ 'hidden': isInputActive }"
      @click="handleStartClick"
    >
      ▶
    </button>
    
    <!-- 输入框容器 -->
    <div 
      ref="inputContainerRef"
      class="input-container"
      :class="{ 'active': isInputActive, 'processing': isProcessing }"
    >
      <input
        ref="inputFieldRef"
        type="text"
        class="emotion-input input-field"
        placeholder="描述此刻心情..."
        v-model="emotionText"
        @blur="handleInputBlur"
        @keyup.enter="handleSubmit"
        @focus="handleInputFocus"
        maxlength="200"
      />
      
      <!-- 提交按钮 -->
      <button
        ref="submitButtonRef"
        class="submit-button btn-circular"
        :disabled="!emotionText.trim() || isProcessing"
        @click="handleSubmit"
      >
        →
      </button>
      
      <!-- 字符计数 -->
      <div class="char-count" v-if="isInputActive && !isProcessing">
        {{ emotionText.length }}/200
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAnimationController } from '@/composables/useAnimationController'
import { useAnimationStore } from '@/stores/animations'

const emit = defineEmits(['start', 'submit', 'blur', 'focus'])

const store = useAnimationStore()
const {
  guideTextRef,
  startButtonRef,
  inputContainerRef,
  inputFieldRef,
  submitButtonRef,
  playStartAnimation,
  playResetAnimation,
  playSubmitAnimation
} = useAnimationController()

// 响应式数据
const emotionText = ref('')
const isInputFocused = ref(false)

// 计算属性
const isInputActive = computed(() => store.isInputActive)
const isProcessing = computed(() => store.isProcessing)

// 监听输入激活状态
watch(isInputActive, async (newValue) => {
  if (newValue) {
    await nextTick()
    // 延迟聚焦到输入框
    setTimeout(() => {
      if (inputFieldRef.value) {
        inputFieldRef.value.focus()
      }
    }, 600) // 等待动画完成
  }
})

// 处理开始按钮点击
const handleStartClick = () => {
  emit('start')
  playStartAnimation()
}

// 处理输入框聚焦
const handleInputFocus = () => {
  isInputFocused.value = true
  emit('focus')
}

// 处理输入框失焦 - 简化版本
const handleInputBlur = () => {
  isInputFocused.value = false
  
  // 如果输入框为空且不在处理状态，则回退动画
  if (!emotionText.value.trim() && !isProcessing.value) {
    setTimeout(() => {
      if (!isInputFocused.value && !emotionText.value.trim()) {
        emit('blur')
        playResetAnimation()
      }
    }, 100) // 短暂延迟避免误触发
  }
}

// 处理提交
const handleSubmit = () => {
  const text = emotionText.value.trim()
  if (!text || isProcessing.value) return
  
  emit('submit', text)
  playSubmitAnimation()
}

// 重置输入
const resetInput = () => {
  emotionText.value = ''
  isInputFocused.value = false
  store.setInputActive(false)
  store.setProcessing(false)
}

// 暴露方法给父组件
defineExpose({
  resetInput,
  focusInput: () => {
    if (inputFieldRef.value) {
      inputFieldRef.value.focus()
    }
  },
  getValue: () => emotionText.value,
  setValue: (value) => {
    emotionText.value = value
  }
})
</script>

<style lang="scss" scoped>
.emotion-input-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 2rem;
}

.guide-text {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  transition: all 0.3s ease;
  font-weight: 300;
  letter-spacing: 0.5px;
  
  &.hidden {
    opacity: 0;
    transform: translateY(-20px);
  }
  
  @media (max-width: 767px) {
    font-size: 1.2rem;
    padding: 0 1rem;
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 1.3rem;
  }
}

.start-button {
  transition: all 0.3s ease;
  
  &.hidden {
    opacity: 0;
    pointer-events: none;
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 0;
  opacity: 0;
  transition: all 0.5s ease;
  
  &.active {
    width: 60vw;
    opacity: 1;
    
    @media (max-width: 767px) {
      width: 80vw;
    }
    
    @media (min-width: 768px) and (max-width: 1023px) {
      width: 70vw;
    }
  }
  
  &.processing {
    transform: translateY(-20vh) scale(0.7);
  }
}

.emotion-input {
  flex: 1;
  height: 60px;
  padding: 0 25px;
  font-size: 16px;
  border-radius: 30px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #FFD166;
    box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 767px) {
    height: 50px;
    font-size: 14px;
    padding: 0 20px;
  }
}

.submit-button {
  margin-left: 1rem;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:not(:disabled):hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
  }
  
  &:not(:disabled):active {
    transform: scale(0.95);
  }
}

.char-count {
  position: absolute;
  bottom: -25px;
  right: 70px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
  
  @media (max-width: 767px) {
    right: 60px;
    font-size: 0.7rem;
  }
}

// 输入验证样式
.emotion-input {
  &.error {
    border-color: #EF476F;
    box-shadow: 0 0 20px rgba(239, 71, 111, 0.3);
  }
  
  &.success {
    border-color: #06D6A0;
    box-shadow: 0 0 20px rgba(6, 214, 160, 0.3);
  }
}

// 动画增强
.input-container.active {
  .emotion-input {
    animation: slideInExpand 0.5s ease-out;
  }
  
  .submit-button {
    animation: slideInRight 0.5s ease-out 0.2s both;
  }
}

@keyframes slideInExpand {
  from {
    width: 0;
    padding: 0;
    opacity: 0;
  }
  to {
    width: 100%;
    padding: 0 25px;
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

// 聚焦状态增强
.emotion-input:focus {
  animation: focusGlow 0.3s ease-out;
}

@keyframes focusGlow {
  0% {
    box-shadow: 0 0 0 rgba(255, 209, 102, 0);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 209, 102, 0.5);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
  }
}

// 加载状态
.input-container.processing {
  .emotion-input,
  .submit-button {
    pointer-events: none;
    opacity: 0.7;
  }
}

// 错误状态提示
.char-count {
  &.warning {
    color: #FFD166;
  }
  
  &.error {
    color: #EF476F;
  }
}

// 响应式调整
@media (max-width: 480px) {
  .guide-text {
    font-size: 1rem;
  }
  
  .input-container.active {
    width: 90vw;
  }
  
  .emotion-input {
    height: 45px;
    font-size: 13px;
  }
  
  .submit-button {
    width: 45px;
    height: 45px;
    margin-left: 0.5rem;
  }
}
</style>
