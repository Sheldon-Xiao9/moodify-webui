<template>
  <div class="static-emoji" :class="[`mood-${mood}`, size]">
    <svg
      :width="svgSize"
      :height="svgSize"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 脸部 -->
      <circle
        cx="80"
        cy="80"
        r="80"
        :fill="moodColors[mood]"
        :stroke="moodColors[mood]"
        stroke-width="3"
      />
      
      <!-- 眼睛 -->
      <g v-if="eyeType === 'circle'">
        <!-- 左眼 -->
        <circle
          cx="55"
          cy="60"
          :r="8 * eyeScale"
          fill="#333"
        />
        <!-- 右眼 -->
        <circle
          cx="105"
          cy="60"
          :r="8 * eyeScale"
          fill="#333"
        />
      </g>
      
      <g v-else-if="eyeType === 'arcUp'">
        <!-- 左眼 - excited表情：下半圆弧，开口朝上 -->
        <path
          :d="`M ${55 - 8 * eyeScale} 60 A ${8 * eyeScale} ${8 * eyeScale} 0 0 1 ${55 + 8 * eyeScale} 60`"
          stroke="#333"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <!-- 右眼 - excited表情：下半圆弧，开口朝上 -->
        <path
          :d="`M ${105 - 8 * eyeScale} 60 A ${8 * eyeScale} ${8 * eyeScale} 0 0 1 ${105 + 8 * eyeScale} 60`"
          stroke="#333"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
      </g>
      
      <!-- 眉毛 -->
      <g v-if="showEyebrows">
        <!-- 左眉毛 - 右端向下倾斜 -->
        <line
          x1="45"
          y1="47"
          x2="65"
          :y2="47 + (eyebrowAngle || 0) * 0.5"
          stroke="#333"
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- 右眉毛 - 左端向下倾斜 -->
        <line
          x1="95"
          :y1="47 + (eyebrowAngle || 0) * 0.5"
          x2="115"
          y2="47"
          stroke="#333"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
      
      <!-- 嘴巴 -->
      <g>
        <!-- Happy: 开心微笑，弧形向上 -->
        <path
          v-if="mouthType === 'smile'"
          d="M 60 95 A 20 20 0 0 0 100 95"
          stroke="#333"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        
        <!-- Sad/Angry: 悲伤皱眉，弧形向下 -->
        <path
          v-else-if="mouthType === 'frown'"
          d="M 60 115 A 20 20 0 0 1 100 115"
          stroke="#333"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        
        <!-- Annoyed: 烦躁直线嘴 -->
        <line
          v-else-if="mouthType === 'line'"
          x1="65"
          y1="105"
          x2="95"
          y2="105"
          stroke="#333"
          stroke-width="3"
          stroke-linecap="round"
        />
        
        <!-- Excited: 兴奋半圆笑带封口横线 -->
        <g v-else-if="mouthType === 'closedHalfCircle'">
          <!-- 半圆 -->
          <path
            d="M 55 90 A 25 25 0 0 0 105 90"
            stroke="#333"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
          />
          <!-- 封口横线 -->
          <line
            x1="55"
            y1="90"
            x2="105"
            y2="90"
            stroke="#333"
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>
      </g>
      
      <!-- 腮红 -->
      <circle
        cx="30"
        cy="85"
        r="12"
        fill="#EF476F"
        opacity="0.3"
      />
      <circle
        cx="130"
        cy="85"
        r="12"
        fill="#EF476F"
        opacity="0.3"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mood: {
    type: String,
    default: 'happy',
    validator: (value) => ['happy', 'sad', 'angry', 'excited', 'annoyed'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

// 颜色定义
const moodColors = {
  happy: '#FFD166',   // 黄色
  sad: '#6A7BDB',     // 蓝色
  angry: '#EF476F',   // 红色
  excited: '#8ad606', // 绿色
  annoyed: '#9B59B6'  // 紫色
}

// 尺寸映射
const svgSize = computed(() => {
  switch (props.size) {
    case 'small': return 60
    case 'medium': return 80
    case 'large': return 120
    default: return 80
  }
})

// 表情参数
const moodParams = computed(() => {
  switch (props.mood) {
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
        eyeType: 'arcUp',
        eyeScale: 1.2,
        mouthType: 'closedHalfCircle',
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
})

// 解构参数
const eyeType = computed(() => moodParams.value.eyeType)
const eyeScale = computed(() => moodParams.value.eyeScale)
const mouthType = computed(() => moodParams.value.mouthType)
const showEyebrows = computed(() => moodParams.value.showEyebrows)
const eyebrowAngle = computed(() => moodParams.value.eyebrowAngle)
</script>

<style lang="scss" scoped>
.static-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    overflow: visible;
  }
  
  &.small {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  }
  
  &.medium {
    filter: drop-shadow(0 3px 12px rgba(0, 0, 0, 0.15));
  }
  
  &.large {
    filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.2));
  }
}

// 表情特定的样式
.mood-happy {
  filter: drop-shadow(0 4px 16px rgba(255, 209, 102, 0.3));
}

.mood-sad {
  filter: drop-shadow(0 4px 16px rgba(106, 123, 219, 0.3));
}

.mood-angry {
  filter: drop-shadow(0 4px 16px rgba(239, 71, 111, 0.3));
}

.mood-excited {
  filter: drop-shadow(0 4px 16px rgba(138, 214, 6, 0.3));
}

.mood-annoyed {
  filter: drop-shadow(0 4px 16px rgba(155, 89, 182, 0.3));
}
</style>
