export default Object.freeze({
  port: 3333,
  prefix: "/api",
  mockSuffix: ".mjs",
  mockPath: "./mocks",
  cors: true,
  responseWrapper: (_req, res, data = null) => {
    res.json({
      code: 200,
      msg: "success",
      data,
    });
  },
});
