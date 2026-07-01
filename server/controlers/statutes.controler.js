import { catchAsync } from "../middlewares/error.middleware.js";
import Statutes from "../models/statutes.models.js";

export const getStatutes = catchAsync(async (req, res, next) => {
  try {
    const statutes = await Statutes.getAll();
    res.status(200).json({
      status: "success",
      data: {
        statutes,
      },
    });
  } catch (error) {
    next(error);
  }
});
