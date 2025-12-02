import express from "express"
import cors from "cors"
import morgan from "morgan"
import AppError from "./utils/AppError.js"
import globalErrorHandler from "./middleware/errorHandler.js"


const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())


app.get('/ping', (req, res) => {
    res.send("pong")
})

app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

app.use(globalErrorHandler)

export default app;