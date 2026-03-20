/**
 * 数据导入导出相关类型定义
 */

/** 操作类型 */
export type OperationType = 'import' | 'export'

/** 操作状态 */
export type OperationStatus = 'success' | 'failed' | 'processing'

/** 导出格式 */
export type ExportFormat = 'xlsx' | 'csv'

/** 数据类型筛选 */
export type FilterType = 'all' | 'import' | 'export' | 'failed'

/** 操作记录 */
export interface TransferRecord {
  id: string
  type: OperationType
  fileName: string
  time: string
  status: OperationStatus
  operator?: string
  errorMessage?: string
  fileSize?: string
  recordCount?: number
}

/** 导入选项 */
export interface ImportOptions {
  file?: File | null
  fileName?: string
  fileSize?: number
}

/** 导出选项 */
export interface ExportOptions {
  dateRange: [string, string]
  dataType: 'all' | 'specific'
  format: ExportFormat
}

/** 分页参数 */
export interface Pagination {
  current: number
  pageSize: number
  total: number
}
