import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkUserIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionCookies = request.cookies.sessionCookies

  if (!sessionCookies) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
}
