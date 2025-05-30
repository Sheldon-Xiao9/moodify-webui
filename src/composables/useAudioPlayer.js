import { ref, reactive, onUnmounted } from 'vue'
import { Howl, Howler } from 'howler'

export function useAudioPlayer() {
  const currentTrack = ref(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const volume = ref(0.7)
  const progress = ref(0)
  const duration = ref(0)
  const currentTime = ref(0)
  
  // 音频播放器实例
  const players = reactive(new Map())
  
  // 进度更新定时器
  let progressTimer = null
  
  onUnmounted(() => {
    stopAll()
    clearProgressTimer()
  })
  
  // 创建音频播放器
  const createPlayer = (track) => {
    if (players.has(track.id)) {
      return players.get(track.id)
    }
    
    const player = new Howl({
      src: [track.previewUrl],
      html5: true,
      preload: false,
      volume: volume.value,
      onload: () => {
        isLoading.value = false
        duration.value = player.duration()
      },
      onplay: () => {
        isPlaying.value = true
        startProgressTimer()
      },
      onpause: () => {
        isPlaying.value = false
        clearProgressTimer()
      },
      onend: () => {
        isPlaying.value = false
        progress.value = 0
        currentTime.value = 0
        clearProgressTimer()
      },
      onerror: (id, error) => {
        console.error('Audio loading error:', error)
        isLoading.value = false
        isPlaying.value = false
      }
    })
    
    players.set(track.id, player)
    return player
  }
  
  // 播放音频
  const play = (track, autoStop = true) => {
    if (!track || !track.previewUrl) {
      console.warn('No preview URL available for track:', track)
      return
    }
    
    // 如果已经在播放同一首歌，则暂停
    if (currentTrack.value?.id === track.id && isPlaying.value) {
      pause()
      return
    }
    
    // 停止当前播放的音频
    if (autoStop && currentTrack.value) {
      stop()
    }
    
    isLoading.value = true
    currentTrack.value = track
    
    const player = createPlayer(track)
    
    // 设置30秒预览限制
    if (track.isPreview !== false) {
      player.stop()
      player.play()
      
      // 30秒后自动停止
      setTimeout(() => {
        if (currentTrack.value?.id === track.id) {
          stop()
        }
      }, 30000)
    } else {
      player.play()
    }
  }
  
  // 暂停音频
  const pause = () => {
    if (currentTrack.value) {
      const player = players.get(currentTrack.value.id)
      if (player) {
        player.pause()
      }
    }
  }
  
  // 停止音频
  const stop = () => {
    if (currentTrack.value) {
      const player = players.get(currentTrack.value.id)
      if (player) {
        player.stop()
      }
    }
    
    isPlaying.value = false
    progress.value = 0
    currentTime.value = 0
    currentTrack.value = null
    clearProgressTimer()
  }
  
  // 停止所有音频
  const stopAll = () => {
    players.forEach(player => {
      player.stop()
      player.unload()
    })
    players.clear()
    
    isPlaying.value = false
    progress.value = 0
    currentTime.value = 0
    currentTrack.value = null
    clearProgressTimer()
  }
  
  // 设置音量
  const setVolume = (newVolume) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    Howler.volume(volume.value)
    
    // 更新所有播放器的音量
    players.forEach(player => {
      player.volume(volume.value)
    })
  }
  
  // 跳转到指定时间
  const seekTo = (time) => {
    if (currentTrack.value) {
      const player = players.get(currentTrack.value.id)
      if (player && player.playing()) {
        player.seek(time)
        currentTime.value = time
        progress.value = duration.value > 0 ? (time / duration.value) * 100 : 0
      }
    }
  }
  
  // 开始进度更新定时器
  const startProgressTimer = () => {
    clearProgressTimer()
    
    progressTimer = setInterval(() => {
      if (currentTrack.value && isPlaying.value) {
        const player = players.get(currentTrack.value.id)
        if (player && player.playing()) {
          const current = player.seek()
          const total = player.duration()
          
          currentTime.value = current
          duration.value = total
          progress.value = total > 0 ? (current / total) * 100 : 0
        }
      }
    }, 100)
  }
  
  // 清除进度定时器
  const clearProgressTimer = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
  
  // 淡入效果
  const fadeIn = (track, duration = 1000) => {
    play(track, false)
    
    if (currentTrack.value) {
      const player = players.get(currentTrack.value.id)
      if (player) {
        player.volume(0)
        player.fade(0, volume.value, duration)
      }
    }
  }
  
  // 淡出效果
  const fadeOut = (duration = 1000) => {
    if (currentTrack.value) {
      const player = players.get(currentTrack.value.id)
      if (player) {
        player.fade(volume.value, 0, duration)
        
        setTimeout(() => {
          stop()
        }, duration)
      }
    }
  }
  
  // 交叉淡变
  const crossfade = (newTrack, duration = 1000) => {
    if (currentTrack.value) {
      fadeOut(duration)
    }
    
    setTimeout(() => {
      fadeIn(newTrack, duration)
    }, duration / 2)
  }
  
  // 获取音频信息
  const getTrackInfo = (trackId) => {
    const player = players.get(trackId)
    if (player) {
      return {
        duration: player.duration(),
        state: player.state(),
        volume: player.volume(),
        playing: player.playing()
      }
    }
    return null
  }
  
  // 预加载音频
  const preload = (tracks) => {
    tracks.forEach(track => {
      if (track.previewUrl && !players.has(track.id)) {
        const player = new Howl({
          src: [track.previewUrl],
          html5: true,
          preload: true,
          volume: 0
        })
        players.set(track.id, player)
      }
    })
  }
  
  // 格式化时间
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // 获取当前播放状态
  const getPlaybackState = () => {
    return {
      currentTrack: currentTrack.value,
      isPlaying: isPlaying.value,
      isLoading: isLoading.value,
      progress: progress.value,
      currentTime: currentTime.value,
      duration: duration.value,
      volume: volume.value,
      formattedCurrentTime: formatTime(currentTime.value),
      formattedDuration: formatTime(duration.value)
    }
  }
  
  // 检查音频支持
  const checkAudioSupport = () => {
    return {
      mp3: Howler.codecs('mp3'),
      mpeg: Howler.codecs('mpeg'),
      opus: Howler.codecs('opus'),
      ogg: Howler.codecs('ogg'),
      oga: Howler.codecs('oga'),
      wav: Howler.codecs('wav'),
      aac: Howler.codecs('aac'),
      caf: Howler.codecs('caf'),
      m4a: Howler.codecs('m4a'),
      mp4: Howler.codecs('mp4'),
      weba: Howler.codecs('weba'),
      webm: Howler.codecs('webm'),
      dolby: Howler.codecs('dolby'),
      flac: Howler.codecs('flac')
    }
  }
  
  return {
    // 状态
    currentTrack,
    isPlaying,
    isLoading,
    volume,
    progress,
    duration,
    currentTime,
    
    // 基本控制
    play,
    pause,
    stop,
    stopAll,
    setVolume,
    seekTo,
    
    // 高级功能
    fadeIn,
    fadeOut,
    crossfade,
    preload,
    
    // 工具函数
    formatTime,
    getPlaybackState,
    getTrackInfo,
    checkAudioSupport
  }
}
