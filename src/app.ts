import express, { type Application } from "express";

const app: Application = express();

app.get("/", (req, res) => {
  res.send("SkillBridge web is cooking...");
});

export default app;
