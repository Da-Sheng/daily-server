/**
 * 每日工具 API 服务
 * 
 * - 提供工具分类和工具项数据的 API
 * - 目前使用静态数据返回
 */

// 工具分类数据
const categories = [
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

// 工具列表数据
const tools = [
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

// 创建标准化的 API 响应格式
function createResponse(data, message = 'Success', code = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
      code
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}

// 处理 OPTIONS 预检请求
function handleOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    },
    status: 204
  });
}

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // 获取请求路径
    const url = new URL(request.url);
    const path = url.pathname;

    // 实现 API 路由
    if (path === '/api/categories') {
      // 获取所有分类
      return createResponse(categories, '获取分类列表成功');
    } else if (path === '/api/tools') {
      // 获取所有工具
      return createResponse(tools, '获取工具列表成功');
    } else if (path.startsWith('/api/categories/') && path.includes('/tools')) {
      // 获取特定分类下的工具
      const categoryId = path.split('/')[3];
      const categoryTools = tools.filter(tool => tool.categoryId === categoryId);
      return createResponse(categoryTools, `获取分类 ${categoryId} 下的工具列表成功`);
    } else if (path.startsWith('/api/categories/')) {
      // 获取特定分类
      const categoryId = path.split('/')[3];
      const category = categories.find(category => category.id === categoryId);
      
      if (category) {
        return createResponse(category, `获取分类成功`);
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `未找到ID为${categoryId}的分类`, 
            code: 404 
          }),
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    } else if (path.startsWith('/api/tools/')) {
      // 获取特定工具
      const toolId = path.split('/')[3];
      const tool = tools.find(tool => tool.id === toolId);
      
      if (tool) {
        return createResponse(tool, `获取工具成功`);
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `未找到ID为${toolId}的工具`, 
            code: 404 
          }),
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    }

    // 返回首页信息
    return new Response(
      JSON.stringify({
        message: '欢迎使用每日工具 API 服务',
        endpoints: [
          '/api/categories - 获取所有分类',
          '/api/categories/:id - 获取指定分类',
          '/api/tools - 获取所有工具',
          '/api/tools/:id - 获取指定工具',
          '/api/categories/:id/tools - 获取指定分类下的工具'
        ]
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  },
}; 