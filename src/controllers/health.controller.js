import SystemValidationServices from "../services/system-validation-services.js";

class HealthController {
    static async getHealth (req, res, next) {
        try {
            const health = await SystemValidationServices.performHealthCheck()

            return res.status(200).json({
                status: "success",
                data: health
            })
        } catch (error) {
            next(error)
        }
    }
}

export default HealthController;