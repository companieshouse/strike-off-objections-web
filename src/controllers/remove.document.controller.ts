import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
 return res.render(Templates.REMOVE_DOCUMENT);
};
