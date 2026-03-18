# wxj-mdns

mDNS 服务发现插件，用于扫描和解析局域网内的 mDNS 服务（如 Bonjour、Avahi 等）。

## 平台支持

- ✅ Android（使用 NsdManager API）
- ❌ iOS（待实现）
- ❌ Harmony（待实现）

## 安装

将插件放入 `uni_modules/wxj-mdns` 目录即可。

## 权限配置

在 `AndroidManifest.xml` 中添加以下权限：

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.CHANGE_WIFI_MULTICAST_STATE"/>
```

## 重要说明

**本插件使用事件驱动模式**，通过 `uni.$emit` 发送服务发现事件，避免 UTS 回调函数被 GC 释放的问题。

### 事件名称

| 事件名 | 说明 |
|--------|------|
| `mdns:serviceFound` | 发现新服务时触发 |
| `mdns:serviceLost` | 服务丢失时触发 |

## API 说明

### startDiscovery(options)

开始扫描 mDNS 服务。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| serviceType | string | 否 | 服务类型，如 `_http._tcp.`，默认扫描 HTTP 服务 |
| success | function | 否 | 扫描启动成功回调 |
| fail | function | 否 | 失败回调 |
| complete | function | 否 | 完成回调 |

**示例：**

```javascript
import { startDiscovery, EVENT_SERVICE_FOUND, EVENT_SERVICE_LOST } from '@/uni_modules/wxj-mdns'

// 1. 先注册事件监听
uni.$on(EVENT_SERVICE_FOUND, (service) => {
  console.log('发现服务:', service.name, service.hostAddress, service.port)
})

uni.$on(EVENT_SERVICE_LOST, (service) => {
  console.log('服务丢失:', service.name)
})

// 2. 开始扫描
startDiscovery({
  serviceType: '_http._tcp.',
  success: (res) => {
    console.log('开始扫描:', res.message)
  },
  fail: (err) => {
    console.error('扫描失败:', err.errMsg)
  }
})

// 3. 页面卸载时移除监听
onUnload(() => {
  uni.$off(EVENT_SERVICE_FOUND)
  uni.$off(EVENT_SERVICE_LOST)
})
```

### stopDiscovery(options)

停止扫描 mDNS 服务。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| success | function | 否 | 成功回调 |
| fail | function | 否 | 失败回调 |
| complete | function | 否 | 完成回调 |

**示例：**

```javascript
import { stopDiscovery } from '@/uni_modules/wxj-mdns'

stopDiscovery({
  success: (res) => {
    console.log('扫描已停止')
  }
})
```

### resolveService(options)

解析指定服务获取详细信息。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| serviceName | string | 是 | 服务名称 |
| serviceType | string | 是 | 服务类型 |
| success | function | 否 | 解析成功回调 |
| fail | function | 否 | 失败回调 |
| complete | function | 否 | 完成回调 |

**示例：**

```javascript
import { resolveService } from '@/uni_modules/wxj-mdns'

resolveService({
  serviceName: 'My Service',
  serviceType: '_http._tcp.',
  success: (res) => {
    console.log('服务信息:', res.service)
  },
  fail: (err) => {
    console.error('解析失败:', err.errMsg)
  }
})
```

### isScanning()

检查当前是否正在扫描。

**返回：** `boolean`

```javascript
import { isScanning } from '@/uni_modules/wxj-mdns'

if (isScanning()) {
  console.log('正在扫描中...')
}
```

### getCurrentServiceType()

获取当前扫描的服务类型。

**返回：** `string | null`

## 数据类型

### DiscoveredService

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 服务名称 |
| type | string | 服务类型 |
| hostName | string \| null | 主机名 |
| hostAddress | string \| null | IP 地址 |
| port | number | 端口号 |
| txtRecords | Map<string, string> \| null | TXT 记录 |

## 错误码

| 错误码 | 说明 |
|--------|------|
| 9010001 | mDNS 服务未初始化 |
| 9010002 | 已经在扫描中 |
| 9010003 | 扫描启动失败 |
| 9010004 | 没有正在进行的扫描 |
| 9010005 | 服务解析失败 |
| 9010006 | 服务类型无效 |

## 常见服务类型

- `_http._tcp.` - HTTP 服务
- `_https._tcp.` - HTTPS 服务
- `_printer._tcp.` - 打印机服务
- `_airplay._tcp.` - AirPlay 服务
- `_googlecast._tcp.` - Google Cast 服务
- `_hap._tcp.` - HomeKit 设备

## 开发文档

- [UTS 语法](https://uniapp.dcloud.net.cn/tutorial/syntax-uts.html)
- [UTS API插件](https://uniapp.dcloud.net.cn/plugin/uts-plugin.html)
- [Android NsdManager](https://developer.android.com/reference/android/net/nsd/NsdManager)