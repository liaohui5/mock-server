import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express-next';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const config = {
  port: 3333,
  prefix: '/api',
  mockPath: './mocks',
  responseWrapper: function (_req, res, data = null) {
    res.json({
      code: 0,
      msg: 'success',
      data,
    });
  },
  errorHandler: function (err, req, res, next) {
    res.status(err.status || 500).json({
      code: 500,
      msg: 'server internal error',
      data: {
        url: req.url,
        message: err.message,
        stack: err.stack,
      },
    });
  },
};

const app = express();
const { port, mockPath, prefix, responseWrapper, errorHandler } = config;

// apply middlewares
app.use(bodyParser.json());
app.use(cors());

// test route
app.get('/', (req, res) => responseWrapper(req, res));
app.use(errorHandler);

function importMocks() {
  readdirSync(resolve(mockPath)).forEach(async (item) => {
    const modeule = await import(`./${mockPath}/${item}`);
    addRoutes(modeule.default);
  });
}

function addRoutes(mocks) {
  for (let i = 0, l = mocks.length; i < l; i++) {
    const mock = resetMock(mocks[i]);
    const { method, timeout, url, response } = mock;
    if (!isMock(mock)) {
      continue;
    }

    // register route to app
    app[method].call(app, url, async (req, res) => {
      await wait(timeout);

      // handle response body with request and response
      let body = response;
      if (typeof response === 'function') {
        body = await response(req, res);
      }

      // response the result
      return responseWrapper(req, res, body);
    });
  }
}

// must be exists properties, url and response
function isMock(mock) {
  return ['url', 'response'].every((key) => mock.hasOwnProperty(key));
}

function resetMock(mock) {
  // handle url format: /api//articles -> /api/articles
  mock.url =
    '/' +
    `${prefix}/${mock.url}`
      .split('/')
      .filter((item) => item)
      .join('/');

  // method & timeout default values
  if (!mock.hasOwnProperty('method')) {
    mock.method = 'get';
  }
  if (!mock.hasOwnProperty('timeout')) {
    mock.timeout = 100;
  }

  // method & timeout allow values
  const { timeout, method } = mock;
  if (typeof timeout !== 'number' || timeout < 100) {
    mock.timeout = 100;
  }
  const allowedMethods = ['get', 'post', 'patch', 'put', 'delete'];
  if (!allowedMethods.includes(String(method).toLowerCase())) {
    mock.method = 'get';
  }
  return mock;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

importMocks();
app.listen(port, () => `server started on: http://localhost:${port}`);
