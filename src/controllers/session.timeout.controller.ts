import { Request, Response } from "express";
import { Templates } from "../model/template.paths"

export const get = (req: Request, res: Response) => {
    return res.render(Templates.SESSION_TIMEOUT)
}