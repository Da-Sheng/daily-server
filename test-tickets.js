#!/usr/bin/env node

/**
 * 票务系统测试脚本
 * 演示票务GraphQL API的核心功能
 */

const API_URL = 'http://localhost:8787/graphql';

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  
  const result = await response.json();
  if (result.errors) {
    console.error('GraphQL 错误:', result.errors);
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

async function testTicketSystem() {
  console.log('🎫 开始测试票务系统...\n');

  try {
    // 1. 创建票务
    console.log('📝 1. 创建新票务...');
    const createResult = await graphqlRequest(`
      mutation CreateTicket($input: TicketInput!) {
        createTicket(input: $input) {
          id
          uni256
          title
          description
          venue
          price
          totalQuantity
          availableQuantity
          isReleased
          organizer
          createdAt
        }
      }
    `, {
      input: {
        title: "2024新年音乐会",
        description: "著名交响乐团新年音乐会演出",
        venue: "国家大剧院",
        category: "concert",
        price: 388.00,
        totalQuantity: 500,
        startTime: "2024-12-31T19:30:00Z",
        endTime: "2024-12-31T22:00:00Z",
        isReleased: true,
        isEnabled: true,
        organizer: "国家交响乐团"
      }
    });
    
    const newTicket = createResult.createTicket;
    console.log(`✅ 票务创建成功! ID: ${newTicket.id}`);
    console.log(`   标题: ${newTicket.title}`);
    console.log(`   价格: ¥${newTicket.price}`);
    console.log(`   总数: ${newTicket.totalQuantity}张\n`);

    // 2. 查询所有票务
    console.log('📋 2. 查询所有票务...');
    const ticketsResult = await graphqlRequest(`
      query GetAllTickets {
        tickets {
          id
          title
          price
          totalQuantity
          availableQuantity
          soldQuantity
          isReleased
          venue
        }
      }
    `);
    
    console.log(`✅ 找到 ${ticketsResult.tickets.length} 个票务:`);
    ticketsResult.tickets.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.title} - ¥${ticket.price} (剩余: ${ticket.availableQuantity}/${ticket.totalQuantity})`);
    });
    console.log();

    // 3. 购买票务
    console.log('🛒 3. 购买票务...');
    const purchaseResult = await graphqlRequest(`
      mutation PurchaseTicket($uni256: String!, $quantity: Int) {
        purchaseTicket(uni256: $uni256, quantity: $quantity) {
          id
          title
          totalQuantity
          availableQuantity
          soldQuantity
          isSoldOut
        }
      }
    `, {
      uni256: newTicket.uni256,
      quantity: 3
    });
    
    const updatedTicket = purchaseResult.purchaseTicket;
    console.log(`✅ 购买成功! 购买了3张 "${updatedTicket.title}"`);
    console.log(`   剩余票数: ${updatedTicket.availableQuantity}/${updatedTicket.totalQuantity}`);
    console.log(`   已售票数: ${updatedTicket.soldQuantity}\n`);

    // 4. 查询可购买票务
    console.log('🎯 4. 查询可购买票务...');
    const availableResult = await graphqlRequest(`
      query GetAvailableTickets {
        availableTickets {
          id
          title
          price
          availableQuantity
          venue
          startTime
        }
      }
    `);
    
    console.log(`✅ 可购买票务 ${availableResult.availableTickets.length} 个:`);
    availableResult.availableTickets.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.title} - ¥${ticket.price} (剩余: ${ticket.availableQuantity}张)`);
    });
    console.log();

    // 5. 票务统计
    console.log('📊 5. 票务统计信息...');
    const statsResult = await graphqlRequest(`
      query GetTicketStats {
        ticketStats {
          totalTickets
          releasedTickets
          soldOutTickets
          expiredTickets
          totalQuantity
          totalSold
          totalAvailable
        }
      }
    `);
    
    const stats = statsResult.ticketStats;
    console.log('✅ 统计信息:');
    console.log(`   总票务数: ${stats.totalTickets}`);
    console.log(`   已发布票务: ${stats.releasedTickets}`);
    console.log(`   总票数: ${stats.totalQuantity}`);
    console.log(`   已售票数: ${stats.totalSold}`);
    console.log(`   剩余票数: ${stats.totalAvailable}\n`);

    // 6. 按条件筛选
    console.log('🔍 6. 按关键词搜索票务...');
    const searchResult = await graphqlRequest(`
      query SearchTickets($filter: TicketFilterInput) {
        ticketsByFilter(filter: $filter) {
          id
          title
          description
          venue
          price
        }
      }
    `, {
      filter: {
        keyword: "音乐会",
        limit: 5
      }
    });
    
    console.log(`✅ 搜索 "音乐会" 找到 ${searchResult.ticketsByFilter.length} 个结果:`);
    searchResult.ticketsByFilter.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.title} - ${ticket.venue}`);
    });
    console.log();

    console.log('🎉 票务系统测试完成！所有功能运行正常。');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testTicketSystem().catch(console.error); 