<script lang="ts" setup>
/**
 * 操作按钮组件
 * 提供"导入数据"和"导出数据"两个主要操作按钮
 */

defineEmits<{
  import: []
  export: []
}>()
</script>

<template>
  <view class="action-bar">
    <view class="action-btn import-btn" @click="$emit('import')">
      <view class="btn-icon">
        📥
      </view>
      <text class="btn-text">导入数据</text>
    </view>
    <view class="action-btn export-btn" @click="$emit('export')">
      <view class="btn-icon">
        📤
      </view>
      <text class="btn-text">导出数据</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    filter: brightness(0.95);
  }

  .btn-icon {
    font-size: 56rpx;
    line-height: 1;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  &.import-btn {
    &:active {
      background: rgba(76, 175, 80, 0.1);
    }
  }

  &.export-btn {
    &:active {
      background: rgba(33, 150, 243, 0.1);
    }
  }
}

/* Pad 端大屏适配 */
@media screen and (min-width: 768px) {
  .action-bar {
    padding: 40rpx 48rpx;
    gap: 48rpx;
  }

  .action-btn {
    padding: 48rpx 40rpx;
    gap: 20rpx;

    .btn-icon {
      font-size: 72rpx;
    }

    .btn-text {
      font-size: 36rpx;
    }
  }
}
</style>
