import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto'

describe('App e2e', ()=> {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async ()=> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    )

    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)

    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  })

  afterAll(()=> {
    app.close()
  })
  
  describe('Auth', ()=> {
    const dto: AuthDto = {
      email: 'yuri@gmail.com',
      password: '123'
    }
    describe('Signup', ()=>{
      it('should throw if email empty', () =>{
        return pactum
          .spec()
          .post(
            '/auth/signup'
          ).withBody({
            password: dto.password
          })
          .expectStatus(400)
          .inspect()
      })
      it('should throw if password empty', () =>{
        return pactum
          .spec()
          .post(
            '/auth/signup'
          ).withBody({
            email: dto.email
          })
          .expectStatus(400)
          .inspect()
      })
      it('should throw if no body provided', () =>{
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
          .inspect()
      })
      it('should signup', ()=>{
        return pactum
          .spec()
          .post(
            '/auth/signup'
          ).withBody(dto)
          .expectStatus(201)
          .inspect()
      })
    })
    describe('Signin', ()=>{
      it('should throw if email empty', () =>{
        return pactum
          .spec()
          .post(
            '/auth/signin'
          ).withBody({
            password: dto.password
          })
          .expectStatus(400)
          .inspect()
      })
      it('should throw if password empty', () =>{
        return pactum
          .spec()
          .post(
            '/auth/signin'
          ).withBody({
            email: dto.email
          })
          .expectStatus(400)
          .inspect()
      })
      it('should throw if no body provided', () =>{
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
          .inspect()
      })
      it('should signin', () =>{
        return pactum
          .spec()
          .post(
            '/auth/signin'
          ).withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      })
    })
  })

  describe('User', ()=> {
    describe('Get', ()=>{
      it('should get current user', ()=> {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
      })
    })

    describe('Edit', ()=>{
      it('should edit user', ()=> {
        const dto: EditUserDto = {
          firstName: 'Doe Smith',
          email: 'john.doe@gmail.com'
        }

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmarks', ()=> {
    describe('Create', ()=>{
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark', 
        link: 'https://github.com/yuriandreisilva',
      }

      it('should create bookmarks', ()=>{
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmark', 'id')
      })
    })

    describe('Get empty', ()=>{
      it('should get bookmarks', ()=>{
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBody([])
      })
    })

    describe('Get bookmarks', ()=>{
      it('should get bookmarks', ()=>{
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })

    describe('Get by id', ()=>{
      it('should get bookmarks by id', ()=>{
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`)
      })
    })

    describe('Edit by id', ()=>{
      it('should edit bookmarks by id', ()=>{
        const dto: EditBookmarkDto = {
          title: 'Test Changing Title',
          description: 'Test Changing Description'
        }

        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .withBody(dto)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectStatus(200)
      })
    })

    describe('Delete by id', ()=>{
      it('should delete bookmarks by id', ()=>{
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(204)
      })

      it('should get empty bookmarks', ()=>{
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`
          })
          .expectStatus(200)
          .expectJsonLength(0)
      })
    })
  })
})