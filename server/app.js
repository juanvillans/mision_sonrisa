import express from "express";
import { PORT, APP_URL } from "./config/env.js";
import cors from "cors"; // Import the CORS package
import userRouter from "./routers/user.routes.js";
import authRouter from "./routers/auth.routes.js";
import connectToDB from "./database/postgre.js";
import errorHandler, { notFound } from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
// import examinationTypesRouter from "./routers/examamination_types.routers.js";
// import examsRouter from "./routers/exams.routers.js";
// import resultsRouter from "./routers/results.routers.js";
// import originsRouter from "./routers/origins.routes.js";
import excelImportRouter from "./routers/excel_import.routers.js";
import statutesRouter from "./routers/statutes.routers.js";
import medicalRequestsRouter from "./routers/medical_requests.routers.js";
import path from "path";
import { fileURLToPath } from "url";

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  

const app = express();
// Enable CORS (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: [APP_URL, "http://localhost:4173"], // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable if using cookies/sessions
  })
);
// ✅ Point Express to client/dist
const clientDist = path.join(__dirname, "../client/dist");

// Serve static assets with long cache
app.use(
  "/assets",
  express.static(path.join(clientDist, "assets"), {
    setHeaders: (res, filePath) => {
      // Explicitly set cache headers
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(arcjetMiddleware);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/excel-imports", excelImportRouter);
app.use("/api/statutes", statutesRouter);
app.use("/api/medical-requests", medicalRequestsRouter);
// app.use("/api/examination-types", examinationTypesRouter);
// app.use("/api/exams", examsRouter);
// app.use("/api/results", resultsRouter); // Public routes for exam resultscv
// app.use("/api/origins", originsRouter); // Public routes for exam resultscv

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription API");
});


// Serve the rest of frontend (index.html, manifest, sw.js, etc.)
app.use(express.static(clientDist));

// Fallback for React Router (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});
// Handle undefined routes (404 errors)
app.all("*", notFound);

// Global error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log("Subscription Tracker API is running on port " + PORT);
  await connectToDB();
});

export default app;