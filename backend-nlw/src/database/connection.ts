import knex from 'knex'     //npm install knex
import path from 'path'

// __dirname = caminho do diretório de execução

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite'),
    },
    useNullAsDefault: true
})

export default connection

// Executar para criar as migrations: 
// npx knex --knexfile knexfile.ts migrate:latest

// ou após incluir nos scripts do package.json:
// npm run knex:migrate