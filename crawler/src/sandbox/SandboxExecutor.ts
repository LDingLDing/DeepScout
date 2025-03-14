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

  public async execute(scriptContent: string, taskId: number): Promise<void> {
    const isolate = new ivm.Isolate({ memoryLimit: 128 });
    const context = await isolate.createContext();
    const jail = context.global;
    const logRepository = this.dataSource.getRepository(ScriptTaskLog);

    // 创建日志函数
    async function logMessage(message: string, level: ScriptTaskLogStatus) {
      await logRepository.save({
        taskId,
        content: message,
        status: level
      });
    }

    // 注入全局函数
    const log = new ivm.Callback(async (message: string, level: string = 'INFO') => {
      await logMessage(message, level as ScriptTaskLogStatus);
    });

    await jail.set('log', log);

    // 注入浏览器初始化函数
    const initBrowser = new ivm.Callback(async () => {
      const browser = await chromium.launch();
      const browserContext = await browser.newContext();
      const page = await browserContext.newPage();
      return { browser, context: browserContext, page };
    });

    await jail.set('initBrowser', initBrowser);

    // 注入控制台函数
    await jail.set('console', {
      log: new ivm.Callback(async (message: string) => {
        await logMessage(message, ScriptTaskLogStatus.INFO);
      }),
      error: new ivm.Callback(async (message: string) => {
        await logMessage(message, ScriptTaskLogStatus.ERROR);
      })
    });

    try {
      // 执行脚本
      const script = await isolate.compileScript(`
        async function main() {
          ${scriptContent}
        }
        main();
      `);
      
      await script.run(context);
    } catch (error) {
      if (error instanceof Error) {
        await logMessage(error.message, ScriptTaskLogStatus.ERROR);
      }
      throw error;
    } finally {
      // 释放资源
      isolate.dispose();
    }
  }
} 