<script lang="ts" setup>
/**
 * 导入弹窗组件
 * 提供文件选择和导入功能
 */
import type { ImportOptions } from '../types/data-transfer'

const props = defineProps<{
  visible: boolean
  isImporting: boolean
  progress: number
  status: string
}>()

const emit = defineEmits<{
  close: []
  import: [options: ImportOptions]
}>()

// 选中的文件信息
const selectedFile = shallowRef<{ name: string, size: number } | null>(null)

// 文件选择处理
function handleChooseFile() {
  // #ifdef H5
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.csv'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      selectedFile.value = {
        name: file.name,
        size: file.size,
      }
    }
  }
  input.click()
  // #endif

  // #ifdef APP-PLUS
  // APP 端使用系统文件选择器
  // @ts-expect-error - plus.io 是 uni-app 提供的 API
  plus.io.chooseFile?.({
    accept: '.xlsx,.csv',
    multiple: false,
  }, (files) => {
    if (files.length > 0) {
      const file = files[0]
      selectedFile.value = {
        name: file.name,
        size: file.size || 0,
      }
    }
  })
  // #endif
}

// 清除已选文件
function clearFile() {
  selectedFile.value = null
}

// 执行导入
function handleImport() {
  if (!selectedFile.value) {
    uni.showToast({ title: '请选择文件', icon: 'none' })
    return
  }

  emit('import', {
    fileName: selectedFile.value.name,
    fileSize: selectedFile.value.size,
  })
}

// 关闭弹窗
function handleClose() {
  if (props.isImporting)
    return
  selectedFile.value = null
  emit('close')
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes}B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
</script>

<template>
  <wd-popup
    :model-value="visible"
    position="center"
    :close-on-click-modal="!isImporting"
    custom-style="border-radius: 24rpx; width: 90%; max-width: 640rpx;"
    @update:model-value="(val: boolean) => { if (!val) handleClose() }"
  >
    <view class="import-dialog">
      <!-- 标题 -->
      <view class="dialog-header">
        <text class="dialog-title">
          {{ isImporting ? '正在导入' : '导入数据' }}
        </text>
        <view v-if="!isImporting" class="close-btn" @click="handleClose">
          ✕
        </view>
      </view>

      <!-- 导入进度 -->
      <view v-if="isImporting" class="import-progress">
        <view class="progress-text">
          正在解析文件...
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: `${progress}%` }" />
        </view>
        <view class="progress-percent">
          {{ progress }}%
        </view>
      </view>

      <!-- 导入表单 -->
      <view v-else class="import-form">
        <!-- 文件选择 -->
        <view class="form-item">
          <text class="form-label">选择文件：</text>
          <view
            v-if="!selectedFile"
            class="file-picker"
            @click="handleChooseFile"
          >
            <text class="picker-icon">📁</text>
            <text class="picker-text">点击选择文件</text>
          </view>
          <view v-else class="file-selected">
            <view class="file-info">
              <text class="file-icon">📄</text>
              <view class="file-details">
                <text class="file-name">{{ selectedFile.name }}</text>
                <text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
              </view>
            </view>
            <view class="file-remove" @click="clearFile">
              ✕
            </view>
          </view>
        </view>

        <!-- 支持格式 -->
        <view class="form-tips">
          <text class="tips-label">支持格式：</text>
          <text class="tips-value">xlsx / csv</text>
        </view>

        <!-- 导入说明 -->
        <view class="form-tips">
          <text class="tips-label">导入说明：</text>
          <view class="tips-list">
            <text class="tips-item">· 文件大小不超过20MB</text>
            <text class="tips-item">· 数据格式必须符合模板</text>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view v-if="!isImporting" class="dialog-footer">
        <view class="btn btn-cancel" @click="handleClose">
          取消
        </view>
        <view class="btn btn-confirm" @click="handleImport">
          导入
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.import-dialog {
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

.import-progress {
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

.import-form {
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

.file-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 48rpx;
  background: #f5f7fa;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    background: #eef0f5;
    border-color: #667eea;
  }

  .picker-icon {
    font-size: 48rpx;
  }

  .picker-text {
    font-size: 28rpx;
    color: #666;
  }
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f5f7fa;
  border-radius: 16rpx;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.file-icon {
  font-size: 40rpx;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.file-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.file-size {
  font-size: 24rpx;
  color: #999;
}

.file-remove {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;

  &:active {
    background: rgba(0, 0, 0, 0.2);
  }
}

.form-tips {
  display: flex;
  gap: 12rpx;
  font-size: 26rpx;
}

.tips-label {
  color: #999;
  flex-shrink: 0;
}

.tips-value {
  color: #667eea;
  font-weight: 500;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tips-item {
  color: #666;
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
