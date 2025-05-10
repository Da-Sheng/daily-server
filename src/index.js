/**
 * 每日工具 GraphQL API 服务
 * 
 * - 提供工具分类和工具项数据的 GraphQL API
 * - 部署在 Cloudflare Workers 上
 */

import { ApolloServer } from 'apollo-server-cloudflare';
import { graphqlCloudflare } from 'apollo-server-cloudflare/dist/cloudflareApollo';
import { typeDefs } from './types/schema.js';
import { resolvers } from './resolvers/resolvers.js';

// 创建 Apollo Server 实例并启动
const createServer = async (request) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // 允许内省（对开发有帮助）
    context: ({ request }) => ({
      headers: request.headers,
      env: request.env,
    }),
  });
  
  await server.start();
  return server;
};

// 添加CORS头到响应
const addCorsHeaders = (response) => {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  headers.set('Access-Control-Max-Age', '86400');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

// 处理 CORS 预检请求
const handleOptions = (request) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, Accept',
      'Access-Control-Max-Age': '86400',
    },
    status: 204,
  });
};

// 判断是否是GraphQL请求路径
const isGraphQLPath = (pathname) => {
  return pathname === '/graphql' || pathname === '/api/graphql';
};

// Worker 入口函数
export default {
  async fetch(request, env, ctx) {
    try {
      // 处理 CORS 预检请求
      if (request.method === 'OPTIONS') {
        return handleOptions(request);
      }
      
      // 获取请求路径
      const url = new URL(request.url);
      
      // 处理GraphQL请求
      if (isGraphQLPath(url.pathname)) {
        // 传递环境变量到请求中
        request.env = env;
        
        // 创建并启动 Apollo Server
        const server = await createServer(request);
        const response = await graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request);
        
        // 添加CORS头
        return addCorsHeaders(response);
      }
      
      // 欢迎页
      if (url.pathname === '/' || url.pathname === '') {
        const response = new Response(
          JSON.stringify({
            message: '欢迎使用每日工具 GraphQL API 服务',
            graphqlEndpoint: '/graphql 或 /api/graphql',
            documentation: '使用 /graphql 或 /api/graphql 端点发送 GraphQL 查询',
            exampleQueries: [
              '查询所有分类: { categories { id name description } }',
              '查询特定工具: { tool(id: "mortgage-calculator") { name description } }',
              '查询分类及其工具: { category(id: "finance") { name tools { id name } } }'
            ]
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return addCorsHeaders(response);
      }
      
      // 404 响应
      const response = new Response(
        JSON.stringify({ 
          success: false, 
          message: '未找到请求的资源', 
          code: 404 
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return addCorsHeaders(response);
    } catch (error) {
      // 错误处理
      console.error('服务器错误:', error);
      const response = new Response(
        JSON.stringify({ 
          success: false, 
          message: '服务器内部错误', 
          error: error.message,
          code: 500 
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return addCorsHeaders(response);
    }
  },
}; 