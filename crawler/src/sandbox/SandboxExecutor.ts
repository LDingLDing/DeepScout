import ivm from 'isolated-vm';
import { DataSource } from 'typeorm';
import { chromium } from 'playwright';
import { Logger } from '../utils/logger';
import { ScriptTaskLog, ScriptTaskLogStatus } from '@entities/script_tasks/script-task-log.entity';

export class SandboxExecutor {
  private dataSource: DataSource;
  private logger: Logger;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.logger = new Logger();
  }

  public async execute(scriptContent: string, taskId: string): Promise<void> {
    const isolate = new ivm.Isolate({ memoryLimit: 128 });
    const context = await isolate.createContext();
    const jail = context.global;
    const logRepository = this.dataSource.getRepository(ScriptTaskLog);

    // 创建日志函数
    const logToDb = async (message: string, level: ScriptTaskLogStatus) => {
      try {
        const safeMessage = String(message);
        
        await logRepository.save({
          taskId, 
          content: safeMessage,
          status: level
        });
        this.logger.info(`Log saved for task ${taskId}: ${safeMessage.substring(0, 50)}...`);
      } catch (error) {
        this.logger.error(`Failed to save log for task ${taskId}:`, error);
      }
    };

    // 注入简单的日志函数
    await jail.set('log', new ivm.Callback(async (message: any) => {
      const safeMessage = String(message);
      await logToDb(safeMessage, ScriptTaskLogStatus.INFO);
    }));

    // 注入简单的错误日志函数
    await jail.set('logError', new ivm.Callback(async (message: any) => {
      const safeMessage = String(message);
      await logToDb(safeMessage, ScriptTaskLogStatus.ERROR);
    }));

    try {
      // 执行脚本，使用简单的日志函数
      const script = await isolate.compileScript(`
        async function main() {
          // 定义控制台对象
          const console = {
            log: function(msg) { log(String(msg)); },
            error: function(msg) { logError(String(msg)); },
            warn: function(msg) { logWarn(String(msg)); }
          };
          
          try {
            ${scriptContent}
          } catch (e) {
            logError('Script execution error: ' + e.message);
          }
        }
        main().catch(e => logError('Async error: ' + e.message));
      `);
      
      await script.run(context);
      this.logger.info(`Script execution completed for task ${taskId}`);
    } catch (error) {
      this.logger.error(`Script execution failed for task ${taskId}:`, error);
      if (error instanceof Error) {
        await logToDb(error.message, ScriptTaskLogStatus.ERROR);
      }
      throw error;
    } finally {
      // 释放资源
      isolate.dispose();
      this.logger.info(`Resources released for task ${taskId}`);
    }
  }
} 