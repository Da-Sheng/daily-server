-- 插入分类数据
INSERT OR REPLACE INTO categories (id, name, icon, description) VALUES
('finance', '金融工具', 'bank', '各种金融相关的计算工具'),
('converter', '转换工具', 'swap', '各种单位、格式转换工具'),
('generator', '生成器', 'code', '各种内容生成工具'),
('daily', '日常工具', 'calendar', '日常生活常用工具');

-- 插入工具数据
INSERT OR REPLACE INTO tools (id, name, description, icon, path, category_id) VALUES
('mortgage-calculator', '房贷计算器', '计算房贷月供、总利息等信息', 'home', '/tools/mortgage-calculator', 'finance'),
('loan-calculator', '贷款计算器', '计算各类贷款的还款信息', 'dollar', '/tools/loan-calculator', 'finance'),
('unit-converter', '单位转换器', '各种单位间的转换工具', 'calculator', '/tools/unit-converter', 'converter'),
('date-calculator', '日期计算器', '计算日期差值、工作日等', 'calendar', '/tools/date-calculator', 'daily'),
('random-generator', '随机生成器', '生成随机密码、UUID等', 'key', '/tools/random-generator', 'generator'); 