import { Request, Response } from "express";
import { CsrfError } from "@companieshouse/web-security-node";
import { csrfErrorHandler, csrfErrorTemplateName } from "../../src/middleware/csrf.middleware";

describe("csrfErrorHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn()
    };
    mockNext = jest.fn();
  });

  it("should render the CSRF error page with status 403 when a CsrfError is encountered", () => {
    const csrfError = new CsrfError("CSRF token missing");
    csrfErrorHandler(csrfError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.render).toHaveBeenCalledWith(csrfErrorTemplateName, { csrfErrors: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with the error if it is not a CsrfError", () => {
    const genericError = new Error("Some other error");
    csrfErrorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(genericError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.render).not.toHaveBeenCalled();
  });
});
