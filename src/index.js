import express from "express"
import cors from "cors"
import morgan from "morgan"
import AppError from "./utils/AppError.js"
import globalErrorHandler from "./middleware/errorHandler.js"
import serverStatusRouter from "./routes/statusServer.route.js"


const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))


app.use('/api/server', serverStatusRouter)



app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

app.use(globalErrorHandler)

export default app;