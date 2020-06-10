// User Methods
import express from 'express'

import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const routes = express.Router()
const pointsController = new PointsController()
const itemsController = new ItemsController()

//Listagem de Itens
routes.get('/items', itemsController.index)

//Criação do ponto de Coleta
routes.post('/point', pointsController.create)

//Listar pontos por busca
routes.get('/points', pointsController.index)

//Listar ponto de coleta especifico
routes.get('/point/:id', pointsController.show)

export default routes