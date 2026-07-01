
import { Router } from "express";
import { getStatutes } from "../controlers/statutes.controler.js";
import { protect } from "../middlewares/auth.middleware.js";

const statutesRouter = Router();

statutesRouter.get("/",  getStatutes);

export default statutesRouter;
