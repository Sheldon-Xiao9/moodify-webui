import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useAnimationStore } from '@/stores/animations'

export function useAnimationController() {
  const store = useAnimationStore()
  const timeline = ref(null)
  
  // 动画元素引用
  const emojiRef = ref(null)
  const guideTextRef = ref(null)
  const startButtonRef = ref(null)
  const inputContainerRef = ref(null)
  const inputFieldRef = ref(null)
  const submitButtonRef = ref(null)
  
  onMounted(() => {
    timeline.value = gsap.timeline({ paused: true })
  })
  
  onUnmounted(() => {
    if (timeline.value) {
      timeline.value.kill()
    }
  })
  
  // 开始按钮点击动画序列
  const playStartAnimation = () => {
    if (!timeline.value) return
    
    store.setInputActive(true)
    
    timeline.value.clear()
    
    // 1. 开始按钮向右移动
    timeline.value.to(startButtonRef.value, {
      duration: 0.5,
      x: '200px',
      ease: 'power2.out'
    })
    
    // 2. 同时输入框从中心向两侧展开
    timeline.value.to(inputContainerRef.value, {
      duration: 0.5,
      width: '60vw',
      opacity: 1,
      ease: 'power2.out'
    }, 0)
    
    // 3. 引导文字淡出
    timeline.value.to(guideTextRef.value, {
      duration: 0.3,
      opacity: 0,
      y: -20,
      ease: 'power2.out'
    }, 0.2)
    
    // 4. 表情缩小并上移
    timeline.value.to(emojiRef.value, {
      duration: 0.6,
      scale: 0.3,
      y: '-40vh',
      ease: 'power2.out'
    }, 0.3)
    
    // 5. 整个输入区域上移到2/3高度
    timeline.value.to([inputContainerRef.value, startButtonRef.value], {
      duration: 0.5,
      y: '-20vh',
      ease: 'power2.out'
    }, 0.4)
    
    timeline.value.play()
  }
  
  // 输入失焦回退动画
  const playResetAnimation = () => {
    if (!timeline.value) return
    
    store.setInputActive(false)
    
    timeline.value.clear()
    
    // 反向执行动画序列
    timeline.value.to([inputContainerRef.value, startButtonRef.value], {
      duration: 0.4,
      y: 0,
      ease: 'power2.out'
    })
    
    timeline.value.to(emojiRef.value, {
      duration: 0.5,
      scale: 1,
      y: 0,
      ease: 'power2.out'
    }, 0.1)
    
    timeline.value.to(guideTextRef.value, {
      duration: 0.3,
      opacity: 1,
      y: 0,
      ease: 'power2.out'
    }, 0.2)
    
    timeline.value.to(inputContainerRef.value, {
      duration: 0.4,
      width: '0vw',
      opacity: 0,
      ease: 'power2.out'
    }, 0.3)
    
    timeline.value.to(startButtonRef.value, {
      duration: 0.4,
      x: 0,
      ease: 'power2.out'
    }, 0.3)
    
    timeline.value.play()
  }
  
  // 提交后动画（输入框上浮缩小）
  const playSubmitAnimation = () => {
    if (!timeline.value) return
    
    store.setProcessing(true)
    
    timeline.value.clear()
    
    timeline.value.to([inputContainerRef.value, submitButtonRef.value], {
      duration: 0.4,
      y: '-35vh',
      scale: 0.7,
      ease: 'power2.out'
    })
    
    timeline.value.play()
  }
  
  // 卡片展开动画
  const playCardExpandAnimation = (cardElement, targetSize = { width: '100vw', height: '100vh' }) => {
    if (!cardElement) return
    
    const tl = gsap.timeline()
    
    // 记录原始位置和尺寸
    const rect = cardElement.getBoundingClientRect()
    
    // 创建全屏覆盖层
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100vw'
    overlay.style.height = '100vh'
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    overlay.style.backdropFilter = 'blur(10px)'
    overlay.style.zIndex = '1000'
    overlay.style.opacity = '0'
    document.body.appendChild(overlay)
    
    // 动画序列
    tl.to(overlay, {
      duration: 0.3,
      opacity: 1,
      ease: 'power2.out'
    })
    
    tl.to(cardElement, {
      duration: 0.5,
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80vw',
      height: '80vh',
      zIndex: 1001,
      ease: 'power2.out'
    }, 0.1)
    
    return { timeline: tl, overlay }
  }
  
  // 卡片收缩动画
  const playCardCollapseAnimation = (cardElement, overlay, originalRect) => {
    const tl = gsap.timeline()
    
    tl.to(cardElement, {
      duration: 0.4,
      position: 'relative',
      top: 'auto',
      left: 'auto',
      transform: 'none',
      width: originalRect.width,
      height: originalRect.height,
      zIndex: 'auto',
      ease: 'power2.out'
    })
    
    tl.to(overlay, {
      duration: 0.3,
      opacity: 0,
      ease: 'power2.out',
      onComplete: () => {
        document.body.removeChild(overlay)
      }
    }, 0.2)
    
    return tl
  }
  
  // 进度条动画
  const animateProgress = (progressElement, targetWidth, duration = 1) => {
    if (!progressElement) return
    
    return gsap.to(progressElement, {
      duration,
      width: targetWidth,
      ease: 'power2.out'
    })
  }
  
  // 悬浮效果动画
  const addHoverAnimation = (element) => {
    if (!element) return
    
    const handleMouseEnter = () => {
      gsap.to(element, {
        duration: 0.3,
        y: -5,
        scale: 1.02,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        ease: 'power2.out'
      })
    }
    
    const handleMouseLeave = () => {
      gsap.to(element, {
        duration: 0.3,
        y: 0,
        scale: 1,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        ease: 'power2.out'
      })
    }
    
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }
  
  // 脉冲动画
  const pulseAnimation = (element, options = {}) => {
    const { scale = 1.05, duration = 1, repeat = -1 } = options
    
    return gsap.to(element, {
      duration,
      scale,
      repeat,
      yoyo: true,
      ease: 'power2.inOut'
    })
  }
  
  // 旋转动画
  const rotateAnimation = (element, options = {}) => {
    const { rotation = 360, duration = 2, repeat = -1 } = options
    
    return gsap.to(element, {
      duration,
      rotation,
      repeat,
      ease: 'none'
    })
  }
  
  // 淡入动画
  const fadeIn = (element, duration = 0.5) => {
    gsap.set(element, { opacity: 0 })
    return gsap.to(element, {
      duration,
      opacity: 1,
      ease: 'power2.out'
    })
  }
  
  // 淡出动画
  const fadeOut = (element, duration = 0.5) => {
    return gsap.to(element, {
      duration,
      opacity: 0,
      ease: 'power2.out'
    })
  }
  
  // 从下方滑入
  const slideInUp = (element, duration = 0.5) => {
    gsap.set(element, { y: 100, opacity: 0 })
    return gsap.to(element, {
      duration,
      y: 0,
      opacity: 1,
      ease: 'power2.out'
    })
  }
  
  // 向上滑出
  const slideOutUp = (element, duration = 0.5) => {
    return gsap.to(element, {
      duration,
      y: -100,
      opacity: 0,
      ease: 'power2.out'
    })
  }
  
  return {
    // 元素引用
    emojiRef,
    guideTextRef,
    startButtonRef,
    inputContainerRef,
    inputFieldRef,
    submitButtonRef,
    
    // 主要动画序列
    playStartAnimation,
    playResetAnimation,
    playSubmitAnimation,
    
    // 卡片动画
    playCardExpandAnimation,
    playCardCollapseAnimation,
    
    // 工具动画
    animateProgress,
    addHoverAnimation,
    pulseAnimation,
    rotateAnimation,
    fadeIn,
    fadeOut,
    slideInUp,
    slideOutUp,
    
    // Timeline 引用
    timeline
  }
}
