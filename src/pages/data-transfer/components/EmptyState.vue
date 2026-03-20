<script lang="ts" setup>
/**
 * 空状态组件
 * 当没有操作记录时显示
 */
</script>

<template>
  <view class="empty-state">
    <view class="empty-icon">
      📂
    </view>
    <text class="empty-title">暂无导入导出记录</text>
    <text class="empty-desc">请点击上方按钮进行操作</text>
  </view>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.8;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
}

/* Pad 端大屏适配 */
@media screen and (min-width: 768px) {
  .empty-state {
    padding: 160rpx 64rpx;
  }

  .empty-icon {
    font-size: 160rpx;
    margin-bottom: 40rpx;
  }

  .empty-title {
    font-size: 36rpx;
    margin-bottom: 20rpx;
  }

  .empty-desc {
    font-size: 30rpx;
  }
}
</style>
