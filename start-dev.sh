#!/bin/bash

# 加载环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
  echo "✓ 环境变量已加载"
  echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
  echo "DATABASE_AUTH_TOKEN: ${DATABASE_AUTH_TOKEN:0:30}..."
else
  echo "✗ 未找到 .env 文件"
  exit 1
fi

# 启动wrangler
echo "🚀 启动开发服务器..."
wrangler dev --env development 