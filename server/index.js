import express from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import compression from "compression";
import { fileURLToPath } from "url";
import { dirname } from "path";
import projectRoutes from "./backend/Routes/projectRoutes.js";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

const mongoURI = "mongodb://bannerAdmin:password@localhost:27017/banner";
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return false;
  }
};

const checkDatabaseConnection = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(500).send("<html><body><h1>Server is not running</h1></body></html>");
  }
};

app.use(checkDatabaseConnection);

app.use("/uploads", express.static(path.join(__dirname, "../server/public/uploads/")));

app.use("/api/projects", projectRoutes);

app.use(
  createProxyMiddleware({
    target: "http://localhost:5173",
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const startServer = async () => {
  const dbConnected = await connectToMongoDB();

  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}.\n MongoDB database connection failed!`
      );
    });
  }
};

startServer();
