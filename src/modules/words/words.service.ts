import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from './entities/word.entity';
import { History } from './entities/history.entity';
import { Favorite } from './entities/favorite.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Response } from 'express';

@Injectable()
export class WordsService {
  private readonly dictionaryApiUrl: string;

  constructor(
    @InjectRepository(Word)
    private wordsRepository: Repository<Word>,
    @InjectRepository(History)
    private historyRepository: Repository<History>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.dictionaryApiUrl = this.configService.get<string>('DICTIONARY_API_URL');
  }

  async findAll(search?: string, cursor?: string, limit = 10) {
    const query = this.wordsRepository.createQueryBuilder('word');

    if (search) {
      query.where('word.word LIKE :search', { search: `%${search}%` });
    }

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString();
      const { id } = JSON.parse(decodedCursor);
      query.andWhere('word.id > :id', { id });
    }

    const words = await query
      .orderBy('word.id', 'ASC')
      .take(limit + 1)
      .getMany();

    const hasNext = words.length > limit;
    if (hasNext) {
      words.pop();
    }

    const nextCursor = hasNext
      ? Buffer.from(JSON.stringify({ id: words[words.length - 1].id })).toString('base64')
      : null;

    const previousCursor = cursor || null;

    return {
      results: words.map(word => word.word),
      totalDocs: await query.getCount(),
      previous: previousCursor,
      next: nextCursor,
      hasNext,
      hasPrev: !!previousCursor,
    };
  }

  async findOne(word: string, userId: string, res: Response) {
    const startTime = Date.now();
    const cacheKey = `word:${word}`;

    // Tenta buscar do cache
    const cachedWord = await this.cacheManager.get<Word>(cacheKey);
    if (cachedWord) {
      res.setHeader('x-cache', 'HIT');
      res.setHeader('x-response-time', `${Date.now() - startTime}ms`);
      return cachedWord;
    }

    // Se não encontrar no cache, busca no banco
    let wordEntity = await this.wordsRepository.findOne({ where: { word } });

    // Se não encontrar no banco, busca na API externa
    if (!wordEntity) {
      try {
        const { data } = await firstValueFrom(
          this.httpService.get(`${this.dictionaryApiUrl}/en/${word}`),
        );

        // Salva no banco
        wordEntity = await this.wordsRepository.save({
          word,
          details: data,
          definition: data[0]?.meanings[0]?.definitions[0]?.definition,
          example: data[0]?.meanings[0]?.definitions[0]?.example,
          etymology: data[0]?.etymologies?.[0],
          synonyms: data[0]?.meanings[0]?.definitions[0]?.synonyms,
          antonyms: data[0]?.meanings[0]?.definitions[0]?.antonyms,
          partOfSpeech: data[0]?.meanings[0]?.partOfSpeech,
        });
      } catch (error) {
        if (error.response?.status === 404) {
          throw new NotFoundException(`Word "${word}" not found`);
        }
        throw error;
      }
    }

    // Salva no cache
    await this.cacheManager.set(cacheKey, wordEntity);

    // Incrementa o contador de buscas
    await this.wordsRepository.update(wordEntity.id, {
      searchCount: wordEntity.searchCount + 1,
    });

    // Salva no histórico
    await this.historyRepository.save({
      userId,
      wordId: wordEntity.id,
    });

    res.setHeader('x-cache', 'MISS');
    res.setHeader('x-response-time', `${Date.now() - startTime}ms`);

    return wordEntity;
  }

  async getHistory(userId: string, cursor?: string, limit = 10) {
    const query = this.historyRepository.createQueryBuilder('history')
      .select(['history.id', 'history.searchedAt', 'word.word'])
      .leftJoin('history.word', 'word')
      .where('history.userId = :userId', { userId });

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString();
      const { searchedAt, id } = JSON.parse(decodedCursor);
      query.andWhere(
        '(history.searchedAt < :searchedAt OR (history.searchedAt = :searchedAt AND history.id > :id))',
        { searchedAt, id },
      );
    }

    const history = await query
      .orderBy('history.searchedAt', 'DESC')
      .addOrderBy('history.id', 'ASC')
      .take(limit + 1)
      .getMany();

    const hasNext = history.length > limit;
    if (hasNext) {
      history.pop();
    }

    const nextCursor = hasNext
      ? Buffer.from(JSON.stringify({
          searchedAt: history[history.length - 1].searchedAt,
          id: history[history.length - 1].id,
        })).toString('base64')
      : null;

    const previousCursor = cursor || null;

    return {
      results: history.map(h => ({
        word: h.word.word,
        added: h.searchedAt,
      })),
      totalDocs: await query.getCount(),
      previous: previousCursor,
      next: nextCursor,
      hasNext,
      hasPrev: !!previousCursor,
    };
  }

  async getFavorites(userId: string, cursor?: string, limit = 10) {
    const query = this.favoriteRepository.createQueryBuilder('favorite')
      .select(['favorite.id', 'favorite.favoritedAt', 'word.word'])
      .leftJoin('favorite.word', 'word')
      .where('favorite.userId = :userId', { userId });

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString();
      const { favoritedAt, id } = JSON.parse(decodedCursor);
      query.andWhere(
        '(favorite.favoritedAt < :favoritedAt OR (favorite.favoritedAt = :favoritedAt AND favorite.id > :id))',
        { favoritedAt, id },
      );
    }

    const favorites = await query
      .orderBy('favorite.favoritedAt', 'DESC')
      .addOrderBy('favorite.id', 'ASC')
      .take(limit + 1)
      .getMany();

    const hasNext = favorites.length > limit;
    if (hasNext) {
      favorites.pop();
    }

    const nextCursor = hasNext
      ? Buffer.from(JSON.stringify({
          favoritedAt: favorites[favorites.length - 1].favoritedAt,
          id: favorites[favorites.length - 1].id,
        })).toString('base64')
      : null;

    const previousCursor = cursor || null;

    return {
      results: favorites.map(fav => ({
        word: fav.word.word,
        added: fav.favoritedAt,
      })),
      totalDocs: await query.getCount(),
      previous: previousCursor,
      next: nextCursor,
      hasNext,
      hasPrev: !!previousCursor,
    };
  }

  async addToFavorites(word: string, userId: string) {
    const wordEntity = await this.wordsRepository.findOne({ 
      select: ['id'],
      where: { word } 
    });
    
    if (!wordEntity) {
      throw new NotFoundException(`Word "${word}" not found`);
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      select: ['id', 'favoritedAt'],
      where: { userId, wordId: wordEntity.id },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    return this.favoriteRepository.save({
      userId,
      wordId: wordEntity.id,
    });
  }

  async removeFromFavorites(word: string, userId: string) {
    const wordEntity = await this.wordsRepository.findOne({ 
      select: ['id'],
      where: { word } 
    });
    
    if (!wordEntity) {
      throw new NotFoundException(`Word "${word}" not found`);
    }

    const favorite = await this.favoriteRepository.findOne({
      select: ['id'],
      where: { userId, wordId: wordEntity.id },
    });

    if (!favorite) {
      throw new NotFoundException(`Word "${word}" is not in favorites`);
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Word removed from favorites' };
  }
} 