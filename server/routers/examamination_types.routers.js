 import { Router } from "express";
import { getExaminationTypes } from "../controlers/examination_types.controler.js";
import { protect } from "../middlewares/auth.middleware.js";

const examsTypesRouter = Router();

examsTypesRouter.get("/",  getExaminationTypes);

export default examsTypesRouter;