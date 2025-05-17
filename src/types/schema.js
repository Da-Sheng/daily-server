import { gql } from 'graphql-tag';

// GraphQL Schema 定义
export const typeDefs = gql`
  type Category {
    id: ID!
    name: String!
    icon: String!
    description: String!
    tools: [Tool!]
  }

  type Tool {
    id: ID!
    name: String!
    description: String!
    icon: String!
    path: String!
    categoryId: ID!
    category: Category
  }

  type Query {
    # 分类查询
    categories: [Category!]!
    category(id: ID!): Category
    
    # 工具查询
    tools: [Tool!]!
    tool(id: ID!): Tool
    toolsByCategory(categoryId: ID!): [Tool!]!
  }

  type Mutation {
    # 重置缓存，强制从API重新获取数据
    resetCache: Boolean
  }
`; 