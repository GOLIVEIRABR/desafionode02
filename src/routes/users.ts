import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)
    const userId = randomUUID()

    const sessionCookies = {
      userId,
      name,
      email,
    }

    reply.setCookie('sessionCookies', JSON.stringify(sessionCookies), {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({
      id: userId,
      name,
      email,
    })

    return reply.status(201).send()
  })
}
