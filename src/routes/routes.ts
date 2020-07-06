import { Request, Response, Router } from "express";
import companyNumberRoute from "../controllers/company.number.controller";
import confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as enterInformation from "../controllers/enter.information.controller";
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
router.post(pageURLs.COMPANY_NUMBER, companyNumberRoute);

router.get(pageURLs.CONFIRM_COMPANY, confirmCompanyRoute);

router.get(pageURLs.ENTER_INFORMATION, enterInformation.get);
router.post(pageURLs.ENTER_INFORMATION, enterInformation.post);

router.get(pageURLs.DOCUMENT_UPLOAD, renderTemplate(Templates.DOCUMENT_UPLOAD));

export default router;
