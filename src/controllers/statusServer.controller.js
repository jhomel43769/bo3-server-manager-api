import Bo3ProcessService from "../services/bo3-process-service.js"

class ServerActionController {

    static async startServer(req, res, next) {
        try {
            const result = await Bo3ProcessService.start()

            res.status(200).json({
                status: "success",
                message: "Servidor iniciado correctamente",
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async stopServer(req, res, next) {
        try {
            const result  = await Bo3ProcessService.stop()
            
            res.status(200).json({
                status: "success",
                message: "Servidor detenido correctamente",
                data: result
            })
        } catch (error) {
            next(error)
        }
    } 

    static async getStatusServer(req, res, next) {
        try {
            const status = Bo3ProcessService.getStatus()
            
            res.status(200).json({
                status: "success",
                message: "Estado del servidor obtenido",
                data: status
            })
        } catch (error) {
            next(error)
        }
    }
}

export default ServerActionController;