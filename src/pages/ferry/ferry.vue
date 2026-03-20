<script lang="ts" setup>
definePage({
  style: {
    navigationBarTitleText: '数据传输',
    navigationStyle: 'custom',
  },
})

// 扫描状态管理
const isScanning = ref(false)
const connectedDevice = ref('')
const isConnecting = ref(false) // 连接中状态
const connectingDeviceId = ref('') // 正在连接的设备ID
const scanTimer = ref<ReturnType<typeof setInterval> | null>(null) // 扫描定时器
const scanTimeout = ref<ReturnType<typeof setTimeout> | null>(null) // 扫描超时定时器

// 发现的设备列表
interface Device {
  id: string
  name: string
  type: 'phone' | 'tablet' | 'pc'
}
const discoveredDevices = ref<Device[]>([])

// 模拟设备池（实际场景中这些会被真实的扫描结果替换）
const mockDevicePool: Device[] = [
  { id: '1', name: 'iPhone 15 Pro', type: 'phone' },
  { id: '2', name: 'MacBook Pro', type: 'pc' },
  { id: '3', name: 'iPad Air', type: 'tablet' },
  { id: '4', name: 'Galaxy S24', type: 'phone' },
  { id: '5', name: 'ThinkPad X1', type: 'pc' },
  { id: '6', name: 'Surface Pro', type: 'tablet' },
]

// 计算按钮文字
const buttonText = computed(() => {
  if (isScanning.value) {
    return {
      main: '正在扫描',
      sub: '点击停止扫描',
    }
  }
  if (connectedDevice.value) {
    return {
      main: '已连接',
      sub: connectedDevice.value,
    }
  }
  return {
    main: '数据摆渡',
    sub: '点击扫描设备',
  }
})

// 停止扫描
function stopScanDevices() {
  if (scanTimer.value) {
    clearInterval(scanTimer.value)
    scanTimer.value = null
  }
  if (scanTimeout.value) {
    clearTimeout(scanTimeout.value)
    scanTimeout.value = null
  }
  isScanning.value = false
}

// 开始扫描设备（持续扫描，直到手动停止或连接设备）
function startScanDevices() {
  if (isScanning.value || isConnecting.value)
    return

  isScanning.value = true
  connectedDevice.value = ''
  discoveredDevices.value = []

  // 模拟发现的设备索引
  let deviceIndex = 0

  // 定时逐个发现设备
  scanTimer.value = setInterval(() => {
    if (deviceIndex < mockDevicePool.length) {
      // 检查设备是否已存在（避免重复添加）
      const device = mockDevicePool[deviceIndex]
      if (!discoveredDevices.value.find(d => d.id === device.id)) {
        discoveredDevices.value.push(device)
      }
      deviceIndex++
    }
    else {
      // 所有模拟设备都已发现，继续循环（模拟持续扫描）
      // 实际场景中，这里会持续监听真实的设备发现事件
      deviceIndex = 0
    }
  }, 1500)

  // 设置30秒自动停止扫描（可选的安全超时）
  scanTimeout.value = setTimeout(() => {
    stopScanDevices()
  }, 30000)
}

// 切换扫描状态
function toggleScan() {
  if (isConnecting.value)
    return

  if (isScanning.value) {
    stopScanDevices()
  }
  else if (connectedDevice.value) {
    // 已连接状态，断开连接
    connectedDevice.value = ''
    discoveredDevices.value = []
  }
  else {
    startScanDevices()
  }
}

// 选择设备并连接
async function selectDevice(device: Device) {
  if (isConnecting.value || connectedDevice.value === device.name)
    return

  // 选择设备时停止扫描
  stopScanDevices()

  isConnecting.value = true
  connectingDeviceId.value = device.id

  try {
    // 显示连接中提示
    uni.showLoading({
      title: '正在连接...',
      mask: true,
    })

    // 模拟异步连接操作
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 连接成功
    connectedDevice.value = device.name
    uni.hideLoading()
    uni.showToast({
      title: '连接成功',
      icon: 'success',
      duration: 1500,
    })

    // 连接成功后跳转到数据导入导出页面
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/data-transfer/data-transfer' })
    }, 1500)
  }
  catch (error) {
    console.error('连接失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: '连接失败',
      icon: 'error',
    })
  }
  finally {
    isConnecting.value = false
    connectingDeviceId.value = ''
  }
}

// 获取设备图标
function getDeviceIcon(type: string): string {
  switch (type) {
    case 'phone':
      return '📱'
    case 'tablet':
      return '📲'
    case 'pc':
      return '💻'
    default:
      return '📱'
  }
}

// 固定的设备槽位角度（按多卡片逻辑预设）
// 预设6个槽位，从上到下排列，每个槽位间隔30度
const DEVICE_SLOT_ANGLES = [-75, -45, -15, 15, 45, 75]

// 计算设备卡片的位置（固定槽位，使用px单位 + translate居中）
function getDeviceStyle(index: number) {
  // 主按钮直径 400rpx ≈ 200px，半径约 100px
  const centerBallRadius = 100

  // 卡片宽度约 280rpx ≈ 140px，需要确保卡片不与中心球重叠
  // x 方向半径：球半径(100) + 卡片一半宽度(70) + 间距(50) = 220px
  const xRadius = centerBallRadius + 170 // 220px
  // y 方向半径：保持足够的弧形效果，可以稍大一些
  const yRadius = 280

  // 使用固定槽位角度，设备按顺序分配到预设槽位
  const angle = DEVICE_SLOT_ANGLES[index] ?? 0

  // 计算笛卡尔坐标（注意：屏幕坐标系 Y 轴向下）
  const radian = (angle * Math.PI) / 180
  const x = Math.cos(radian) * xRadius
  const y = Math.sin(radian) * yRadius

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: 'translate(-50%, -50%)',
    animationDelay: `${index * 0.15}s`,
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopScanDevices()
})
</script>

<template>
  <view class="ferry-page">
    <!-- 顶部状态栏 -->
    <view class="status-bar">
      <view class="status-bar-content">
        <text class="title">数据摆渡</text>
        <text class="subtitle">安全传输 · 快速同步</text>
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="main-container">
      <!-- 中间数据摆渡按钮 -->
      <view class="center-panel">
        <view class="ferrying-btn" :class="{ scanning: isScanning, connecting: isConnecting }">
          <!-- 扫描波纹效果 - 一直显示 -->
          <view class="scan-waves">
            <div class="scan-wave" />
            <div class="scan-wave" />
            <div class="scan-wave" />
          </view>

          <!-- 发现的设备卡片 - 围绕圆球显示 -->
          <view
            v-for="(device, index) in discoveredDevices"
            :key="device.id"
            class="device-card"
            :class="{
              selected: connectedDevice === device.name,
              connecting: connectingDeviceId === device.id,
            }"
            :style="getDeviceStyle(index)"
            @click="selectDevice(device)"
          >
            <view class="device-icon">
              <text>{{ getDeviceIcon(device.type) }}</text>
            </view>
            <view class="device-info">
              <text class="device-name">{{ device.name }}</text>
              <text class="device-status">{{ connectingDeviceId === device.id ? '连接中...' : '点击连接' }}</text>
            </view>
            <!-- 选中状态勾选图标 -->
            <view v-if="connectedDevice === device.name" class="check-icon">
              <text>✓</text>
            </view>
          </view>

          <!-- 主按钮 -->
          <view
            class="ferrying-btn-wrap"
            :class="{
              scanning: isScanning,
              connecting: isConnecting,
              connected: connectedDevice && !isConnecting,
            }"
            @click="toggleScan"
          >
            <!-- 按钮图标 -->
            <view class="btn-icon">
              <text v-if="isConnecting" class="icon-text spinning">⏳</text>
              <text v-else-if="isScanning" class="icon-text spinning">🔍</text>
              <text v-else-if="connectedDevice" class="icon-text">✓</text>
              <text v-else class="icon-text">📡</text>
            </view>

            <!-- 按钮文字 -->
            <text class="btn-text-main">{{ buttonText.main }}</text>
            <text class="btn-text-sub">{{ buttonText.sub }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ferry-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

/* 状态栏 */
.status-bar {
  flex-shrink: 0;
  padding: 40rpx 60rpx;
  padding-top: calc(40rpx + env(safe-area-inset-top));

  .status-bar-content {
    .title {
      display: block;
      font-size: 48rpx;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 4rpx;
    }

    .subtitle {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 8rpx;
      letter-spacing: 2rpx;
    }
  }
}

/* 主内容区域 */
.main-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 中间面板 */
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: visible;
}

/* 摆渡按钮容器 */
.ferrying-btn {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1000rpx;
  height: 1000rpx;
  overflow: visible;
}

/* 扫描波纹效果 - 一直显示，淡入淡出 */
.scan-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0.6;
  transition: opacity 0.5s ease;

  .scan-wave {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400rpx;
    height: 400rpx;
    border: 3rpx solid rgba(11, 158, 70, 0.6);
    border-radius: 50%;
    animation: scanWave 3s ease-out infinite;
    transition: border-color 0.3s ease;

    &:nth-child(2) {
      animation-delay: 1s;
    }

    &:nth-child(3) {
      animation-delay: 2s;
    }
  }
}

// 扫描状态时波纹变蓝色
.ferrying-btn.scanning .scan-waves {
  opacity: 1;

  .scan-wave {
    border-color: rgba(33, 150, 243, 0.7);
  }
}

// 连接状态时波纹变紫色
.ferrying-btn.connecting .scan-waves {
  opacity: 1;

  .scan-wave {
    border-color: rgba(156, 39, 176, 0.7);
  }
}

@keyframes scanWave {
  0% {
    width: 400rpx;
    height: 400rpx;
    opacity: 0.8;
  }

  100% {
    width: 800rpx;
    height: 800rpx;
    opacity: 0;
  }
}

/* 发现的设备卡片 */
.device-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  padding-right: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28rpx;
  border: 4rpx solid transparent;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  z-index: 10;
  cursor: pointer;
  animation: deviceAppear 0.5s ease-out forwards;
  opacity: 0;

  &:active {
    filter: brightness(0.95);
  }

  &.selected {
    background: #ffffff;
    border-color: #4caf50;
    box-shadow: 0 8rpx 40rpx rgba(76, 175, 80, 0.4);

    .device-icon {
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
    }

    .device-name {
      color: #2e7d32;
    }
  }

  &.connecting {
    background: #ffffff;
    border-color: #9c27b0;
    box-shadow: 0 8rpx 40rpx rgba(156, 39, 176, 0.4);

    .device-icon {
      animation: pulse 1s ease-in-out infinite;
    }
  }

  .device-icon {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    border-radius: 20rpx;

    text {
      font-size: 44rpx;
    }
  }

  .device-info {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 200rpx;

    .device-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
    }

    .device-status {
      font-size: 22rpx;
      color: #888;
      white-space: nowrap;
    }
  }

  .check-icon {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4caf50, #388e3c);
    border-radius: 50%;

    text {
      font-size: 28rpx;
      color: #fff;
      font-weight: bold;
    }
  }
}

@keyframes deviceAppear {
  0% {
    opacity: 0;
    filter: blur(10px);
  }

  100% {
    opacity: 1;
    filter: blur(0);
  }
}

/* 主按钮 */
.ferrying-btn-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 400rpx;
  height: 400rpx;
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #0b9e46 0%, #0d7a3a 50%, #0a5d2b 100%);
  border-radius: 50%;
  box-shadow:
    0 20rpx 40rpx rgba(11, 158, 70, 0.3),
    0 10rpx 20rpx rgba(0, 0, 0, 0.2),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.2);
  border: 3rpx solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  z-index: 3;

  // 光泽效果
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

  &:active {
    transform: scale(0.98);
  }

  // 悬停效果
  &:hover {
    transform: translateY(-5rpx) scale(1.02);
    box-shadow:
      0 30rpx 60rpx rgba(11, 158, 70, 0.4),
      0 15rpx 30rpx rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #0cb050 0%, #0e8540 50%, #0b6530 100%);

    &::before {
      opacity: 1;
      animation: shine 0.6s ease-in-out;
    }
  }

  // 扫描状态
  &.scanning {
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 50%, #0d47a1 100%);
    animation: scanPulse 2s ease-in-out infinite;

    &:hover {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 50%, #1565c0 100%);
    }
  }

  // 连接状态
  &.connecting {
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 50%, #6a1b9a 100%);
    animation: connectPulse 1.5s ease-in-out infinite;
  }

  // 已连接状态
  &.connected {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 50%, #2e7d32 100%);
  }

  .btn-icon {
    margin-bottom: 16rpx;

    .icon-text {
      font-size: 64rpx;
      filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.3));

      &.spinning {
        animation: spin 2s linear infinite;
      }
    }
  }

  .btn-text-main {
    font-size: 44rpx;
    font-weight: 700;
    line-height: 1.1;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    letter-spacing: 2rpx;
    margin-bottom: 8rpx;
  }

  .btn-text-sub {
    font-size: 36rpx;
    font-weight: 500;
    line-height: 1.1;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    letter-spacing: 2rpx;
    opacity: 0.95;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

@keyframes scanPulse {
  0%,
  100% {
    box-shadow:
      0 20rpx 40rpx rgba(33, 150, 243, 0.3),
      0 10rpx 20rpx rgba(0, 0, 0, 0.2),
      inset 0 2rpx 4rpx rgba(255, 255, 255, 0.2);
  }

  50% {
    box-shadow:
      0 30rpx 60rpx rgba(33, 150, 243, 0.5),
      0 15rpx 30rpx rgba(0, 0, 0, 0.3),
      inset 0 2rpx 4rpx rgba(255, 255, 255, 0.3);
  }
}

@keyframes connectPulse {
  0%,
  100% {
    box-shadow:
      0 20rpx 40rpx rgba(156, 39, 176, 0.3),
      0 10rpx 20rpx rgba(0, 0, 0, 0.2),
      inset 0 2rpx 4rpx rgba(255, 255, 255, 0.2);
  }

  50% {
    box-shadow:
      0 30rpx 60rpx rgba(156, 39, 176, 0.5),
      0 15rpx 30rpx rgba(0, 0, 0, 0.3),
      inset 0 2rpx 4rpx rgba(255, 255, 255, 0.3);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Pad 端大屏适配 */
@media screen and (min-width: 768px) {
  .status-bar {
    padding: 60rpx 80rpx;
    padding-top: calc(60rpx + env(safe-area-inset-top));

    .status-bar-content {
      .title {
        font-size: 56rpx;
      }

      .subtitle {
        font-size: 28rpx;
      }
    }
  }

  .ferrying-btn {
    width: 1200rpx;
    height: 1200rpx;
  }

  .ferrying-btn-wrap {
    width: 480rpx;
    height: 480rpx;

    .btn-icon .icon-text {
      font-size: 80rpx;
    }

    .btn-text-main {
      font-size: 52rpx;
    }

    .btn-text-sub {
      font-size: 42rpx;
    }
  }

  .scan-waves .scan-wave {
    width: 480rpx;
    height: 480rpx;
  }

  @keyframes scanWave {
    0% {
      width: 480rpx;
      height: 480rpx;
      opacity: 0.8;
    }

    100% {
      width: 960rpx;
      height: 960rpx;
      opacity: 0;
    }
  }

  .device-card {
    padding: 32rpx 40rpx;

    .device-icon {
      width: 96rpx;
      height: 96rpx;

      text {
        font-size: 52rpx;
      }
    }

    .device-info {
      .device-name {
        font-size: 34rpx;
      }

      .device-status {
        font-size: 26rpx;
      }
    }

    .check-icon {
      width: 56rpx;
      height: 56rpx;

      text {
        font-size: 32rpx;
      }
    }
  }
}

/* 超大屏幕适配 (平板横屏) */
@media screen and (min-width: 1024px) {
  .main-container {
    max-width: 1600rpx;
    margin: 0 auto;
  }
}
</style>
