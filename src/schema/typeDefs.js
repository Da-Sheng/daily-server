import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Category {
    id: String!
    name: String!
    description: String
    icon: String
    tools: [Tool!]!
    createdAt: String
    updatedAt: String
  }

  type Tool {
    id: String!
    name: String!
    description: String
    icon: String
    path: String!
    categoryId: String!
    category: Category
    createdAt: String
    updatedAt: String
  }

  type Ticket {
    id: String!
    uni256: String!
    title: String!
    description: String
    venue: String
    category: String!
    price: Float!
    totalQuantity: Int!
    availableQuantity: Int!
    soldQuantity: Int!
    startTime: String!
    endTime: String
    saleStartTime: String
    saleEndTime: String
    isReleased: Boolean!
    isExpired: Boolean!
    isEnabled: Boolean!
    isSoldOut: Boolean!
    organizer: String
    contactInfo: String
    terms: String
    imageUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type TicketStats {
    totalTickets: Int!
    releasedTickets: Int!
    soldOutTickets: Int!
    expiredTickets: Int!
    totalQuantity: Int!
    totalSold: Int!
    totalAvailable: Int!
  }

  input TicketInput {
    uni256: String
    title: String!
    description: String
    venue: String
    category: String
    price: Float!
    totalQuantity: Int!
    availableQuantity: Int
    startTime: String!
    endTime: String
    saleStartTime: String
    saleEndTime: String
    isReleased: Boolean
    isExpired: Boolean
    isEnabled: Boolean
    organizer: String
    contactInfo: String
    terms: String
    imageUrl: String
  }

  input TicketUpdateInput {
    title: String
    description: String
    venue: String
    category: String
    price: Float
    totalQuantity: Int
    availableQuantity: Int
    startTime: String
    endTime: String
    saleStartTime: String
    saleEndTime: String
    isReleased: Boolean
    isExpired: Boolean
    isEnabled: Boolean
    organizer: String
    contactInfo: String
    terms: String
    imageUrl: String
  }

  input TicketFilterInput {
    category: String
    isReleased: Boolean
    isEnabled: Boolean
    isExpired: Boolean
    isSoldOut: Boolean
    availableOnly: Boolean
    startTimeFrom: String
    startTimeTo: String
    keyword: String
    limit: Int
    offset: Int
  }

  type Query {
    categories: [Category!]!
    category(id: String!): Category
    tools: [Tool!]!
    tool(id: String!): Tool
    toolsByCategory(categoryId: String!): [Tool!]!
    
    # 票务查询
    tickets: [Ticket!]!
    ticket(uni256: String!): Ticket
    ticketById(id: String!): Ticket
    ticketsByFilter(filter: TicketFilterInput): [Ticket!]!
    ticketStats: TicketStats!
    availableTickets: [Ticket!]!
  }

  type Mutation {
    # 票务操作
    createTicket(input: TicketInput!): Ticket!
    updateTicket(uni256: String!, input: TicketUpdateInput!): Ticket!
    deleteTicket(uni256: String!): Boolean!
    purchaseTicket(uni256: String!, quantity: Int): Ticket!
  }
`; 