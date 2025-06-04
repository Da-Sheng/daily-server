import { categoryModel } from '../models/Category.js';
import { toolModel } from '../models/Tool.js';
import { initializeDatabase } from '../migrations/migrationManager.js';
import { testConnection } from '../../config/database.js';

/**
 * 数据库服务类
 * 整合所有数据库操作，提供统一的服务接口
 */
export class DatabaseService {
  constructor() {
    this.categoryModel = categoryModel;
    this.toolModel = toolModel;
  }

  /**
   * 初始化数据库服务
   */
  async initialize() {
    try {
      console.log('开始初始化数据库服务...');
      
      // 1. 测试数据库连接
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('数据库连接失败');
      }
      
      // 2. 初始化数据库结构和数据
      await initializeDatabase();
      
      console.log('✓ 数据库服务初始化完成');
      return true;
    } catch (error) {
      console.error('✗ 数据库服务初始化失败:', error);
      throw error;
    }
  }

  // ===== 分类相关操作 =====
  
  /**
   * 获取所有分类
   */
  async getAllCategories() {
    return await this.categoryModel.findAll();
  }

  /**
   * 根据ID获取分类
   */
  async getCategoryById(id) {
    return await this.categoryModel.findById(id);
  }

  /**
   * 创建分类
   */
  async createCategory(categoryData) {
    return await this.categoryModel.create(categoryData);
  }

  /**
   * 更新分类
   */
  async updateCategory(id, categoryData) {
    return await this.categoryModel.update(id, categoryData);
  }

  /**
   * 删除分类
   */
  async deleteCategory(id) {
    return await this.categoryModel.delete(id);
  }

  // ===== 工具相关操作 =====
  
  /**
   * 获取所有工具
   */
  async getAllTools() {
    return await this.toolModel.findAll();
  }

  /**
   * 根据ID获取工具
   */
  async getToolById(id) {
    return await this.toolModel.findById(id);
  }

  /**
   * 根据分类ID获取工具
   */
  async getToolsByCategory(categoryId) {
    return await this.toolModel.findByCategory(categoryId);
  }

  /**
   * 创建工具
   */
  async createTool(toolData) {
    return await this.toolModel.create(toolData);
  }

  /**
   * 更新工具
   */
  async updateTool(id, toolData) {
    return await this.toolModel.update(id, toolData);
  }

  /**
   * 删除工具
   */
  async deleteTool(id) {
    return await this.toolModel.delete(id);
  }

  /**
   * 搜索工具
   */
  async searchTools(keyword) {
    return await this.toolModel.search(keyword);
  }

  // ===== 统计和分析 =====
  
  /**
   * 获取数据库统计信息
   */
  async getStats() {
    try {
      const [categories, toolStats] = await Promise.all([
        this.categoryModel.findAll(),
        this.toolModel.getStats()
      ]);

      return {
        categories: {
          total: categories.length,
          list: categories
        },
        tools: toolStats
      };
    } catch (error) {
      console.error('获取数据库统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取完整的分类-工具树结构
   */
  async getCategoryTree() {
    try {
      const categories = await this.categoryModel.findAll();
      const categoryTree = [];

      for (const category of categories) {
        const tools = await this.toolModel.findByCategory(category.id);
        categoryTree.push({
          ...category,
          tools: tools
        });
      }

      return categoryTree;
    } catch (error) {
      console.error('获取分类树结构失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const databaseService = new DatabaseService();
export default databaseService; 