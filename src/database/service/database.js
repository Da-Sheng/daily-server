import { categoryModel } from '../models/Category.js';
import { toolModel } from '../models/Tool.js';
import { ticketModel } from '../models/Ticket.js';

class DatabaseService {
  constructor() {
    this.categoryModel = categoryModel;
    this.toolModel = toolModel;
    this.ticketModel = ticketModel;
  }

  // 分类相关方法
  async getAllCategories(cloudflareEnv = null) {
    return await this.categoryModel.findAll(cloudflareEnv);
  }

  async getCategoryById(id, cloudflareEnv = null) {
    return await this.categoryModel.findById(id, cloudflareEnv);
  }

  // 工具相关方法
  async getAllTools(cloudflareEnv = null) {
    return await this.toolModel.findAll(cloudflareEnv);
  }

  async getToolById(id, cloudflareEnv = null) {
    return await this.toolModel.findById(id, cloudflareEnv);
  }

  async getToolsByCategory(categoryId, cloudflareEnv = null) {
    return await this.toolModel.findByCategory(categoryId, cloudflareEnv);
  }

  // 票务相关方法
  async getAllTickets(cloudflareEnv = null) {
    return await this.ticketModel.findAll(cloudflareEnv);
  }

  async getTicketByUni256(uni256, cloudflareEnv = null) {
    return await this.ticketModel.findByUni256(uni256, cloudflareEnv);
  }

  async getTicketById(id, cloudflareEnv = null) {
    return await this.ticketModel.findById(id, cloudflareEnv);
  }

  async getTicketsByFilter(filter, cloudflareEnv = null) {
    return await this.ticketModel.findByConditions(filter, cloudflareEnv);
  }

  async getAvailableTickets(cloudflareEnv = null) {
    return await this.ticketModel.findByConditions({ 
      available_only: true 
    }, cloudflareEnv);
  }

  async createTicket(ticketData, cloudflareEnv = null) {
    return await this.ticketModel.create(ticketData, cloudflareEnv);
  }

  async updateTicket(uni256, updateData, cloudflareEnv = null) {
    return await this.ticketModel.update(uni256, updateData, cloudflareEnv);
  }

  async deleteTicket(uni256, cloudflareEnv = null) {
    return await this.ticketModel.delete(uni256, cloudflareEnv);
  }

  async purchaseTicket(uni256, quantity = 1, cloudflareEnv = null) {
    return await this.ticketModel.purchaseTicket(uni256, quantity, cloudflareEnv);
  }

  async getTicketStats(cloudflareEnv = null) {
    return await this.ticketModel.getStats(cloudflareEnv);
  }
}

export const databaseService = new DatabaseService(); 