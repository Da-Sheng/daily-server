import { getDBClient } from '../../config/database.js';

/**
 * 分类模型 - CRUD操作
 */
export class CategoryModel {
  constructor() {
    this.client = getDBClient();
  }

  /**
   * 获取所有分类
   */
  async findAll() {
    try {
      const result = await this.client.execute(
        'SELECT * FROM categories ORDER BY name'
      );
      return result.rows;
    } catch (error) {
      console.error('获取所有分类失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取分类
   */
  async findById(id) {
    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM categories WHERE id = ?',
        args: [id]
      });
      return result.rows[0] || null;
    } catch (error) {
      console.error('根据ID获取分类失败:', error);
      throw error;
    }
  }

  /**
   * 创建新分类
   */
  async create(categoryData) {
    try {
      const { id, name, icon, description } = categoryData;
      const result = await this.client.execute({
        sql: `INSERT INTO categories (id, name, icon, description) 
              VALUES (?, ?, ?, ?)`,
        args: [id, name, icon, description]
      });
      
      return await this.findById(id);
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 更新分类
   */
  async update(id, categoryData) {
    try {
      const { name, icon, description } = categoryData;
      await this.client.execute({
        sql: `UPDATE categories 
              SET name = ?, icon = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
              WHERE id = ?`,
        args: [name, icon, description, id]
      });
      
      return await this.findById(id);
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  }

  /**
   * 删除分类
   */
  async delete(id) {
    try {
      const result = await this.client.execute({
        sql: 'DELETE FROM categories WHERE id = ?',
        args: [id]
      });
      
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类下的工具数量
   */
  async getToolsCount(id) {
    try {
      const result = await this.client.execute({
        sql: 'SELECT COUNT(*) as count FROM tools WHERE category_id = ?',
        args: [id]
      });
      
      return result.rows[0]?.count || 0;
    } catch (error) {
      console.error('获取分类工具数量失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const categoryModel = new CategoryModel();
export default categoryModel; 