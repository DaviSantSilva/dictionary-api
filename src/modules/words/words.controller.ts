import { Controller, Get, Post, Delete, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('words')
@Controller('entries')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('en/:word')
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
  async findOne(@Param('word') word: string) {
    return this.wordsService.findOne(word);
  }

  @Get('en')
  @ApiOperation({ summary: 'Listar palavras em inglês' })
  @ApiQuery({ 
    name: 'cursor', 
    required: false, 
    description: 'Cursor para paginação baseada em cursores' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Número máximo de resultados por página (padrão: 10)',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna a lista de palavras paginada',
    schema: {
      type: 'object',
      properties: {
        results: { 
          type: 'array',
          items: {
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
        },
        totalDocs: { type: 'number' },
        previous: { type: 'string', nullable: true },
        next: { type: 'string', nullable: true },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
      }
    }
  })
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.wordsService.findAll(cursor, limit);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter histórico de buscas do usuário' })
  @ApiQuery({ 
    name: 'cursor', 
    required: false, 
    description: 'Cursor para paginação baseada em cursores' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Número máximo de resultados por página (padrão: 10)',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna o histórico de buscas do usuário',
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
  async getHistory(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.wordsService.getHistory(req.user.id, cursor, limit);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter palavras favoritas do usuário' })
  @ApiQuery({ 
    name: 'cursor', 
    required: false, 
    description: 'Cursor para paginação baseada em cursores' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Número máximo de resultados por página (padrão: 10)',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna as palavras favoritas do usuário',
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
  async getFavorites(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.wordsService.getFavorites(req.user.id, cursor, limit);
  }

  @Post('en/:word/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar palavra aos favoritos' })
  @ApiResponse({ 
    status: 201, 
    description: 'Palavra adicionada aos favoritos',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        wordId: { type: 'string' },
        favoritedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Palavra não encontrada' })
  async addToFavorites(
    @Param('word') word: string,
    @Req() req: any,
  ) {
    return this.wordsService.addToFavorites(word, req.user.id);
  }

  @Delete('en/:word/favorite')
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
  @ApiResponse({ status: 404, description: 'Palavra não encontrada ou não está nos favoritos' })
  async removeFromFavorites(
    @Param('word') word: string,
    @Req() req: any,
  ) {
    return this.wordsService.removeFromFavorites(word, req.user.id);
  }
} 