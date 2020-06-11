import { Router } from "express";

const router: Router = Router();

router.get("/", (req, response) => response.send("This is the Strike Off Objections app"));

export default router;
