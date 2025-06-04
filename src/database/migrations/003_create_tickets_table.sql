-- 创建票务表
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  uni256 TEXT UNIQUE NOT NULL,           -- 256位唯一标识符
  title TEXT NOT NULL,                   -- 场次名称
  description TEXT,                      -- 描述
  venue TEXT,                           -- 场地/地点
  category TEXT DEFAULT 'general',       -- 票务分类
  
  -- 价格和库存
  price DECIMAL(10,2) NOT NULL,         -- 票价
  total_quantity INTEGER NOT NULL,      -- 总票数
  available_quantity INTEGER NOT NULL,  -- 剩余票数
  sold_quantity INTEGER DEFAULT 0,      -- 已售票数
  
  -- 时间字段
  start_time DATETIME NOT NULL,         -- 开始时间
  end_time DATETIME,                    -- 结束时间
  sale_start_time DATETIME,             -- 开售时间
  sale_end_time DATETIME,               -- 停售时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 更新时间
  
  -- 状态字段
  is_released BOOLEAN DEFAULT 0,        -- 是否出库/发布
  is_expired BOOLEAN DEFAULT 0,         -- 是否过期
  is_enabled BOOLEAN DEFAULT 1,         -- 是否启用
  is_sold_out BOOLEAN DEFAULT 0,        -- 是否售罄
  
  -- 其他信息
  organizer TEXT,                       -- 主办方
  contact_info TEXT,                    -- 联系信息
  terms TEXT,                          -- 购票条款
  image_url TEXT,                      -- 票务图片
  
  -- 索引
  FOREIGN KEY (category) REFERENCES categories(id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tickets_uni256 ON tickets(uni256);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_start_time ON tickets(start_time);
CREATE INDEX IF NOT EXISTS idx_tickets_is_released ON tickets(is_released);
CREATE INDEX IF NOT EXISTS idx_tickets_is_enabled ON tickets(is_enabled);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- 创建更新时间触发器
CREATE TRIGGER IF NOT EXISTS update_tickets_updated_at 
  AFTER UPDATE ON tickets
  BEGIN
    UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END; 