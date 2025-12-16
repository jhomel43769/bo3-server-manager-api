import express from 'express';
import MetadataController from '../controllers/metadata.controller.js';

const metadataRouter = express.Router();

metadataRouter.get('/available-options', MetadataController.getOptions);

export default metadataRouter;