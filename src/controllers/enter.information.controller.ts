import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  return res.render(Templates.ENTER_INFORMATION, {
    templateName: Templates.ENTER_INFORMATION,
  });
};

export default route;
