import { Controller, Get, Post, Delete, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
}

@ApiTags('words')
@Controller('entries')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get(':word')
  @ApiOperation({ summary: 'Buscar definição de uma palavra em inglês' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna a definição da palavra',
    schema: {
      type: 'object',
      properties: {
        word: { type: 'string' },
        definition: { type: 'string' },
        example: { type: 'string', nullable: true },
        etymology: { type: 'string', nullable: true },
        synonyms: { type: 'array', items: { type: 'string' }, nullable: true },
        antonyms: { type: 'array', items: { type: 'string' }, nullable: true },
        partOfSpeech: { type: 'string', nullable: true },
        searchCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Palavra não encontrada' })
  async findOne(
    @Param('word') word: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    if (!req.user || !req.user.id) {
      throw new Error('Usuário não autenticado');
    }
    const result = await this.wordsService.findOne(word, req.user.id, res);
    return res.json(result);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar palavras em inglês' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna uma lista paginada de palavras',
    schema: {
      type: 'object',
      properties: {
        results: { type: 'array', items: { type: 'string' } },
        totalDocs: { type: 'number' },
        previous: { type: 'string', nullable: true },
        next: { type: 'string', nullable: true },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
      }
    }
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.wordsService.findAll(search, limit);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar histórico de pesquisas do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna uma lista paginada de palavras pesquisadas',
    schema: {
      type: 'object',
      properties: {
        results: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              word: { type: 'string' },
              added: { type: 'string', format: 'date-time' }
            }
          } 
        },
        totalDocs: { type: 'number' },
        previous: { type: 'string', nullable: true },
        next: { type: 'string', nullable: true },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
      }
    }
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Req() req: RequestWithUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    if (!req.user || !req.user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.wordsService.getHistory(req.user.id, cursor, limit);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar palavras favoritas do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna uma lista paginada de palavras favoritas',
    schema: {
      type: 'object',
      properties: {
        results: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              word: { type: 'string' },
              added: { type: 'string', format: 'date-time' }
            }
          } 
        },
        totalDocs: { type: 'number' },
        previous: { type: 'string', nullable: true },
        next: { type: 'string', nullable: true },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
      }
    }
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFavorites(
    @Req() req: RequestWithUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    if (!req.user || !req.user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.wordsService.getFavorites(req.user.id, cursor, limit);
  }

  @Post(':word/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar palavra aos favoritos' })
  @ApiResponse({ 
    status: 201, 
    description: 'Palavra adicionada aos favoritos',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'string' },
        wordId: { type: 'number' },
        favoritedAt: { type: 'string', format: 'date-time' },
        word: { 
          type: 'object',
          properties: {
            id: { type: 'number' },
            word: { type: 'string' },
            definition: { type: 'string' },
            example: { type: 'string', nullable: true },
            etymology: { type: 'string', nullable: true },
            synonyms: { type: 'array', items: { type: 'string' }, nullable: true },
            antonyms: { type: 'array', items: { type: 'string' }, nullable: true },
            partOfSpeech: { type: 'string', nullable: true },
            searchCount: { type: 'number' }
          }
        }
      }
    }
  })
  async addToFavorites(
    @Param('word') word: string,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user || !req.user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.wordsService.addToFavorites(word, req.user.id);
  }

  @Delete(':word/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover palavra dos favoritos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Palavra removida dos favoritos',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async removeFromFavorites(
    @Param('word') word: string,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user || !req.user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.wordsService.removeFromFavorites(word, req.user.id);
  }
} 