/**
 * Gets an environment variable. If the env var is not set and a default value is not
 * provided, then it is assumed it is a mandatory requirement and an error will be
 * thrown.
 */

const getEnv = (key: string, defaultValue?: any): string => {
  const isMandatory: boolean = !defaultValue;
  const value: string = process.env[key] || "";

  if (!value && isMandatory) {
    throw new Error(`Please set the environment variable "${key}"`);
  }

  return value || defaultValue as string;
};

export const COOKIE_NAME = getEnv("COOKIE_NAME");

export const COOKIE_DOMAIN = getEnv("COOKIE_DOMAIN");

export const COOKIE_SECRET = getEnv("COOKIE_SECRET");

export const CACHE_SERVER = getEnv("CACHE_SERVER");
