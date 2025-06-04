import { databaseService } from '../database/service/database.js';

// GraphQL 解析器
const resolvers = {
  Query: {
    // 分类相关解析器
    categories: async (_, __, { cloudflareEnv }) => {
      return await databaseService.getAllCategories(cloudflareEnv);
    },
    
    category: async (_, { id }, { cloudflareEnv }) => {
      return await databaseService.getCategoryById(id, cloudflareEnv);
    },
    
    // 工具相关解析器
    tools: async (_, __, { cloudflareEnv }) => {
      return await databaseService.getAllTools(cloudflareEnv);
    },
    
    tool: async (_, { id }, { cloudflareEnv }) => {
      return await databaseService.getToolById(id, cloudflareEnv);
    },
    
    toolsByCategory: async (_, { categoryId }, { cloudflareEnv }) => {
      return await databaseService.getToolsByCategory(categoryId, cloudflareEnv);
    },

    // 票务查询
    tickets: async (_, __, { cloudflareEnv }) => {
      return await databaseService.getAllTickets(cloudflareEnv);
    },

    ticket: async (_, { uni256 }, { cloudflareEnv }) => {
      return await databaseService.getTicketByUni256(uni256, cloudflareEnv);
    },

    ticketById: async (_, { id }, { cloudflareEnv }) => {
      return await databaseService.getTicketById(id, cloudflareEnv);
    },

    ticketsByFilter: async (_, { filter }, { cloudflareEnv }) => {
      return await databaseService.getTicketsByFilter(filter || {}, cloudflareEnv);
    },

    availableTickets: async (_, __, { cloudflareEnv }) => {
      return await databaseService.getAvailableTickets(cloudflareEnv);
    },

    ticketStats: async (_, __, { cloudflareEnv }) => {
      return await databaseService.getTicketStats(cloudflareEnv);
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
    // 映射数据库字段名到GraphQL字段名
    categoryId: (parent) => {
      return parent.category_id;
    },
    
    category: async (parent, _, { cloudflareEnv }) => {
      return await databaseService.getCategoryById(parent.category_id, cloudflareEnv);
    },
  },

  Ticket: {
    // 数据库字段到GraphQL字段的映射
    totalQuantity: (parent) => parent.total_quantity,
    availableQuantity: (parent) => parent.available_quantity,
    soldQuantity: (parent) => parent.sold_quantity,
    startTime: (parent) => parent.start_time,
    endTime: (parent) => parent.end_time,
    saleStartTime: (parent) => parent.sale_start_time,
    saleEndTime: (parent) => parent.sale_end_time,
    isReleased: (parent) => Boolean(parent.is_released),
    isExpired: (parent) => Boolean(parent.is_expired),
    isEnabled: (parent) => Boolean(parent.is_enabled),
    isSoldOut: (parent) => Boolean(parent.is_sold_out),
    contactInfo: (parent) => parent.contact_info,
    imageUrl: (parent) => parent.image_url,
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
  },

  TicketStats: {
    // 统计数据字段映射
    totalTickets: (parent) => parent.total_tickets,
    releasedTickets: (parent) => parent.released_tickets,
    soldOutTickets: (parent) => parent.sold_out_tickets,
    expiredTickets: (parent) => parent.expired_tickets,
    totalQuantity: (parent) => parent.total_quantity,
    totalSold: (parent) => parent.total_sold,
    totalAvailable: (parent) => parent.total_available,
  },

  Mutation: {
    // 票务变更操作
    createTicket: async (_, { input }, { cloudflareEnv }) => {
      try {
        return await databaseService.createTicket(input, cloudflareEnv);
      } catch (error) {
        throw new Error(`创建票务失败: ${error.message}`);
      }
    },

    updateTicket: async (_, { uni256, input }, { cloudflareEnv }) => {
      try {
        return await databaseService.updateTicket(uni256, input, cloudflareEnv);
      } catch (error) {
        throw new Error(`更新票务失败: ${error.message}`);
      }
    },

    deleteTicket: async (_, { uni256 }, { cloudflareEnv }) => {
      try {
        return await databaseService.deleteTicket(uni256, cloudflareEnv);
      } catch (error) {
        throw new Error(`删除票务失败: ${error.message}`);
      }
    },

    purchaseTicket: async (_, { uni256, quantity = 1 }, { cloudflareEnv }) => {
      try {
        return await databaseService.purchaseTicket(uni256, quantity, cloudflareEnv);
      } catch (error) {
        throw new Error(`购买票务失败: ${error.message}`);
      }
    },
  },
};

export default resolvers; 