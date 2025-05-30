// 表情画布渲染器
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
      colorCycle: false, // 默认关闭颜色循环，保持静态颜色
      blinkInterval: 2000, // 眨眼间隔（毫秒）
      blinkDuration: 150,  // 眨眼持续时间（毫秒）
      ...options
    }
    
    // 表情元素
    this.elements = []
    this.time = 0
    this.lastBlinkTime = 0
    this.isBlinking = false
    this.blinkStartTime = 0
    this.currentMood = 'happy'
    this.currentFaceColor = '#FFD166' // 当前脸部颜色
    this.actualFaceColor = '#FFD166' // 实际渲染的脸部颜色（包括渐变）
    
    this.init()
  }
  
  init() {
    this.setupCanvas()
    this.createEmojiElements()
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
  }
  
  createEmojiElements() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    
    // 创建表情的各个部分
    this.elements = [
      // 脸部轮廓
      {
        type: 'circle',
        x: centerX,
        y: centerY,
        radius: 80,
        color: this.currentFaceColor,
        parallax: 0.5,
        breathing: true
      },
      // 左眼
      {
        type: 'circle',
        x: centerX - 25,
        y: centerY - 15,
        radius: 8,
        color: '#333',
        parallax: 0.8,
        breathing: false,
        isEye: true,
        eyeSide: 'left'
      },
      // 右眼
      {
        type: 'circle',
        x: centerX + 25,
        y: centerY - 15,
        radius: 8,
        color: '#333',
        parallax: 0.8,
        breathing: false,
        isEye: true,
        eyeSide: 'right'
      },
      // 嘴巴
      {
        type: 'arc',
        x: centerX,
        y: centerY + 10,
        radius: 25,
        startAngle: 0,
        endAngle: Math.PI,
        color: '#333',
        parallax: 0.6,
        breathing: true
      },
      // 左腮红
      {
        type: 'circle',
        x: centerX - 50,
        y: centerY + 5,
        radius: 12,
        color: '#EF476F',
        alpha: 0.4,
        parallax: 0.3,
        breathing: true
      },
      // 右腮红
      {
        type: 'circle',
        x: centerX + 50,
        y: centerY + 5,
        radius: 12,
        color: '#EF476F',
        alpha: 0.4,
        parallax: 0.3,
        breathing: true
      },
      // 左眼皮（用于眨眼动画）
      {
        type: 'eyelid',
        x: centerX - 25,
        y: centerY - 15,
        radius: 8,
        color: this.currentFaceColor,
        parallax: 0.8,
        breathing: false,
        isEyelid: true,
        eyeSide: 'left'
      },
      // 右眼皮（用于眨眼动画）
      {
        type: 'eyelid',
        x: centerX + 25,
        y: centerY - 15,
        radius: 8,
        color: this.currentFaceColor,
        parallax: 0.8,
        breathing: false,
        isEyelid: true,
        eyeSide: 'right'
      }
    ]
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
  
  // 更新眨眼状态
  updateBlinkState() {
    const currentTime = Date.now()
    
    // 检查是否应该开始眨眼
    if (!this.isBlinking && currentTime - this.lastBlinkTime > this.options.blinkInterval) {
      this.isBlinking = true
      this.blinkStartTime = currentTime
      this.lastBlinkTime = currentTime
    }
    
    // 检查是否应该结束眨眼
    if (this.isBlinking && currentTime - this.blinkStartTime > this.options.blinkDuration) {
      this.isBlinking = false
    }
  }
  
  // 计算眨眼动画进度
  getBlinkProgress() {
    if (!this.isBlinking) return 0
    
    const elapsed = Date.now() - this.blinkStartTime
    const progress = Math.min(elapsed / this.options.blinkDuration, 1)
    
    // 使用sin函数创建平滑的眨眼动画
    return Math.sin(progress * Math.PI)
  }
  
  // 计算当前渲染帧的实际脸部颜色
  getCurrentFaceColor() {
    if (this.options.colorCycle) {
      // 从黄色开始的HSL渐变
      const hue = 60 + (this.time * 0.5) % 300 // 从60度(黄色)开始，缓慢变化
      return `hsl(${hue}, 70%, 65%)`
    } else {
      return this.currentFaceColor
    }
  }
  
  drawElement(element) {
    this.ctx.save()
    
    // 计算视差偏移
    const parallaxX = (this.mouseX - this.width / 2) * element.parallax * this.options.parallaxStrength
    const parallaxY = (this.mouseY - this.height / 2) * element.parallax * this.options.parallaxStrength
    
    // 计算呼吸效果
    let breathingScale = 1
    if (element.breathing) {
      breathingScale = 1 + Math.sin(this.time * this.options.breathingSpeed) * 0.05
    }
    
    // 设置颜色
    let color = element.color
    
    // 脸部使用渐变色（如果开启）
    if (element.type === 'circle' && element.radius > 50) {
      color = this.getCurrentFaceColor()
      this.actualFaceColor = color // 更新实际脸部颜色
    }
    
    // 眼皮使用实际脸部颜色
    if (element.isEyelid) {
      color = this.actualFaceColor
    }
    
    // 设置透明度
    this.ctx.globalAlpha = element.alpha || 1
    
    // 应用变换
    this.ctx.translate(element.x + parallaxX, element.y + parallaxY)
    this.ctx.scale(breathingScale, breathingScale)
    
    // 绘制元素
    this.ctx.fillStyle = color
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 3
    
    switch (element.type) {
      case 'circle':
        this.drawCircle(0, 0, element.radius)
        break
      case 'arc':
        this.drawArc(0, 0, element.radius, element.startAngle, element.endAngle)
        break
      case 'eyelid':
        this.drawEyelid(element)
        break
    }
    
    this.ctx.restore()
  }
  
  // 绘制眼皮（眨眼动画）
  drawEyelid(element) {
    const blinkProgress = this.getBlinkProgress()
    
    if (blinkProgress > 0) {
      // 计算眼皮的高度
      const eyelidHeight = element.radius * 2 * blinkProgress
      
      // 使用实际脸部颜色
      this.ctx.fillStyle = this.actualFaceColor
      this.ctx.beginPath()
      this.ctx.ellipse(0, -element.radius + eyelidHeight/2, element.radius, eyelidHeight/2, 0, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
  
  drawCircle(x, y, radius) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
    
    // 添加发光效果
    if (this.options.glowIntensity > 0) {
      this.ctx.shadowBlur = 20 * this.options.glowIntensity
      this.ctx.shadowColor = this.ctx.fillStyle
      this.ctx.fill()
    }
  }
  
  drawArc(x, y, radius, startAngle, endAngle) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, startAngle, endAngle)
    this.ctx.stroke()
    
    // 添加发光效果
    if (this.options.glowIntensity > 0) {
      this.ctx.shadowBlur = 15 * this.options.glowIntensity
      this.ctx.shadowColor = this.ctx.strokeStyle
      this.ctx.stroke()
    }
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  
  render() {
    this.clear()
    
    // 更新眨眼状态
    this.updateBlinkState()
    
    // 绘制背景渐变
    this.drawBackground()
    
    // 绘制所有表情元素
    this.elements.forEach(element => {
      this.drawElement(element)
    })
    
    this.time++
  }
  
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
  }
  
  // 更新表情状态
  updateMood(mood) {
    this.currentMood = mood
    
    const moodConfigs = {
      happy: {
        faceColor: '#FFD166',
        eyeStyle: 'happy',
        mouthStyle: 'smile',
        blinkInterval: 2000
      },
      sad: {
        faceColor: '#6A7BDB',
        eyeStyle: 'sad',
        mouthStyle: 'frown',
        blinkInterval: 3000 // 悲伤时眨眼更慢
      },
      excited: {
        faceColor: '#EF476F',
        eyeStyle: 'excited',
        mouthStyle: 'big-smile',
        blinkInterval: 1500 // 兴奋时眨眼更快
      },
      calm: {
        faceColor: '#06D6A0',
        eyeStyle: 'calm',
        mouthStyle: 'neutral',
        blinkInterval: 2500 // 平静时眨眼较慢
      },
      melancholy: {
        faceColor: '#9B59B6',
        eyeStyle: 'melancholy',
        mouthStyle: 'neutral',
        blinkInterval: 3500 // 忧郁时眨眼最慢
      }
    }
    
    const config = moodConfigs[mood] || moodConfigs.happy
    this.options.blinkInterval = config.blinkInterval
    
    // 更新当前脸部颜色
    this.currentFaceColor = config.faceColor
    this.actualFaceColor = config.faceColor
    
    this.applyMoodConfig(config)
  }
  
  applyMoodConfig(config) {
    // 更新脸部颜色
    const face = this.elements[0]
    const leftEyelid = this.elements[6]
    const rightEyelid = this.elements[7]
    
    if (face) {
      face.color = config.faceColor
    }
    
    // 眼皮颜色跟随脸部颜色
    if (leftEyelid) {
      leftEyelid.color = config.faceColor
    }
    if (rightEyelid) {
      rightEyelid.color = config.faceColor
    }
    
    // 根据心情调整眼睛
    this.updateEyes(config.eyeStyle)
    
    // 根据心情调整嘴巴
    this.updateMouth(config.mouthStyle)
  }
  
  updateEyes(style) {
    const leftEye = this.elements[1]
    const rightEye = this.elements[2]
    
    switch (style) {
      case 'happy':
        leftEye.type = 'circle'
        rightEye.type = 'circle'
        leftEye.startAngle = 0
        leftEye.endAngle = Math.PI
        rightEye.startAngle = 0
        rightEye.endAngle = Math.PI
        leftEye.radius = 8
        rightEye.radius = 8
        break
      case 'sad':
        leftEye.type = 'arc'
        rightEye.type = 'arc'
        leftEye.startAngle = Math.PI
        leftEye.endAngle = 0
        rightEye.startAngle = Math.PI
        rightEye.endAngle = 0
        leftEye.radius = 8
        rightEye.radius = 8
        break
      case 'excited':
        leftEye.type = 'circle'
        rightEye.type = 'circle'
        leftEye.radius = 10 // 兴奋时眼睛更大
        rightEye.radius = 10
        break
      case 'melancholy':
        leftEye.type = 'circle'
        rightEye.type = 'circle'
        leftEye.radius = 6 // 忧郁时眼睛更小
        rightEye.radius = 6
        break
      default:
        leftEye.type = 'circle'
        rightEye.type = 'circle'
        leftEye.radius = 8
        rightEye.radius = 8
        break
    }
  }
  
  updateMouth(style) {
    const mouth = this.elements[3]
    
    switch (style) {
      case 'smile':
        mouth.type = 'arc'
        mouth.radius = 25
        mouth.startAngle = 0
        mouth.endAngle = Math.PI
        break
      case 'big-smile':
        mouth.type = 'arc'
        mouth.radius = 30
        mouth.startAngle = 0
        mouth.endAngle = Math.PI
        break
      case 'frown':
        mouth.type = 'arc'
        mouth.radius = 25
        mouth.startAngle = Math.PI
        mouth.endAngle = 0
        break
      case 'neutral':
        mouth.type = 'arc'
        mouth.radius = 15
        mouth.startAngle = 0
        mouth.endAngle = Math.PI
        break
    }
  }
  
  // 手动触发眨眼
  triggerBlink() {
    this.isBlinking = true
    this.blinkStartTime = Date.now()
  }
  
  // 调整画布大小
  resize() {
    this.setupCanvas()
    this.createEmojiElements()
  }
  
  // 销毁渲染器
  destroy() {
    this.stopAnimation()
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave)
  }
}

// 导出工厂函数
export function createEmojiRenderer(canvas, options) {
  return new EmojiCanvasRenderer(canvas, options)
}
