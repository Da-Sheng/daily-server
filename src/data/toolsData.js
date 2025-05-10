/**
 * 工具和分类数据
 */

// 工具分类数据
export const categories = [
  {
    id: 'finance',
    name: '金融工具',
    icon: 'bank',
    description: '各种金融相关的计算工具',
  },
  {
    id: 'converter',
    name: '转换工具',
    icon: 'swap',
    description: '各种单位、格式转换工具',
  },
  {
    id: 'generator',
    name: '生成器',
    icon: 'code',
    description: '各种内容生成工具',
  },
  {
    id: 'daily',
    name: '日常工具',
    icon: 'calendar',
    description: '日常生活常用工具',
  },
];

// 工具列表数据
export const tools = [
  {
    id: 'mortgage-calculator',
    name: '房贷计算器',
    description: '计算房贷月供、总利息等信息',
    icon: 'home',
    path: '/tools/mortgage-calculator',
    categoryId: 'finance',
  },
  {
    id: 'loan-calculator',
    name: '贷款计算器',
    description: '计算各类贷款的还款信息',
    icon: 'dollar',
    path: '/tools/loan-calculator',
    categoryId: 'finance',
  },
  {
    id: 'unit-converter',
    name: '单位转换器',
    description: '各种单位间的转换工具',
    icon: 'calculator',
    path: '/tools/unit-converter',
    categoryId: 'converter',
  },
  {
    id: 'date-calculator',
    name: '日期计算器',
    description: '计算日期差值、工作日等',
    icon: 'calendar',
    path: '/tools/date-calculator',
    categoryId: 'daily',
  },
  {
    id: 'random-generator',
    name: '随机生成器',
    description: '生成随机密码、UUID等',
    icon: 'key',
    path: '/tools/random-generator',
    categoryId: 'generator',
  },
]; 