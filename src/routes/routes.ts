import { Request, Response, Router } from "express";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as documentUploadRoute from "../controllers/document_upload/document.upload.controller";
import * as enterInformationRoute from "../controllers/enter.information.controller";
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
router.post(pageURLs.COMPANY_NUMBER, companyNumberRoute.post);

router.get(pageURLs.CONFIRM_COMPANY, confirmCompanyRoute.get);

router.get(pageURLs.ENTER_INFORMATION, enterInformationRoute.get);
router.post(pageURLs.ENTER_INFORMATION, enterInformationRoute.post);

router.get(pageURLs.DOCUMENT_UPLOAD, documentUploadRoute.get);
router.post(pageURLs.DOCUMENT_UPLOAD, documentUploadRoute.postFile);
router.post(pageURLs.DOCUMENT_UPLOAD_CONTINUE, documentUploadRoute.postContinueButton);

router.get(pageURLs.ERROR, renderTemplate(Templates.ERROR));
export default router;
