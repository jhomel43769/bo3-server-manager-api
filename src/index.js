import express from "express"
import cors from "cors"
import morgan from "morgan"

import AppError from "./utils/AppError.js"

import globalErrorHandler from "./middleware/errorHandler.js"
import serverStatusRouter from "./routes/statusServer.route.js"
import configServerRouter from "./routes/configServer.route.js"
import healthRouter from "./routes/health.routes.js"


const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))


app.use('/api/server', serverStatusRouter)
app.use('/api/server', configServerRouter)
app.use('/api/health', healthRouter)


app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

app.use(globalErrorHandler)

export default app;