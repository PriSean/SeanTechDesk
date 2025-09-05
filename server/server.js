import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config(); // server/.env in dev; Render env in prod

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

// --- API ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/submissions", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name and email required" });
    const created = await prisma.submission.create({ data: { name, email, message } });
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/submissions", async (_req, res) => {
  try {
    const items = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// --- Serve React build ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "../client/dist");

app.use(express.static(clientDist));
app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(SeanTechDesk listening on :\));
