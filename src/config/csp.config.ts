import { HelmetOptions } from "helmet";
import { CDN_URL, PIWIK_URL, CHS_URL, ACCOUNT_URL } from "../utils/properties";

export const prepareCSPConfig = (nonce: string): HelmetOptions => {
    const CDN = CDN_URL;
    const PIWIK = PIWIK_URL;
    const CHS = CHS_URL;
    const ACCOUNT = ACCOUNT_URL;
    const SELF = `'self'`;
    const NONCE = `'nonce-${nonce}'`;
    const ONE_YEAR_SECONDS = 31536000;

    return {
        contentSecurityPolicy: {
            directives: {
                upgradeInsecureRequests: null,
                defaultSrc: [SELF],
                fontSrc: [CDN],
                imgSrc: [SELF, CDN, PIWIK],
                styleSrc: [CDN],
                connectSrc: [SELF, PIWIK],
                formAction: [SELF, CHS, ACCOUNT],
                frameAncestors: [`'none'`],
                scriptSrcAttr: [`'none'`],
                scriptSrc: [
                    NONCE,
                    CDN,
                    PIWIK
                ],
                objectSrc: [`'none'`]
            }
        },
        referrerPolicy: {
            policy: ["strict-origin-when-cross-origin"]
        },
        hsts: {
            maxAge: ONE_YEAR_SECONDS,
            includeSubDomains: true
        }
    };
};
