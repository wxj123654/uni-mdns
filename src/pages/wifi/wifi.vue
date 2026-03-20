<script lang="ts" setup>
import type { WifiInfo } from '@/hooks/useWifi'

import useWifi from '@/hooks/useWifi'

definePage({
  style: {
    navigationBarTitleText: 'Wi-Fi 管理',
  },
})

// 状态
const ssidInput = ref('')
const passwordInput = ref('')
const selectedWifi = ref<WifiInfo | null>(null)

// 使用 Wi-Fi Hook
const {
  initialized,
  wifiList,
  connectedWifi,
  logs,
  startWifi,
  stopWifi,
  getWifiList,
  connectWifi,
  getConnectedWifi,
  clearWifiList,
  clearLogs,
} = useWifi({
  onWifiConnected: (wifi) => {
    uni.showToast({ title: `已连接: ${wifi.SSID}`, icon: 'success' })
  },
  onWifiListReceived: (list) => {
    uni.showToast({ title: `扫描到 ${list.length} 个 Wi-Fi`, icon: 'success' })
  },
})

// 初始化 Wi-Fi 模块
async function handleStartWifi() {
  try {
    await startWifi()
    uni.showToast({ title: '初始化成功', icon: 'success' })
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 关闭 Wi-Fi 模块
async function handleStopWifi() {
  try {
    await stopWifi()
    uni.showToast({ title: '已关闭', icon: 'success' })
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 扫描 Wi-Fi 列表
async function handleGetWifiList() {
  try {
    await getWifiList()
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 连接 Wi-Fi
async function handleConnectWifi() {
  if (!ssidInput.value) {
    uni.showToast({ title: '请输入 SSID', icon: 'none' })
    return
  }

  try {
    await connectWifi(ssidInput.value, passwordInput.value)
    ssidInput.value = ''
    passwordInput.value = ''
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 获取当前连接的 Wi-Fi
async function handleGetConnectedWifi() {
  try {
    const wifi = await getConnectedWifi()
    if (wifi) {
      uni.showToast({ title: `当前: ${wifi.SSID}`, icon: 'success' })
    }
    else {
      uni.showToast({ title: '未连接 Wi-Fi', icon: 'none' })
    }
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 查看 Wi-Fi 详情
function viewWifiDetail(wifi: WifiInfo) {
  selectedWifi.value = wifi
}

// 关闭详情弹窗
function closeDetail() {
  selectedWifi.value = null
}

// 选择 Wi-Fi 进行连接
function selectWifi(wifi: WifiInfo) {
  ssidInput.value = wifi.SSID
}

// 获取信号强度描述
function getSignalStrength(strength?: number): string {
  if (strength === undefined)
    return '-'
  if (strength >= 80)
    return '极好'
  if (strength >= 60)
    return '良好'
  if (strength >= 40)
    return '一般'
  return '较弱'
}

// 获取信号强度图标
function getSignalIcon(strength?: number): string {
  if (strength === undefined)
    return '○'
  if (strength >= 80)
    return '▂▄▆█'
  if (strength >= 60)
    return '▂▄▆_'
  if (strength >= 40)
    return '▂▄__'
  return '▂___'
}
</script>

<template>
  <view class="wifi-container p-4">
    <!-- 状态信息 -->
    <view class="section mb-4">
      <view class="section-title mb-2 text-base font-bold">
        Wi-Fi 状态
      </view>
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view
            class="h-3 w-3 rounded-full"
            :class="initialized ? 'bg-green-500' : 'bg-gray-400'"
          />
          <text>{{ initialized ? '已初始化' : '未初始化' }}</text>
        </view>
        <view v-if="connectedWifi" class="text-sm text-green-600">
          已连接: {{ connectedWifi.SSID }}
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="section mb-4">
      <view class="section-title mb-2 text-base font-bold">
        模块控制
      </view>
      <view class="flex flex-wrap gap-2">
        <button
          type="primary"
          size="mini"
          :disabled="initialized"
          @click="handleStartWifi"
        >
          初始化
        </button>
        <button
          type="warn"
          size="mini"
          :disabled="!initialized"
          @click="handleStopWifi"
        >
          关闭
        </button>
        <button
          size="mini"
          :disabled="!initialized"
          @click="handleGetWifiList"
        >
          扫描
        </button>
        <button
          size="mini"
          :disabled="!initialized"
          @click="handleGetConnectedWifi"
        >
          获取当前
        </button>
      </view>
    </view>

    <!-- 连接 Wi-Fi -->
    <view class="section mb-4">
      <view class="section-title mb-2 text-base font-bold">
        连接 Wi-Fi
      </view>
      <view class="flex flex-col gap-2">
        <input
          v-model="ssidInput"
          type="text"
          placeholder="SSID"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
        <input
          v-model="passwordInput"
          type="password"
          placeholder="密码"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
        <button
          type="primary"
          size="mini"
          :disabled="!initialized || !ssidInput"
          @click="handleConnectWifi"
        >
          连接
        </button>
      </view>
    </view>

    <!-- Wi-Fi 列表 -->
    <view class="section mb-4">
      <view class="section-title mb-2 flex items-center justify-between">
        <text class="text-base font-bold">扫描结果</text>
        <view class="flex items-center gap-2">
          <text class="text-sm text-gray-500">共 {{ wifiList.length }} 个</text>
          <button size="mini" @click="clearWifiList">
            清空
          </button>
        </view>
      </view>
      <scroll-view scroll-y class="wifi-list max-h-60 border border-gray-200 rounded">
        <view v-if="wifiList.length === 0" class="p-4 text-center text-gray-400">
          暂无扫描结果，请点击"扫描"按钮
        </view>
        <view
          v-for="(wifi, index) in wifiList"
          :key="index"
          class="wifi-item border-b border-gray-100 p-3 last:border-0"
          @click="viewWifiDetail(wifi)"
        >
          <view class="flex items-center justify-between">
            <view class="flex-1">
              <view class="font-medium">
                {{ wifi.SSID }}
              </view>
              <view class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <text>{{ getSignalStrength(wifi.signalStrength) }}</text>
                <text v-if="wifi.secure" class="text-blue-500">🔒 加密</text>
                <text v-else class="text-gray-400">开放</text>
              </view>
            </view>
            <view class="flex items-center gap-2">
              <text class="text-xs text-gray-400 font-mono">{{ getSignalIcon(wifi.signalStrength) }}</text>
              <button
                size="mini"
                type="primary"
                plain
                @click.stop="selectWifi(wifi)"
              >
                连接
              </button>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 日志 -->
    <view class="section">
      <view class="section-title mb-2 flex items-center justify-between">
        <text class="text-base font-bold">日志</text>
        <button size="mini" @click="clearLogs">
          清空
        </button>
      </view>
      <scroll-view scroll-y class="log-list max-h-50 border border-gray-200 rounded bg-gray-50 p-2">
        <view v-if="logs.length === 0" class="p-2 text-center text-sm text-gray-400">
          暂无日志
        </view>
        <view
          v-for="(log, index) in logs"
          :key="index"
          class="log-item border-b border-gray-100 py-1 text-xs last:border-0"
          :class="{ 'text-green-600': log.type === 'success', 'text-red-500': log.type === 'error' }"
        >
          [{{ log.time }}] {{ log.message }}
        </view>
      </scroll-view>
    </view>

    <!-- Wi-Fi 详情弹窗 -->
    <view
      v-if="selectedWifi"
      class="detail-mask fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      @click="closeDetail"
    >
      <view class="detail-content mx-4 max-w-80 w-full rounded-lg bg-white p-4" @click.stop>
        <view class="mb-3 text-lg font-bold">
          Wi-Fi 详情
        </view>
        <view class="detail-info">
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">SSID:</text>
            <text class="flex-1">{{ selectedWifi.SSID }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">BSSID:</text>
            <text class="flex-1">{{ selectedWifi.BSSID || '-' }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">信号:</text>
            <text class="flex-1">{{ selectedWifi.signalStrength ?? '-' }} ({{ getSignalStrength(selectedWifi.signalStrength) }})</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">频率:</text>
            <text class="flex-1">{{ selectedWifi.frequency ? `${selectedWifi.frequency} MHz` : '-' }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">加密:</text>
            <text class="flex-1">{{ selectedWifi.secure ? '是' : '否' }}</text>
          </view>
        </view>
        <view class="mt-4 flex gap-2">
          <button
            type="primary"
            size="mini"
            @click="selectWifi(selectedWifi); closeDetail()"
          >
            连接此 Wi-Fi
          </button>
          <button size="mini" @click="closeDetail">
            关闭
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.wifi-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.section {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
}

.wifi-list {
  background-color: #fff;
}

.wifi-item:active {
  background-color: #f5f5f5;
}

.log-list {
  font-family: monospace;
}

.detail-mask {
  position: fixed;
}
</style>
