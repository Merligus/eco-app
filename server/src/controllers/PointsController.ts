import { Request, Response } from "express";
import knex from "./../database/connection";

class PointsController {
    async index(req: Request, res: Response) {
        var { city, uf, items } = req.query;

        city = city ? String(city).toLowerCase() : "";
        uf = uf ? String(uf).toLowerCase() : "";

        let parsedItems: number[];
        if (!items || items.length === 0) {
            parsedItems = await (await knex("items").select("id")).map(item => item.id);
        }
        else {
            parsedItems = String(items)
                .split(",")
                .map(item => Number(item.trim()));
        }

        const points = await knex("points")
            .join("point_items", "points.id", "=", "point_items.point_id")
            .whereIn("point_items.item_id", parsedItems)
            .where("city", "like", `%${city}%`)
            .where("uf", "like", `%${uf}%`)
            .distinct()
            .groupBy("point_id")
            .select(knex.raw("points.*, group_concat(item_id) as items_raw"));
        
        const serializedPoints = points.map(point => {
            return {
                ...point,
                items: point.items_raw
                    .split(",")
                    .map((item: String) => Number(item)),
                image_url: `${process.env.URL_DOMAIN}/uploads/${point.image}`,
            };
        });
            
        return res.json(serializedPoints);
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex("points").where("id", id).first();

        if (!point) {
            return res.status(400).json({ message: "Point not found." });
        }

        const items = await knex("items")
            .join("point_items", "items.id", "=", "point_items.item_id")
            .where("point_items.point_id", id)
            .select("items.title");
        
        const serializedPoint = {
                ...point,
                image_url: `${process.env.URL_DOMAIN}/uploads/${point.image}`,
            };

        return res.json({point: serializedPoint, items});
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;

        const trx = await knex.transaction();

        const placeholder = "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=60";

        const point = {
            image: req.file === null ? placeholder : req.file?.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
    
        const insertedIds = await trx("points").insert(point);
    
        const point_id = insertedIds[0]
        
        const pointItems = items
            .split(",")
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id,
                };
            });
    
        await trx("point_items").insert(pointItems);
        await trx.commit();
    
        return res.json({ 
            id: point_id, 
            ...point,
        });
    }
}

export default PointsController;