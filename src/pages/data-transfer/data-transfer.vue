<script lang="ts" setup>
/**
 * 数据导入导出页面
 * 作为容器组件，组合各个子组件
 * 使用 scroll-view 实现滚动加载，表头固定
 */
import ActionBar from './components/ActionBar.vue'
import DetailDialog from './components/DetailDialog.vue'
import EmptyState from './components/EmptyState.vue'
import ExportDialog from './components/ExportDialog.vue'
import FilterBar from './components/FilterBar.vue'
import ImportDialog from './components/ImportDialog.vue'
import RecordTable from './components/RecordTable.vue'
import { useDataTransfer } from './composables/useDataTransfer'

definePage({
  style: {
    navigationBarTitleText: '数据导入导出',
    navigationStyle: 'custom',
  },
})

// 使用 composable 管理状态
const {
  // 状态
  filterType,
  searchKeyword,
  displayedRecords,
  isEmpty,
  isLoading,
  hasMore,
  showImportDialog,
  showExportDialog,
  showDetailDialog,
  selectedRecord,
  importState,
  exportState,

  // 方法
  loadMore,
  setFilterType,
  setSearchKeyword,
  openImportDialog,
  closeImportDialog,
  openExportDialog,
  closeExportDialog,
  viewRecordDetail,
  closeDetailDialog,
  handleImport,
  handleExport,
  downloadFile,
} = useDataTransfer()

// 返回上一页
function handleGoBack() {
  uni.navigateBack()
}

// 滚动到底部加载更多
function handleScrollToLower() {
  if (!isLoading.value && hasMore.value) {
    loadMore()
  }
}
</script>

<template>
  <view class="data-transfer-page">
    <!-- 顶部状态栏 -->
    <view class="status-bar">
      <view class="status-bar-content">
        <view class="back-btn" @click="handleGoBack">
          ← 返回
        </view>
        <view class="header-info">
          <text class="title">数据管理</text>
          <text class="subtitle">导入 · 导出 · 同步</text>
        </view>
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="main-container">
      <!-- 左侧操作区（Pad 横屏布局） -->
      <view class="left-panel">
        <ActionBar
          @import="openImportDialog"
          @export="openExportDialog"
        />
      </view>

      <!-- 右侧记录区 -->
      <view class="right-panel">
        <!-- 筛选栏 -->
        <FilterBar
          v-model:filter-type="filterType"
          v-model:search-keyword="searchKeyword"
        />

        <!-- 表格区域 -->
        <view class="table-wrapper">
          <!-- 固定表头 -->
          <view class="table-header">
            <view class="col-type">
              类型
            </view>
            <view class="col-filename">
              文件名
            </view>
            <view class="col-time">
              时间
            </view>
            <view class="col-status">
              状态
            </view>
            <view class="col-action">
              操作
            </view>
          </view>

          <!-- 滚动列表区域 -->
          <scroll-view
            class="scroll-container"
            scroll-y
            :scroll-with-animation="true"
            @scrolltolower="handleScrollToLower"
          >
            <!-- 记录列表 -->
            <RecordTable
              v-if="!isEmpty"
              :records="displayedRecords"
              @view-detail="viewRecordDetail"
              @download="downloadFile"
            />

            <!-- 空状态 -->
            <EmptyState v-else />

            <!-- 加载状态 -->
            <view v-if="!isEmpty && (isLoading || hasMore)" class="load-more">
              <view v-if="isLoading" class="loading-text">
                加载中...
              </view>
              <view v-else-if="hasMore" class="loading-text">
                下拉加载更多
              </view>
            </view>

            <!-- 没有更多数据 -->
            <view v-if="!isEmpty && !hasMore" class="no-more">
              没有更多数据了
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 导入弹窗 -->
    <ImportDialog
      :visible="showImportDialog"
      :is-importing="importState.isImporting"
      :progress="importState.progress"
      :status="importState.status"
      @close="closeImportDialog"
      @import="handleImport"
    />

    <!-- 导出弹窗 -->
    <ExportDialog
      :visible="showExportDialog"
      :is-exporting="exportState.isExporting"
      :progress="exportState.progress"
      @close="closeExportDialog"
      @export="handleExport"
    />

    <!-- 详情弹窗 -->
    <DetailDialog
      :visible="showDetailDialog"
      :record="selectedRecord"
      @close="closeDetailDialog"
    />
  </view>
</template>

<style lang="scss" scoped>
.data-transfer-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

/* 状态栏 */
.status-bar {
  flex-shrink: 0;
  padding: 40rpx 60rpx;
  padding-top: calc(40rpx + env(safe-area-inset-top));
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .status-bar-content {
    display: flex;
    align-items: center;
    gap: 32rpx;
  }

  .back-btn {
    padding: 16rpx 24rpx;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.2);
    border-radius: 32rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .title {
    font-size: 44rpx;
    font-weight: 700;
    color: #fff;
    letter-spacing: 2rpx;
  }

  .subtitle {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 4rpx;
  }
}

/* 主内容区域 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32rpx;
  gap: 32rpx;
  min-height: 0;
  overflow: hidden;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 表格包装器 */
.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* 固定表头 */
.table-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
}

// 列宽定义（与 RecordTable 保持一致）
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

/* 滚动容器 */
.scroll-container {
  flex: 1;
  min-height: 0;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 32rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

/* 没有更多数据 */
.no-more {
  display: flex;
  justify-content: center;
  padding: 32rpx;
  font-size: 24rpx;
  color: #ccc;
}

/* Pad 端大屏适配 */
@media screen and (min-width: 768px) {
  .status-bar {
    padding: 48rpx 80rpx;
    padding-top: calc(48rpx + env(safe-area-inset-top));

    .back-btn {
      padding: 20rpx 32rpx;
      font-size: 30rpx;
    }

    .title {
      font-size: 52rpx;
    }

    .subtitle {
      font-size: 28rpx;
    }
  }

  .main-container {
    flex-direction: row;
    padding: 48rpx;
    gap: 48rpx;
  }

  .left-panel {
    width: 360rpx;
    flex-shrink: 0;
  }

  .table-header {
    padding: 28rpx 32rpx;
    font-size: 28rpx;
  }

  .col-type {
    width: 160rpx;
  }

  .col-time {
    width: 220rpx;
  }

  .col-status {
    width: 140rpx;
  }

  .col-action {
    width: 120rpx;
  }
}

/* 超大屏幕适配 (平板横屏) */
@media screen and (min-width: 1024px) {
  .main-container {
    max-width: 96%;
    margin: 0 auto;
    width: 100%;
  }

  .left-panel {
    width: 420rpx;
  }
}
</style>
