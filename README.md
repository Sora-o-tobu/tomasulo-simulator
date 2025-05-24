# Tomasulo算法模拟器

这是一个用于模拟Tomasulo算法的Web应用，可以帮助理解指令级并行（ILP）中的动态调度机制。

## 功能特点

- 可视化Tomasulo算法的执行过程
- 支持MIPS指令的输入和解析
- 实时显示保留站状态
- 支持单步执行和重置功能

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

## Docker部署

1. 构建Docker镜像：
```bash
docker build -t tomasulo-simulator .
```

2. 运行容器：
```bash
docker run -p 80:80 tomasulo-simulator
```

## 部署到GitHub Pages

1. 在package.json中添加homepage字段：
```json
{
  "homepage": "https://yourusername.github.io/tomasulo-simulator"
}
```

2. 安装gh-pages：
```bash
npm install --save-dev gh-pages
```

3. 在package.json的scripts中添加：
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

4. 部署：
```bash
npm run deploy
``` 