import express from 'express';
import { protect } from '../middleware/auth';

import {
    createUserProject,
    getUserCredits,
    getUserProject,
    getUserProjects,
    purchaseCredits,
    togglePublish } from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/credits',protect, getUserCredits);

userRouter.post('/project', protect, createUserProject);
userRouter.get(`/project/:projectId`, protect, getUserProject);

userRouter.get('/projects', protect, getUserProjects);
userRouter.post('/purchase-credits', protect, purchaseCredits);
userRouter.get(`/toggle-publish/:projectId`, protect, togglePublish);

export default userRouter;
