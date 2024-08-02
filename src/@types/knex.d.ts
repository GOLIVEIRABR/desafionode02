// eslint-disable-next-line
import { Knex } from 'knex'
// ou faça apenas:
// import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
    }
    diets: {
      id: string
      user_id: string
      name: string
      description: string
      data: string
      onDiet: boolean
      created_at: string
    }
  }
}
