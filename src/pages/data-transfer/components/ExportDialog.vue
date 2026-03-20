<script lang="ts" setup>
/**
 * 导出弹窗组件
 * 提供数据导出配置功能
 */
import type { ExportOptions } from '../types/data-transfer'

const props = defineProps<{
  visible: boolean
  isExporting: boolean
  progress: number
}>()

const emit = defineEmits<{
  close: []
  export: [options: ExportOptions]
}>()

// 导出配置
const exportConfig = reactive({
  dateRange: ['', ''] as [string, string],
  dataType: 'all' as 'all' | 'specific',
  format: 'xlsx' as 'xlsx' | 'csv',
})

// 打开日期选择器
const showDatePicker = shallowRef(false)
const currentDateField = shallowRef<'start' | 'end'>('start')

function openDatePicker(field: 'start' | 'end') {
  currentDateField.value = field
  showDatePicker.value = true
}

function onDateConfirm(e: { detail: { value: string } }) {
  if (currentDateField.value === 'start') {
    exportConfig.dateRange[0] = e.detail.value
  }
  else {
    exportConfig.dateRange[1] = e.detail.value
  }
  showDatePicker.value = false
}

// 执行导出
function handleExport() {
  if (!exportConfig.dateRange[0] || !exportConfig.dateRange[1]) {
    uni.showToast({ title: '请选择时间范围', icon: 'none' })
    return
  }

  emit('export', {
    dateRange: exportConfig.dateRange,
    dataType: exportConfig.dataType,
    format: exportConfig.format,
  })
}

// 关闭弹窗
function handleClose() {
  if (props.isExporting)
    return
  emit('close')
}

// 重置配置
function resetConfig() {
  exportConfig.dateRange = ['', '']
  exportConfig.dataType = 'all'
  exportConfig.format = 'xlsx'
}

// 监听弹窗打开重置
watch(() => props.visible, (val) => {
  if (val) {
    resetConfig()
  }
})
</script>

<template>
  <wd-popup
    :model-value="visible"
    position="center"
    :close-on-click-modal="!isExporting"
    custom-style="border-radius: 24rpx; width: 90%; max-width: 640rpx;"
    @update:model-value="(val: boolean) => { if (!val) handleClose() }"
  >
    <view class="export-dialog">
      <!-- 标题 -->
      <view class="dialog-header">
        <text class="dialog-title">
          {{ isExporting ? '正在导出' : '导出数据' }}
        </text>
        <view v-if="!isExporting" class="close-btn" @click="handleClose">
          ✕
        </view>
      </view>

      <!-- 导出进度 -->
      <view v-if="isExporting" class="export-progress">
        <view class="progress-text">
          正在生成文件...
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: `${progress}%` }" />
        </view>
        <view class="progress-percent">
          {{ progress }}%
        </view>
      </view>

      <!-- 导出表单 -->
      <view v-else class="export-form">
        <!-- 时间范围 -->
        <view class="form-item">
          <text class="form-label">时间范围：</text>
          <view class="date-range">
            <view
              class="date-picker"
              :class="{ 'has-value': exportConfig.dateRange[0] }"
              @click="openDatePicker('start')"
            >
              {{ exportConfig.dateRange[0] || '开始日期' }}
            </view>
            <text class="date-separator">-</text>
            <view
              class="date-picker"
              :class="{ 'has-value': exportConfig.dateRange[1] }"
              @click="openDatePicker('end')"
            >
              {{ exportConfig.dateRange[1] || '结束日期' }}
            </view>
          </view>
        </view>

        <!-- 数据类型 -->
        <view class="form-item">
          <text class="form-label">数据类型：</text>
          <view class="radio-group">
            <view
              class="radio-item"
              :class="{ active: exportConfig.dataType === 'all' }"
              @click="exportConfig.dataType = 'all'"
            >
              <view class="radio-icon">
                {{ exportConfig.dataType === 'all' ? '☑' : '☐' }}
              </view>
              <text class="radio-text">全部数据</text>
            </view>
            <view
              class="radio-item"
              :class="{ active: exportConfig.dataType === 'specific' }"
              @click="exportConfig.dataType = 'specific'"
            >
              <view class="radio-icon">
                {{ exportConfig.dataType === 'specific' ? '☑' : '☐' }}
              </view>
              <text class="radio-text">指定分类</text>
            </view>
          </view>
        </view>

        <!-- 导出格式 -->
        <view class="form-item">
          <text class="form-label">导出格式：</text>
          <view class="radio-group">
            <view
              class="radio-item"
              :class="{ active: exportConfig.format === 'xlsx' }"
              @click="exportConfig.format = 'xlsx'"
            >
              <view class="radio-icon">
                {{ exportConfig.format === 'xlsx' ? '◉' : '○' }}
              </view>
              <text class="radio-text">Excel (.xlsx)</text>
            </view>
            <view
              class="radio-item"
              :class="{ active: exportConfig.format === 'csv' }"
              @click="exportConfig.format = 'csv'"
            >
              <view class="radio-icon">
                {{ exportConfig.format === 'csv' ? '◉' : '○' }}
              </view>
              <text class="radio-text">CSV (.csv)</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view v-if="!isExporting" class="dialog-footer">
        <view class="btn btn-cancel" @click="handleClose">
          取消
        </view>
        <view class="btn btn-confirm" @click="handleExport">
          导出
        </view>
      </view>
    </view>

    <!-- 日期选择器 -->
    <wd-datetime-picker
      :model-value="showDatePicker as any"
      type="date"
      :max-date="new Date().getTime()"
      @confirm="onDateConfirm"
      @update:model-value="(val: boolean) => { showDatePicker = val }"
    />
  </wd-popup>
</template>

<style lang="scss" scoped>
.export-dialog {
  padding: 40rpx;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #999;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;

  &:active {
    background: #eee;
  }
}

.export-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.progress-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 32rpx;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: 32rpx;
  font-weight: 600;
  color: #667eea;
  margin-top: 24rpx;
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.date-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  font-size: 28rpx;
  color: #999;
  background: #f5f7fa;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &.has-value {
    color: #333;
    background: #fff;
    border: 2rpx solid #667eea;
  }

  &:active {
    background: #eef0f5;
  }
}

.date-separator {
  font-size: 28rpx;
  color: #999;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    background: rgba(102, 126, 234, 0.1);
    border: 2rpx solid #667eea;
  }

  &:active {
    background: #eef0f5;
  }
}

.radio-icon {
  font-size: 32rpx;
  color: #667eea;
}

.radio-text {
  font-size: 28rpx;
  color: #333;
}

.dialog-footer {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.btn-cancel {
  color: #666;
  background: #f5f5f5;
}

.btn-confirm {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
