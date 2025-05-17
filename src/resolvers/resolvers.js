import { getCategories, getTools, resetCache } from '../data/toolsData.js';

// GraphQL 解析器
export const resolvers = {
  Query: {
    // 分类相关解析器
    categories: async () => {
      return await getCategories();
    },
    category: async (_, { id }) => {
      const categories = await getCategories();
      return categories.find(category => category.id === id);
    },
    
    // 工具相关解析器
    tools: async () => {
      return await getTools();
    },
    tool: async (_, { id }) => {
      const tools = await getTools();
      return tools.find(tool => tool.id === id);
    },
    toolsByCategory: async (_, { categoryId }) => {
      const tools = await getTools();
      return tools.filter(tool => tool.categoryId === categoryId);
    },
  },
  
  // 重置缓存的mutation
  Mutation: {
    resetCache: async () => {
      await resetCache();
      return true;
    },
  },
  
  // 分类的工具关联解析器
  Category: {
    tools: async (parent) => {
      const tools = await getTools();
      return tools.filter(tool => tool.categoryId === parent.id);
    },
  },
  
  // 工具的分类关联解析器
  Tool: {
    category: async (parent) => {
      const categories = await getCategories();
      return categories.find(category => category.id === parent.categoryId);
    },
  },
}; 