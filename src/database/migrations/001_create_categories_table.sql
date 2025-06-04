-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- 创建更新时间触发器
CREATE TRIGGER IF NOT EXISTS update_categories_updated_at
  AFTER UPDATE ON categories
  FOR EACH ROW
BEGIN
  UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 插入默认分类数据
INSERT OR IGNORE INTO categories (id, name, description, icon, color, sort_order) VALUES
('finance', '金融理财', '金融投资和理财相关工具', '💰', '#4CAF50', 1),
('productivity', '效率工具', '提高工作和学习效率的工具', '⚡', '#2196F3', 2),
('entertainment', '娱乐休闲', '娱乐和休闲相关工具', '🎮', '#FF9800', 3),
('education', '教育学习', '教育和学习相关工具', '📚', '#9C27B0', 4),
('health', '健康医疗', '健康和医疗相关工具', '🏥', '#F44336', 5),
('travel', '旅行出行', '旅行和出行相关工具', '✈️', '#00BCD4', 6),
('shopping', '购物消费', '购物和消费相关工具', '🛒', '#FF5722', 7),
('social', '社交通讯', '社交和通讯相关工具', '💬', '#795548', 8),
('business', '商务办公', '商务和办公相关工具', '💼', '#607D8B', 9),
('lifestyle', '生活服务', '日常生活服务工具', '🏠', '#8BC34A', 10); 