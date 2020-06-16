import { NextFunction, Request, Response, Router } from "express";

const router: Router = Router();

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
  return res.render(template, { templateName: template });
};

router.get("/", renderTemplate("index"));

export default router;
