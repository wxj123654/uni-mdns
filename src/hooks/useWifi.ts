import type { Ref } from 'vue'

import { onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'

export interface WifiLog {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

/**
 * Wi-Fi 信息类型（对应 uni-wifi 模块的 UniWifiInfo）
 */
export interface WifiInfo {
  SSID: string
  BSSID?: string
  secure?: boolean
  /** 信号强度 0~100，值越大信号越好（hook 内已自动转换 Android 的 -100~0） */
  signalStrength?: number
  frequency?: number
}

export interface UseWifiOptions {
  /** 最大日志条数，默认 50 */
  maxLogs?: number
  /** Wi-Fi 连接成功的回调 */
  onWifiConnected?: (wifi: WifiInfo) => void
  /** Wi-Fi 列表获取成功的回调 */
  onWifiListReceived?: (wifiList: WifiInfo[]) => void
}

export interface UseWifiReturn {
  /** Wi-Fi 模块是否已初始化 */
  initialized: Ref<boolean>
  /** Wi-Fi 列表 */
  wifiList: Ref<WifiInfo[]>
  /** 当前连接的 Wi-Fi */
  connectedWifi: Ref<WifiInfo | null>
  /** 日志列表 */
  logs: Ref<WifiLog[]>
  /** 初始化 Wi-Fi 模块 */
  startWifi: () => Promise<void>
  /** 关闭 Wi-Fi 模块 */
  stopWifi: () => Promise<void>
  /** 获取 Wi-Fi 列表 */
  getWifiList: () => Promise<void>
  /** 连接 Wi-Fi */
  connectWifi: (SSID: string, password: string, maunal?: boolean) => Promise<void>
  /** 获取当前连接的 Wi-Fi */
  getConnectedWifi: (partialInfo?: boolean) => Promise<WifiInfo | null>
  /** 清空 Wi-Fi 列表 */
  clearWifiList: () => void
  /** 清空日志 */
  clearLogs: () => void
  /** 添加日志 */
  addLog: (message: string, type?: 'info' | 'success' | 'error') => void
}

/**
 * Wi-Fi 管理 Hook
 *
 * 封装了 Wi-Fi 操作的核心功能，自动管理监听器的注册和注销
 *
 * @param options 配置选项
 * @returns Wi-Fi 操作方法和状态
 *
 * @example
 * ```ts
 * const {
 *   initialized,
 *   wifiList,
 *   connectedWifi,
 *   startWifi,
 *   getWifiList,
 *   connectWifi,
 *   getConnectedWifi,
 * } = useWifi({
 *   onWifiConnected: (wifi) => console.log('已连接:', wifi.SSID),
 * })
 *
 * // 初始化
 * await startWifi()
 *
 * // 获取 Wi-Fi 列表
 * await getWifiList()
 *
 * // 连接 Wi-Fi
 * await connectWifi('SSID', 'password')
 *
 * // 获取当前连接的 Wi-Fi
 * const wifi = await getConnectedWifi()
 * ```
 */
export default function useWifi(options: UseWifiOptions = {}): UseWifiReturn {
  const { maxLogs = 50, onWifiConnected, onWifiListReceived } = options

  // 状态
  const initialized = ref(false)
  const wifiList = ref<WifiInfo[]>([])
  const connectedWifi = ref<WifiInfo | null>(null)
  const logs = ref<WifiLog[]>([])

  // 添加日志
  function addLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const time = new Date().toLocaleTimeString()
    logs.value.unshift({ time, message, type })
    // 保留最近 N 条日志
    if (logs.value.length > maxLogs) {
      logs.value = logs.value.slice(0, maxLogs)
    }
  }

  // 初始化 Wi-Fi 模块
  function startWifiFn(): Promise<void> {
    return new Promise((resolve, reject) => {
      addLog('初始化 Wi-Fi 模块...')

      uni.startWifi({
        success: () => {
          initialized.value = true
          addLog('Wi-Fi 模块初始化成功', 'success')
          resolve()
        },
        fail: (err) => {
          addLog(`初始化失败: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 关闭 Wi-Fi 模块
  function stopWifiFn(): Promise<void> {
    return new Promise((resolve, reject) => {
      addLog('关闭 Wi-Fi 模块...')

      uni.stopWifi({
        success: () => {
          initialized.value = false
          wifiList.value = []
          connectedWifi.value = null
          addLog('Wi-Fi 模块已关闭', 'info')
          resolve()
        },
        fail: (err) => {
          addLog(`关闭失败: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 获取 Wi-Fi 列表
  function getWifiListFn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!initialized.value) {
        const error = new Error('Wi-Fi 模块未初始化')
        addLog('错误: Wi-Fi 模块未初始化', 'error')
        reject(error)
        return
      }

      addLog('正在扫描 Wi-Fi 列表...')

      // onGetWifiList 只会触发一次，每次扫描前需要重新注册监听
      uni.onGetWifiList(handleWifiList)

      uni.getWifiList({
        success: () => {
          addLog('扫描请求已发送', 'success')
          resolve()
        },
        fail: (err) => {
          addLog(`扫描失败: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 连接 Wi-Fi
  function connectWifiFn(SSID: string, password: string, maunal = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!initialized.value) {
        const error = new Error('Wi-Fi 模块未初始化')
        addLog('错误: Wi-Fi 模块未初始化', 'error')
        reject(error)
        return
      }

      if (!SSID) {
        const error = new Error('请输入 SSID')
        addLog('错误: 请输入 SSID', 'error')
        reject(error)
        return
      }

      addLog(`正在连接 Wi-Fi: ${SSID}`)

      uni.connectWifi({
        SSID,
        password,
        maunal,
        success: () => {
          addLog(`已连接到: ${SSID}`, 'success')
          resolve()
        },
        fail: (err) => {
          addLog(`连接失败: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 获取当前连接的 Wi-Fi
  function getConnectedWifiFn(partialInfo = false): Promise<WifiInfo | null> {
    return new Promise((resolve, reject) => {
      if (!initialized.value) {
        const error = new Error('Wi-Fi 模块未初始化')
        addLog('错误: Wi-Fi 模块未初始化', 'error')
        reject(error)
        return
      }

      addLog('获取当前连接的 Wi-Fi...')

      uni.getConnectedWifi({
        partialInfo,
        success: (res) => {
          if (res.wifi) {
            connectedWifi.value = res.wifi
            addLog(`当前连接: ${res.wifi.SSID}`, 'success')
          }
          else {
            connectedWifi.value = null
            addLog('当前未连接 Wi-Fi', 'info')
          }
          resolve(res.wifi)
        },
        fail: (err) => {
          addLog(`获取失败: ${err.errMsg}`, 'error')
          reject(new Error(err.errMsg))
        },
      })
    })
  }

  // 清空 Wi-Fi 列表
  function clearWifiList() {
    wifiList.value = []
    addLog('已清空 Wi-Fi 列表', 'info')
  }

  // 清空日志
  function clearLogs() {
    logs.value = []
  }

  // 处理 Wi-Fi 列表数据（UTSJSONObject 类型来自 uni-wifi 原生模块）
  // 每次扫描后会重新注册监听，因为 onGetWifiList 只触发一次
  function handleWifiList(data: any) {
    const list = (data?.wifiList as WifiInfo[]) || []

    // 按 SSID 去重，保留信号强度更强的
    const wifiMap = new Map<string, WifiInfo>()
    for (const wifi of list) {
      if (!wifi.SSID)
        continue

      // Android 扫描结果 signalStrength 为 -100~0，需 +100 转换为 0~100
      // iOS 直接返回 0~100，无需转换
      if (wifi.signalStrength !== undefined && wifi.signalStrength < 0) {
        wifi.signalStrength = wifi.signalStrength + 100
      }

      const existing = wifiMap.get(wifi.SSID)
      if (!existing || (wifi.signalStrength ?? 0) > (existing.signalStrength ?? 0)) {
        wifiMap.set(wifi.SSID, wifi)
      }
    }

    const uniqueList = Array.from(wifiMap.values())
    wifiList.value = uniqueList
    addLog(`扫描到 ${uniqueList.length} 个 Wi-Fi（去重前 ${list.length} 个）`, 'success')
    onWifiListReceived?.(uniqueList)
  }

  // 处理 Wi-Fi 连接事件
  function handleWifiConnected(res: any) {
    if (res?.wifi) {
      connectedWifi.value = res.wifi
      addLog(`已连接: ${res.wifi.SSID}`, 'success')
      onWifiConnected?.(res.wifi)
    }
  }

  // 注册监听器
  function registerListeners() {
    // 注意：onGetWifiList 只会触发一次，在 getWifiListFn 中每次扫描前重新注册
    // 监听 Wi-Fi 连接事件
    uni.onWifiConnected(handleWifiConnected)

    addLog('已注册监听器', 'info')
  }

  // 注销监听器
  function unregisterListeners() {
    uni.offGetWifiList(handleWifiList)
    uni.offWifiConnected()
    addLog('已注销监听器', 'info')
  }

  // 页面加载时注册监听器
  registerListeners()

  // 页面卸载时自动清理
  onUnload(() => {
    // 注销监听器
    unregisterListeners()

    // 如果已初始化，关闭 Wi-Fi 模块
    if (initialized.value) {
      uni.stopWifi({
        success: () => {
          initialized.value = false
        },
      })
    }
  })

  return {
    initialized,
    wifiList,
    connectedWifi,
    logs,
    startWifi: startWifiFn,
    stopWifi: stopWifiFn,
    getWifiList: getWifiListFn,
    connectWifi: connectWifiFn,
    getConnectedWifi: getConnectedWifiFn,
    clearWifiList,
    clearLogs,
    addLog,
  }
}
