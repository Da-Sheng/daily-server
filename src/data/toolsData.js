/**
 * 工具和分类数据 - 通过OpenAI API动态生成
 */
import fetch from 'node-fetch';

// OpenAI API配置
const OPENAI_API_KEY = 'sk-FJjismr3hW3LOju6GcWu1OdtWnhmuHNDyS6oFNbc35Ut4qWw';
const OPENAI_API_BASE_URL = 'https://api.chatanywhere.tech/v1/chat/completions';

// 调用OpenAI API的函数
async function callOpenAI(prompt) {
  try {
    console.log('正在调用OpenAI API...');
    const response = await fetch(OPENAI_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个帮助生成工具和分类数据的AI助手。请根据要求提供格式化的JSON数据。不要使用Markdown格式，直接返回纯JSON。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API请求失败: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API响应成功:', data.choices[0].message.role);
    try {
      let content = data.choices[0].message.content;
      
      // 清理Markdown格式标记
      content = content.replace(/```json\s*/g, '');
      content = content.replace(/```\s*$/g, '');
      content = content.trim();
      
      console.log('清理后的JSON内容:', content);
      
      const parsedData = JSON.parse(content);
      console.log('数据解析成功，返回条目数量:', parsedData.length);
      return parsedData;
    } catch (parseError) {
      console.error('解析OpenAI返回的JSON数据失败:', parseError);
      console.log('原始内容:', data.choices[0].message.content);
      return null;
    }
  } catch (error) {
    console.error('调用OpenAI API时出错:', error);
    // 如果API调用失败，返回默认数据
    return null;
  }
}

// 缓存机制 - 避免频繁调用API
const cache = {
  categories: null,
  tools: null,
  lastFetched: 0,
  expiryTime: 24 * 60 * 60 * 1000 // 24小时缓存
};

// 重置缓存
export async function resetCache() {
  console.log('手动重置缓存');
  cache.categories = null;
  cache.tools = null;
  cache.lastFetched = 0;
  return true;
}

// 获取分类数据
export async function getCategories() {
  // 检查缓存是否有效
  const now = Date.now();
  if (cache.categories && now - cache.lastFetched < cache.expiryTime) {
    console.log('使用缓存的分类数据');
    return cache.categories;
  }

  console.log('缓存过期或不存在，重新获取分类数据');
  
  const prompt = `
    请生成工具分类数据，格式如下:
    [
      {
        id: 'finance',
        name: '金融工具',
        icon: 'bank',
        description: '各种金融相关的计算工具',
      },
      {
        id: 'converter',
        name: '转换工具',
        icon: 'swap',
        description: '各种单位、格式转换工具',
      }
    ]

    请生成4个不同类别的工具分类，包含id, name, icon和description字段。
    icon应为简短的英文名称，如bank、swap、code、calendar等。
  `;

  try {
    const data = await callOpenAI(prompt);
    if (data) {
      console.log('成功获取AI生成的分类数据');
      cache.categories = data;
      cache.lastFetched = now;
      return data;
    }
  } catch (error) {
    console.error('获取分类数据时出错:', error);
  }

  // 如果API调用失败，返回默认数据
  console.log('使用默认分类数据');
  return defaultCategories;
}

// 获取工具数据
export async function getTools() {
  // 检查缓存是否有效
  const now = Date.now();
  if (cache.tools && now - cache.lastFetched < cache.expiryTime) {
    console.log('使用缓存的工具数据');
    return cache.tools;
  }

  console.log('缓存过期或不存在，重新获取工具数据');

  // 首先确保我们有分类数据
  const categories = await getCategories();
  const categoryIds = categories.map(cat => cat.id);
  console.log('使用的分类IDs:', categoryIds);

  const prompt = `
    生成工具数据。每个分类至少生成1个工具。返回格式为JSON数组，每个工具包含id、name、description、icon、path和categoryId字段。
    
    需要用到的分类ID有: ${JSON.stringify(categoryIds)}
    
    示例格式:
    [
      {
        "id": "mortgage-calculator",
        "name": "房贷计算器",
        "description": "计算房贷月供、总利息等信息",
        "icon": "home",
        "path": "/tools/mortgage-calculator",
        "categoryId": "finance"
      },
      {
        "id": "loan-calculator",
        "name": "贷款计算器",
        "description": "计算各类贷款的还款信息",
        "icon": "dollar",
        "path": "/tools/loan-calculator",
        "categoryId": "finance"
      }
    ]

    请确保每个工具的categoryId与上面提供的分类ID列表中的值匹配。
    icon应为简短的英文名称。
    path统一格式为"/tools/"加上工具的id。
    不要添加任何额外的说明或者markdown标记，直接返回JSON数组。
  `;

  try {
    const data = await callOpenAI(prompt);
    if (data) {
      console.log('成功获取AI生成的工具数据');
      cache.tools = data;
      cache.lastFetched = now;
      return data;
    }
  } catch (error) {
    console.error('获取工具数据时出错:', error);
  }

  // 如果API调用失败，返回默认数据
  console.log('使用默认工具数据');
  return defaultTools;
}

// 默认分类数据（API调用失败时使用）
const defaultCategories = [
  {
    id: 'finance',
    name: '金融工具',
    icon: 'bank',
    description: '各种金融相关的计算工具',
  },
  {
    id: 'converter',
    name: '转换工具',
    icon: 'swap',
    description: '各种单位、格式转换工具',
  },
  {
    id: 'generator',
    name: '生成器',
    icon: 'code',
    description: '各种内容生成工具',
  },
  {
    id: 'daily',
    name: '日常工具',
    icon: 'calendar',
    description: '日常生活常用工具',
  },
];

// 默认工具数据（API调用失败时使用）
const defaultTools = [
  {
    id: 'mortgage-calculator',
    name: '房贷计算器',
    description: '计算房贷月供、总利息等信息',
    icon: 'home',
    path: '/tools/mortgage-calculator',
    categoryId: 'finance',
  },
  {
    id: 'loan-calculator',
    name: '贷款计算器',
    description: '计算各类贷款的还款信息',
    icon: 'dollar',
    path: '/tools/loan-calculator',
    categoryId: 'finance',
  },
  {
    id: 'unit-converter',
    name: '单位转换器',
    description: '各种单位间的转换工具',
    icon: 'calculator',
    path: '/tools/unit-converter',
    categoryId: 'converter',
  },
  {
    id: 'date-calculator',
    name: '日期计算器',
    description: '计算日期差值、工作日等',
    icon: 'calendar',
    path: '/tools/date-calculator',
    categoryId: 'daily',
  },
  {
    id: 'random-generator',
    name: '随机生成器',
    description: '生成随机密码、UUID等',
    icon: 'key',
    path: '/tools/random-generator',
    categoryId: 'generator',
  },
];

// 导出原始静态变量但不使用它们
export const categories = [...defaultCategories];
export const tools = [...defaultTools]; 