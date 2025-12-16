import express from "express"
import ServerActionController from "../controllers/statusServer.controller.js"

const serverStatusRouter = express.Router()

serverStatusRouter.post('/start', ServerActionController.startServer)
serverStatusRouter.post('/stop', ServerActionController.stopServer)

serverStatusRouter.get('/status', ServerActionController.getStatusServer)
serverStatusRouter.get('/logs', ServerActionController.getLogs)


export default serverStatusRouter;