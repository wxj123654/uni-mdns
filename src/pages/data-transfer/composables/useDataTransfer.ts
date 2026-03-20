import type { ExportOptions, FilterType, ImportOptions, OperationStatus, TransferRecord } from '../types/data-transfer'
/**
 * 数据导入导出功能 Composable
 * 管理操作记录、筛选、分页等状态
 */
import { computed, shallowRef } from 'vue'

// 生成唯一ID
function generateId(): string {
  return `record_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes}B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// 格式化时间
function formatTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 生成随机记录的工厂函数
function createMockRecord(): TransferRecord {
  const types: Array<'import' | 'export'> = ['import', 'export']
  const statuses: Array<'success' | 'failed'> = ['success', 'success', 'success', 'failed'] // 75% 成功率
  const fileExtensions = ['xlsx', 'csv', 'json', 'xml']
  const fileNames = [
    '客户数据',
    '产品清单',
    '销售报表',
    '库存记录',
    '订单数据',
    '用户信息',
    '财务报表',
    '员工名单',
    '商品目录',
    '交易记录',
    '供应商数据',
    '采购清单',
    '退货记录',
    '会员信息',
    '积分明细',
  ]

  const type = types[Math.floor(Math.random() * types.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const ext = fileExtensions[Math.floor(Math.random() * fileExtensions.length)]
  const fileName = fileNames[Math.floor(Math.random() * fileNames.length)]

  // 生成随机日期（最近30天内）
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))

  const record: TransferRecord = {
    id: generateId(),
    type,
    fileName: `${fileName}.${ext}`,
    time: formatTime(date),
    status,
    operator: 'admin',
  }

  if (status === 'success') {
    record.fileSize = formatFileSize(Math.floor(Math.random() * 5000000) + 100000) // 100KB - 5MB
    record.recordCount = Math.floor(Math.random() * 500) + 10
  }
  else {
    const errors = [
      '文件格式不正确，请检查文件头',
      '第3行数据解析失败',
      '文件内容为空',
      '数据列数不匹配',
      '文件损坏，无法读取',
    ]
    record.errorMessage = errors[Math.floor(Math.random() * errors.length)]
  }

  return record
}

// 生成模拟数据（50条用于测试分页）
function generateMockRecords(): TransferRecord[] {
  return [
    // 固定几条典型数据
    {
      id: generateId(),
      type: 'import',
      fileName: '客户数据.xlsx',
      time: '2026-03-20 10:01',
      status: 'success',
      operator: 'admin',
      fileSize: '2.5MB',
      recordCount: 156,
    },
    {
      id: generateId(),
      type: 'export',
      fileName: '数据备份.xlsx',
      time: '2026-03-20 09:20',
      status: 'success',
      operator: 'admin',
      fileSize: '1.8MB',
      recordCount: 120,
    },
    {
      id: generateId(),
      type: 'import',
      fileName: 'test.csv',
      time: '2026-03-19 16:33',
      status: 'failed',
      operator: 'admin',
      errorMessage: '第5行数据格式错误，无法解析',
    },
    {
      id: generateId(),
      type: 'export',
      fileName: '销售报表.xlsx',
      time: '2026-03-19 14:15',
      status: 'success',
      operator: 'admin',
      fileSize: '3.2MB',
      recordCount: 245,
    },
    {
      id: generateId(),
      type: 'import',
      fileName: '产品清单.xlsx',
      time: '2026-03-18 11:30',
      status: 'success',
      operator: 'admin',
      fileSize: '856KB',
      recordCount: 89,
    },
    // 动态生成更多测试数据
    ...Array.from({ length: 45 }, () => createMockRecord()),
  ]
}

export function useDataTransfer() {
  // 筛选条件
  const filterType = shallowRef<FilterType>('all')
  const searchKeyword = shallowRef('')

  // 分页状态
  const pageSize = 10
  const currentCount = shallowRef(pageSize) // 当前显示的记录数
  const isLoading = shallowRef(false)
  const hasMore = shallowRef(true)

  // 操作记录列表
  const records = shallowRef<TransferRecord[]>(generateMockRecords())

  // 弹窗状态
  const showImportDialog = shallowRef(false)
  const showExportDialog = shallowRef(false)
  const showDetailDialog = shallowRef(false)

  // 当前选中的记录（用于详情查看）
  const selectedRecord = shallowRef<TransferRecord | null>(null)

  // 导入状态
  const importState = reactive({
    isImporting: false,
    progress: 0,
    status: '' as OperationStatus | '',
  })

  // 导出状态
  const exportState = reactive({
    isExporting: false,
    progress: 0,
  })

  // 根据筛选条件过滤记录
  const filteredRecords = computed(() => {
    let result = records.value

    // 类型筛选
    if (filterType.value === 'import') {
      result = result.filter(r => r.type === 'import')
    }
    else if (filterType.value === 'export') {
      result = result.filter(r => r.type === 'export')
    }
    else if (filterType.value === 'failed') {
      result = result.filter(r => r.status === 'failed')
    }

    // 关键词搜索
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(r =>
        r.fileName.toLowerCase().includes(keyword),
      )
    }

    return result
  })

  // 当前显示的记录（滚动加载）
  const displayedRecords = computed(() => {
    return filteredRecords.value.slice(0, currentCount.value)
  })

  // 是否为空状态
  const isEmpty = computed(() => filteredRecords.value.length === 0)

  // 加载更多
  async function loadMore() {
    if (isLoading.value || !hasMore.value)
      return

    isLoading.value = true

    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    const totalCount = filteredRecords.value.length
    const nextCount = Math.min(currentCount.value + pageSize, totalCount)

    currentCount.value = nextCount
    hasMore.value = nextCount < totalCount
    isLoading.value = false
  }

  // 重置分页（筛选变化时调用）
  function resetPagination() {
    currentCount.value = pageSize
    hasMore.value = filteredRecords.value.length > pageSize
  }

  // 设置筛选类型
  function setFilterType(type: FilterType) {
    filterType.value = type
    resetPagination()
  }

  // 设置搜索关键词
  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
    resetPagination()
  }

  // 打开导入弹窗
  function openImportDialog() {
    showImportDialog.value = true
  }

  // 关闭导入弹窗
  function closeImportDialog() {
    showImportDialog.value = false
    importState.isImporting = false
    importState.progress = 0
    importState.status = ''
  }

  // 打开导出弹窗
  function openExportDialog() {
    showExportDialog.value = true
  }

  // 关闭导出弹窗
  function closeExportDialog() {
    showExportDialog.value = false
    exportState.isExporting = false
    exportState.progress = 0
  }

  // 查看记录详情
  function viewRecordDetail(record: TransferRecord) {
    selectedRecord.value = record
    showDetailDialog.value = true
  }

  // 关闭详情弹窗
  function closeDetailDialog() {
    showDetailDialog.value = false
    selectedRecord.value = null
  }

  // 执行导入操作
  async function handleImport(options: ImportOptions): Promise<boolean> {
    if (!options.file && !options.fileName) {
      uni.showToast({ title: '请选择文件', icon: 'none' })
      return false
    }

    importState.isImporting = true
    importState.progress = 0
    importState.status = 'processing'

    try {
      // 模拟导入进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        importState.progress = i
      }

      // 创建成功记录
      const newRecord: TransferRecord = {
        id: generateId(),
        type: 'import',
        fileName: options.fileName || '未知文件',
        time: formatTime(new Date()),
        status: 'success',
        operator: 'admin',
        fileSize: options.fileSize ? formatFileSize(options.fileSize) : undefined,
        recordCount: Math.floor(Math.random() * 200) + 50,
      }

      records.value = [newRecord, ...records.value]
      importState.status = 'success'

      uni.showToast({ title: '导入成功', icon: 'success' })

      // 延迟关闭弹窗
      setTimeout(() => {
        closeImportDialog()
      }, 1000)

      return true
    }
    catch (error) {
      importState.status = 'failed'

      // 创建失败记录
      const failedRecord: TransferRecord = {
        id: generateId(),
        type: 'import',
        fileName: options.fileName || '未知文件',
        time: formatTime(new Date()),
        status: 'failed',
        operator: 'admin',
        errorMessage: '导入过程中发生错误',
      }

      records.value = [failedRecord, ...records.value]
      uni.showToast({ title: '导入失败', icon: 'error' })
      return false
    }
  }

  // 执行导出操作
  async function handleExport(options: ExportOptions): Promise<boolean> {
    exportState.isExporting = true
    exportState.progress = 0

    try {
      // 模拟导出进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        exportState.progress = i
      }

      // 创建导出记录
      const fileName = `数据导出_${new Date().toISOString().slice(0, 10)}.${options.format}`

      const newRecord: TransferRecord = {
        id: generateId(),
        type: 'export',
        fileName,
        time: formatTime(new Date()),
        status: 'success',
        operator: 'admin',
        fileSize: `${(Math.random() * 5 + 1).toFixed(1)}MB`,
        recordCount: Math.floor(Math.random() * 300) + 100,
      }

      records.value = [newRecord, ...records.value]

      uni.showToast({ title: '导出成功', icon: 'success' })

      // 延迟关闭弹窗
      setTimeout(() => {
        closeExportDialog()
      }, 1000)

      return true
    }
    catch (error) {
      uni.showToast({ title: '导出失败', icon: 'error' })
      return false
    }
  }

  // 下载文件（针对导出记录）
  function downloadFile(record: TransferRecord) {
    if (record.type !== 'export' || record.status !== 'success') {
      return
    }

    uni.showToast({ title: '开始下载...', icon: 'loading' })

    // 模拟下载
    setTimeout(() => {
      uni.showToast({ title: '下载完成', icon: 'success' })
    }, 1500)
  }

  return {
    // 状态
    filterType,
    searchKeyword,
    records,
    filteredRecords,
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
  }
}
