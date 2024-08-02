import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('diets routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a diet', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@hotmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: false,
      })
      .expect(201)
  })

  it('should be able to list all diets by user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@hotmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Janta',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: false,
      })
      .expect(201)

    const listDietsResponse = await request(app.server)
      .get('/diets')
      .set('Cookie', cookies)
      .expect(200)

    expect(listDietsResponse.body.diets).toHaveLength(2)
  })

  it('should be able to get a specific user diet', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@hotmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: false,
      })
      .expect(201)

    const listDietsResponse = await request(app.server)
      .get('/diets')
      .set('Cookie', cookies)
      .expect(200)

    const dietId = listDietsResponse.body.diets[0].id

    const getDietResponse = await request(app.server)
      .get(`/diets/${dietId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getDietResponse.body.diet).toEqual(
      expect.objectContaining({
        name: 'Almoço',
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@hotmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/diets')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Almoço pesado',
        data: "{% faker 'isoTimestamp' %}",
        onDiet: false,
      })
      .expect(201)

    const summaryResponse = await request(app.server)
      .get('/diets/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      totalDiets: 3,
      onDiet: 2,
      offDiet: 1,
      bestSequence: 2,
    })
  })
})
