import { MAPS_DETAILS, GAMETYPES_DETAILS } from '../config/bo3-metadata.js';

class MetadataController {
    
    static getOptions(req, res, next) {
        try {
            res.status(200).json({
                status: "success",
                data: {
                    maps: MAPS_DETAILS,
                    gameModes: GAMETYPES_DETAILS
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default MetadataController;