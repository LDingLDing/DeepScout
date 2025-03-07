### 数据库设计文档
---

### 一、概述
本系统用于管理多源信息采集任务及用户关注关系，核心功能包括：  
1. **信息源管理**：支持多种类型（Web/RSS/公众号）的信息源配置。  
2. **采集任务版本化**：任务代码按版本存储，更新时保留历史记录。  
3. **用户订阅管理**：用户可关注信息源并配置采集频率（Cron表达式）。  
4. **状态控制**：支持禁用订阅关系或采集任务。  
5. **双端用户体系**：分别维护前台用户（users）和后台用户（staff_users）。

---

### 二、表结构设计

#### 1. 后台用户表 (`staff_users`)
| 字段名      | 类型         | 必填 | 默认值         | 描述               | 索引   |
|-------------|-------------|------|----------------|--------------------|--------|
| `id`        | INT         | 是   | 自增           | 用户唯一ID         | 主键   |
| `email`     | VARCHAR(100)| 是   | -              | 邮箱              | 唯一   |
| `username`  | VARCHAR(50) | 是   | -              | 用户名            | 唯一   |
| `password`  | VARCHAR(255)| 是   | -              | 密码哈希          |        |
| `role`      | ENUM('admin','manager','viewer') | 是 | 'viewer' | 用户角色 |        |
| `is_active` | BOOLEAN     | 否   | true           | 是否启用          |        |
| `created_at`| DATETIME    | 否   | `CURRENT_TIMESTAMP` | 创建时间     |        |
| `updated_at`| DATETIME    | 否   | `ON UPDATE CURRENT_TIMESTAMP` | 更新时间 |        |

#### 2. 前台用户表 (`users`)
| 字段名      | 类型        | 必填 | 默认值         | 描述               | 索引   |
|-------------|-------------|------|----------------|--------------------|--------|
| `userid`    | INT         | 是   | 自增           | 用户唯一ID         | 主键   |
| `nickname`  | VARCHAR(50) | 是   | -              | 用户昵称           |        |
| `created_at`| DATETIME    | 否   | `CURRENT_TIMESTAMP` | 用户创建时间       |        |

#### 3. 信息源表 (`sources`)
| 字段名       | 类型         | 必填 | 默认值         | 描述               | 索引   |
|--------------|--------------|------|----------------|--------------------|--------|
| `sourceid`   | INT          | 是   | 自增           | 信息源唯一ID       | 主键   |
| `name`       | VARCHAR(100) | 是   | -              | 信息源名称         |        |
| `created_at` | DATETIME     | 否   | `CURRENT_TIMESTAMP` | 创建时间          |        |
| `updated_at` | DATETIME     | 否   | `ON UPDATE CURRENT_TIMESTAMP` | 最后更新时间    |        |

#### 4. 采集任务表 (`tasks`)
| 字段名       | 类型                   | 必填 | 默认值         | 描述               | 索引   |
|--------------|------------------------|------|----------------|--------------------|--------|
| `taskid`     | INT                   | 是   | 自增           | 任务唯一ID         | 主键   |
| `sourceid`   | INT                   | 是   | -              | 关联的信息源ID     | 外键   |
| `source_type`| ENUM('web','rss','wechat') | 是 | -       | 信息源类型         | 联合索引(`sourceid`, `source_type`) |
| `code`       | TEXT                  | 是   | -              | 采集代码（TS文本） |        |
| `version`    | INT                   | 是   | 1              | 任务版本号         |        |
| `created_at` | DATETIME              | 否   | `CURRENT_TIMESTAMP` | 任务创建时间     |        |

**唯一约束**：  
```sql
UNIQUE KEY `task_version` (`sourceid`, `source_type`, `version`)
```

#### 5. 用户关注关系表 (`user_source`)
| 字段名       | 类型                   | 必填 | 默认值         | 描述               | 索引   |
|--------------|------------------------|------|----------------|--------------------|--------|
| `userid`     | INT                   | 是   | -              | 用户ID             | 主键   |
| `sourceid`   | INT                   | 是   | -              | 信息源ID           | 主键   |
| `frequency`  | VARCHAR(20)           | 是   | -              | Cron表达式（如 `0 */1 * * *`） | |
| `status`     | ENUM('active','inactive') | 否 | 'active'    | 关注状态           |        |
| `created_at` | DATETIME              | 否   | `CURRENT_TIMESTAMP` | 创建时间        |        |
| `updated_at` | DATETIME              | 否   | `ON UPDATE CURRENT_TIMESTAMP` | 状态更新时间 |        |

**外键约束**：  
```sql
FOREIGN KEY (`userid`) REFERENCES `users`(`userid`),
FOREIGN KEY (`sourceid`) REFERENCES `sources`(`sourceid`)
```

### 6. 采集任务执行日志
| 字段名       | 类型                   | 必填 | 默认值         | 描述               | 索引   |
|--------------|------------------------|------|----------------|--------------------|--------|
| `taskid`     | INT                   | 是   | -              | 关联的采集任务ID   | 主键   |
| `status`     | ENUM('active','inactive') | 否 | 'active'    | 任务状态           |        |
| `created_at` | DATETIME              | 否   | `CURRENT_TIMESTAMP` | 创建时间        |        |
| `updated_at` | DATETIME              | 否   | `ON UPDATE CURRENT_TIMESTAMP` | 状态更新时间 |        |

---

### 三、关键设计说明

#### 1. 采集任务版本管理
• **更新逻辑**：  
  当某信息源（如 `sourceid=100`）的 `web` 类型任务需要更新时，插入新记录并递增 `version`（原任务保留历史）。
• **查询最新任务**：  
  ```sql
  SELECT * FROM tasks 
  WHERE sourceid = 100 AND source_type = 'web' 
  ORDER BY version DESC LIMIT 1;
  ```

#### 2. 用户关注状态控制
• **禁用订阅**：将 `user_source.status` 设为 `inactive`，系统将暂停该订阅的采集。
• **状态变更时间**：通过 `updated_at` 字段追踪最后一次状态修改。

#### 3. 数据一致性
• **删除信息源**：需手动删除关联的 `tasks` 和 `user_source` 记录（或通过触发器级联删除）。
• **软删除扩展建议**：可添加 `is_deleted` 字段标记删除，避免物理删除。

---

### 四、索引与性能优化
| 表名         | 索引字段                | 索引类型 | 说明                 |
|--------------|-------------------------|----------|----------------------|
| `tasks`      | (`sourceid`, `source_type`) | 联合索引 | 加速按信息源和类型查询任务 |
| `user_source`| (`sourceid`)            | 单列索引 | 加速按信息源查询订阅用户 |

---

### 五、API 示例
#### 1. 获取用户所有有效订阅
```sql
SELECT s.name, us.frequency 
FROM user_source us
JOIN sources s ON us.sourceid = s.sourceid 
WHERE us.userid = 123 AND us.status = 'active';
```

#### 2. 更新采集任务（插入新版本）
```sql
INSERT INTO tasks (sourceid, source_type, code, version)
VALUES (100, 'web', 'TS代码内容', (SELECT MAX(version)+1 FROM tasks WHERE sourceid=100 AND source_type='web'));
```

---

### 六、待扩展功能
1. **代码变更检测**  
   对 `tasks.code` 计算哈希值，仅当内容变化时插入新版本。

---

### 七、沟通协作说明
1. **术语一致性**  
   • **信息源**：指代 `sources` 表中的记录（如新闻网站、公众号）。  
   • **采集任务**：指代 `tasks` 表中的记录，每个任务绑定到具体的信息源和类型。  
2. **变更流程**  
   • 修改表结构需同步更新本文档并通知团队。  
   • 新增索引需评估性能影响。  
