import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express-next';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const config = {
  port: 3333,
  prefix: '/api',
  mockPath: './mocks',
  cors: true,
  responseWrapper: function (_req, res, data = null) {
    res.json({
      code: 0,
      msg: 'success',
      data,
    });
  },
};

const app = express();
const { port, mockPath, prefix, cors: enableCors, responseWrapper } = config;

// apply middlewares
app.use(bodyParser.json());
enableCors && app.use(cors());

// test route
app.get('/', (req, res) => responseWrapper(req, res));

// import mock files
function importMocks() {
  readdirSync(resolve(mockPath)).forEach(async (item) => {
    const modeule = await import(`./${mockPath}/${item}`);
    addRoutes(modeule.default);
  });
}

function addRoutes(mocks) {
  for (let i = 0, l = mocks.length; i < l; i++) {
    const item = mocks[i];
    if (!isMock(item)) {
      continue;
    }

    // register route to app
    const mock = resetMock(item);
    const { method, timeout, url, response } = mock;
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
