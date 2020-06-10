// Extensão .ts, de type script

// Necessário instalar a definição de tipos do express. Verificar a sugestão do alerta.
import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes'

const app = express()

app.use(cors())     //npm install cors
app.use(express.json())
app.use(routes)

//visualizar imagens
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(3333)