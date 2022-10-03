import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { AppModule } from '../src/app.module'

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

    prisma = app.get(PrismaService)

    await prisma.cleanDb()
  })

  afterAll(()=> {
    app.close()
  })
  
  describe('Auth', ()=> {
    describe('Signup', ()=>{
      it.todo('should signup')
    })

    describe('Signin', ()=>{
      it.todo('should signin')
    })
  })

  describe('User', ()=> {
    describe('Get', ()=>{
      
    })

    describe('Edit', ()=>{
      
    })
  })

  describe('Bookmarks', ()=> {
    describe('Create', ()=>{
      
    })

    describe('Get', ()=>{
      
    })

    describe('Get by id', ()=>{
      
    })

    describe('Edit', ()=>{
      
    })

    describe('Delete', ()=>{
      
    })
  })
})