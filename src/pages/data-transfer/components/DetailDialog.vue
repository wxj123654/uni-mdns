<script lang="ts" setup>
/**
 * 记录详情弹窗组件
 * 展示操作记录的详细信息
 */
import type { TransferRecord } from '../types/data-transfer'

defineProps<{
  visible: boolean
  record: TransferRecord | null
}>()

const emit = defineEmits<{
  close: []
}>()

// 获取类型文本
function getTypeText(type: string): string {
  return type === 'import' ? '导入' : '导出'
}

// 获取状态样式
function getStatusInfo(status: string): { icon: string, text: string, class: string } {
  switch (status) {
    case 'success':
      return { icon: '✅', text: '成功', class: 'status-success' }
    case 'failed':
      return { icon: '❌', text: '失败', class: 'status-failed' }
    default:
      return { icon: '⏳', text: '处理中', class: 'status-processing' }
  }
}
</script>

<template>
  <wd-popup
    :model-value="visible"
    position="center"
    close-on-click-modal
    custom-style="border-radius: 24rpx; width: 90%; max-width: 640rpx;"
    @update:model-value="(val: boolean) => { if (!val) $emit('close') }"
  >
    <view v-if="record" class="detail-dialog">
      <!-- 标题 -->
      <view class="dialog-header">
        <text class="dialog-title">操作详情</text>
        <view class="close-btn" @click="$emit('close')">
          ✕
        </view>
      </view>

      <!-- 详情内容 -->
      <view class="detail-content">
        <!-- 操作类型 -->
        <view class="detail-item">
          <text class="detail-label">操作类型：</text>
          <view class="detail-value type-badge" :class="record.type">
            {{ getTypeText(record.type) }}
          </view>
        </view>

        <!-- 文件名称 -->
        <view class="detail-item">
          <text class="detail-label">文件名称：</text>
          <text class="detail-value">{{ record.fileName }}</text>
        </view>

        <!-- 操作时间 -->
        <view class="detail-item">
          <text class="detail-label">操作时间：</text>
          <text class="detail-value">{{ record.time }}</text>
        </view>

        <!-- 操作人 -->
        <view v-if="record.operator" class="detail-item">
          <text class="detail-label">操作人：</text>
          <text class="detail-value">{{ record.operator }}</text>
        </view>

        <!-- 文件大小 -->
        <view v-if="record.fileSize" class="detail-item">
          <text class="detail-label">文件大小：</text>
          <text class="detail-value">{{ record.fileSize }}</text>
        </view>

        <!-- 记录数量 -->
        <view v-if="record.recordCount" class="detail-item">
          <text class="detail-label">记录数量：</text>
          <text class="detail-value">{{ record.recordCount }} 条</text>
        </view>

        <!-- 状态 -->
        <view class="detail-item">
          <text class="detail-label">状态：</text>
          <view class="detail-value status-badge" :class="getStatusInfo(record.status).class">
            <text class="status-icon">{{ getStatusInfo(record.status).icon }}</text>
            <text class="status-text">{{ getStatusInfo(record.status).text }}</text>
          </view>
        </view>

        <!-- 错误信息 -->
        <view v-if="record.errorMessage" class="detail-item error-item">
          <text class="detail-label">错误信息：</text>
          <view class="error-message">
            {{ record.errorMessage }}
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="dialog-footer">
        <view class="btn btn-close" @click="$emit('close')">
          关闭
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.detail-dialog {
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

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
  min-width: 160rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.type-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 500;

  &.import {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  &.export {
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;

  .status-icon {
    font-size: 28rpx;
  }

  .status-text {
    font-weight: 500;
  }

  &.status-success {
    color: #4caf50;
  }

  &.status-failed {
    color: #f44336;
  }

  &.status-processing {
    color: #ff9800;
  }
}

.error-item {
  flex-direction: column;
  gap: 12rpx;
}

.error-message {
  padding: 20rpx;
  background: rgba(244, 67, 54, 0.05);
  border: 2rpx solid rgba(244, 67, 54, 0.2);
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #f44336;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 48rpx;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200rpx;
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

.btn-close {
  color: #666;
  background: #f5f5f5;
}
</style>
