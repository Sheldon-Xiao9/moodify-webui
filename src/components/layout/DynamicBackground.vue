<template>
  <div class="dynamic-background" :class="variant">
    <!-- 浮动几何形状 -->
    <div class="floating-shapes">
      <div 
        v-for="i in shapeCount" 
        :key="`shape-${i}`"
        class="shape"
        :class="`shape-${i}`"
        :style="getShapeStyle(i)"
      ></div>
    </div>
    
    <!-- 渐变光球 -->
    <div class="gradient-orbs">
      <div 
        v-for="i in orbCount" 
        :key="`orb-${i}`"
        class="orb"
        :class="`orb-${i}`"
        :style="getOrbStyle(i)"
      ></div>
    </div>
    
    <!-- 音符装饰 -->
    <div class="music-notes">
      <span 
        v-for="(note, i) in notes" 
        :key="`note-${i}`"
        class="note"
        :class="`note-${i + 1}`"
        :style="getNoteStyle(i)"
      >{{ note }}</span>
    </div>
    
    <!-- 粒子效果 -->
    <div class="particles">
      <div 
        v-for="i in particleCount" 
        :key="`particle-${i}`"
        class="particle"
        :class="`particle-${i}`"
        :style="getParticleStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'home', // 'home' | 'results'
    validator: (value) => ['home', 'results'].includes(value)
  }
})

// 根据变体调整元素数量和样式
const shapeCount = computed(() => props.variant === 'home' ? 8 : 6)
const orbCount = computed(() => props.variant === 'home' ? 4 : 3)
const particleCount = computed(() => props.variant === 'home' ? 10 : 8)

const notes = ['♪', '♫', '♪', '♬', '♫', '♪', '♬', '♫']

// 为不同变体生成不同的样式
const getShapeStyle = (index) => {
  const homePositions = [
    { top: '10%', left: '10%', width: '80px', height: '80px', delay: '0s' },
    { top: '20%', right: '15%', width: '60px', height: '60px', delay: '-2s' },
    { bottom: '20%', left: '8%', width: '100px', height: '100px', delay: '-4s' },
    { top: '60%', right: '8%', width: '45px', height: '45px', delay: '-1s' },
    { top: '40%', left: '5%', width: '70px', height: '70px', delay: '-3s' },
    { bottom: '10%', right: '20%', width: '55px', height: '55px', delay: '-5s' },
    { top: '5%', left: '50%', width: '90px', height: '90px', delay: '-6s' },
    { bottom: '30%', right: '40%', width: '35px', height: '35px', delay: '-7s' }
  ]
  
  const resultsPositions = [
    { top: '15%', left: '12%', width: '70px', height: '70px', delay: '0s' },
    { top: '25%', right: '18%', width: '50px', height: '50px', delay: '-2s' },
    { bottom: '25%', left: '10%', width: '85px', height: '85px', delay: '-4s' },
    { top: '65%', right: '12%', width: '40px', height: '40px', delay: '-1s' },
    { top: '45%', left: '8%', width: '60px', height: '60px', delay: '-3s' },
    { bottom: '15%', right: '25%', width: '45px', height: '45px', delay: '-5s' }
  ]
  
  const positions = props.variant === 'home' ? homePositions : resultsPositions
  const pos = positions[index - 1] || positions[0]
  
  return {
    top: pos.top,
    left: pos.left,
    right: pos.right,
    bottom: pos.bottom,
    width: pos.width,
    height: pos.height,
    animationDelay: pos.delay
  }
}

const getOrbStyle = (index) => {
  const homeOrbs = [
    { 
      top: '5%', right: '10%', width: '200px', height: '200px', 
      background: 'radial-gradient(circle, rgba(255, 107, 107, 0.4) 0%, transparent 70%)',
      delay: '0s' 
    },
    { 
      bottom: '15%', left: '5%', width: '150px', height: '150px',
      background: 'radial-gradient(circle, rgba(78, 205, 196, 0.4) 0%, transparent 70%)',
      delay: '-4s' 
    },
    { 
      top: '50%', left: '50%', width: '180px', height: '180px',
      background: 'radial-gradient(circle, rgba(255, 206, 84, 0.4) 0%, transparent 70%)',
      delay: '-8s' 
    },
    { 
      top: '70%', right: '30%', width: '120px', height: '120px',
      background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)',
      delay: '-6s' 
    }
  ]
  
  const resultsOrbs = [
    { 
      top: '8%', right: '15%', width: '170px', height: '170px', 
      background: 'radial-gradient(circle, rgba(255, 149, 149, 0.35) 0%, transparent 70%)',
      delay: '0s' 
    },
    { 
      bottom: '20%', left: '8%', width: '130px', height: '130px',
      background: 'radial-gradient(circle, rgba(98, 225, 216, 0.35) 0%, transparent 70%)',
      delay: '-4s' 
    },
    { 
      top: '55%', right: '35%', width: '110px', height: '110px',
      background: 'radial-gradient(circle, rgba(158, 83, 246, 0.25) 0%, transparent 70%)',
      delay: '-6s' 
    }
  ]
  
  const orbs = props.variant === 'home' ? homeOrbs : resultsOrbs
  const orb = orbs[index - 1] || orbs[0]
  
  return {
    top: orb.top,
    left: orb.left,
    right: orb.right,
    bottom: orb.bottom,
    width: orb.width,
    height: orb.height,
    background: orb.background,
    animationDelay: orb.delay
  }
}

const getNoteStyle = (index) => {
  const homeNotes = [
    { top: '15%', left: '20%', delay: '0s' },
    { top: '25%', right: '25%', delay: '-2s' },
    { bottom: '30%', left: '15%', delay: '-4s' },
    { top: '50%', right: '10%', delay: '-6s' },
    { bottom: '15%', right: '35%', delay: '-8s' },
    { top: '35%', left: '30%', delay: '-3s' },
    { bottom: '40%', right: '15%', delay: '-5s' },
    { top: '60%', left: '40%', delay: '-7s' }
  ]
  
  const resultsNotes = [
    { top: '18%', left: '22%', delay: '0s' },
    { top: '28%', right: '28%', delay: '-2s' },
    { bottom: '32%', left: '18%', delay: '-4s' },
    { top: '52%', right: '12%', delay: '-6s' },
    { bottom: '18%', right: '38%', delay: '-8s' },
    { top: '38%', left: '32%', delay: '-3s' }
  ]
  
  const positions = props.variant === 'home' ? homeNotes : resultsNotes
  const maxIndex = positions.length - 1
  const pos = positions[Math.min(index, maxIndex)]
  
  return {
    top: pos.top,
    left: pos.left,
    right: pos.right,
    bottom: pos.bottom,
    animationDelay: pos.delay
  }
}

const getParticleStyle = (index) => {
  const homeParticles = [
    { top: '10%', left: '10%', delay: '0s' },
    { top: '20%', left: '80%', delay: '-3s' },
    { top: '30%', left: '60%', delay: '-6s' },
    { top: '40%', left: '20%', delay: '-9s' },
    { top: '50%', left: '90%', delay: '-12s' },
    { top: '60%', left: '40%', delay: '-2s' },
    { top: '70%', left: '70%', delay: '-5s' },
    { top: '80%', left: '30%', delay: '-8s' },
    { top: '90%', left: '50%', delay: '-11s' },
    { top: '85%', left: '10%', delay: '-14s' }
  ]
  
  const resultsParticles = [
    { top: '12%', left: '12%', delay: '0s' },
    { top: '22%', left: '82%', delay: '-3s' },
    { top: '32%', left: '62%', delay: '-6s' },
    { top: '42%', left: '22%', delay: '-9s' },
    { top: '52%', left: '88%', delay: '-12s' },
    { top: '62%', left: '42%', delay: '-2s' },
    { top: '72%', left: '72%', delay: '-5s' },
    { top: '82%', left: '32%', delay: '-8s' }
  ]
  
  const particles = props.variant === 'home' ? homeParticles : resultsParticles
  const particle = particles[index - 1] || particles[0]
  
  return {
    top: particle.top,
    left: particle.left,
    animationDelay: particle.delay
  }
}
</script>

<style lang="scss" scoped>
.dynamic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
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

// Results变体的形状稍微透明一些
.dynamic-background.results .shape {
  background: rgba(255, 255, 255, 0.08);
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

// Results变体的音符稍微小一些
.dynamic-background.results .note {
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.25);
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

// Results变体的音符透明度
.dynamic-background.results .note {
  @keyframes noteFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.25;
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
      opacity: 0.5;
    }
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

// Results变体的粒子稍微透明一些
.dynamic-background.results .particle {
  background: rgba(255, 255, 255, 0.4);
}

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

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .shape,
  .orb,
  .note,
  .particle {
    animation: none;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .shape {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .note {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .particle {
    background: rgba(255, 255, 255, 0.8);
  }
}
</style>
