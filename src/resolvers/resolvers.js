import { categories, tools } from '../data/toolsData.js';

// GraphQL 解析器
export const resolvers = {
  Query: {
    // 分类相关解析器
    categories: () => categories,
    category: (_, { id }) => categories.find(category => category.id === id),
    
    // 工具相关解析器
    tools: () => tools,
    tool: (_, { id }) => tools.find(tool => tool.id === id),
    toolsByCategory: (_, { categoryId }) => tools.filter(tool => tool.categoryId === categoryId),
  },
  
  // 分类的工具关联解析器
  Category: {
    tools: (parent) => tools.filter(tool => tool.categoryId === parent.id),
  },
  
  // 工具的分类关联解析器
  Tool: {
    category: (parent) => categories.find(category => category.id === parent.categoryId),
  },
}; 