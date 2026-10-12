# 本地化运行

该服务同时托管网页和模型代理，原始单证及风险数据不需要发送到公共网站。

1. 在企业电脑或服务器安装 Node.js 20+。
2. 准备兼容 OpenAI Chat Completions 的本地模型服务，默认地址为 `http://127.0.0.1:11434/v1`。
3. 在 `dist` 目录运行：

```powershell
node .\local-server\server.mjs
```

4. 浏览器访问 `http://127.0.0.1:8787`。

可选环境变量：`HOST`、`PORT`、`MODEL_BASE_URL`、`MODEL_NAME`、`MODEL_API_KEY`。API Key 只允许放在服务器环境变量中，禁止写入网页或提交到仓库。
