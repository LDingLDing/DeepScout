import axios from 'axios';
import { Task, CrawlResult, ProcessedData } from '../models/task.model';
import { config } from '../config/config';
import { logger } from '../utils/logger';

/**
 * 调用DeepSeek API进行数据结构化处理
 * @param task 任务信息
 * @param result 爬取结果
 * @returns 处理后的结构化数据
 */
export async function processData(task: Task, result: CrawlResult): Promise<ProcessedData> {
  try {
    logger.info(`开始处理任务 [${task.id}] 的数据，URL: ${result.url}`);
    
    // 构建系统提示词
    const systemPrompt = `你是一个专业的数据提取AI助手。你的任务是从网页内容中提取结构化信息。根据以下提取规则，从HTML内容中抽取相关信息，并以JSON格式返回：
${task.extract_rules}

仅返回JSON格式的数据，不要包含任何其他解释或标记。`;

    // 准备用户提示词（简化HTML内容）
    const userPrompt = simplifyHtml(result.html);
    
    // 调用DeepSeek API
    const response = await axios.post(
      `${config.deepseek.baseUrl}/v1/chat/completions`,
      {
        model: 'deepseek-r1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseek.apiKey}`
        }
      }
    );
    
    // 解析API响应
    const aiResponse = response.data.choices[0].message.content;
    const extractedData = JSON.parse(aiResponse);
    
    logger.info(`任务 [${task.id}] 数据处理完成`);
    
    // 返回处理后的数据
    return {
      taskId: task.id,
      sourceUrl: result.url,
      timestamp: new Date(),
      data: extractedData,
      raw: result
    };
  } catch (error) {
    logger.error(`处理任务 [${task.id}] 数据失败:`, error);
    
    // 返回基本信息和错误
    return {
      taskId: task.id,
      sourceUrl: result.url,
      timestamp: new Date(),
      data: { error: '数据处理失败', message: error.message },
      raw: result
    };
  }
}

/**
 * 简化HTML内容，减少不必要的标签和内容
 * @param html 原始HTML
 * @returns 简化后的HTML
 */
function simplifyHtml(html: string = ''): string {
  if (!html) return '';
  
  try {
    // 简单的HTML清理，去除脚本和样式
    let simplified = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '') // 删除注释
      .replace(/\s+/g, ' '); // 压缩空白字符
    
    // 如果内容太长，截断
    const maxLength = 12000; // DeepSeek API的上下文限制
    if (simplified.length > maxLength) {
      simplified = simplified.substring(0, maxLength) + '...';
    }
    
    return simplified;
  } catch (error) {
    logger.error('简化HTML失败:', error);
    return html.substring(0, 12000); // 简单截断
  }
}

export default { processData };
