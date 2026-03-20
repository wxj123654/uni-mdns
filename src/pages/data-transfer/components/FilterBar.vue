<script lang="ts" setup>
/**
 * 筛选栏组件
 * 提供类型筛选和关键词搜索功能
 */
import type { FilterType } from '../types/data-transfer'

defineProps<{
  filterType: FilterType
  searchKeyword: string
}>()

const emit = defineEmits<{
  'update:filterType': [value: FilterType]
  'update:searchKeyword': [value: string]
}>()

const filterOptions: { value: FilterType, label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'import', label: '仅导入' },
  { value: 'export', label: '仅导出' },
  { value: 'failed', label: '仅失败' },
]

function selectFilter(value: FilterType) {
  emit('update:filterType', value)
}

function handleSearch(e: { detail?: { value?: string }, value?: string }) {
  const value = e.detail?.value ?? e.value ?? ''
  emit('update:searchKeyword', value)
}

function clearSearch() {
  emit('update:searchKeyword', '')
}
</script>

<template>
  <view class="filter-bar">
    <view class="filter-tabs">
      <view
        v-for="option in filterOptions"
        :key="option.value"
        class="filter-tab"
        :class="{ active: filterType === option.value }"
        @click="selectFilter(option.value)"
      >
        {{ option.label }}
      </view>
    </view>

    <view class="search-box">
      <view class="search-icon">
        🔍
      </view>
      <input
        class="search-input"
        type="text"
        placeholder="搜索文件名"
        :value="searchKeyword"
        placeholder-class="search-placeholder"
        @input="handleSearch"
      >
      <view
        v-if="searchKeyword"
        class="clear-btn"
        @click="clearSearch"
      >
        ✕
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  color: #666;
  background: #f5f7fa;
  border-radius: 32rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-weight: 500;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #f5f7fa;
  border-radius: 40rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &:focus-within {
    background: #fff;
    border-color: #667eea;
  }
}

.search-icon {
  font-size: 32rpx;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.search-placeholder {
  color: #999;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
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

/* Pad 端大屏适配 */
@media screen and (min-width: 768px) {
  .filter-bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
  }

  .filter-tabs {
    gap: 20rpx;
  }

  .filter-tab {
    padding: 18rpx 40rpx;
    font-size: 30rpx;
  }

  .search-box {
    width: 400rpx;
    padding: 16rpx 24rpx;
  }

  .search-input {
    font-size: 30rpx;
  }
}
</style>
