import { prepareCSPConfig } from "../../src/config/csp.config";

describe("prepareCSPConfig", () => {
  const TEST_NONCE = "test-nonce-123";

  it("should include the nonce in scriptSrc", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    expect(directives.directives.scriptSrc).toContain(`'nonce-${TEST_NONCE}'`);
  });

  it("should not allow unsafe-inline in scriptSrc", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    expect(directives.directives.scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("should block frame ancestors", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    expect(directives.directives.frameAncestors).toContain("'none'");
  });

  it("should block inline event handlers", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    expect(directives.directives.scriptSrcAttr).toContain("'none'");
  });

  it("should include CDN_HOST in styleSrc, fontSrc and imgSrc", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    const cdn = process.env.CDN_HOST;
    expect(directives.directives.styleSrc).toContain(cdn);
    expect(directives.directives.fontSrc).toContain(cdn);
    expect(directives.directives.imgSrc).toContain(cdn);
  });

  it("should include PIWIK_URL in scriptSrc, connectSrc and imgSrc", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    const piwik = process.env.PIWIK_URL;
    expect(directives.directives.scriptSrc).toContain(piwik);
    expect(directives.directives.connectSrc).toContain(piwik);
    expect(directives.directives.imgSrc).toContain(piwik);
  });

  it("should include CHS_URL and ACCOUNT_URL in formAction", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    const directives = config.contentSecurityPolicy as any;
    expect(directives.directives.formAction).toContain(process.env.CHS_URL);
    expect(directives.directives.formAction).toContain(process.env.ACCOUNT_URL);
  });

  it("should set HSTS max age to one year", () => {
    const config = prepareCSPConfig(TEST_NONCE);
    expect((config.hsts as any).maxAge).toBe(31536000);
  });

  it("should generate a different nonce each call", () => {
    const config1 = prepareCSPConfig("nonce-a");
    const config2 = prepareCSPConfig("nonce-b");
    const src1 = (config1.contentSecurityPolicy as any).directives.scriptSrc;
    const src2 = (config2.contentSecurityPolicy as any).directives.scriptSrc;
    expect(src1).not.toEqual(src2);
  });
});
