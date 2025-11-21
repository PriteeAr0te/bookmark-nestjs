import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));

    await app.init();
    await app.listen(3333)

    prisma = app.get(PrismaService)

    pactum.request.setBaseUrl('http://localhost:3333')

    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: 'test123'
    }
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })

      it('should throw if np credentials probided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      })

      it('Should signup.', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)
      })

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400)
      })

      it('should throw if np credentials probided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
      })

      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'token.access_token')
      })
    })
  })

  describe('User', () => {
    describe('Get me', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })

    describe('Edit user', () => {
      it('Should edit user', () => {
        const dto: EditUserDto = {
          firstName: "Pritee",
          email: "priteearote.dev@gmail.com"
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBody([])
      })
    })

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: "test",
        link: "https://test.com"
      }
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id')
      })

    })

    describe('Get bookmark', () => {
      it('Should get bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })

    describe('Get bookmark by id', () => {
      it('Should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBodyContains('https://test.com')
      })
    })

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'test2',
        description: 'test description'
      }
      it('Should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
      })
    })

    describe('Delete bookmark by id', () => {
      it('Should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(204)
      })

      it('should get empty bookmarks', () => {
         return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectJsonLength(0)
      })
    })
  })
})