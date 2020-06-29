export default () => {
  process.env.COOKIE_NAME = "cookie_name";
  process.env.COOKIE_DOMAIN = "cookie_domain";
  process.env.COOKIE_SECRET = "123456789012345678901234";
  process.env.CACHE_SERVER = "cache_server";
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
  process.env.LOG_LEVEL = "error";
};
