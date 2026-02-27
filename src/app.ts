import { toNodeHandler } from "better-auth/node";
import express, { type Application } from "express";
import { auth } from "./lib/auth";
import cors from "cors";
import { tutorRouter } from "./modules/tutor/tutor.route";

const app: Application = express();
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true,
  }),
);
app.use(express.json());

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/tutors", tutorRouter);

app.get("/", (req, res) => {
  res.send("SkillBridge web is cooking...");
});

export default app;
