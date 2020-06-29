import { Request, Response, Router } from "express";
import companyNumberRoute from "../controllers/company.number.controller";
import confirmCompanyRoute from "../controllers/confirm.company.controller";
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

router.post(pageURLs.COMPANY_NUMBER, companyNumberRoute);
router.get(pageURLs.CONFIRM_COMPANY, confirmCompanyRoute);
router.get(pageURLs.ENTER_INFORMATION, renderTemplate(Templates.ENTER_INFORMATION));

export default router;
