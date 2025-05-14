import { Test, TestingModule } from '@nestjs/testing';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

describe('WordsController', () => {
  let controller: WordsController;
  let service: WordsService;

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

  const mockWordsService = {
    findAll: jest.fn().mockResolvedValue({
      results: [mockWord.word],
      totalDocs: 1,
      previous: null,
      next: null,
      hasNext: false,
      hasPrev: false,
    }),
    findOne: jest.fn().mockResolvedValue(mockWord),
    getHistory: jest.fn().mockResolvedValue({
      results: [{ word: mockWord.word, added: mockHistory.searchedAt }],
      totalDocs: 1,
      previous: null,
      next: null,
      hasNext: false,
      hasPrev: false,
    }),
    getFavorites: jest.fn().mockResolvedValue({
      results: [{ word: mockWord.word, added: mockFavorite.favoritedAt }],
      totalDocs: 1,
      previous: null,
      next: null,
      hasNext: false,
      hasPrev: false,
    }),
    addToFavorites: jest.fn().mockResolvedValue(mockFavorite),
    removeFromFavorites: jest.fn().mockResolvedValue({ message: 'Word removed from favorites' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordsController],
      providers: [
        {
          provide: WordsService,
          useValue: mockWordsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WordsController>(WordsController);
    service = module.get<WordsService>(WordsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated words', async () => {
      const result = await controller.findAll('test', undefined, 10);
      expect(result).toEqual({
        results: [mockWord.word],
        totalDocs: 1,
        previous: null,
        next: null,
        hasNext: false,
        hasPrev: false,
      });
      expect(service.findAll).toHaveBeenCalledWith('test', undefined, 10);
    });
  });

  describe('findOne', () => {
    it('should return word details', async () => {
      const mockReq = { user: { id: 'user1' } };
      const mockRes = {
        json: jest.fn().mockReturnThis(),
      } as any as Response;

      await controller.findOne('test', mockReq, mockRes);
      expect(service.findOne).toHaveBeenCalledWith('test', 'user1', mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(mockWord);
    });
  });

  describe('getHistory', () => {
    it('should return user search history', async () => {
      const mockReq = { user: { id: 'user1' } };
      const result = await controller.getHistory(mockReq, undefined, 10);
      expect(result).toEqual({
        results: [{ word: mockWord.word, added: mockHistory.searchedAt }],
        totalDocs: 1,
        previous: null,
        next: null,
        hasNext: false,
        hasPrev: false,
      });
      expect(service.getHistory).toHaveBeenCalledWith('user1', undefined, 10);
    });
  });

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      const mockReq = { user: { id: 'user1' } };
      const result = await controller.getFavorites(mockReq, undefined, 10);
      expect(result).toEqual({
        results: [{ word: mockWord.word, added: mockFavorite.favoritedAt }],
        totalDocs: 1,
        previous: null,
        next: null,
        hasNext: false,
        hasPrev: false,
      });
      expect(service.getFavorites).toHaveBeenCalledWith('user1', undefined, 10);
    });
  });

  describe('addToFavorites', () => {
    it('should add word to favorites', async () => {
      const mockReq = { user: { id: 'user1' } };
      const result = await controller.addToFavorites('test', mockReq);
      expect(result).toEqual(mockFavorite);
      expect(service.addToFavorites).toHaveBeenCalledWith('test', 'user1');
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove word from favorites', async () => {
      const mockReq = { user: { id: 'user1' } };
      const result = await controller.removeFromFavorites('test', mockReq);
      expect(result).toEqual({ message: 'Word removed from favorites' });
      expect(service.removeFromFavorites).toHaveBeenCalledWith('test', 'user1');
    });
  });
}); 