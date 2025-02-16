import mongoose from 'mongoose'
import request from 'supertest'
import { User } from '../../modules/user/types'
import { app } from '../../server'
import { getAccessToken } from '../../utils/getAccessToken'
import { clearDatabase, createFakeUser, mongoServerInit } from '../utils'

describe('User test suite', () => {
  mongoServerInit()

  describe('POST /users', () => {
    it('should create a user', async () => {
      const result = await request(app)
      .post('/users')
      .set('Authorization', getAccessToken())
      .send({
        email: 'joao@email.com',
        name: 'joao',
        password: '123123'
      })
    
      expect(result.statusCode).toEqual(201)
      expect(result.body).toMatchObject({
        user: {
          email: 'joao@email.com',
          name: 'joao'
        }
      })
    })

    it('should not create a user when the sent email is already taken', async () => {
      await request(app)
      .post('/users')
      .set('Authorization', getAccessToken())
      .send({
        email: 'marcos@email.com',
        name: 'marcos',
        password: '123123'
      })

      const result = await request(app)
      .post('/users')
      .set('Authorization', getAccessToken())
      .send({
        email: 'marcos@email.com',
        name: 'marcos',
        password: '123123'
      })
    
      expect(result.statusCode).toEqual(500)
    })
  })

  describe('POST /users/login', () => {
    beforeAll(async () => {
      clearDatabase()
      await request(app)
      .post('/users')
      .set('Authorization', getAccessToken())
      .send({
        email: 'joao@email.com',
        name: 'joao',
        password: '123123'
      })
    })

    it('should login', async () => {
      
      const result = await request(app)
        .post('/users/login')
        .send({
          email: 'joao@email.com',
          password: '123123'
        })

        expect(result.statusCode).toEqual(200)
        expect(result.body).toMatchObject({
          user: {
            email: 'joao@email.com',
            name: 'joao',
          },
        })
    })

    it('should not login when password is wrong', async () => {
      const result = await request(app)
        .post('/users/login')
        .send({
          email: 'joao@email.com',
          password: '12344444'
        })

        expect(result.statusCode).toEqual(500)
    })
  })

  describe('GET /users', () => {
    let users: User[] = []

    beforeAll(async () => {
      clearDatabase()
      users.push(await createFakeUser())
      users.push(await createFakeUser())
    })

    it('should return unauthorized when no token is sent', async () => {
      const result = await request(app)
        .get('/users')
        .send()
      
      expect(result.statusCode).toEqual(401)
    })

    it('should return a list of users', async () => {
      const result = await request(app)
      .get('/users')
      .set('Authorization', getAccessToken())
      .send()
    
      expect(result.statusCode).toEqual(200)
      expect(result.body)
        .toMatchObject({ results: users.map(user => ({ email: user.email, name: user.name })) })
    })
  })

  describe('GET /users/:id', () => {
    let user: User
    let wrongUser: User

    beforeAll(async () => {
      clearDatabase()
      user = await createFakeUser()
      wrongUser = await createFakeUser()
    })

    it('should return unauthorized when no token is sent', async () => {
      const result = await request(app)
        .get(`/users/${user._id}`)
        .send()
      
      expect(result.statusCode).toEqual(401)
    })

    it('should return the data of the user whose id is sent', async () => {
      const result = await request(app)
      .get(`/users/${user._id}`)
      .set('Authorization', getAccessToken())
      .send()
    
      expect(result.statusCode).toEqual(200)
      expect(result.body).toMatchObject({ _id: user._id, email: user.email, name: user.name })
      expect(result.body).not.toMatchObject({ _id: wrongUser._id, email: wrongUser.email, name: wrongUser.name })
    })
  })
})