import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { dietsRoutes } from './routes/diets'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(dietsRoutes, {
  prefix: 'diets',
})
