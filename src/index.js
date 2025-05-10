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

// 创建 Apollo Server 实例
const createServer = (request) => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // 允许内省（对开发有帮助）
    context: ({ request }) => ({
      headers: request.headers,
      env: request.env,
    }),
  });
};

// 处理 CORS 预检请求
const handleOptions = (request) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
    status: 204,
  });
};

// Worker 入口函数
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // 只处理 /graphql 路径的请求
    const url = new URL(request.url);
    if (url.pathname === '/graphql') {
      // 传递环境变量到请求中
      request.env = env;
      
      // 创建 Apollo Server 并处理请求
      const server = createServer(request);
      return graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request);
    }
    
    // 欢迎页
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(
        JSON.stringify({
          message: '欢迎使用每日工具 GraphQL API 服务',
          graphqlEndpoint: '/graphql',
          documentation: '使用 /graphql 端点发送 GraphQL 查询',
          exampleQueries: [
            '查询所有分类: { categories { id name description } }',
            '查询特定工具: { tool(id: "mortgage-calculator") { name description } }',
            '查询分类及其工具: { category(id: "finance") { name tools { id name } } }'
          ]
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    // 404 响应
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: '未找到请求的资源', 
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
  },
}; 