"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./../database/connection"));
class PointsController {
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var { city, uf, items } = req.query;
            city = city ? String(city).toLowerCase() : "";
            uf = uf ? String(uf).toLowerCase() : "";
            let parsedItems;
            if (!items || items.length === 0) {
                parsedItems = yield (yield (0, connection_1.default)("items").select("id")).map(item => item.id);
            }
            else {
                parsedItems = String(items)
                    .split(",")
                    .map(item => Number(item.trim()));
            }
            const points = yield (0, connection_1.default)("points")
                .join("point_items", "points.id", "=", "point_items.point_id")
                .whereIn("point_items.item_id", parsedItems)
                .where("city", "like", `%${city}%`)
                .where("uf", "like", `%${uf}%`)
                .distinct()
                .groupBy("point_id")
                .select(connection_1.default.raw("points.*, group_concat(item_id) as items_raw"));
            const serializedPoints = points.map(point => {
                return Object.assign(Object.assign({}, point), { items: point.items_raw
                        .split(",")
                        .map((item) => Number(item)), image_url: `${process.env.URL_DOMAIN}/uploads/${point.image}` });
            });
            return res.json(serializedPoints);
        });
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const point = yield (0, connection_1.default)("points").where("id", id).first();
            if (!point) {
                return res.status(400).json({ message: "Point not found." });
            }
            const items = yield (0, connection_1.default)("items")
                .join("point_items", "items.id", "=", "point_items.item_id")
                .where("point_items.point_id", id)
                .select("items.title");
            const serializedPoint = Object.assign(Object.assign({}, point), { image_url: `${process.env.URL_DOMAIN}/uploads/${point.image}` });
            return res.json({ point: serializedPoint, items });
        });
    }
    create(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;
            const trx = yield connection_1.default.transaction();
            const placeholder = "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=60";
            const point = {
                image: req.file === null ? placeholder : (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename,
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            };
            const insertedIds = yield trx("points").insert(point);
            const point_id = insertedIds[0];
            const pointItems = items
                .split(",")
                .map((item) => Number(item.trim()))
                .map((item_id) => {
                return {
                    item_id,
                    point_id,
                };
            });
            yield trx("point_items").insert(pointItems);
            yield trx.commit();
            return res.json(Object.assign({ id: point_id }, point));
        });
    }
}
exports.default = PointsController;
