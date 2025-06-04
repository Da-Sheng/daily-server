import { databaseService } from '../database/services/DatabaseService.js';

// GraphQL 解析器
export const resolvers = {
  Query: {
    // 分类相关解析器
    categories: async () => {
      return await databaseService.getAllCategories();
    },
    
    category: async (_, { id }) => {
      return await databaseService.getCategoryById(id);
    },
    
    // 工具相关解析器
    tools: async () => {
      return await databaseService.getAllTools();
    },
    
    tool: async (_, { id }) => {
      return await databaseService.getToolById(id);
    },
    
    toolsByCategory: async (_, { categoryId }) => {
      return await databaseService.getToolsByCategory(categoryId);
    },
  },
  
  // 分类的工具关联解析器
  Category: {
    tools: async (parent) => {
      return await databaseService.getToolsByCategory(parent.id);
    },
  },
  
  // 工具的分类关联解析器
  Tool: {
    category: async (parent) => {
      return await databaseService.getCategoryById(parent.category_id);
    },
  },
}; 