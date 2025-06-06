# Moodify 部署文档

本文档提供了 Moodify 前端应用的完整部署指南。

## 环境要求

### 强制依赖的软件及版本
- **Node.js**: >= 16.0.0 (推荐使用 LTS 版本)
- **npm**: >= 7.0.0 (或 yarn >= 1.22.0 / pnpm >= 6.0.0)

## 启动流程

### 获取项目
```bash
# 在服务器上执行
git clone https://github.com/yourusername/moodify.git
cd moodify/frontend
```

### 配置项修改

复制环境配置文件并填入实际配置：
```bash
# 在项目根目录 frontend/ 执行
cp .env.example .env.production
```

编辑 `.env.production` 文件，修改以下配置项：
```bash
# API 基础 URL (必须修改)
VITE_API_BASE_URL=[你的后端API地址]

# 应用信息 (可选修改)
VITE_APP_TITLE=Moodify - 情绪音乐推荐
VITE_APP_DESCRIPTION=基于情绪的智能音乐推荐系统

# Spotify API 配置 (必须填入)
VITE_SPOTIFY_CLIENT_ID=[你的Spotify客户端ID]

# 生产环境配置
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=warn
```

**配置项说明：**
- `VITE_API_BASE_URL`: 后端API服务地址，如 `https://api.yourdomain.com`
- `VITE_SPOTIFY_CLIENT_ID`: 从 [Spotify开发者控制台](https://developer.spotify.com/dashboard) 获取

### 完整启动命令链

```bash
# 在项目根目录 frontend/ 执行以下命令

# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 部署静态文件
# 方式一：使用内置预览服务器（简单部署）
npm run preview

# 方式二：使用 Web 服务器（推荐生产环境）
# 将 dist/ 目录内容复制到 Web 服务器根目录
cp -r dist/* /var/www/html/
```

### 服务访问方式

**内置预览服务器：**
- URL: `http://[服务器IP]:4173`
- 端口: 4173

**Web服务器部署：**
- URL: `http://[服务器IP]` 或 `https://yourdomain.com`
- 端口: 80 (HTTP) / 443 (HTTPS)

## 基础运维

### 服务重启命令

**内置预览服务器：**
```bash
# 在项目根目录 frontend/ 执行
# 停止当前服务 (Ctrl+C)
# 重新启动
npm run preview
```

**使用 PM2 管理（推荐）：**
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start "npm run preview" --name moodify-frontend

# 重启服务
pm2 restart moodify-frontend

# 停止服务
pm2 stop moodify-frontend
```

### 日志查看方式

**内置预览服务器日志：**
```bash
# 在项目根目录 frontend/ 执行
# 直接在终端查看实时日志
```

**使用 PM2 查看日志：**
```bash
# 查看实时日志
pm2 logs moodify-frontend

# 查看错误日志
pm2 logs moodify-frontend --err

# 清空日志
pm2 flush
```

**Web服务器日志：**
```bash
# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Apache 日志
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log
```

### 关闭服务命令

**内置预览服务器：**
```bash
# 在运行服务的终端执行
Ctrl+C
```

**PM2 管理的服务：**
```bash
# 停止服务
pm2 stop moodify-frontend

# 删除服务
pm2 delete moodify-frontend
```

## 高级部署选项

### 使用 Nginx 反向代理

创建 Nginx 配置文件 `/etc/nginx/sites-available/moodify`：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/moodify;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理 (如果需要)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

启用配置：
```bash
# 在服务器上执行
sudo ln -s /etc/nginx/sites-available/moodify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 使用静态文件托管服务

**部署到 Vercel：**
```bash
# 在项目根目录 frontend/ 执行
npm install -g vercel
vercel --prod
```

**部署到 Netlify：**
```bash
# 在项目根目录 frontend/ 执行
npm run build
# 将 dist/ 目录拖拽到 Netlify Deploy 页面
```

**使用对象存储 + CDN：**
```bash
# 在项目根目录 frontend/ 执行
npm run build

# 上传到阿里云OSS
ossutil cp -r dist/ oss://your-bucket-name/

# 配置CDN加速域名指向OSS存储桶
```

### SSL/HTTPS 配置

使用 Certbot 配置免费 SSL 证书：
```bash
# 在服务器上执行
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 故障排除

### 常见问题解决

| 问题现象 | 解决命令 |
|---------|----------|
| 页面空白 | `sudo nginx -t && sudo systemctl reload nginx` |
| 资源404 | `ls -la dist/ && nginx -T | grep root` |
| API请求失败 | `curl -v http://localhost:8000/health` |
| 端口被占用 | `sudo lsof -i :4173 && sudo kill -9 [PID]` |
| 权限错误 | `sudo chown -R www-data:www-data /var/www/moodify` |
| 内存不足 | `free -h && sudo systemctl restart nginx` |

### 性能优化检查

```bash
# 在项目根目录 frontend/ 执行检查构建大小
du -sh dist/
ls -lah dist/assets/js/

# 检查 Gzip 压缩效果
curl -H "Accept-Encoding: gzip" -v http://yourdomain.com

# 监控服务器资源
top
df -h
```

## 安全注意事项

1. **环境变量安全**: 确保 `.env.production` 文件权限为 600
2. **API密钥保护**: 不要在客户端代码中暴露敏感的API密钥
3. **HTTPS强制**: 生产环境必须使用HTTPS协议
4. **防火墙配置**: 只开放必要的端口 (80, 443)
5. **定期更新**: 及时更新Node.js和依赖包到最新版本

## 监控和备份

### 服务监控
```bash
# 设置健康检查脚本
#!/bin/bash
curl -f http://localhost:4173 > /dev/null || pm2 restart moodify-frontend
```

### 备份策略
```bash
# 备份配置文件和构建产物
tar -czf moodify-backup-$(date +%Y%m%d).tar.gz .env.production dist/
