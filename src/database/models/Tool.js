import { getDBClient } from '../../config/database.js';

/**
 * 工具模型 - CRUD操作
 */
export class ToolModel {
  constructor() {
    this.client = getDBClient();
  }

  /**
   * 获取所有工具
   */
  async findAll() {
    try {
      const result = await this.client.execute(`
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.description as category_description
        FROM tools t
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.name
      `);
      return result.rows;
    } catch (error) {
      console.error('获取所有工具失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取工具
   */
  async findById(id) {
    try {
      const result = await this.client.execute({
        sql: `
          SELECT t.*, c.name as category_name, c.icon as category_icon, c.description as category_description
          FROM tools t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.id = ?
        `,
        args: [id]
      });
      return result.rows[0] || null;
    } catch (error) {
      console.error('根据ID获取工具失败:', error);
      throw error;
    }
  }

  /**
   * 根据分类ID获取工具
   */
  async findByCategory(categoryId) {
    try {
      const result = await this.client.execute({
        sql: `
          SELECT t.*, c.name as category_name, c.icon as category_icon, c.description as category_description
          FROM tools t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.category_id = ?
          ORDER BY t.name
        `,
        args: [categoryId]
      });
      return result.rows;
    } catch (error) {
      console.error('根据分类ID获取工具失败:', error);
      throw error;
    }
  }

  /**
   * 创建新工具
   */
  async create(toolData) {
    try {
      const { id, name, description, icon, path, category_id } = toolData;
      await this.client.execute({
        sql: `INSERT INTO tools (id, name, description, icon, path, category_id) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, name, description, icon, path, category_id]
      });
      
      return await this.findById(id);
    } catch (error) {
      console.error('创建工具失败:', error);
      throw error;
    }
  }

  /**
   * 更新工具
   */
  async update(id, toolData) {
    try {
      const { name, description, icon, path, category_id } = toolData;
      await this.client.execute({
        sql: `UPDATE tools 
              SET name = ?, description = ?, icon = ?, path = ?, category_id = ?, 
                  updated_at = CURRENT_TIMESTAMP 
              WHERE id = ?`,
        args: [name, description, icon, path, category_id, id]
      });
      
      return await this.findById(id);
    } catch (error) {
      console.error('更新工具失败:', error);
      throw error;
    }
  }

  /**
   * 删除工具
   */
  async delete(id) {
    try {
      const result = await this.client.execute({
        sql: 'DELETE FROM tools WHERE id = ?',
        args: [id]
      });
      
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('删除工具失败:', error);
      throw error;
    }
  }

  /**
   * 搜索工具
   */
  async search(keyword) {
    try {
      const result = await this.client.execute({
        sql: `
          SELECT t.*, c.name as category_name, c.icon as category_icon, c.description as category_description
          FROM tools t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE t.name LIKE ? OR t.description LIKE ?
          ORDER BY t.name
        `,
        args: [`%${keyword}%`, `%${keyword}%`]
      });
      return result.rows;
    } catch (error) {
      console.error('搜索工具失败:', error);
      throw error;
    }
  }

  /**
   * 获取工具统计信息
   */
  async getStats() {
    try {
      const totalResult = await this.client.execute('SELECT COUNT(*) as total FROM tools');
      const categoryResult = await this.client.execute(`
        SELECT c.name, COUNT(t.id) as count
        FROM categories c
        LEFT JOIN tools t ON c.id = t.category_id
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `);
      
      return {
        total: totalResult.rows[0]?.total || 0,
        byCategory: categoryResult.rows
      };
    } catch (error) {
      console.error('获取工具统计信息失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const toolModel = new ToolModel();
export default toolModel; 