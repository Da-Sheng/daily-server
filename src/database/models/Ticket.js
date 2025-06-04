import { getDBClient } from '../../config/database.js';

/**
 * 票务数据模型
 */
export class TicketModel {
  constructor() {
    this.tableName = 'tickets';
  }

  /**
   * 获取数据库客户端
   */
  getClient(cloudflareEnv = null) {
    return getDBClient(cloudflareEnv);
  }

  /**
   * 生成256位唯一标识符
   */
  generateUni256() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 256; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 创建票务
   */
  async create(ticketData, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    
    // 生成唯一标识符
    const uni256 = ticketData.uni256 || this.generateUni256();
    
    // 设置默认值，处理GraphQL camelCase到数据库snake_case的映射
    const data = {
      uni256,
      title: ticketData.title,
      description: ticketData.description || null,
      venue: ticketData.venue || null,
      category: ticketData.category || 'general',
      price: ticketData.price,
      total_quantity: ticketData.totalQuantity || ticketData.total_quantity,
      available_quantity: ticketData.availableQuantity || ticketData.available_quantity || ticketData.totalQuantity || ticketData.total_quantity,
      sold_quantity: ticketData.soldQuantity || ticketData.sold_quantity || 0,
      start_time: ticketData.startTime || ticketData.start_time,
      end_time: ticketData.endTime || ticketData.end_time || null,
      sale_start_time: ticketData.saleStartTime || ticketData.sale_start_time || null,
      sale_end_time: ticketData.saleEndTime || ticketData.sale_end_time || null,
      is_released: ticketData.isReleased !== undefined ? (ticketData.isReleased ? 1 : 0) : (ticketData.is_released ? 1 : 0),
      is_expired: ticketData.isExpired !== undefined ? (ticketData.isExpired ? 1 : 0) : (ticketData.is_expired ? 1 : 0),
      is_enabled: ticketData.isEnabled !== undefined ? (ticketData.isEnabled ? 1 : 0) : (ticketData.is_enabled !== false ? 1 : 0),
      is_sold_out: ((ticketData.availableQuantity || ticketData.available_quantity || ticketData.totalQuantity || ticketData.total_quantity) <= 0) ? 1 : 0,
      organizer: ticketData.organizer || null,
      contact_info: ticketData.contactInfo || ticketData.contact_info || null,
      terms: ticketData.terms || null,
      image_url: ticketData.imageUrl || ticketData.image_url || null
    };

    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `
      INSERT INTO ${this.tableName} (${fields})
      VALUES (${placeholders})
    `;

    const result = await client.execute({ sql, args: values });
    return await this.findByUni256(uni256, cloudflareEnv);
  }

  /**
   * 根据uni256查找票务
   */
  async findByUni256(uni256, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    const sql = `SELECT * FROM ${this.tableName} WHERE uni256 LIKE ?`;
    const result = await client.execute({ sql, args: [`%${uni256}%`] });
    return result.rows[0] || null;
  }

  /**
   * 根据ID查找票务
   */
  async findById(id, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const result = await client.execute({ sql, args: [id] });
    return result.rows[0] || null;
  }

  /**
   * 获取所有票务
   */
  async findAll(cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    const sql = `
      SELECT * FROM ${this.tableName} 
      ORDER BY created_at DESC
    `;
    const result = await client.execute(sql);
    return result.rows;
  }

  /**
   * 按条件查询票务
   */
  async findByConditions(conditions = {}, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    let sql = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    const args = [];

    // 构建查询条件
    if (conditions.category) {
      sql += ` AND category = ?`;
      args.push(conditions.category);
    }

    if (conditions.is_released !== undefined) {
      sql += ` AND is_released = ?`;
      args.push(conditions.is_released ? 1 : 0);
    }

    if (conditions.is_enabled !== undefined) {
      sql += ` AND is_enabled = ?`;
      args.push(conditions.is_enabled ? 1 : 0);
    }

    if (conditions.is_expired !== undefined) {
      sql += ` AND is_expired = ?`;
      args.push(conditions.is_expired ? 1 : 0);
    }

    if (conditions.is_sold_out !== undefined) {
      sql += ` AND is_sold_out = ?`;
      args.push(conditions.is_sold_out ? 1 : 0);
    }

    if (conditions.available_only) {
      sql += ` AND available_quantity > 0 AND is_enabled = 1 AND is_released = 1`;
    }

    // 时间范围查询
    if (conditions.start_time_from) {
      sql += ` AND start_time >= ?`;
      args.push(conditions.start_time_from);
    }

    if (conditions.start_time_to) {
      sql += ` AND start_time <= ?`;
      args.push(conditions.start_time_to);
    }

    // 关键词搜索
    if (conditions.keyword) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR venue LIKE ?)`;
      const keyword = `%${conditions.keyword}%`;
      args.push(keyword, keyword, keyword);
    }

    sql += ` ORDER BY created_at DESC`;

    // 分页
    if (conditions.limit) {
      sql += ` LIMIT ?`;
      args.push(conditions.limit);
      
      if (conditions.offset) {
        sql += ` OFFSET ?`;
        args.push(conditions.offset);
      }
    }

    const result = await client.execute({ sql, args });
    return result.rows;
  }

  /**
   * 购买票务（减少库存）
   */
  async purchaseTicket(uni256, quantity = 1, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    
    // 先查询当前票务信息
    const ticket = await this.findByUni256(uni256, cloudflareEnv);
    if (!ticket) {
      throw new Error('票务不存在');
    }

    if (!ticket.is_enabled) {
      throw new Error('票务未启用');
    }

    if (!ticket.is_released) {
      throw new Error('票务未发布');
    }

    if (ticket.is_expired) {
      throw new Error('票务已过期');
    }

    if (ticket.available_quantity < quantity) {
      throw new Error('票务库存不足');
    }

    // 更新库存
    const newAvailableQuantity = ticket.available_quantity - quantity;
    const newSoldQuantity = ticket.sold_quantity + quantity;
    const isSoldOut = newAvailableQuantity <= 0;

    const sql = `
      UPDATE ${this.tableName} 
      SET available_quantity = ?, 
          sold_quantity = ?,
          is_sold_out = ?
      WHERE uni256 LIKE ?
    `;

    await client.execute({ 
      sql, 
      args: [newAvailableQuantity, newSoldQuantity, isSoldOut ? 1 : 0, `%${uni256}%`] 
    });

    return await this.findByUni256(uni256, cloudflareEnv);
  }

  /**
   * 更新票务
   */
  async update(uni256, updateData, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    
    const allowedFields = [
      'title', 'description', 'venue', 'category', 'price', 
      'total_quantity', 'available_quantity', 'start_time', 'end_time',
      'sale_start_time', 'sale_end_time', 'is_released', 'is_expired',
      'is_enabled', 'organizer', 'contact_info', 'terms', 'image_url'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(`%${uni256}%`);
    const sql = `
      UPDATE ${this.tableName} 
      SET ${updateFields.join(', ')}
      WHERE uni256 LIKE ?
    `;

    await client.execute({ sql, args: values });
    return await this.findByUni256(uni256, cloudflareEnv);
  }

  /**
   * 删除票务
   */
  async delete(uni256, cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    const sql = `DELETE FROM ${this.tableName} WHERE uni256 LIKE ?`;
    const result = await client.execute({ sql, args: [`%${uni256}%`] });
    return result.meta.changes > 0;
  }

  /**
   * 获取票务统计信息
   */
  async getStats(cloudflareEnv = null) {
    const client = this.getClient(cloudflareEnv);
    const sql = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN is_released = 1 THEN 1 END) as released_tickets,
        COUNT(CASE WHEN is_sold_out = 1 THEN 1 END) as sold_out_tickets,
        COUNT(CASE WHEN is_expired = 1 THEN 1 END) as expired_tickets,
        SUM(total_quantity) as total_quantity,
        SUM(sold_quantity) as total_sold,
        SUM(available_quantity) as total_available
      FROM ${this.tableName}
    `;
    const result = await client.execute(sql);
    return result.rows[0];
  }
}

// 导出模型实例
export const ticketModel = new TicketModel(); 