<script lang="ts" setup>
// @ts-expect-error uts编译
import type { DiscoveredService } from '@/uni_modules/wxj-mdns'

import useMDns from '@/hooks/useMDns'

definePage({
  style: {
    navigationBarTitleText: 'mDNS 服务发现',
  },
})

// 服务类型列表
const serviceTypes = [
  { label: 'HTTP 服务', value: '_http._tcp.' },
  { label: 'HTTPS 服务', value: '_https._tcp.' },
  { label: '打印机服务', value: '_printer._tcp.' },
  { label: 'AirPlay', value: '_airplay._tcp.' },
  { label: 'Google Cast', value: '_googlecast._tcp.' },
  { label: '自定义', value: '' },
]

// 状态
const selectedTypeIndex = ref(0)
const customServiceType = ref('')
const selectedService = ref<DiscoveredService | null>(null)

// 使用 mDNS Hook
const {
  scanning,
  services,
  logs,
  startDiscovery,
  stopDiscovery,
  resolveService,
  clearServices,
  clearLogs,
} = useMDns()

// 获取当前服务类型
function getCurrentServiceType(): string {
  if (serviceTypes[selectedTypeIndex.value].value === '') {
    return customServiceType.value || '_http._tcp.'
  }
  return serviceTypes[selectedTypeIndex.value].value
}

// 开始扫描
async function handleStartDiscovery() {
  const serviceType = getCurrentServiceType()

  if (!serviceType) {
    uni.showToast({ title: '请输入服务类型', icon: 'none' })
    return
  }

  try {
    await startDiscovery(serviceType)
    uni.showToast({ title: '开始扫描', icon: 'success' })
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 停止扫描
async function handleStopDiscovery() {
  try {
    await stopDiscovery()
    uni.showToast({ title: '扫描已停止', icon: 'success' })
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 解析服务
async function handleResolveService(service: DiscoveredService) {
  try {
    const resolved = await resolveService(service)
    selectedService.value = resolved
    uni.showToast({ title: '解析成功', icon: 'success' })
  }
  catch (error) {
    uni.showToast({ title: (error as Error).message, icon: 'none' })
  }
}

// 服务类型选择变化
function onTypeChange(e: any) {
  selectedTypeIndex.value = e.detail.value
}

// 查看服务详情
function viewServiceDetail(service: DiscoveredService) {
  selectedService.value = service
}

// 关闭详情弹窗
function closeDetail() {
  selectedService.value = null
}
</script>

<template>
  <view class="mdns-container p-4">
    <!-- 服务类型选择 -->
    <view class="section mb-4">
      <view class="section-title mb-2 text-base font-bold">
        服务类型
      </view>
      <view class="flex items-center gap-2">
        <picker
          mode="selector"
          :range="serviceTypes"
          range-key="label"
          :value="selectedTypeIndex"
          @change="onTypeChange"
        >
          <view class="picker-btn flex items-center justify-between border border-gray-300 rounded px-3 py-2">
            <text>{{ serviceTypes[selectedTypeIndex].label }}</text>
            <text class="text-gray-400">
              ▼
            </text>
          </view>
        </picker>
      </view>
      <!-- 自定义服务类型输入 -->
      <view v-if="serviceTypes[selectedTypeIndex].value === ''" class="mt-2">
        <input
          v-model="customServiceType"
          type="text"
          placeholder="输入服务类型，如 _http._tcp."
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="section mb-4">
      <view class="flex gap-2">
        <button
          type="primary"
          size="mini"
          :disabled="scanning"
          @click="handleStartDiscovery"
        >
          开始扫描
        </button>
        <button
          type="warn"
          size="mini"
          :disabled="!scanning"
          @click="handleStopDiscovery"
        >
          停止扫描
        </button>
        <button
          size="mini"
          @click="clearServices"
        >
          清空列表
        </button>
      </view>
      <view class="mt-2 text-sm text-gray-500">
        状态: {{ scanning ? '扫描中...' : '已停止' }}
      </view>
    </view>

    <!-- 发现的服务列表 -->
    <view class="section mb-4">
      <view class="section-title mb-2 flex items-center justify-between">
        <text class="text-base font-bold">发现的服务</text>
        <text class="text-sm text-gray-500">共 {{ services.length }} 个</text>
      </view>
      <scroll-view scroll-y class="service-list max-h-60 border border-gray-200 rounded">
        <view v-if="services.length === 0" class="p-4 text-center text-gray-400">
          暂无发现的服务
        </view>
        <view
          v-for="(service, index) in services"
          :key="index"
          class="service-item border-b border-gray-100 p-3 last:border-0"
          @click="viewServiceDetail(service)"
        >
          <view class="font-medium">
            {{ service.name }}
          </view>
          <view class="mt-1 text-sm text-gray-500">
            {{ service.type }}
          </view>
          <view v-if="service.hostAddress" class="mt-1 text-sm text-green-600">
            {{ service.hostAddress }}:{{ service.port }}
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

    <!-- 服务详情弹窗 -->
    <view
      v-if="selectedService"
      class="detail-mask fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      @click="closeDetail"
    >
      <view class="detail-content mx-4 max-w-80 w-full rounded-lg bg-white p-4" @click.stop>
        <view class="mb-3 text-lg font-bold">
          服务详情
        </view>
        <view class="detail-info">
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">名称:</text>
            <text class="flex-1">{{ selectedService.name }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">类型:</text>
            <text class="flex-1">{{ selectedService.type }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">主机:</text>
            <text class="flex-1">{{ selectedService.hostName || '-' }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">IP:</text>
            <text class="flex-1">{{ selectedService.hostAddress || '-' }}</text>
          </view>
          <view class="mb-2 flex">
            <text class="w-20 text-gray-500">端口:</text>
            <text class="flex-1">{{ selectedService.port || '-' }}</text>
          </view>
          <view v-if="selectedService.txtRecords" class="mb-2">
            <text class="text-gray-500">TXT 记录:</text>
            <view class="mt-1 rounded bg-gray-100 p-2 text-sm">
              <view v-for="[key, value] in selectedService.txtRecords" :key="key" class="mb-1">
                {{ key }}: {{ value }}
              </view>
            </view>
          </view>
        </view>
        <view class="mt-4 flex gap-2">
          <button
            v-if="!selectedService.hostAddress"
            type="primary"
            size="mini"
            @click="handleResolveService(selectedService)"
          >
            解析服务
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
.mdns-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.section {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
}

.picker-btn {
  min-width: 200px;
  background-color: #fff;
}

.service-list {
  background-color: #fff;
}

.service-item:active {
  background-color: #f5f5f5;
}

.log-list {
  font-family: monospace;
}

.detail-mask {
  position: fixed;
}
</style>
