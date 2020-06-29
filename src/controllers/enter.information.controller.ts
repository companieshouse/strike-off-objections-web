import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";

const route = (req: Request, res: Response, next: NextFunction) => {
  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export default route;
