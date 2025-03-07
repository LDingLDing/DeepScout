### 数据库设计文档
---

### 一、概述
本系统用于管理话题知识库及其采集任务，核心功能包括：
1. **话题管理**：支持创建和管理话题，每个话题可以有多个标签。
2. **知识库版本化**：话题知识库内容按版本存储，保留所有历史记录。
3. **采集脚本版本化**：采集脚本按版本存储，更新时保留历史记录。
4. **用户订阅管理**：用户可订阅感兴趣的话题。
5. **双端用户体系**：分别维护前台用户（user）和后台用户（staff_user）。

---

### 二、表结构设计

#### 1. 用户表 (`user`)
| 字段名      | 类型         | 必填 | 默认值 | 描述       | 索引 |
|------------|--------------|------|--------|------------|------|
| `id`       | INT         | 是   | 自增   | 用户唯一ID | 主键 |
| `email`    | VARCHAR(100)| 是   | -      | 用户邮箱   | 唯一 |
| `password` | VARCHAR(255)| 是   | -      | 密码哈希   |      |

#### 2. 后台用户表 (`staff_user`)
| 字段名      | 类型         | 必填 | 默认值 | 描述       | 索引 |
|------------|--------------|------|--------|------------|------|
| `id`       | INT         | 是   | 自增   | 用户唯一ID | 主键 |
| `email`    | VARCHAR(100)| 是   | -      | 用户邮箱   | 唯一 |
| `name`     | VARCHAR(50) | 是   | -      | 用户名称   |      |
| `password` | VARCHAR(255)| 是   | -      | 密码哈希   |      |
| `role`     | VARCHAR(20) | 是   | -      | 用户角色   |      |

#### 3. 话题表 (`topic`)
| 字段名   | 类型         | 必填 | 默认值 | 描述       | 索引 |
|---------|--------------|------|--------|------------|------|
| `id`    | INT         | 是   | 自增   | 话题唯一ID | 主键 |
| `name`  | VARCHAR(100)| 是   | -      | 话题名称   | 唯一 |
| `desc`  | TEXT        | 否   | -      | 话题描述   |      |
| `tagids`| VARCHAR(255)| 否   | -      | 标签ID列表 |      |

#### 4. 话题标签表 (`topic_tag`)
| 字段名 | 类型         | 必填 | 默认值 | 描述       | 索引 |
|--------|--------------|------|--------|------------|------|
| `id`   | INT         | 是   | 自增   | 标签唯一ID | 主键 |
| `name` | VARCHAR(50) | 是   | -      | 标签名称   | 唯一 |

#### 5. 话题订阅表 (`subscrip_topic`)
| 字段名    | 类型 | 必填 | 默认值 | 描述       | 索引 |
|----------|------|------|--------|------------|------|
| `id`     | INT  | 是   | 自增   | 订阅唯一ID | 主键 |
| `user_id`| INT  | 是   | -      | 用户ID     | 外键 |
| `topic_id`| INT | 是   | -      | 话题ID     | 外键 |

#### 6. 话题知识库表 (`topic_knowledge`)
| 字段名            | 类型      | 必填 | 默认值 | 描述           | 索引 |
|------------------|-----------|------|--------|----------------|------|
| `id`             | INT       | 是   | 自增   | 知识库条目ID   | 主键 |
| `topic_id`       | INT       | 是   | -      | 话题ID         | 外键 |
| `content`        | TEXT      | 是   | -      | 知识库内容     |      |
| `created_at`     | DATETIME  | 是   | NOW()  | 创建时间       |      |
| `created_by_taskid`| INT     | 是   | -      | 创建任务ID     | 外键 |

#### 7. 采集脚本文件表 (`script_file`)
| 字段名      | 类型         | 必填 | 默认值 | 描述         | 索引 |
|------------|--------------|------|--------|--------------|------|
| `id`       | INT         | 是   | 自增   | 脚本文件ID   | 主键 |
| `file_name`| VARCHAR(255)| 是   | -      | 文件名       |      |
| `content`  | TEXT        | 是   | -      | 脚本内容     |      |
| `created_at`| DATETIME   | 是   | NOW()  | 创建时间     |      |

#### 8. 采集任务表 (`script_task`)
| 字段名      | 类型         | 必填 | 默认值 | 描述         | 索引 |
|------------|--------------|------|--------|--------------|------|
| `id`       | INT         | 是   | 自增   | 任务ID       | 主键 |
| `script_id`| INT         | 是   | -      | 脚本文件ID   | 外键 |
| `status`   | VARCHAR(20) | 是   | -      | 任务状态     |      |
| `created_at`| DATETIME   | 是   | NOW()  | 创建时间     |      |
| `updated_at`| DATETIME   | 是   | NOW()  | 更新时间     |      |

#### 9. 采集任务日志表 (`script_task_log`)
| 字段名      | 类型         | 必填 | 默认值 | 描述         | 索引 |
|------------|--------------|------|--------|--------------|------|
| `id`       | INT         | 是   | 自增   | 日志ID       | 主键 |
| `task_id`  | INT         | 是   | -      | 任务ID       | 外键 |
| `content`  | TEXT        | 是   | -      | 日志内容     |      |
| `type`     | VARCHAR(20) | 是   | -      | 日志类型     |      |
| `created_at`| DATETIME   | 是   | NOW()  | 创建时间     |      |

---

### 三、关键设计说明

#### 1. 版本化管理
- **知识库版本化**：每次更新知识库内容时，创建新记录而不是修改现有记录。
- **脚本版本化**：每次更新采集脚本时，创建新记录保留历史版本。

#### 2. 外键约束
```sql
ALTER TABLE subscrip_topic
    ADD FOREIGN KEY (user_id) REFERENCES user(id),
    ADD FOREIGN KEY (topic_id) REFERENCES topic(id);

ALTER TABLE topic_knowledge
    ADD FOREIGN KEY (topic_id) REFERENCES topic(id),
    ADD FOREIGN KEY (created_by_taskid) REFERENCES script_task(id);

ALTER TABLE script_task
    ADD FOREIGN KEY (script_id) REFERENCES script_file(id);

ALTER TABLE script_task_log
    ADD FOREIGN KEY (task_id) REFERENCES script_task(id);
```

#### 3. 索引优化
```sql
CREATE INDEX idx_topic_knowledge_topic ON topic_knowledge(topic_id);
CREATE INDEX idx_script_tasks_status ON script_task(status);
CREATE INDEX idx_task_logs_task ON script_task_log(task_id);
CREATE INDEX idx_subscrip_topic_user ON subscrip_topic(user_id);
```

---

### 四、查询示例

#### 1. 获取用户订阅的所有话题
```sql
SELECT t.* 
FROM topic t
JOIN subscrip_topic st ON t.id = st.topic_id
WHERE st.user_id = ?;
```

#### 2. 获取话题的最新知识库内容
```sql
SELECT * 
FROM topic_knowledge 
WHERE topic_id = ? 
ORDER BY created_at DESC 
LIMIT 1;
```

#### 3. 获取采集任务的所有日志
```sql
SELECT * 
FROM script_task_log 
WHERE task_id = ? 
ORDER BY created_at DESC;
```

---

### 五、注意事项
1. 所有时间字段使用 DATETIME 类型，并设置默认值为当前时间。
2. 知识库和脚本文件采用追加式更新，保留所有历史版本。
3. 任务状态变更需要同步更新 updated_at 字段。
4. 话题标签使用 tagids 字段存储，格式为逗号分隔的ID列表。
5. 用户密码需要使用安全的哈希算法存储。
6. 建议为常用查询字段添加适当的索引以提升性能。
