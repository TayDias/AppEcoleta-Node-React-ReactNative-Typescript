import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
    async index (request: Request, response: Response) {
        //filtros: cidade, uf, itens
        const {
            city,
            uf,
            items
        } = request.query

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))

        const points = await knex('point')
            .join('point_item', 'point.id', '=', 'point_item.point_id')
            .whereIn('point_item.item_id', parsedItems)
            .orWhere('city', String(city))
            .orWhere('uf', String(uf))
            .distinct()
            .select('point.*')

        return response.json(points)
    }

    async show (request: Request, response: Response) {
        const { id } = request.params

        const point = await knex('point').where('id', id).first()

        if(!point) {
            return response.status(400).json({ message: "Point not found."})
        }

        const items = await knex('item')
            .join('point_item', 'item_id', '=', 'item.id')
            .where('point_item.point_id', id)
            .select('item.title')


        return response.json({ point, items })
    }

    async create (request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        //Transação aberta para garantir execução conjunta dos inserts
        const transaction = await knex.transaction()

        const point = {
            image: 'https://images.unsplash.com/photo-1481761289552-381112059e05?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
    
        //Insersão + Retorno de um vetor de ids dos itens inseridos
        const insertedIds = await transaction('point').insert(point)
    
        //Pegar o id na posição 0
        const point_id = insertedIds[0]
    
        const pointItens = items.map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
    
        //Relacionamento com a tabela de items
        await transaction('point_item').insert(pointItens)
    
        await transaction.commit()

        return response.json({
            point_id, 
            ...point
         })
    }
}

export default PointsController