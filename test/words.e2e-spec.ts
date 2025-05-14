import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('WordsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Criar token de autenticação para testes
    authToken = jwtService.sign({ id: 'test-user', email: 'test@example.com' });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /entries/en', () => {
    it('should return paginated words', () => {
      return request(app.getHttpServer())
        .get('/entries/en')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('totalDocs');
          expect(res.body).toHaveProperty('previous');
          expect(res.body).toHaveProperty('next');
          expect(res.body).toHaveProperty('hasNext');
          expect(res.body).toHaveProperty('hasPrev');
        });
    });

    it('should return filtered words by search term', () => {
      return request(app.getHttpServer())
        .get('/entries/en?search=test')
        .expect(200)
        .expect((res) => {
          expect(res.body.results).toBeInstanceOf(Array);
          expect(res.body.results.every((word: string) => word.includes('test'))).toBe(true);
        });
    });
  });

  describe('GET /entries/en/:word', () => {
    it('should return word details', () => {
      return request(app.getHttpServer())
        .get('/entries/en/test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('word');
          expect(res.body).toHaveProperty('details');
          expect(res.body).toHaveProperty('definition');
          expect(res.body).toHaveProperty('example');
          expect(res.body).toHaveProperty('etymology');
          expect(res.body).toHaveProperty('synonyms');
          expect(res.body).toHaveProperty('antonyms');
          expect(res.body).toHaveProperty('partOfSpeech');
          expect(res.body).toHaveProperty('searchCount');
        });
    });

    it('should return 404 for non-existent word', () => {
      return request(app.getHttpServer())
        .get('/entries/en/nonexistentword123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/entries/en/test')
        .expect(401);
    });
  });

  describe('GET /entries/history', () => {
    it('should return user search history', () => {
      return request(app.getHttpServer())
        .get('/entries/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('totalDocs');
          expect(res.body).toHaveProperty('previous');
          expect(res.body).toHaveProperty('next');
          expect(res.body).toHaveProperty('hasNext');
          expect(res.body).toHaveProperty('hasPrev');
          expect(res.body.results).toBeInstanceOf(Array);
          expect(res.body.results[0]).toHaveProperty('word');
          expect(res.body.results[0]).toHaveProperty('added');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/entries/history')
        .expect(401);
    });
  });

  describe('GET /entries/favorites', () => {
    it('should return user favorites', () => {
      return request(app.getHttpServer())
        .get('/entries/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('totalDocs');
          expect(res.body).toHaveProperty('previous');
          expect(res.body).toHaveProperty('next');
          expect(res.body).toHaveProperty('hasNext');
          expect(res.body).toHaveProperty('hasPrev');
          expect(res.body.results).toBeInstanceOf(Array);
          expect(res.body.results[0]).toHaveProperty('word');
          expect(res.body.results[0]).toHaveProperty('added');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/entries/favorites')
        .expect(401);
    });
  });

  describe('POST /entries/en/:word/favorite', () => {
    it('should add word to favorites', () => {
      return request(app.getHttpServer())
        .post('/entries/en/test/favorite')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('wordId');
          expect(res.body).toHaveProperty('favoritedAt');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/entries/en/test/favorite')
        .expect(401);
    });
  });

  describe('DELETE /entries/en/:word/unfavorite', () => {
    it('should remove word from favorites', () => {
      return request(app.getHttpServer())
        .delete('/entries/en/test/unfavorite')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Word removed from favorites');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete('/entries/en/test/unfavorite')
        .expect(401);
    });
  });
}); 