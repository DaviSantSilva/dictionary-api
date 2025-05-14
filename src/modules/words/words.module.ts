import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { History } from './entities/history.entity';
import { Word } from './entities/word.entity';
import { Favorite } from './entities/favorite.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([History, Word, Favorite]),
    HttpModule,
    ConfigModule,
    CacheModule.register({
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      max: 1000, // máximo de 1000 itens em cache
    }),
  ],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {} 