#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎵 Moodify Frontend 启动脚本');
console.log('============================');

// 检查 Node.js 版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ 需要 Node.js 16 或更高版本');
  console.error(`当前版本: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js 版本检查通过: ${nodeVersion}`);

// 检查是否存在 node_modules
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 检测到需要安装依赖...');
  
  try {
    console.log('正在安装依赖，请稍候...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
  } catch (error) {
    console.error('❌ 依赖安装失败');
    console.error(error.message);
    process.exit(1);
  }
} else {
  console.log('✅ 依赖已安装');
}

// 检查环境变量文件
if (!fs.existsSync(path.join(__dirname, '.env.development'))) {
  console.log('⚠️  未找到 .env.development 文件');
  console.log('请确保环境变量配置正确');
}

console.log('🚀 启动开发服务器...');
console.log('');

try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 启动失败');
  console.error(error.message);
  process.exit(1);
}
