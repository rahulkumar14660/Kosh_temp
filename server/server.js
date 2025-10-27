import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import bookRouter from "./routers/book.router.js";
import authRouter from "./routers/auth.router.js";
import borrowRouter from "./routers/borrow.router.js";
import userRouter from "./routers/user.router.js";
import assetRouter from "./routers/asset.router.js";
import assetAssignmentRouter from "./routers/assignAsset.router.js";
import { v2 as cloudinary } from "cloudinary";
import { notifyUsers } from "./services/notifyUsers.js";
import auditLogRoutes from "./routers/auditLog.router.js";
import aiOperations from "./routers/aiOperations.js";
import swaggerSpec from "./swagger.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

app.use(
  cors({
    origin: ["https://kosh-erp.netlify.app", "http://localhost:5173", "http://localhost:8000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



connectDB().then(() => {
  console.log("DATABASE CONNECTED SUCCESSFULLY");
  notifyUsers();
  app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT}`);
  });
});
app.get("/ping", (req, res) => {
  return res.status(200).json({
    message: "pong",
  });
});

app.get('/', (req, res) => {
  res.render('home');
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/asset", assetRouter);
app.use("/api/v1/assignAsset", assetAssignmentRouter);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/v1/ai-operations', aiOperations);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorMiddleware);
