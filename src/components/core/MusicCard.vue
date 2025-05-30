<template>
  <div 
    class="music-card"
    :class="{ 
      'expanded': isExpanded,
      'hover': isHovering,
      'playing': isPlaying
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleCardClick"
    ref="cardRef"
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
        <div class="play-overlay" v-if="isHovering">
          <button class="play-button" @click.stop="togglePlay">
            <span v-if="!isPlaying">▶</span>
            <span v-else>⏸</span>
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
            v-for="emotion in track.emotions.slice(0, 3)" 
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
            <span class="spotify-icon">🎵</span>
            在 Spotify 中打开
          </a>
        </div>
      </div>
    </div>
    
    <!-- 进度条（悬停时显示） -->
    <div class="progress-container" v-if="isHovering && isPlaying">
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
            <span v-if="!isPlaying">▶ 播放</span>
            <span v-else>⏸ 暂停</span>
          </button>
          <button class="control-btn spotify-btn" @click="openSpotify" v-if="track.spotifyUrl">
            🎵 Spotify
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
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
const isImageLoaded = ref(false)
const isImageError = ref(false)

// 计算属性
const isPlaying = computed(() => {
  return audioPlaying.value && currentTrack.value?.id === props.track.id
})

const playbackProgress = computed(() => {
  if (!isPlaying.value) return 0
  return progress.value
})

// 动画控制
let hoverCleanup = null
let expandAnimation = null
let originalRect = null

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
})

// 处理鼠标进入
const handleMouseEnter = () => {
  isHovering.value = true
  
  // 自动播放预览（如果有预览链接）
  if (props.track.previewUrl && !isPlaying.value) {
    setTimeout(() => {
      if (isHovering.value) {
        play(props.track)
      }
    }, 500) // 延迟半秒避免误触发
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  isHovering.value = false
  
  // 停止播放预览
  if (isPlaying.value && currentTrack.value?.id === props.track.id) {
    setTimeout(() => {
      if (!isHovering.value && !isExpanded.value) {
        pause()
      }
    }, 200) // 短暂延迟避免意外停止
  }
}

// 处理卡片点击
const handleCardClick = () => {
  if (isExpanded.value) return
  
  // 记录原始位置
  originalRect = cardRef.value.getBoundingClientRect()
  
  // 播放展开动画
  const { timeline, overlay } = playCardExpandAnimation(cardRef.value)
  expandAnimation = { timeline, overlay }
  
  isExpanded.value = true
  emit('expand', props.track)
}

// 处理关闭
const handleClose = () => {
  if (!isExpanded.value) return
  
  // 播放收缩动画
  if (expandAnimation && originalRect) {
    playCardCollapseAnimation(
      cardRef.value, 
      expandAnimation.overlay, 
      originalRect
    )
  }
  
  isExpanded.value = false
  emit('collapse', props.track)
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
    peaceful: '#4CAF50'
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
    height: 15vh;
    min-height: 120px;
  }
  
  // 移动端尺寸
  @media (max-width: 767px) {
    width: 80vw;
    height: 15vh;
    min-height: 100px;
  }
  
  // 平板端尺寸
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 60vw;
    height: 15vh;
    min-height: 110px;
  }
  
  &.hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(15px);
  }
  
  &.expanded {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 80vw !important;
    height: 80vh !important;
    z-index: 1001 !important;
    max-width: 800px;
    max-height: 600px;
  }
  
  &.playing {
    border-color: #FFD166;
    box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
  }
}

.card-content {
  display: flex;
  height: 100%;
  
  .music-card.expanded & {
    display: none;
  }
}

.album-cover {
  position: relative;
  width: 30%;
  min-width: 80px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .music-card.hover & img {
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
  transition: opacity 0.3s ease;
  
  .music-card.hover & {
    opacity: 1;
  }
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #FFD166;
  color: #121212;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background: #FFA726;
  }
}

.track-info {
  flex: 1;
  padding: 1rem;
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
    font-size: 0.8rem;
  }
}

.track-album {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 767px) {
    font-size: 0.7rem;
  }
}

.emotion-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.emotion-tag {
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  color: white;
  font-weight: 500;
  
  @media (max-width: 767px) {
    font-size: 0.6rem;
    padding: 0.1rem 0.4rem;
  }
}

.spotify-link {
  a {
    color: #1DB954;
    text-decoration: none;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
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
  height: 4px;
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

// 扩展视图样式
.expanded-content {
  display: none;
  
  .music-card.expanded & {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
  }
}

.expanded-cover {
  width: 60%;
  margin: 0 auto 2rem auto;
  border-radius: 15px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: auto;
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
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
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
