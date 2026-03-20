<template>
  <DVSide :visible="dvSideStore.dvSideVisible">
    <div class="main">
      <!-- 左侧系统资源监控 -->
      <div class="left-panel">
        <SystemMonitor />
      </div>

      <!-- 中间数据摆渡按钮 -->
      <div class="center-panel">
        <div class="ferrying-btn">
          <div class="ferrying-btn-bg">
            <video src="./video/ferrying.mp4" autoplay loop muted style="width: 100%" />
          </div>

          <!-- 扫描波纹效果 -->
          <div v-if="isScanning" class="scan-waves">
            <div class="scan-wave" />
            <div class="scan-wave" />
            <div class="scan-wave" />
          </div>

          <div class="ferrying-btn-wrap" :class="{ scanning: isScanning }" @click="scanDevices">
            <!-- 扫描图标 -->
            <div v-show="false" v-if="isScanning" class="btn-icon">
              <svg
                width="60" height="60" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <!-- 连接图标 -->
            <div v-show="false" v-else class="btn-icon">
              <svg
                width=" 60" height="60" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H16M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <div class="btn-text-main">
              {{ buttonText.main }}
            </div>
            <div class="btn-text-sub">
              {{ buttonText.sub }}
            </div>
          </div>
        </div>

        <!-- 扫描结果提示 -->
        <div v-if="showResult" class="scan-result">
          <div class="result-content">
            <div class="result-icon">
              ⚠️
            </div>
            <div class="result-text">
              {{ scanResult }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧数据采集情况 -->
      <div class="right-panel">
        <DataCollection />
      </div>
    </div>
  </DVSide>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import DataCollection from '@/components/DataCollection/index.vue'
import SystemMonitor from '@/components/SystemMonitor/index.vue'
import DVSide from '@/layout/DVSide'
import dvSideStore from '@/layout/DVSide/store'

// 扫描状态管理
const isScanning = ref(false)
const scanResult = ref('')
const showResult = ref(false)

// 计算按钮文字
const buttonText = computed(() => {
  if (isScanning.value) {
    return {
      main: '正在扫描',
      sub: '搜索设备中...',
    }
  }
  return {
    main: '数据摆渡',
    sub: '连接设备',
  }
})

// 扫描设备功能
async function scanDevices() {
  if (isScanning.value)
    return

  isScanning.value = true
  showResult.value = false
  scanResult.value = ''

  // 模拟扫描过程
  try {
    await new Promise(resolve => setTimeout(resolve, 3000)) // 3秒扫描时间

    // 模拟未找到设备
    scanResult.value = '未找到附近数据摆渡设备'
    showResult.value = true

    // 3秒后隐藏结果
    setTimeout(() => {
      showResult.value = false
      scanResult.value = ''
    }, 3000)
  }
  catch (error) {
    console.error('扫描失败:', error)
    scanResult.value = '扫描失败，请重试'
    showResult.value = true
  }
  finally {
    isScanning.value = false
  }
}
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // width: 1860px;
  height: 880px;
  padding: 0 20px;
  gap: 20px;
}

.left-panel,
.right-panel {
  flex: 0 0 350px;
  height: 100%;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.ferrying-btn {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -50px;
  width: 1000px;
  height: 1000px;

  > video {
    // filter: sepia(1);
  }

  &-bg {
    position: absolute;
    mix-blend-mode: screen;
  }

  &-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 400px;
    font-size: 48px;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, #0b9e46 0%, #0d7a3a 50%, #0a5d2b 100%);
    border-radius: 50%;
    box-shadow:
      0 20px 40px rgba(11, 158, 70, 0.3),
      0 10px 20px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    border: 3px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    // 添加光泽效果
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
      transform: rotate(45deg);
      transition: all 0.6s ease;
      opacity: 0;
    }

    // 悬停效果
    &:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow:
        0 30px 60px rgba(11, 158, 70, 0.4),
        0 15px 30px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.3);
      background: linear-gradient(135deg, #0cb050 0%, #0e8540 50%, #0b6530 100%);

      &::before {
        opacity: 1;
        animation: shine 0.6s ease-in-out;
      }
    }

    // 点击效果
    &:active {
      transform: translateY(-2px) scale(0.98);
      box-shadow:
        0 15px 30px rgba(11, 158, 70, 0.3),
        0 8px 15px rgba(0, 0, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    // 图标样式
    .btn-icon {
      margin-bottom: 15px;
      opacity: 0.9;
      transition: all 0.3s ease;

      svg {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        transition: all 0.3s ease;
      }
    }

    // 文字样式优化
    .btn-text-main {
      font-size: 52px;
      font-weight: 700;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .btn-text-sub {
      font-size: 44px;
      font-weight: 500;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 2px;
      opacity: 0.95;
    }

    // 悬停时图标动画
    &:hover .btn-icon {
      opacity: 1;
      transform: scale(1.1) rotate(90deg);

      svg {
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
      }
    }

    // 扫描状态下的图标动画
    &.scanning .btn-icon {
      animation: scanRotate 2s linear infinite;

      svg {
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
      }
    }
  }

  // 扫描状态样式
  &-wrap.scanning {
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 50%, #0d47a1 100%);
    animation: scanPulse 2s ease-in-out infinite;

    &:hover {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #1565c0 100%);
    }
  }

  // 扫描波纹效果
  .scan-waves {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;

    .scan-wave {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      border: 2px solid rgba(33, 150, 243, 0.6);
      border-radius: 50%;
      animation: scanWave 2s ease-out infinite;

      &:nth-child(2) {
        animation-delay: 0.7s;
      }

      &:nth-child(3) {
        animation-delay: 1.4s;
      }
    }
  }

  // 光泽动画
  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }

    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  // 扫描脉冲动画
  @keyframes scanPulse {
    0%,
    100% {
      box-shadow:
        0 20px 40px rgba(33, 150, 243, 0.3),
        0 10px 20px rgba(0, 0, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    50% {
      box-shadow:
        0 30px 60px rgba(33, 150, 243, 0.5),
        0 15px 30px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.3);
    }
  }

  // 扫描波纹动画
  @keyframes scanWave {
    0% {
      width: 400px;
      height: 400px;
      opacity: 1;
    }

    100% {
      width: 800px;
      height: 800px;
      opacity: 0;
    }
  }

  // 扫描图标旋转动画
  @keyframes scanRotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

// 扫描结果提示
.scan-result {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 300px));
  z-index: 1000;
  animation: resultFadeIn 0.5s ease-out;

  .result-content {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px 30px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 25px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

    .result-icon {
      font-size: 24px;
    }

    .result-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: 500;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
  }
}

// 结果提示动画
@keyframes resultFadeIn {
  0% {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 320px));
  }

  100% {
    opacity: 1;
    transform: translate(-50%, calc(-50% + 300px));
  }
}
</style>
