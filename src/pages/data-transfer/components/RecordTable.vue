<script lang="ts" setup>
/**
 * 记录表格组件
 * 仅包含表格内容，表头固定在外部
 */
import type { TransferRecord } from '../types/data-transfer'

defineProps<{
  records: TransferRecord[]
}>()

const emit = defineEmits<{
  viewDetail: [record: TransferRecord]
  download: [record: TransferRecord]
}>()

// 获取类型图标
function getTypeIcon(type: string): string {
  return type === 'import' ? '📥' : '📤'
}

// 获取类型文本
function getTypeText(type: string): string {
  return type === 'import' ? '导入' : '导出'
}

// 获取状态样式类
function getStatusClass(status: string): string {
  return status === 'success' ? 'status-success' : status === 'failed' ? 'status-failed' : 'status-processing'
}

// 获取状态图标
function getStatusIcon(status: string): string {
  return status === 'success' ? '✅' : status === 'failed' ? '❌' : '⏳'
}

// 获取状态文本
function getStatusText(status: string): string {
  return status === 'success' ? '成功' : status === 'failed' ? '失败' : '处理中'
}

// 处理操作
function handleAction(record: TransferRecord) {
  if (record.type === 'export' && record.status === 'success') {
    emit('download', record)
  }
  else {
    emit('viewDetail', record)
  }
}

// 获取操作按钮文本
function getActionText(record: TransferRecord): string {
  if (record.type === 'export' && record.status === 'success') {
    return '下载'
  }
  return record.status === 'failed' ? '详情' : '查看'
}
</script>

<template>
  <view class="record-table-body">
    <view
      v-for="record in records"
      :key="record.id"
      class="table-row"
      @click="handleAction(record)"
    >
      <view class="col-type">
        <view class="type-badge" :class="record.type">
          <text class="type-icon">{{ getTypeIcon(record.type) }}</text>
          <text class="type-text">{{ getTypeText(record.type) }}</text>
        </view>
      </view>
      <view class="col-filename">
        <text class="filename-text">{{ record.fileName }}</text>
        <text v-if="record.fileSize" class="file-size">{{ record.fileSize }}</text>
      </view>
      <view class="col-time">
        {{ record.time }}
      </view>
      <view class="col-status">
        <view class="status-badge" :class="getStatusClass(record.status)">
          <text class="status-icon">{{ getStatusIcon(record.status) }}</text>
          <text class="status-text">{{ getStatusText(record.status) }}</text>
        </view>
      </view>
      <view class="col-action">
        <view class="action-btn" :class="{ 'btn-download': record.type === 'export' && record.status === 'success' }">
          {{ getActionText(record) }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.record-table-body {
  background: #fff;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 28rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9fafb;
  }
}

// 列宽定义
.col-type {
  width: 140rpx;
  flex-shrink: 0;
}

.col-filename {
  flex: 1;
  min-width: 0;
  padding: 0 16rpx;
}

.col-time {
  width: 180rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #666;
}

.col-status {
  width: 120rpx;
  flex-shrink: 0;
}

.col-action {
  width: 100rpx;
  flex-shrink: 0;
  text-align: center;
}

// 类型徽章
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;

  &.import {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  &.export {
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }

  .type-icon {
    font-size: 24rpx;
  }

  .type-text {
    font-weight: 500;
  }
}

// 文件名列
.filename-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

// 状态徽章
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;

  &.status-success {
    color: #4caf50;
  }

  &.status-failed {
    color: #f44336;
  }

  &.status-processing {
    color: #ff9800;
  }

  .status-icon {
    font-size: 24rpx;
  }

  .status-text {
    font-weight: 500;
  }
}

// 操作按钮
.action-btn {
  display: inline-block;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20rpx;
  font-weight: 500;

  &.btn-download {
    color: #2196f3;
    background: rgba(33, 150, 243, 0.1);
  }
}

/* Pad 端大屏适配 */
@media screen and (min-width: 768px) {
  .table-row {
    padding: 32rpx;
  }

  .col-type {
    width: 160rpx;
  }

  .col-time {
    width: 220rpx;
    font-size: 26rpx;
  }

  .col-status {
    width: 140rpx;
  }

  .col-action {
    width: 120rpx;
  }

  .filename-text {
    font-size: 30rpx;
  }

  .file-size {
    font-size: 24rpx;
  }

  .type-badge {
    padding: 10rpx 20rpx;
    font-size: 26rpx;
  }

  .status-badge {
    font-size: 26rpx;
  }

  .action-btn {
    padding: 14rpx 28rpx;
    font-size: 26rpx;
  }
}
</style>
