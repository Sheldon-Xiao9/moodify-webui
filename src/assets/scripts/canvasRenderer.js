import { gsap } from 'gsap'

// 表情画布渲染器 - 全新动态表情系统
export class EmojiCanvasRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    this.mouseX = 0
    this.mouseY = 0
    this.animationId = null
    
    // 配置选项
    this.options = {
      parallaxStrength: 0.02,
      breathingSpeed: 0.003,
      glowIntensity: 0.3,
      colorCycle: false,
      colorTransitionSpeed: 0.5,
      ...options
    }
    
    // 表情状态管理
    this.currentMood = 'happy'
    this.targetMood = 'happy'
    this.morphProgress = 0
    this.isTransitioning = false
    this.staticDisplayTime = 0
    this.lastColorCheck = 0
    this.lastUniqueActionTime = 0
    
    // 表情循环序列
    this.moodSequence = ['happy', 'sad', 'annoyed', 'angry', 'excited']
    this.currentSequenceIndex = 0
    
    // 颜色定义
    this.moodColors = {
      happy: '#FFD166',   // 黄色
      sad: '#6A7BDB',     // 蓝色
      angry: '#EF476F',   // 红色
      excited: '#8ad606', // 绿色
      annoyed: '#9B59B6'  // 紫色
    }
    
    // 嘴巴形状参数定义
    this.mouthShapes = {
      smile: {
        centerY: 15,
        radius: 20,
        startAngle: 0,
        endAngle: Math.PI,
        isArc: true,
        isUpward: true,
        hasLine: false
      },
      frown: {
        centerY: 35,
        radius: 20,
        startAngle: Math.PI,
        endAngle: 0,
        isArc: true,
        isUpward: false,
        hasLine: false
      },
      line: {
        centerY: 25,
        width: 30,
        isArc: false,
        hasLine: true
      },
      closedHalfCircle: {
        centerY: 10,
        radius: 25,
        startAngle: 0,
        endAngle: Math.PI,
        isArc: true,
        isUpward: true,
        hasLine: true,
        lineY: 10
      }
    }
    
    // 当前渲染状态
    this.currentFaceColor = this.moodColors.happy
    this.time = 0
    
    // 表情元素基础结构 - 重置所有默认值
    this.resetFaceElements()
    
    // GSAP时间轴
    this.masterTimeline = gsap.timeline({ repeat: -1 })
    this.morphTimeline = gsap.timeline()
    this.actionTimeline = gsap.timeline()
    
    this.init()
  }
  
  // 重置所有表情元素到默认状态
  resetFaceElements() {
    this.faceElements = {
      face: { scale: 1, rotation: 0, x: 0, y: 0 },
      leftEye: { scale: 1, scaleY: 1, x: 0, y: 0, rotation: 0 },
      rightEye: { scale: 1, scaleY: 1, x: 0, y: 0, rotation: 0 },
      mouth: { scaleX: 1, scaleY: 1, x: 0, y: 0 },
      leftEyebrow: { x: 0, y: 0, rotation: 0 },
      rightEyebrow: { x: 0, y: 0, rotation: 0 }
    }
  }
  
  init() {
    this.setupCanvas()
    this.setupColorCycle()
    this.startAnimation()
    this.bindEvents()
  }
  
  setupCanvas() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
    
    this.width = rect.width
    this.height = rect.height
    
    // 设置绘图样式
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
  }
  
  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
    })
    
    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = this.width / 2
      this.mouseY = this.height / 2
    })
  }
  
  // 颜色循环系统
  setupColorCycle() {
    if (this.options.colorCycle) {
      this.masterTimeline.to({}, {
        duration: 25, // 总循环时间25秒 (5个表情 × 5秒)
        onUpdate: () => {
          const progress = this.masterTimeline.progress()
          this.updateColorFromProgress(progress)
        },
        ease: 'none'
      })
    }
  }
  
  // 根据进度更新颜色和表情
  updateColorFromProgress(progress) {
    const totalMoods = this.moodSequence.length
    const currentMoodIndex = Math.floor(progress * totalMoods)
    const withinMoodProgress = (progress * totalMoods) % 1
    
    // 获取当前和下一个表情
    const currentMoodKey = this.moodSequence[currentMoodIndex % totalMoods]
    const nextMoodKey = this.moodSequence[(currentMoodIndex + 1) % totalMoods]
    
    // 修改颜色变化逻辑：每个表情保持固定颜色4秒，最后1秒过渡
    let colorProgress = 0
    if (withinMoodProgress < 0.8) {
      // 前80%时间（4秒）保持当前表情的纯色
      colorProgress = 0
      this.currentFaceColor = this.moodColors[currentMoodKey]
    } else {
      // 后20%时间（1秒）过渡到下一个颜色
      colorProgress = (withinMoodProgress - 0.8) / 0.2
      this.currentFaceColor = this.interpolateColor(
        this.moodColors[currentMoodKey],
        this.moodColors[nextMoodKey],
        colorProgress
      )
    }
    
    // 检查是否需要切换表情和触发独特动作
    this.checkMoodTransition(currentMoodKey, withinMoodProgress)
    this.checkUniqueAction(currentMoodKey, withinMoodProgress)
  }
  
  // 检查表情切换
  checkMoodTransition(targetMood, progress) {
    const now = Date.now()
    
    // 避免频繁检查
    if (now - this.lastColorCheck < 100) return
    this.lastColorCheck = now
    
    // 检查颜色差异
    const colorDifference = this.calculateColorDifference(
      this.currentFaceColor,
      this.moodColors[targetMood]
    )
    
    // 当颜色接近目标表情时触发切换
    if (colorDifference < 0.1 && targetMood !== this.currentMood) {
      this.triggerMoodTransition(targetMood)
    }
  }
  
  // 检查独特动作触发
  checkUniqueAction(currentMoodKey, progress) {
    const now = Date.now()
    
    // 只在当前表情稳定显示期间触发独特动作
    if (this.currentMood === currentMoodKey && !this.isTransitioning) {
      // 在表情稳定展示的中间段触发独特动作
      if (progress > 0.2 && progress < 0.7) {
        if (now - this.lastUniqueActionTime > 3000) { // 每3秒触发一次独特动作
          this.triggerUniqueAction(this.currentMood)
          this.lastUniqueActionTime = now
        }
      }
    }
  }
  
  // 触发表情切换
  triggerMoodTransition(targetMood) {
    if (this.isTransitioning) return
    
    this.isTransitioning = true
    this.targetMood = targetMood
    
    // 停止之前的动画
    this.actionTimeline.kill()
    
    // 重置到默认状态
    this.resetFaceElements()
    
    // 表情切换时的弹跳效果
    gsap.to(this.faceElements.face, { 
      scale: 1.05, 
      duration: 0.15, 
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    })
    
    // 使用GSAP进行平滑变形
    this.morphTimeline.clear()
    this.morphTimeline
      .to(this, { morphProgress: 1, duration: 0.3, ease: 'power2.out' })
      .call(() => {
        this.currentMood = this.targetMood
        this.morphProgress = 0
        this.isTransitioning = false
        this.staticDisplayTime = Date.now()
        // 重置独特动作时间，确保新表情可以立即开始独特动作
        this.lastUniqueActionTime = Date.now() - 2000
      })
  }
  
  // 触发独特动作
  triggerUniqueAction(mood) {
    // 先停止之前的动作
    this.actionTimeline.kill()
    this.actionTimeline = gsap.timeline()
    
    switch (mood) {
      case 'happy':
        // Happy: 眨眼+嘴巴上移
        this.actionTimeline
          .to([this.faceElements.leftEye, this.faceElements.rightEye], { 
            scaleY: 0.1, 
            duration: 0.1 
          })
          .to(this.faceElements.mouth, { y: -3, duration: 0.2 }, 0)
          .to([this.faceElements.leftEye, this.faceElements.rightEye], { 
            scaleY: 1, 
            duration: 0.1 
          })
          .to(this.faceElements.mouth, { y: 0, duration: 0.2 }, '-=0.1')
        break
        
      case 'sad':
        // Sad: 眼睛下沉+嘴巴下移
        this.actionTimeline
          .to([this.faceElements.leftEye, this.faceElements.rightEye], { 
            y: 2, 
            duration: 0.3 
          })
          .to(this.faceElements.mouth, { y: 3, duration: 0.4 }, 0.1)
          .to([this.faceElements.leftEye, this.faceElements.rightEye], { 
            y: 0, 
            duration: 0.3 
          })
          .to(this.faceElements.mouth, { y: 0, duration: 0.3 }, '-=0.2')
        break
        
      case 'angry':
        // Angry: 快速震动+眉毛激烈摆动
        this.actionTimeline
          .to(this.faceElements.face, { 
            x: -2, 
            y: -1, 
            duration: 0.05,
            repeat: 7,
            yoyo: true,
            ease: 'power2.inOut'
          })
          .to(this.faceElements.leftEyebrow, { 
            rotation: 25, 
            y: -3, 
            duration: 0.1,
            repeat: 5,
            yoyo: true
          }, 0)
          .to(this.faceElements.rightEyebrow, { 
            rotation: -25, 
            y: -3, 
            duration: 0.1,
            repeat: 5,
            yoyo: true
          }, 0)
          .to(this.faceElements.face, { x: 0, y: 0, duration: 0.1 })
          .to([this.faceElements.leftEyebrow, this.faceElements.rightEyebrow], { 
            rotation: 0, 
            y: 0, 
            duration: 0.2 
          }, '-=0.1')
        break
        
      case 'excited':
        // Excited: 嘴巴放大+眼睛微微上移
        this.actionTimeline
          .to(this.faceElements.mouth, { 
            scaleX: 1.15, 
            scaleY: 1.1, 
            duration: 0.2 
          })
          .to([this.faceElements.leftEye, this.faceElements.rightEye], { 
            y: -3, 
            duration: 0.3,
            ease: 'power2.out'
          }, 0)
          .to(this.faceElements.mouth, { 
            scaleX: 1, 
            scaleY: 1, 
            duration: 0.2 
          })
          .to([this.faceElements.leftEye, this.faceElements.rightEye], { 
            y: 0, 
            duration: 0.3,
            ease: 'power2.out'
          }, '-=0.1')
        break
        
      case 'annoyed':
        // Annoyed: 细微抽动+眉毛上扬
        this.actionTimeline
          .to(this.faceElements.face, { 
            rotation: -1, 
            duration: 0.1,
            repeat: 5,
            yoyo: true
          })
          .to([this.faceElements.leftEyebrow, this.faceElements.rightEyebrow], { 
            y: -2, 
            rotation: 8, 
            duration: 0.4 
          }, 0)
          .to(this.faceElements.face, { rotation: 0, duration: 0.1 })
          .to([this.faceElements.leftEyebrow, this.faceElements.rightEyebrow], { 
            y: 0, 
            rotation: 0, 
            duration: 0.3 
          }, '-=0.1')
        break
    }
  }
  
  // 颜色插值
  interpolateColor(color1, color2, progress) {
    const c1 = this.hexToRgb(color1)
    const c2 = this.hexToRgb(color2)
    
    const r = Math.round(c1.r + (c2.r - c1.r) * progress)
    const g = Math.round(c1.g + (c2.g - c1.g) * progress)
    const b = Math.round(c1.b + (c2.b - c1.b) * progress)
    
    return this.rgbToHex(r, g, b)
  }
  
  // 计算颜色差异
  calculateColorDifference(color1, color2) {
    const c1 = this.hexToRgb(color1)
    const c2 = this.hexToRgb(color2)
    
    const deltaR = (c1.r - c2.r) / 255
    const deltaG = (c1.g - c2.g) / 255
    const deltaB = (c1.b - c2.b) / 255
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB)
  }
  
  // 颜色工具函数
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
  
  // 嘴巴形状插值
  interpolateMouthShape(shape1, shape2, progress) {
    const easedProgress = this.easeInOutQuad(progress)
    
    return {
      centerY: shape1.centerY + (shape2.centerY - shape1.centerY) * easedProgress,
      radius: (shape1.radius || 0) + ((shape2.radius || 0) - (shape1.radius || 0)) * easedProgress,
      width: (shape1.width || 0) + ((shape2.width || 0) - (shape1.width || 0)) * easedProgress,
      startAngle: (shape1.startAngle || 0) + ((shape2.startAngle || 0) - (shape1.startAngle || 0)) * easedProgress,
      endAngle: (shape1.endAngle || 0) + ((shape2.endAngle || 0) - (shape1.endAngle || 0)) * easedProgress,
      isArc: progress < 0.5 ? shape1.isArc : shape2.isArc,
      isUpward: progress < 0.5 ? shape1.isUpward : shape2.isUpward,
      hasLine: shape1.hasLine || shape2.hasLine,
      lineY: shape1.lineY ? shape1.lineY + ((shape2.lineY || shape2.centerY) - shape1.lineY) * easedProgress : undefined,
      morphProgress: easedProgress
    }
  }
  
  // 缓动函数
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }
  
  // 获取当前表情的渲染参数
  getCurrentMoodParams() {
    const currentParams = this.getMoodParams(this.currentMood)
    
    if (this.isTransitioning && this.morphProgress > 0) {
      const targetParams = this.getMoodParams(this.targetMood)
      return this.interpolateParams(currentParams, targetParams, this.morphProgress)
    }
    
    return currentParams
  }
  
  // 获取表情参数
  getMoodParams(mood) {
    switch (mood) {
      case 'happy':
        return {
          eyeType: 'circle',
          eyeScale: 1,
          mouthType: 'smile',
          showEyebrows: false
        }
        
      case 'sad':
        return {
          eyeType: 'circle',
          eyeScale: 0.8,
          mouthType: 'frown',
          showEyebrows: false
        }
        
      case 'angry':
        return {
          eyeType: 'circle',
          eyeScale: 1.1,
          mouthType: 'frown',
          showEyebrows: true,
          eyebrowAngle: 15
        }
        
      case 'excited':
        return {
          eyeType: 'arcUp',  // 上半圆弧，开口朝下
          eyeScale: 1.2,
          mouthType: 'closedHalfCircle',  // 封口半圆笑
          showEyebrows: false
        }
        
      case 'annoyed':
        return {
          eyeType: 'circle',
          eyeScale: 1,
          mouthType: 'line',
          showEyebrows: true,
          eyebrowAngle: 5
        }
        
      default:
        return {
          eyeType: 'circle',
          eyeScale: 1,
          mouthType: 'smile',
          showEyebrows: false
        }
    }
  }
  
  // 参数插值
  interpolateParams(params1, params2, progress) {
    return {
      eyeType: progress < 0.5 ? params1.eyeType : params2.eyeType,
      eyeScale: params1.eyeScale + (params2.eyeScale - params1.eyeScale) * progress,
      mouthType: progress < 0.5 ? params1.mouthType : params2.mouthType,
      // 添加嘴巴形状插值
      mouthShape: this.interpolateMouthShape(
        this.mouthShapes[params1.mouthType],
        this.mouthShapes[params2.mouthType],
        progress
      ),
      showEyebrows: progress < 0.5 ? params1.showEyebrows : params2.showEyebrows,
      eyebrowAngle: (params1.eyebrowAngle || 0) + ((params2.eyebrowAngle || 0) - (params1.eyebrowAngle || 0)) * progress
    }
  }
  
  // 渲染方法
  render() {
    this.clear()
    this.drawBackground()
    
    const centerX = this.width / 2
    const centerY = this.height / 2
    const params = this.getCurrentMoodParams()
    
    // 计算视差偏移
    const parallaxX = (this.mouseX - centerX) * this.options.parallaxStrength
    const parallaxY = (this.mouseY - centerY) * this.options.parallaxStrength
    
    // 保存上下文
    this.ctx.save()
    this.ctx.translate(centerX + parallaxX, centerY + parallaxY)
    
    // 应用脸部变换（用于动画效果）
    this.ctx.translate(this.faceElements.face.x, this.faceElements.face.y)
    this.ctx.scale(this.faceElements.face.scale, this.faceElements.face.scale)
    this.ctx.rotate(this.faceElements.face.rotation * Math.PI / 180)
    
    // 绘制脸部
    this.drawFace(params)
    
    // 绘制眼睛
    this.drawEyes(params)
    
    // 绘制眉毛
    if (params.showEyebrows) {
      this.drawEyebrows(params)
    }
    
    // 绘制嘴巴
    this.drawMouth(params)
    
    // 绘制腮红
    this.drawCheeks()
    
    this.ctx.restore()
    this.time++
  }
  
  // 绘制脸部
  drawFace(params) {
    this.ctx.save()
    
    // 呼吸效果
    const breathingScale = 1 + Math.sin(this.time * this.options.breathingSpeed) * 0.03
    this.ctx.scale(breathingScale, breathingScale)
    
    this.ctx.fillStyle = this.currentFaceColor
    this.ctx.strokeStyle = this.currentFaceColor
    this.ctx.lineWidth = 3
    
    if (this.options.glowIntensity > 0) {
      this.ctx.shadowBlur = 20 * this.options.glowIntensity
      this.ctx.shadowColor = this.currentFaceColor
    }
    
    this.ctx.beginPath()
    this.ctx.arc(0, 0, 80, 0, Math.PI * 2)
    this.ctx.fill()
    
    this.ctx.restore()
  }
  
  // 绘制眼睛
  drawEyes(params) {
    this.ctx.save()
    
    const eyeScale = params.eyeScale
    const leftEyeX = -25 + this.faceElements.leftEye.x
    const leftEyeY = -20 + this.faceElements.leftEye.y
    const rightEyeX = 25 + this.faceElements.rightEye.x
    const rightEyeY = -20 + this.faceElements.rightEye.y
    
    this.ctx.fillStyle = '#333'
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 3
    this.ctx.lineCap = 'round'
    
    // 左眼
    this.ctx.save()
    this.ctx.translate(leftEyeX, leftEyeY)
    this.ctx.scale(eyeScale * this.faceElements.leftEye.scale, 
                   eyeScale * this.faceElements.leftEye.scaleY)
    this.ctx.rotate(this.faceElements.leftEye.rotation * Math.PI / 180)
    
    if (params.eyeType === 'arcUp') {
      // Excited表情：上半圆弧，开口朝下（眯眼笑）
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 8, Math.PI, 2 * Math.PI, false)
      this.ctx.stroke()
    } else {
      // 其他表情：圆形眼睛
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 8, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.restore()
    
    // 右眼
    this.ctx.save()
    this.ctx.translate(rightEyeX, rightEyeY)
    this.ctx.scale(eyeScale * this.faceElements.rightEye.scale, 
                   eyeScale * this.faceElements.rightEye.scaleY)
    this.ctx.rotate(this.faceElements.rightEye.rotation * Math.PI / 180)
    
    if (params.eyeType === 'arcUp') {
      // Excited表情：上半圆弧，开口朝下（眯眼笑）
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 8, Math.PI, 2 * Math.PI, false)
      this.ctx.stroke()
    } else {
      // 其他表情：圆形眼睛
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 8, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.restore()
    
    this.ctx.restore()
  }
  
  // 绘制眉毛
  drawEyebrows(params) {
    this.ctx.save()
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 3
    this.ctx.lineCap = 'round'
    
    const leftBrowX = -25 + this.faceElements.leftEyebrow.x
    const leftBrowY = -30 + this.faceElements.leftEyebrow.y
    const rightBrowX = 25 + this.faceElements.rightEyebrow.x
    const rightBrowY = -30 + this.faceElements.rightEyebrow.y
    
    // 左眉毛
    this.ctx.save()
    this.ctx.translate(leftBrowX, leftBrowY)
    this.ctx.rotate(((params.eyebrowAngle || 0) + this.faceElements.leftEyebrow.rotation) * Math.PI / 180)
    this.ctx.beginPath()
    this.ctx.moveTo(-10, 0)
    this.ctx.lineTo(10, 0)
    this.ctx.stroke()
    this.ctx.restore()
    
    // 右眉毛
    this.ctx.save()
    this.ctx.translate(rightBrowX, rightBrowY)
    this.ctx.rotate((-(params.eyebrowAngle || 0) + this.faceElements.rightEyebrow.rotation) * Math.PI / 180)
    this.ctx.beginPath()
    this.ctx.moveTo(-10, 0)
    this.ctx.lineTo(10, 0)
    this.ctx.stroke()
    this.ctx.restore()
    
    this.ctx.restore()
  }
  
  // 绘制嘴巴
  drawMouth(params) {
    this.ctx.save()
    
    // 应用嘴巴的变换
    this.ctx.translate(this.faceElements.mouth.x, this.faceElements.mouth.y)
    this.ctx.scale(this.faceElements.mouth.scaleX, this.faceElements.mouth.scaleY)
    
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 3
    this.ctx.lineCap = 'round'
    
    // 如果在过渡中，使用插值形状
    if (this.isTransitioning && params.mouthShape) {
      this.drawMorphingMouth(params.mouthShape)
    } else {
      // 使用标准形状
      this.drawStandardMouth(params.mouthType)
    }
    
    this.ctx.restore()
  }
  
  // 绘制变形中的嘴巴
  drawMorphingMouth(shape) {
    this.ctx.beginPath()
    
    if (shape.isArc && shape.radius > 0) {
      // 绘制弧形嘴巴
      this.ctx.arc(0, shape.centerY, shape.radius, shape.startAngle, shape.endAngle)
      this.ctx.stroke()
      
      // 如果需要线条（如excited的封口线）
      if (shape.hasLine && shape.lineY !== undefined) {
        // 计算线条的透明度（基于变形进度）
        const lineAlpha = shape.morphProgress > 0.3 ? (shape.morphProgress - 0.3) / 0.7 : 0
        if (lineAlpha > 0) {
          this.ctx.save()
          this.ctx.globalAlpha = lineAlpha
          this.ctx.beginPath()
          this.ctx.moveTo(-shape.radius, shape.lineY)
          this.ctx.lineTo(shape.radius, shape.lineY)
          this.ctx.stroke()
          this.ctx.restore()
        }
      }
    } else if (!shape.isArc && shape.width > 0) {
      // 绘制直线嘴巴
      this.ctx.beginPath()
      this.ctx.moveTo(-shape.width / 2, shape.centerY)
      this.ctx.lineTo(shape.width / 2, shape.centerY)
      this.ctx.stroke()
    }
  }
  
  // 绘制标准嘴巴
  drawStandardMouth(mouthType) {
    switch (mouthType) {
      case 'smile':
        // Happy: 开心微笑，弧形向上
        this.ctx.beginPath()
        this.ctx.arc(0, 15, 20, 0, Math.PI)
        this.ctx.stroke()
        break
        
      case 'closedHalfCircle':
        // Excited: 兴奋半圆笑带封口横线
        // 先画半圆
        this.ctx.beginPath()
        this.ctx.arc(0, 10, 25, 0, Math.PI)
        this.ctx.stroke()
        // 再画封口横线
        this.ctx.beginPath()
        this.ctx.moveTo(-25, 10)
        this.ctx.lineTo(25, 10)
        this.ctx.stroke()
        break
        
      case 'frown':
        // Sad/Angry: 悲伤皱眉，弧形向下
        this.ctx.beginPath()
        this.ctx.arc(0, 35, 20, Math.PI, 0)
        this.ctx.stroke()
        break
        
      case 'line':
        // Annoyed: 烦躁直线嘴
        this.ctx.beginPath()
        this.ctx.moveTo(-15, 25)
        this.ctx.lineTo(15, 25)
        this.ctx.stroke()
        break
        
      default:
        this.ctx.beginPath()
        this.ctx.arc(0, 15, 15, 0, Math.PI)
        this.ctx.stroke()
        break
    }
  }
  
  // 绘制腮红
  drawCheeks() {
    this.ctx.save()
    this.ctx.fillStyle = '#EF476F'
    this.ctx.globalAlpha = 0.3
    
    this.ctx.beginPath()
    this.ctx.arc(-50, 5, 12, 0, Math.PI * 2)
    this.ctx.fill()
    
    this.ctx.beginPath()
    this.ctx.arc(50, 5, 12, 0, Math.PI * 2)
    this.ctx.fill()
    
    this.ctx.restore()
  }
  
  // 绘制背景
  drawBackground() {
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
    )
    
    gradient.addColorStop(0, 'rgba(255, 209, 102, 0.1)')
    gradient.addColorStop(0.5, 'rgba(239, 71, 111, 0.05)')
    gradient.addColorStop(1, 'rgba(6, 214, 160, 0.02)')
    
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  
  startAnimation() {
    const animate = () => {
      this.render()
      this.animationId = requestAnimationFrame(animate)
    }
    animate()
  }
  
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.masterTimeline.pause()
  }
  
  // 手动更新表情
  updateMood(mood) {
    if (mood !== this.currentMood && !this.isTransitioning) {
      this.triggerMoodTransition(mood)
    }
  }
  
  // 调整画布大小
  resize() {
    this.setupCanvas()
  }
  
  // 销毁渲染器
  destroy() {
    this.stopAnimation()
    this.masterTimeline.kill()
    this.morphTimeline.kill()
    this.actionTimeline.kill()
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave)
  }
}

// 导出工厂函数
export function createEmojiRenderer(canvas, options) {
  return new EmojiCanvasRenderer(canvas, options)
}
