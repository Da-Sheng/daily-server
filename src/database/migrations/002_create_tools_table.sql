-- 创建工具表
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  icon TEXT,
  category_id TEXT NOT NULL,
  tags TEXT, -- JSON格式存储标签数组
  is_featured BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_active ON tools(is_active);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON tools(rating);
CREATE INDEX IF NOT EXISTS idx_tools_view_count ON tools(view_count);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at);

-- 创建更新时间触发器
CREATE TRIGGER IF NOT EXISTS update_tools_updated_at
  AFTER UPDATE ON tools
  FOR EACH ROW
BEGIN
  UPDATE tools SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 插入默认工具数据
INSERT OR IGNORE INTO tools (id, name, description, url, icon, category_id, tags, is_featured) VALUES
('mortgage-calc', '房贷计算器', '计算房贷月供、利息等信息', 'https://example.com/mortgage', '🏠', 'finance', '["房贷", "计算器", "金融"]', 1),
('loan-calc', '贷款计算器', '各种贷款计算工具', 'https://example.com/loan', '💳', 'finance', '["贷款", "计算器", "金融"]', 1),
('investment-calc', '投资收益计算器', '计算投资收益和复利', 'https://example.com/investment', '📈', 'finance', '["投资", "收益", "复利"]', 0),
('budget-tracker', '预算跟踪器', '个人预算管理工具', 'https://example.com/budget', '💰', 'finance', '["预算", "管理", "记账"]', 0),
('todo-manager', '待办事项管理', '高效的任务管理工具', 'https://example.com/todo', '✅', 'productivity', '["待办", "任务", "效率"]', 1),
('time-tracker', '时间跟踪器', '跟踪工作时间和效率', 'https://example.com/time', '⏰', 'productivity', '["时间", "跟踪", "效率"]', 0),
('note-taking', '笔记工具', '强大的笔记记录工具', 'https://example.com/notes', '📝', 'productivity', '["笔记", "记录", "整理"]', 1),
('password-manager', '密码管理器', '安全的密码存储管理', 'https://example.com/password', '🔐', 'productivity', '["密码", "安全", "管理"]', 1); 