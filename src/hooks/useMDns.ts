import type { Ref } from 'vue'
// @ts-expect-error uts编译
import type { DiscoveredService, MdnsDiscoveryListener } from '@/uni_modules/wxj-mdns'

import { onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
import {
  registerMdnsDiscoveryListener,
  resolveService,
  startDiscovery,
  stopDiscovery,
  unregisterMdnsDiscoveryListener,
  // @ts-expect-error uts编译
} from '@/uni_modules/wxj-mdns'

export interface MDnsLog {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

export interface UseMDnsOptions {
  /** 最大日志条数，默认 50 */
  maxLogs?: number
  /** 服务发现时的回调 */
  onServiceFound?: (service: DiscoveredService) => void
  /** 服务丢失时的回调 */
  onServiceLost?: (service: DiscoveredService) => void
}

export interface UseMDnsReturn {
  /** 是否正在扫描 */
  scanning: Ref<boolean>
  /** 发现的服务列表 */
  services: Ref<DiscoveredService[]>
  /** 日志列表 */
  logs: Ref<MDnsLog[]>
  /** 开始扫描 */
  startDiscovery: (serviceType?: string) => Promise<void>
  /** 停止扫描 */
  stopDiscovery: () => Promise<void>
  /** 解析服务 */
  resolveService: (service: DiscoveredService) => Promise<DiscoveredService>
  /** 清空服务列表 */
  clearServices: () => void
  /** 清空日志 */
  clearLogs: () => void
  /** 添加日志 */
  addLog: (message: string, type?: 'info' | 'success' | 'error') => void
}

/**
 * mDNS 服务发现 Hook
 *
 * 封装了 mDNS 服务发现的核心功能，自动管理监听器的注册和注销
 *
 * @param options 配置选项
 * @returns mDNS 操作方法和状态
 *
 * @example
 * ```ts
 * const {
 *   scanning,
 *   services,
 *   startDiscovery,
 *   stopDiscovery,
 *   resolveService,
 * } = useMDns({
 *   onServiceFound: (service) => console.log('发现:', service.name),
 * })
 *
 * // 开始扫描
 * await startDiscovery('_http._tcp.')
 *
 * // 解析服务
 * const resolved = await resolveService(service)
 * ```
 */
export default function useMDns(options: UseMDnsOptions = {}): UseMDnsReturn {
  const { maxLogs = 50, onServiceFound, onServiceLost } = options

  // 状态
  const scanning = ref(false)
  const services = ref<DiscoveredService[]>([])
  const logs = ref<MDnsLog[]>([])

  // 监听器实例
  let discoveryListener: MdnsDiscoveryListener | null = null

  // 添加日志
  function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const time = new Date().toLocaleTimeString()
    logs.value.unshift({ time, message, type })
    // 保留最近 N 条日志
    if (logs.value.length > maxLogs) {
      logs.value = logs.value.slice(0, maxLogs)
    }
  }

  // 处理服务发现事件
  function handleServiceFound(service: DiscoveredService) {
    // 检查是否已存在，避免重复
    const index = services.value.findIndex((s) => {
      // type发现后和解析后可能不一样
      return s.name === service.name
    })
    if (index === -1) {
      services.value.push(service)
    }
    else {
      // 更新服务信息
      services.value[index] = service
    }

    onServiceFound?.(service)
  }

  // 处理服务丢失事件
  function handleServiceLost(service: DiscoveredService) {
    addLog(`服务丢失: ${service.name}`, 'error')
    services.value = services.value.filter(s => s.name !== service.name)
    onServiceLost?.(service)
  }

  // 开始扫描
  function startDiscoveryFn(serviceType = '_http._tcp.'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!serviceType) {
        const error = new Error('请输入服务类型')
        addLog('错误: 请输入服务类型', 'error')
        reject(error)
        return
      }

      addLog(`开始扫描: ${serviceType}`)

      startDiscovery({
        serviceType,
        success: (res) => {
          scanning.value = true
          addLog(res.message, 'success')
          resolve()
        },
        fail: (err) => {
          addLog(`错误: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 停止扫描
  function stopDiscoveryFn(): Promise<void> {
    return new Promise((resolve, reject) => {
      stopDiscovery({
        success: (res) => {
          scanning.value = false
          addLog(res.message, 'info')
          resolve()
        },
        fail: (err) => {
          addLog(`错误: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 解析服务
  function resolveServiceFn(service: DiscoveredService): Promise<DiscoveredService> {
    return new Promise((resolve, reject) => {
      addLog(`解析服务: ${service.name}`)

      resolveService({
        serviceName: service.name,
        serviceType: service.type,
        success: (res) => {
          addLog(`解析成功: ${res.service.hostAddress}:${res.service.port}`, 'success')
          // 更新服务信息
          const index = services.value.findIndex(s => s.name === service.name && s.type === service.type)
          if (index !== -1) {
            services.value[index] = res.service
          }
          resolve(res.service)
        },
        fail: (err) => {
          addLog(`解析失败: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 清空服务列表
  function clearServices() {
    services.value = []
    addLog('已清空服务列表', 'info')
  }

  // 清空日志
  function clearLogs() {
    logs.value = []
  }

  // 注册监听器
  function registerListener() {
    if (discoveryListener)
      return

    discoveryListener = {
      onServiceFound: handleServiceFound,
      onServiceLost: handleServiceLost,
    }

    registerMdnsDiscoveryListener(discoveryListener)
    addLog('已注册监听器', 'info')
  }

  // 注销监听器
  function unregisterListener() {
    if (!discoveryListener)
      return

    unregisterMdnsDiscoveryListener(discoveryListener)
    discoveryListener = null
    addLog('已注销监听器', 'info')
  }

  // 页面加载时注册监听器
  registerListener()

  // 页面卸载时自动清理
  onUnload(() => {
    // 注销监听器
    unregisterListener()

    // 如果正在扫描，停止扫描
    if (scanning.value) {
      stopDiscovery({
        success: () => {
          scanning.value = false
        },
      })
    }
  })

  return {
    scanning,
    services,
    logs,
    startDiscovery: startDiscoveryFn,
    stopDiscovery: stopDiscoveryFn,
    resolveService: resolveServiceFn,
    clearServices,
    clearLogs,
    addLog,
  }
}
