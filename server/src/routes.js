"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const celebrate_1 = require("celebrate");
const multer_1 = __importDefault(require("multer"));
const multer_2 = __importDefault(require("./config/multer"));
const PointsController_1 = __importDefault(require("./controllers/PointsController"));
const ItemsController_1 = __importDefault(require("./controllers/ItemsController"));
const routes = express_1.default.Router();
const upload = (0, multer_1.default)(multer_2.default);
const pointsController = new PointsController_1.default();
const itemsController = new ItemsController_1.default();
routes.get("/items", itemsController.index);
routes.get("/points", pointsController.index);
routes.get("/points/:id", pointsController.show);
routes.post("/points", upload.single("image"), (0, celebrate_1.celebrate)({
    body: celebrate_1.Joi.object().keys({
        name: celebrate_1.Joi.string().required(),
        email: celebrate_1.Joi.string().required().email(),
        whatsapp: celebrate_1.Joi.number().required(),
        latitude: celebrate_1.Joi.number().required(),
        longitude: celebrate_1.Joi.number().required(),
        city: celebrate_1.Joi.string().required(),
        uf: celebrate_1.Joi.string().required().max(2),
        items: celebrate_1.Joi.string().required(),
    })
}, {
    abortEarly: false
}), pointsController.create);
exports.default = routes;
