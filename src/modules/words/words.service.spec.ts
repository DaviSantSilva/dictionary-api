import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { WordsService } from './words.service';
import { Word } from './entities/word.entity';
import { History } from './entities/history.entity';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { of } from 'rxjs';
import { Response } from 'express';

describe('WordsService', () => {
  let service: WordsService;
  let wordRepository: Repository<Word>;
  let historyRepository: Repository<History>;
  let favoriteRepository: Repository<Favorite>;
  let httpService: HttpService;
  let cacheManager: any;

  const mockWord = {
    id: 1,
    word: 'test',
    details: { test: 'test' },
    definition: 'test definition',
    example: 'test example',
    etymology: 'test etymology',
    synonyms: ['synonym1', 'synonym2'],
    antonyms: ['antonym1', 'antonym2'],
    partOfSpeech: 'noun',
    searchCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHistory = {
    id: 1,
    userId: 'user1',
    wordId: 1,
    searchedAt: new Date(),
    word: mockWord,
  };

  const mockFavorite = {
    id: 1,
    userId: 'user1',
    wordId: 1,
    favoritedAt: new Date(),
    word: mockWord,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: getRepositoryToken(Word),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockWord]),
            getCount: jest.fn().mockResolvedValue(1),
            findOne: jest.fn().mockResolvedValue(mockWord),
            save: jest.fn().mockResolvedValue(mockWord),
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(History),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockHistory]),
            getCount: jest.fn().mockResolvedValue(1),
            save: jest.fn().mockResolvedValue(mockHistory),
          },
        },
        {
          provide: getRepositoryToken(Favorite),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockFavorite]),
            getCount: jest.fn().mockResolvedValue(1),
            findOne: jest.fn().mockResolvedValue(mockFavorite),
            save: jest.fn().mockResolvedValue(mockFavorite),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(of({ data: [mockWord.details] })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://api.dictionaryapi.dev/api/v2'),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    wordRepository = module.get<Repository<Word>>(getRepositoryToken(Word));
    historyRepository = module.get<Repository<History>>(getRepositoryToken(History));
    favoriteRepository = module.get<Repository<Favorite>>(getRepositoryToken(Favorite));
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated words', async () => {
      const result = await service.findAll('test', undefined, 10);
      expect(result).toEqual({
        results: [mockWord.word],
        totalDocs: 1,
        previous: null,
        next: null,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return word from cache', async () => {
      const mockRes = {
        setHeader: jest.fn(),
      } as any as Response;

      cacheManager.get.mockResolvedValueOnce(mockWord);

      const result = await service.findOne('test', 'user1', mockRes);
      expect(result).toEqual(mockWord);
      expect(mockRes.setHeader).toHaveBeenCalledWith('x-cache', 'HIT');
    });

    it('should return word from database', async () => {
      const mockRes = {
        setHeader: jest.fn(),
      } as any as Response;

      cacheManager.get.mockResolvedValueOnce(null);

      const result = await service.findOne('test', 'user1', mockRes);
      expect(result).toEqual(mockWord);
      expect(mockRes.setHeader).toHaveBeenCalledWith('x-cache', 'MISS');
    });

    it('should fetch word from API if not in database', async () => {
      const mockRes = {
        setHeader: jest.fn(),
      } as any as Response;

      cacheManager.get.mockResolvedValueOnce(null);
      wordRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findOne('test', 'user1', mockRes);
      expect(result).toEqual(mockWord);
      expect(httpService.get).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      const result = await service.getHistory('user1', undefined, 10);
      expect(result).toEqual({
        results: [{ word: mockWord.word, added: mockHistory.searchedAt }],
        totalDocs: 1,
        previous: null,
        next: null,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('getFavorites', () => {
    it('should return paginated favorites', async () => {
      const result = await service.getFavorites('user1', undefined, 10);
      expect(result).toEqual({
        results: [{ word: mockWord.word, added: mockFavorite.favoritedAt }],
        totalDocs: 1,
        previous: null,
        next: null,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('addToFavorites', () => {
    it('should add word to favorites', async () => {
      const result = await service.addToFavorites('test', 'user1');
      expect(result).toEqual(mockFavorite);
    });

    it('should return existing favorite if already favorited', async () => {
      const result = await service.addToFavorites('test', 'user1');
      expect(result).toEqual(mockFavorite);
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove word from favorites', async () => {
      const result = await service.removeFromFavorites('test', 'user1');
      expect(result).toEqual({ message: 'Word removed from favorites' });
    });

    it('should throw error if word not in favorites', async () => {
      favoriteRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.removeFromFavorites('test', 'user1')).rejects.toThrow();
    });
  });
}); 