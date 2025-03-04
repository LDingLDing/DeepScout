-- InfoRadar 数据库结构
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS inforadar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inforadar;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    userid INT PRIMARY KEY AUTO_INCREMENT,
    nickname VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 信息源表
CREATE TABLE IF NOT EXISTS sources (
    sourceid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- 采集任务表
CREATE TABLE IF NOT EXISTS tasks (
    taskid INT PRIMARY KEY AUTO_INCREMENT,
    sourceid INT NOT NULL,
    source_type ENUM('web', 'rss', 'wechat') NOT NULL,
    code TEXT NOT NULL,                   -- 存储TS代码文本
    version INT NOT NULL DEFAULT 1,       -- 版本号（同一信息源+类型下递增）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sourceid) REFERENCES sources(sourceid),
    UNIQUE KEY task_version (sourceid, source_type, version) -- 确保版本唯一性
);

-- 用户关注关系表
CREATE TABLE IF NOT EXISTS user_source (
    userid INT NOT NULL,
    sourceid INT NOT NULL,
    frequency VARCHAR(20) NOT NULL,       -- Cron表达式（如 "0 */1 * * *"）
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP, -- 状态变更时间
    PRIMARY KEY (userid, sourceid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (sourceid) REFERENCES sources(sourceid)
);

-- 任务执行日志表
CREATE TABLE IF NOT EXISTS task_logs (
    logid INT PRIMARY KEY AUTO_INCREMENT,
    taskid INT NOT NULL,
    status ENUM('success', 'failed', 'running'),
    error_message TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    FOREIGN KEY (taskid) REFERENCES tasks(taskid)
);

-- 创建索引
CREATE INDEX idx_tasks_source ON tasks(sourceid, source_type);
CREATE INDEX idx_user_source_source ON user_source(sourceid);
