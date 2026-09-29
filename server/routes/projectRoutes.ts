import express from 'express';
import { protect } from '../middleware/auth';
import {
    deleteProject,
    getPreviewProject,
    getProjectById,
    getPublishedProjects,
    makeRevision,
    rollbackToVersion,
    saveProjectCode
} from '../controllers/projectController';

const projectRouter = express.Router();

projectRouter.get('/published',getPublishedProjects);
projectRouter.get("/published/:projectId", getProjectById);
projectRouter.get('/preview/:projectId', protect, getPreviewProject);
projectRouter.post('/revision/:projectId', protect, makeRevision);
projectRouter.put('/save/:projectId', protect, saveProjectCode);
projectRouter.get('/rollback/:projectId/:versionId', protect, rollbackToVersion);
projectRouter.delete('/:projectId', protect, deleteProject)

export default projectRouter;