import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from '../modules/words/entities/word.entity';
import { ImportWordsCommand } from './import-words.command';
 
@Module({
  imports: [TypeOrmModule.forFeature([Word])],
  providers: [ImportWordsCommand],
})
export class CommandsModule {} 