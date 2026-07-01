import { Router } from "express";
import { getOrigins } from "../controlers/origins.controler.js";

const originsRouter = Router();

originsRouter.get("/", getOrigins);

export default originsRouter;
