import "dotenv/config";
import express, { Request, Response } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import projectRouter from "./routes/projectRoutes";
import { stripeWebhook } from "./controllers/stripeWebhook";

const app = express();

const port = process.env.PORT || 3000;

// Middleware
const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({limit: '50mb'}));

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});