import { Request, Response } from 'express'
import knex from '../database/connection'

//Padrão de nomes: index, show, create, update, delete
class ItemsController {
    async index (request: Request, response: Response){
        const items = await knex('item').select('*')
    
        //Serialização da imagem: retornar url
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                name: item.title,
                image: `http://localhost:3333/uploads/${item.image}`
            }
        })
    
        return response.json(serializedItems)
    }
}

export default ItemsController