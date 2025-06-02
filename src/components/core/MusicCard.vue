<template>
  <div class="music-card-wrapper">
    <!-- 音乐卡片 -->
    <div 
      class="music-card"
      :class="{ 
        'expanded': isExpanded,
        'hover': isHovering && !isExpanded && !isExpanding && !isCollapsing,
        'playing': isPlaying,
        'expanding': isExpanding,
        'collapsing': isCollapsing,
        'left-column': isLeftColumn,
        'right-column': isRightColumn
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleCardClick"
      ref="cardRef"
      :style="cardStyles"
    >
      <!-- 卡片内容 -->
      <div class="card-content">
        <!-- 专辑封面 -->
        <div class="album-cover">
          <img 
            :src="track.albumCover" 
            :alt="track.albumName"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <div class="play-overlay" v-if="isHovering && !isExpanded && !isExpanding">
            <button class="play-button" @click.stop="togglePlay">
              <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 歌曲信息 -->
        <div class="track-info">
          <h3 class="track-title">{{ track.name }}</h3>
          <p class="track-artist">{{ track.artist }}</p>
          <p class="track-album">{{ track.albumName }}</p>
          
          <!-- 情绪标签 -->
          <div class="emotion-tags" v-if="track.emotions && track.emotions.length">
            <span 
              v-for="emotion in track.emotions.slice(0, 2)" 
              :key="emotion"
              class="emotion-tag"
              :style="{ backgroundColor: getEmotionColor(emotion) }"
            >
              {{ emotion }}
            </span>
          </div>
          
          <!-- Spotify链接 -->
          <div class="spotify-link" v-if="track.spotifyUrl">
            <a :href="track.spotifyUrl" target="_blank" @click.stop>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.583a.625.625 0 0 1-.859.208c-2.354-1.437-5.317-1.763-8.812-.963a.625.625 0 0 1-.312-1.211c3.833-.878 7.125-.506 9.775 1.107a.625.625 0 0 1 .208.859zm1.229-2.729a.781.781 0 0 1-1.073.26c-2.694-1.653-6.792-2.132-9.965-1.166a.781.781 0 1 1-.391-1.513c3.637-1.106 8.139-.57 11.169 1.346a.781.781 0 0 1 .26 1.073zm.106-2.854C14.643 8.933 8.523 8.725 4.966 9.71a.938.938 0 0 1-.624-1.769c4.086-1.133 10.744-.904 14.405 1.315a.938.938 0 0 1-.35 1.744z"/>
              </svg>
              在 Spotify 中打开
            </a>
          </div>
        </div>
      </div>
      
      <!-- 进度条（悬停时显示） -->
      <div class="progress-container" v-if="isHovering && isPlaying && !isExpanded && !isExpanding">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${playbackProgress}%` }"
          ></div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      
      <!-- 扩展视图内容 -->
      <div class="expanded-content" v-if="isExpanded">
        <div class="expanded-cover">
          <img :src="track.albumCover" :alt="track.albumName" />
        </div>
        <div class="expanded-info">
          <h2 class="expanded-title">{{ track.name }}</h2>
          <p class="expanded-artist">{{ track.artist }}</p>
          <p class="expanded-album">{{ track.albumName }}</p>
          
          <!-- 详细信息 -->
          <div class="track-details">
            <div class="detail-item" v-if="track.duration">
              <span class="label">时长:</span>
              <span class="value">{{ formatTime(track.duration) }}</span>
            </div>
            <div class="detail-item" v-if="track.releaseDate">
              <span class="label">发布:</span>
              <span class="value">{{ track.releaseDate }}</span>
            </div>
            <div class="detail-item" v-if="track.popularity">
              <span class="label">热度:</span>
              <span class="value">{{ track.popularity }}/100</span>
            </div>
          </div>
          
          <!-- 控制按钮 -->
          <div class="expanded-controls">
            <button class="control-btn play-btn" @click="togglePlay">
              <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <span v-if="!isPlaying">播放</span>
              <span v-else>暂停</span>
            </button>
            <button class="control-btn spotify-btn" @click="openSpotify" v-if="track.spotifyUrl">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.583a.625.625 0 0 1-.859.208c-2.354-1.437-5.317-1.763-8.812-.963a.625.625 0 0 1-.312-1.211c3.833-.878 7.125-.506 9.775 1.107a.625.625 0 0 1 .208.859zm1.229-2.729a.781.781 0 0 1-1.073.26c-2.694-1.653-6.792-2.132-9.965-1.166a.781.781 0 1 1-.391-1.513c3.637-1.106 8.139-.57 11.169 1.346a.781.781 0 0 1 .26 1.073zm.106-2.854C14.643 8.933 8.523 8.725 4.966 9.71a.938.938 0 0 1-.624-1.769c4.086-1.133 10.744-.904 14.405 1.315a.938.938 0 0 1-.35 1.744z"/>
              </svg>
              Spotify
            </button>
          </div>
          
          <!-- 进度控制 -->
          <div class="expanded-progress" v-if="isPlaying">
            <div class="progress-bar-large">
              <div 
                class="progress-fill-large"
                :style="{ width: `${playbackProgress}%` }"
              ></div>
            </div>
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 关闭按钮 -->
      <button 
        class="close-button" 
        v-if="isExpanded"
        @click.stop="handleClose"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
    
    <!-- 背景遮罩（仅当卡片展开时显示） -->
    <div 
      class="card-backdrop" 
      v-if="isExpanded"
      @click="handleClose"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useAnimationController } from '@/composables/useAnimationController'
import { useAnimationStore } from '@/stores/animations'

const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['expand', 'collapse', 'play', 'pause'])

const store = useAnimationStore()
const { 
  play, 
  pause, 
  stop, 
  currentTrack, 
  isPlaying: audioPlaying, 
  progress, 
  currentTime, 
  duration,
  formatTime 
} = useAudioPlayer()

const {
  playCardExpandAnimation,
  playCardCollapseAnimation,
  addHoverAnimation
} = useAnimationController()

// 响应式数据
const cardRef = ref(null)
const isHovering = ref(false)
const isExpanded = ref(false)
const isExpanding = ref(false)
const isCollapsing = ref(false)
const isImageLoaded = ref(false)
const isImageError = ref(false)
const originalRect = ref(null)
const cardStyles = ref({})

// 计算属性
const isPlaying = computed(() => {
  return audioPlaying.value && currentTrack.value?.id === props.track.id
})

const playbackProgress = computed(() => {
  if (!isPlaying.value) return 0
  return progress.value
})

// 判断是左列还是右列（基于index）
const isLeftColumn = computed(() => props.index % 2 === 0)
const isRightColumn = computed(() => props.index % 2 === 1)

// 动画控制
let hoverCleanup = null

onMounted(() => {
  // 添加悬停动画
  if (cardRef.value) {
    hoverCleanup = addHoverAnimation(cardRef.value)
  }
})

onUnmounted(() => {
  // 清理
  if (hoverCleanup) {
    hoverCleanup()
  }
  if (isPlaying.value && currentTrack.value?.id === props.track.id) {
    stop()
  }
})

// 监听扩展状态
watch(isExpanded, (newValue) => {
  store.setCardExpanded(newValue ? props.track.id : null)
  
  // 控制页面滚动
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 保存原始位置和尺寸
const saveOriginalRect = () => {
  if (cardRef.value) {
    const rect = cardRef.value.getBoundingClientRect()
    originalRect.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  }
}

// 处理鼠标进入
const handleMouseEnter = () => {
  // 只有在非展开状态下才允许悬停效果
  if (!isExpanded.value && !isExpanding.value && !isCollapsing.value) {
    isHovering.value = true
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  // 清除悬停状态，但不影响展开的卡片
  isHovering.value = false
}

// 处理卡片点击 - 展开动画
const handleCardClick = async () => {
  if (isExpanded.value || isExpanding.value) return
  
  // 清除悬停状态，防止干扰动画
  isHovering.value = false
  
  // 保存原始位置
  saveOriginalRect()
  
  isExpanding.value = true
  
  // 设置初始位置
  if (originalRect.value) {
    cardStyles.value = {
      position: 'fixed',
      top: `${originalRect.value.top}px`,
      left: `${originalRect.value.left}px`,
      width: `${originalRect.value.width}px`,
      height: `${originalRect.value.height}px`,
      zIndex: 1002,
      transformOrigin: 'center center',
      transform: 'none'
    }
  }
  
  await nextTick()
  
  // 计算目标位置 - 直接使用绝对像素位置
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const targetWidth = Math.min(viewportWidth * 0.8, 800)
  const targetHeight = Math.min(viewportHeight * 0.85, 680)
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2
  
  // 开始展开动画 - 不使用translate，直接计算绝对位置
  requestAnimationFrame(() => {
    cardStyles.value = {
      ...cardStyles.value,
      top: `${centerY - targetHeight / 2}px`,
      left: `${centerX - targetWidth / 2}px`,
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      transform: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  })
  
  // 等待动画完成
  setTimeout(() => {
    isExpanding.value = false
    isExpanded.value = true
    emit('expand', props.track)
  }, 400)
}

// 处理关闭 - 收缩动画
const handleClose = async () => {
  if (!isExpanded.value || isCollapsing.value) return
  
  // 确保悬停状态被清除
  isHovering.value = false
  
  isCollapsing.value = true
  isExpanded.value = false
  
  // 开始收缩动画 - 回到原始位置
  if (originalRect.value) {
    cardStyles.value = {
      ...cardStyles.value,
      top: `${originalRect.value.top}px`,
      left: `${originalRect.value.left}px`,
      width: `${originalRect.value.width}px`,
      height: `${originalRect.value.height}px`,
      transform: 'none',
      transformOrigin: 'center center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
  
  // 等待动画完成
  setTimeout(() => {
    isCollapsing.value = false
    cardStyles.value = {}
    originalRect.value = null
    emit('collapse', props.track)
  }, 300)
}

// 切换播放状态
const togglePlay = () => {
  if (isPlaying.value) {
    pause()
    emit('pause', props.track)
  } else {
    play(props.track)
    emit('play', props.track)
  }
}

// 打开Spotify
const openSpotify = () => {
  if (props.track.spotifyUrl) {
    window.open(props.track.spotifyUrl, '_blank')
  }
}

// 获取情绪颜色
const getEmotionColor = (emotion) => {
  const colors = {
    happy: '#FFD166',
    sad: '#6A7BDB',
    energetic: '#EF476F',
    calm: '#06D6A0',
    romantic: '#E91E63',
    melancholy: '#9C27B0',
    excited: '#FF5722',
    peaceful: '#4CAF50',
    angry: '#F44336',
    annoyed: '#FF9800',
    intense: '#9C27B0',
    pumped: '#FF5722'
  }
  return colors[emotion.toLowerCase()] || '#FFD166'
}

// 处理图片加载
const handleImageLoad = () => {
  isImageLoaded.value = true
}

const handleImageError = () => {
  isImageError.value = true
}

// 暴露方法给父组件
defineExpose({
  expand: handleCardClick,
  collapse: handleClose,
  togglePlay,
  isExpanded,
  isPlaying
})
</script>

<style lang="scss" scoped>
.music-card-wrapper {
  position: relative;
}

.music-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  // 桌面端尺寸
  @media (min-width: 1024px) {
    width: 40vw;
    height: 14vh;
    min-height: 140px;
    max-width: 720px;
  }
  
  // 移动端尺寸
  @media (max-width: 767px) {
    width: 85vw;
    height: 14vh;
    min-height: 130px;
    max-width: 400px;
  }
  
  // 平板端尺寸
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 60vw;
    height: 14vh;
    min-height: 135px;
    max-width: 450px;
  }
  
  // 只有在正常状态且悬停时才应用悬停效果
  &.hover:not(.expanded):not(.expanding):not(.collapsing) {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(15px);
  }
  
  // 展开状态的样式由JS动态控制，这里只保留基础样式
  &.expanded {
    // 确保展开状态下不受其他CSS影响
    transform: none !important;
    
    .card-content {
      display: none;
    }
    
    .expanded-content {
      display: flex;
    }
  }
  
  // 展开中状态
  &.expanding {
    // 确保展开过程中不受悬停影响
    transform: none !important;
    
    .card-content {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }
  
  // 收缩中状态
  &.collapsing {
    // 确保收缩过程中不受悬停影响
    transform: none !important;
    
    .expanded-content {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .card-content {
      display: flex;
      opacity: 1;
      transition: opacity 0.2s ease 0.1s;
    }
  }
  
  // 左列和右列统一使用中心点作为transform-origin
  &.left-column, &.right-column {
    &.expanding, &.collapsing {
      transform-origin: center center !important;
    }
  }
  
  &.playing {
    border-color: #FFD166;
    box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
  }
}

.card-content {
  display: flex;
  height: 100%;
}

.album-cover {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  
  @media (max-width: 767px) {
    width: 130px;
    height: 130px;
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 135px;
    height: 135px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  // 只有在正常悬停状态下才缩放图片
  .music-card.hover:not(.expanded):not(.expanding):not(.collapsing) & img {
    transform: scale(1.05);
  }
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  
  // 只有在正常悬停状态下才显示播放覆盖层并同步缩放
  .music-card.hover:not(.expanded):not(.expanding):not(.collapsing) & {
    opacity: 1;
    transform: scale(1.05);
  }
}

.play-button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: #FFD166;
  color: #121212;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    transform: scale(1.1);
    background: #FFA726;
  }
}

.track-info {
  flex: 1;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  
  @media (max-width: 767px) {
    padding: 0.75rem;
  }
}

.track-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 767px) {
    font-size: 1rem;
  }
}

.track-artist {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 767px) {
    font-size: 0.85rem;
  }
}

.track-album {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.4rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 767px) {
    font-size: 0.75rem;
  }
}

.emotion-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
}

.emotion-tag {
  padding: 0.15rem 0.45rem;
  border-radius: 8px;
  font-size: 0.65rem;
  color: white;
  font-weight: 500;
  
  @media (max-width: 767px) {
    font-size: 0.6rem;
    padding: 0.12rem 0.4rem;
  }
}

.spotify-link {
  a {
    color: #1DB954;
    text-decoration: none;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
    
    &:hover {
      color: #1ed760;
    }
  }
}

.progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD166, #EF476F);
  transition: width 0.3s ease;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
}

// 背景遮罩
.card-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1001;
  backdrop-filter: blur(5px);
}

// 扩展视图样式
.expanded-content {
  display: none;
  
  .music-card.expanded & {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
    position: relative;
    z-index: 1003;
  }
}

.expanded-cover {
  width: 300px;
  height: 300px;
  margin: 0 auto 2rem auto;
  border-radius: 15px;
  overflow: hidden;
  flex-shrink: 0;
  
  @media (max-width: 767px) {
    width: 250px;
    height: 250px;
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 280px;
    height: 280px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.expanded-info {
  text-align: center;
}

.expanded-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 767px) {
    font-size: 1.5rem;
  }
}

.expanded-artist {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 767px) {
    font-size: 1.1rem;
  }
}

.expanded-album {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem 0;
}

.track-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 767px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  
  .label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .value {
    font-size: 1rem;
    color: white;
    font-weight: 500;
  }
}

.expanded-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &.play-btn {
    background: #FFD166;
    color: #121212;
    
    &:hover {
      background: #FFA726;
      transform: scale(1.05);
    }
  }
  
  &.spotify-btn {
    background: #1DB954;
    color: white;
    
    &:hover {
      background: #1ed760;
      transform: scale(1.05);
    }
  }
}

.expanded-progress {
  margin-top: 2rem;
}

.progress-bar-large {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(90deg, #FFD166, #EF476F);
  transition: width 0.3s ease;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1004;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

// 错误状态
.music-card {
  &.error {
    .album-cover img {
      filter: grayscale(100%);
    }
    
    .track-info {
      opacity: 0.7;
    }
  }
}

// 加载状态
.music-card {
  &.loading {
    .album-cover::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
