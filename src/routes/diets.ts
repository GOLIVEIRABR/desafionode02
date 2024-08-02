import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-session-id-exists'

interface ISessionCookies {
  userId: string
  name: string
  email: string
}

export async function dietsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const cookies = request.cookies.sessionCookies
      if (cookies) {
        const sessionCookies: ISessionCookies = JSON.parse(cookies)
        const diets = await knex('diets').where({
          user_id: sessionCookies.userId,
        })

        return {
          diets,
        }
      }

      return reply.status(201).send()
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const cookies = request.cookies.sessionCookies
      if (cookies) {
        const sessionCookies: ISessionCookies = JSON.parse(cookies)
        const diets = await knex('diets').where({
          user_id: sessionCookies.userId,
        })
        const totalDiets = diets.length
        let bestSequenceCalc = 0
        const summaryDiets = diets.reduce(
          (acc, item) => {
            if (bestSequenceCalc < acc.bestSequence) {
              bestSequenceCalc = acc.bestSequence
            }
            if (item.onDiet) {
              acc.onDiet++
              acc.bestSequence++
            } else {
              acc.offDiet++
              acc.bestSequence = 0
            }
            return acc
          },
          { onDiet: 0, offDiet: 0, bestSequence: 0 },
        )

        return {
          summary: {
            totalDiets,
            onDiet: summaryDiets.onDiet,
            offDiet: summaryDiets.offDiet,
            bestSequence: bestSequenceCalc,
          },
        }
      }

      return reply.status(201).send()
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const getDietParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getDietParamsSchema.parse(request.params)

      const cookies = request.cookies.sessionCookies
      if (cookies) {
        const sessionCookies: ISessionCookies = JSON.parse(cookies)
        const diet = await knex('diets')
          .where({
            id,
            user_id: sessionCookies.userId,
          })
          .first()

        return {
          diet,
        }
      }

      return reply.status(201).send()
    },
  )

  app.delete('/:id', async (request, reply) => {
    const deleteDietParamsSchema = z.object({
      id: z.string(),
    })
    const { id } = deleteDietParamsSchema.parse(request.params)

    const cookies = request.cookies.sessionCookies
    if (cookies) {
      const sessionCookies: ISessionCookies = JSON.parse(cookies)
      await knex('diets').delete().where({ id, user_id: sessionCookies.userId })
    }

    return reply.status(201).send()
  })

  app.put('/', async (request, reply) => {
    const updateDietBodySchema = z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      data: z.string().optional(),
      onDiet: z.boolean().optional(),
    })

    const { id, name, description, data, onDiet } = updateDietBodySchema.parse(
      request.body,
    )

    const cookies = request.cookies.sessionCookies
    if (cookies) {
      const sessionCookies: ISessionCookies = JSON.parse(cookies)

      await knex('diets')
        .update({
          name,
          description,
          data,
          onDiet,
        })
        .where({ id, user_id: sessionCookies.userId })
    }

    return reply.status(201).send()
  })

  app.post('/', async (request, reply) => {
    const createDietBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      data: z.string(),
      onDiet: z.boolean(),
    })

    const { name, description, data, onDiet } = createDietBodySchema.parse(
      request.body,
    )

    const cookies = request.cookies.sessionCookies
    if (cookies) {
      const sessionCookies: ISessionCookies = JSON.parse(cookies)

      await knex('diets').insert({
        id: randomUUID(),
        user_id: sessionCookies.userId,
        name,
        description,
        data,
        onDiet,
      })
    }

    return reply.status(201).send()
  })
}
