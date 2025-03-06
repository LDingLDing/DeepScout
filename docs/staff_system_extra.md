# Staff 后台管理系统扩展模块设计

## 一、信息源管理模块

### 1.1 功能概述

信息源管理模块负责管理系统中所有数据采集的来源，包括网站、RSS、API接口等各类信息源的创建、编辑、删除和查询功能。

### 1.2 数据库设计

#### 信息源表 (source)

| 字段名 | 类型 | 必填 | 默认值 | 描述 | 索引 |
|--------|------|------|--------|------|------|
| `id` | INT | 是 | 自增 | 信息源唯一ID | 主键 |
| `name` | VARCHAR(100) | 是 | - | 信息源名称 | - |
| `type` | ENUM('website', 'rss', 'api', 'wechat', 'other') | 是 | - | 信息源类型 | - |
| `url` | VARCHAR(255) | 否 | NULL | 信息源URL | - |
| `description` | TEXT | 否 | NULL | 信息源描述 | - |
| `config` | JSONB | 否 | NULL | 配置信息 | - |
| `status` | ENUM('active', 'inactive') | 是 | 'active' | 状态 | - |
| `createdBy` | INT | 是 | - | 创建人ID | 外键 |
| `updatedBy` | INT | 否 | NULL | 更新人ID | 外键 |
| `createdAt` | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 | - |
| `updatedAt` | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 更新时间 | - |

### 1.3 API 接口设计

#### 1.3.1 获取信息源列表

- **请求方式**：GET
- **接口路径**：`/api/sources`
- **权限要求**：所有已登录用户
- **请求参数**：
  - `page`: 页码，默认1
  - `pageSize`: 每页条数，默认20
  - `type`: 信息源类型，可选
  - `status`: 状态，可选
  - `keyword`: 搜索关键词，可选
- **响应数据**：
  ```json
  {
    "total": 100,
    "data": [
      {
        "id": 1,
        "name": "示例网站",
        "type": "website",
        "url": "https://example.com",
        "status": "active",
        "createdAt": "2025-03-01T08:00:00Z"
      }
    ]
  }
  ```
1.3.2 获取信息源详情
请求方式：GET
接口路径：/api/sources/:id
权限要求：所有已登录用户
响应数据：
json
CopyInsert
{
  "id": 1,
  "name": "示例网站",
  "type": "website",
  "url": "https://example.com",
  "description": "这是一个示例网站",
  "config": { "selector": ".content", "encoding": "utf-8" },
  "status": "active",
  "createdBy": 1,
  "createdAt": "2025-03-01T08:00:00Z",
  "updatedAt": "2025-03-01T08:00:00Z"
}
1.3.3 创建信息源
请求方式：POST
接口路径：/api/sources
权限要求：ADMIN, MANAGER
请求数据：
json
CopyInsert
{
  "name": "新信息源",
  "type": "website",
  "url": "https://new-example.com",
  "description": "这是一个新的信息源",
  "config": { "selector": ".content", "encoding": "utf-8" },
  "status": "active"
}
响应数据：创建的信息源对象
1.3.4 更新信息源
请求方式：PUT
接口路径：/api/sources/:id
权限要求：ADMIN, MANAGER
请求数据：与创建信息源相同
响应数据：更新后的信息源对象
1.3.5 删除信息源
请求方式：DELETE
接口路径：/api/sources/:id
权限要求：ADMIN
响应数据：
json
CopyInsert
{
  "success": true,
  "message": "信息源已删除"
}
1.4 前端界面设计
1.4.1 信息源列表页
顶部搜索栏：支持按名称搜索
筛选选项：类型、状态
列表展示：ID、名称、类型、URL、状态、创建时间
操作按钮：查看、编辑、删除
分页控件
1.4.2 信息源详情/编辑页
基本信息区：名称、类型、URL、描述、状态
高级配置区：JSON编辑器，用于编辑配置信息
关联任务列表：显示与该信息源关联的所有任务
保存/取消按钮
二、任务管理模块
2.1 功能概述
任务管理模块负责管理数据采集任务，包括任务的创建、编辑、版本管理、执行控制和监控。每个任务都关联到特定的信息源，并包含采集逻辑和调度配置。

2.2 数据库设计
2.2.1 任务表 (task)
| 字段名 | 类型 | 必填 | 默认值 | 描述 | 索引 | |--------|------|------|--------|------|------| | id | INT | 是 | 自增 | 任务唯一ID | 主键 | | name | VARCHAR(100) | 是 | - | 任务名称 | - | | sourceId | INT | 是 | - | 关联的信息源ID | 外键 | | description | TEXT | 否 | NULL | 任务描述 | - | | currentVersionId | INT | 否 | NULL | 当前版本ID | 外键 | | schedule | VARCHAR(50) | 否 | NULL | 调度表达式(cron) | - | | status | ENUM('active', 'inactive', 'error') | 是 | 'inactive' | 任务状态 | - | | lastRunAt | TIMESTAMP | 否 | NULL | 上次执行时间 | - | | nextRunAt | TIMESTAMP | 否 | NULL | 下次执行时间 | - | | createdBy | INT | 是 | - | 创建人ID | 外键 | | updatedBy | INT | 否 | NULL | 更新人ID | 外键 | | createdAt | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 | - | | updatedAt | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 更新时间 | - |

2.2.2 任务版本表 (task_version)
| 字段名 | 类型 | 必填 | 默认值 | 描述 | 索引 | |--------|------|------|--------|------|------| | id | INT | 是 | 自增 | 版本唯一ID | 主键 | | taskId | INT | 是 | - | 关联的任务ID | 外键 | | version | INT | 是 | - | 版本号 | - | | code | TEXT | 是 | - | 采集代码 | - | | config | JSONB | 否 | NULL | 配置信息 | - | | comment | TEXT | 否 | NULL | 版本说明 | - | | createdBy | INT | 是 | - | 创建人ID | 外键 | | createdAt | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 | - |

2.3 API 接口设计
2.3.1 获取任务列表
请求方式：GET
接口路径：/api/tasks
权限要求：所有已登录用户
请求参数：
page: 页码，默认1
pageSize: 每页条数，默认20
sourceId: 信息源ID，可选
status: 状态，可选
keyword: 搜索关键词，可选
响应数据：
json
CopyInsert
{
  "total": 50,
  "data": [
    {
      "id": 1,
      "name": "示例任务",
      "sourceId": 1,
      "sourceName": "示例网站",
      "status": "active",
      "lastRunAt": "2025-03-05T08:00:00Z",
      "nextRunAt": "2025-03-06T08:00:00Z",
      "createdAt": "2025-03-01T08:00:00Z"
    }
  ]
}
2.3.2 获取任务详情
请求方式：GET
接口路径：/api/tasks/:id
权限要求：所有已登录用户
响应数据：
json
CopyInsert
{
  "id": 1,
  "name": "示例任务",
  "sourceId": 1,
  "sourceName": "示例网站",
  "description": "这是一个示例任务",
  "currentVersionId": 5,
  "currentVersion": 5,
  "schedule": "0 0 * * *",
  "status": "active",
  "lastRunAt": "2025-03-05T08:00:00Z",
  "nextRunAt": "2025-03-06T08:00:00Z",
  "createdBy": 1,
  "createdAt": "2025-03-01T08:00:00Z",
  "updatedAt": "2025-03-05T08:00:00Z"
}
2.3.3 创建任务
请求方式：POST
接口路径：/api/tasks
权限要求：ADMIN, MANAGER
请求数据：
json
CopyInsert
{
  "name": "新任务",
  "sourceId": 1,
  "description": "这是一个新任务",
  "code": "function scrape() { return { data: 'example' }; }",
  "config": { "timeout": 30000 },
  "schedule": "0 0 * * *",
  "status": "inactive",
  "comment": "初始版本"
}
响应数据：创建的任务对象
2.3.4 更新任务
请求方式：PUT
接口路径：/api/tasks/:id
权限要求：ADMIN, MANAGER
请求数据：
json
CopyInsert
{
  "name": "更新的任务名称",
  "description": "更新的描述",
  "schedule": "0 0 * * *",
  "status": "active"
}
响应数据：更新后的任务对象
2.3.5 创建任务新版本
请求方式：POST
接口路径：/api/tasks/:id/versions
权限要求：ADMIN, MANAGER
请求数据：
json
CopyInsert
{
  "code": "function scrape() { return { data: 'updated example' }; }",
  "config": { "timeout": 60000 },
  "comment": "修复了超时问题"
}
响应数据：创建的版本对象
2.3.6 获取任务版本列表
请求方式：GET
接口路径：/api/tasks/:id/versions
权限要求：所有已登录用户
响应数据：
json
CopyInsert
{
  "total": 5,
  "data": [
    {
      "id": 5,
      "taskId": 1,
      "version": 5,
      "comment": "修复了超时问题",
      "createdBy": 1,
      "createdAt": "2025-03-05T08:00:00Z"
    }
  ]
}
2.3.7 获取任务版本详情
请求方式：GET
接口路径：/api/tasks/:taskId/versions/:versionId
权限要求：所有已登录用户
响应数据：
json
CopyInsert
{
  "id": 5,
  "taskId": 1,
  "version": 5,
  "code": "function scrape() { return { data: 'updated example' }; }",
  "config": { "timeout": 60000 },
  "comment": "修复了超时问题",
  "createdBy": 1,
  "createdAt": "2025-03-05T08:00:00Z"
}
2.3.8 切换任务版本
请求方式：PUT
接口路径：/api/tasks/:id/current-version
权限要求：ADMIN, MANAGER
请求数据：
json
CopyInsert
{
  "versionId": 3
}
响应数据：更新后的任务对象
2.3.9 手动执行任务
请求方式：POST
接口路径：/api/tasks/:id/run
权限要求：ADMIN, MANAGER
响应数据：
json
CopyInsert
{
  "success": true,
  "message": "任务已提交执行",
  "logId": 123
}
2.4 前端界面设计
2.4.1 任务列表页
顶部搜索栏：支持按名称搜索
筛选选项：信息源、状态
列表展示：ID、名称、信息源、状态、上次执行时间、下次执行时间
操作按钮：查看、编辑、执行、查看日志
分页控件
2.4.2 任务详情页
基本信息区：名称、信息源、描述、调度、状态
版本信息区：当前版本、版本历史
代码编辑区：代码编辑器，支持语法高亮
配置区：JSON编辑器，用于编辑配置信息
执行历史区：最近的执行日志
操作按钮：保存、执行、停止、切换版本
2.4.3 版本对比页
版本选择：左侧和右侧版本选择器
代码对比：并排或内联显示差异
配置对比：显示配置的差异
操作按钮：切换到选定版本
三、日志管理模块扩展
3.1 功能概述
在现有的任务日志基础上扩展更多功能，包括更详细的日志信息、高级筛选、统计分析和告警功能。

3.2 数据库设计扩展
3.2.1 任务日志表扩展 (task_log)
在现有字段基础上增加：

| 字段名 | 类型 | 必填 | 默认值 | 描述 | 索引 | |--------|------|------|--------|------|------| | sourceId | INT | 否 | NULL | 关联的信息源ID | 外键 | | versionId | INT | 否 | NULL | 任务版本ID | 外键 | | startTime | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 开始时间 | - | | endTime | TIMESTAMP | 否 | NULL | 结束时间 | - | | duration | INT | 否 | NULL | 执行时长(ms) | - | | itemsProcessed | INT | 否 | 0 | 处理项目数 | - | | errorCount | INT | 否 | 0 | 错误数量 | - |

3.2.2 日志详情表 (task_log_detail)
| 字段名 | 类型 | 必填 | 默认值 | 描述 | 索引 | |--------|------|------|--------|------|------| | id | INT | 是 | 自增 | 详情唯一ID | 主键 | | logId | INT | 是 | - | 关联的日志ID | 外键 | | level | ENUM('info', 'warning', 'error', 'debug') | 是 | 'info' | 日志级别 | - | | message | TEXT | 是 | - | 日志消息 | - | | timestamp | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 时间戳 | - | | metadata | JSONB | 否 | NULL | 元数据 | - |

3.3 API 接口设计
3.3.1 获取日志列表（扩展）
请求方式：GET
接口路径：/api/task-logs
权限要求：所有已登录用户
请求参数：
page: 页码，默认1
pageSize: 每页条数，默认20
taskId: 任务ID，可选
sourceId: 信息源ID，可选
status: 状态，可选
startDate: 开始日期，可选
endDate: 结束日期，可选
minDuration: 最小执行时长，可选
maxDuration: 最大执行时长，可选
响应数据：
json
CopyInsert
{
  "total": 200,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "taskName": "示例任务",
      "sourceId": 1,
      "sourceName": "示例网站",
      "status": "success",
      "startTime": "2025-03-05T08:00:00Z",
      "endTime": "2025-03-05T08:01:30Z",
      "duration": 90000,
      "itemsProcessed": 150,
      "errorCount": 0
    }
  ]
}
3.3.2 获取日志详情（扩展）
请求方式：GET
接口路径：/api/task-logs/:id
权限要求：所有已登录用户
响应数据：
json
CopyInsert
{
  "id": 1,
  "taskId": 1,
  "taskName": "示例任务",
  "sourceId": 1,
  "sourceName": "示例网站",
  "versionId": 5,
  "version": 5,
  "status": "success",
  "startTime": "2025-03-05T08:00:00Z",
  "endTime": "2025-03-05T08:01:30Z",
  "duration": 90000,
  "message": "任务执行成功",
  "metadata": {
    "memory": "120MB",
    "cpu": "5%"
  },
  "itemsProcessed": 150,
  "errorCount": 0
}
3.3.3 获取日志详情列表
请求方式：GET
接口路径：/api/task-logs/:id/details
权限要求：所有已登录用户
请求参数：
page: 页码，默认1
pageSize: 每页条数，默认50
level: 日志级别，可选
响应数据：
json
CopyInsert
{
  "total": 80,
  "data": [
    {
      "id": 1,
      "logId": 1,
      "level": "info",
      "message": "开始处理项目 #1",
      "timestamp": "2025-03-05T08:00:01Z",
      "metadata": {
        "itemId": 1
      }
    }
  ]
}
3.3.4 获取日志统计信息
请求方式：GET
接口路径：/api/task-logs/statistics
权限要求：所有已登录用户
请求参数：
taskId: 任务ID，可选
sourceId: 信息源ID，可选
startDate: 开始日期，可选
endDate: 结束日期，可选
响应数据：
json
CopyInsert
{
  "totalLogs": 500,
  "successCount": 450,
  "failedCount": 50,
  "averageDuration": 75000,
  "totalItemsProcessed": 75000,
  "totalErrorCount": 120,
  "dailyStats": [
    {
      "date": "2025-03-01",
      "count": 100,
      "successRate": 0.95
    }
  ]
}
3.4 前端界面设计
3.4.1 日志列表页（扩展）
高级筛选区：任务、信息源、状态、时间范围、执行时长
列表展示：ID、任务名称、信息源、状态、开始时间、结束时间、执行时长、处理项目数
统计信息：成功率、平均执行时长、总处理项目数
图表展示：每日执行次数、成功率趋势
操作按钮：查看详情、导出
分页控件
3.4.2 日志详情页（扩展）
基本信息区：任务名称、信息源、版本、状态、时间信息
执行统计区：处理项目数、错误数、资源使用情况
详细日志区：按时间顺序展示所有日志条目，支持按级别筛选
元数据展示：JSON格式展示元数据
相关操作区：重新执行任务、查看任务详情
导出按钮：导出日志为文件
四、模块间关系
4.1 数据流关系
信息源 → 任务：一个信息源可以关联多个任务
任务 → 任务版本：一个任务有多个版本，其中一个为当前版本
任务 → 日志：一个任务执行产生多个日志记录
日志 → 日志详情：一个日志记录包含多条详细日志
4.2 权限控制
| 操作 | ADMIN | MANAGER | VIEWER | |------|-------|---------|--------| | 查看信息源 | ✓ | ✓ | ✓ | | 创建/编辑信息源 | ✓ | ✓ | ✗ | | 删除信息源 | ✓ | ✗ | ✗ | | 查看任务 | ✓ | ✓ | ✓ | | 创建/编辑任务 | ✓ | ✓ | ✗ | | 执行任务 | ✓ | ✓ | ✗ | | 管理任务版本 | ✓ | ✓ | ✗ | | 查看日志 | ✓ | ✓ | ✓ | | 导出日志 | ✓ | ✓ | ✓ |

五、实现计划
5.1 后端实现
创建数据库表结构
实现实体类和DTO
实现服务层逻辑
实现控制器和API接口
添加权限控制
实现任务调度和执行系统
5.2 前端实现
创建API服务
实现列表页面和详情页面
实现表单和编辑功能
添加代码编辑器和JSON编辑器
实现版本对比功能
添加统计图表和可视化
5.3 优先级排序
信息源管理基础功能
任务管理基础功能
日志管理扩展功能
任务版本管理功能
统计和分析功能
