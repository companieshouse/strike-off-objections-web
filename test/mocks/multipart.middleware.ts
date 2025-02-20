jest.mock("../../src/middleware/multipart.middleware", () => ({
  MultipartMiddleware: jest.fn((req, res, next) => next())
}));
