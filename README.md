[toc]

## 介绍

快速模拟服务端接口

## 安装

```sh
degit liaohui5/mock-server
cd mock-server
npm i
```

## 启动

```sh
# 仅启动服务
npm run start

# 启动并且观察文件变化自动重启服务
npm run dev
```

## 配置

<!-- prettier-ignore-start -->

```js
// fileName: app.js
const config = {
  port: 3333,          // 服务端监听的端口
  prefix: '/api',      // 前缀
  mockPath: './mocks', // 模拟接口文件存放目录
  cors: true,          // 是否一年许跨域
  responseWrapper: (_req, res, data = null) => { // 响应体数据格式
    res.json({
      code: 0,
      msg: 'success',
      data,
    });
  },
};
```

## 模拟接口

在 mocks 目录下新建文件 `如: article.mjs` <span style="color:#f00;">注:需要使用 `.mjs` 作为后缀</span>

内容如下:

```js
// fileName: mocks/articles.mjs
export default [
  {
    url: '/articles',
    response: Array(10) .fill() .map((_, i) => {
      i += 1000;
      return {
        id: i,
        title: `文章标题${i}`,
        content: `文章内容${i}`,
        author_id: `100${i}`,
      };
    }),
  },

  {
    url: '/article',
    method: 'post',
    timeout: 500,
    response: (_, res) => {
      res.status(201);
      return {
        id: 1,
        title: `文章标题`,
        content: `文章内容`,
        author_id: `100`,
      };
    },
  },

  {
    url: '/article/:id',
    response: (req) => {
      return new Promise((resolve) => {
        const id = req.params.id;
        const body = {
          id,
          title: `文章标题${id}`,
          content: `文章内容${id}`,
          starts: 11,
          shares: 22,
          comments: 111,
          author_id: `100${id}`,
        };
        setTimeout(() => resolve(body), 100);
      });
    },
  },

  {
    url: '/article/:id',
    method: 'patch',
    response: 1,
  },

  {
    url: '/article/:id',
    method: 'delete',
    response: {
      effectRows: 1,
    },
  },
];
```
<!-- prettier-ignore-end -->

## 字段

| 字段     | 取值范围                                                       | 说明                                  | 示例   |
| :------- | :------------------------------------------------------------- | :------------------------------------ | :----- |
| url      | string                                                         | 请求地址                              | /users |
| method   | get/post/patch/put/delete                                      | 请求方式,默认`get`                    | post   |
| timeout  | number                                                         | 延迟时间,默认`100`,小于100按照100计算 | 500    |
| response | null/string/boolean/number/Array/Object/<br>function(req, res) | 响应体具体数据                        | data   |

### response 函数的参数

- req: 就是 express 的 [Request](https://expressjs.com/en/5x/api.html#req) 对象
- res: 就是 express 的 [Response](https://expressjs.com/en/5x/api.html#res) 对象
