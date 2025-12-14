import express from "express"
import ConfigServerController  from "../controllers/configServer.controller.js";

const configServerRouter = express.Router()

configServerRouter.get('/config', ConfigServerController .getConfig)
configServerRouter.post('/config', ConfigServerController .updateConfig)

export default configServerRouter