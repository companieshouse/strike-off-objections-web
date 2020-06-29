import { Request, Response, Router } from "express";
import * as pageURLs from "../model/page.urls";
import { Templates } from "../model/template.paths";

const router: Router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
  return res.render(template, { templateName: template });
};

router.get("/", renderTemplate(Templates.INDEX));

router.get(pageURLs.COMPANY_NUMBER, renderTemplate(Templates.COMPANY_NUMBER));
router.get(pageURLs.CONFIRM_COMPANY, renderTemplate(Templates.CONFIRM_COMPANY));
router.get(pageURLs.ENTER_INFORMATION, renderTemplate(Templates.ENTER_INFORMATION));
export default router;
