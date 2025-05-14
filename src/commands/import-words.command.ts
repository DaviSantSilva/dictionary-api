import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from '../modules/words/entities/word.entity';
import axios from 'axios';
import { setTimeout } from 'timers/promises';
import * as cliProgress from 'cli-progress';

@Injectable()
@Command({
  name: 'import-words',
  description: 'Import words from Free Dictionary API wordList',
})
export class ImportWordsCommand extends CommandRunner {
  private readonly logger = new Logger(ImportWordsCommand.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 segundo

  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {
    super();
  }

  private async verifyConnection() {
    try {
      // Verifica se a conexão está ativa
      const isConnected = this.wordRepository.manager.connection.isConnected;
      this.logger.log(`Conexão com o banco está ${isConnected ? 'ativa' : 'inativa'}`);
      
      // Verifica o banco atual
      const dbResult = await this.wordRepository.query('SELECT current_database() as db');
      this.logger.log(`Banco de dados atual: ${dbResult[0].db}`);
      
      // Verifica o schema atual
      const schemaResult = await this.wordRepository.query('SELECT current_schema() as schema');
      this.logger.log(`Schema atual: ${schemaResult[0].schema}`);
      
      // Lista todas as tabelas no schema public
      const tablesResult = await this.wordRepository.query(`
        SELECT table_name, table_schema
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      this.logger.log('Tabelas encontradas:');
      tablesResult.forEach((table: any) => {
        this.logger.log(`- ${table.table_name} (schema: ${table.table_schema})`);
      });
      
      // Verifica se a tabela words existe em qualquer schema (case insensitive)
      const wordsTableResult = await this.wordRepository.query(`
        SELECT table_name, table_schema
        FROM information_schema.tables 
        WHERE table_name ILIKE 'words'
      `);
      
      if (wordsTableResult.length > 0) {
        this.logger.log('Tabela words encontrada em:');
        wordsTableResult.forEach((table: any) => {
          this.logger.log(`- ${table.table_name} (schema: ${table.table_schema})`);
        });
      } else {
        this.logger.log('Tabela words não encontrada em nenhum schema');
      }
      
      // Tenta fazer uma consulta direta na tabela words usando aspas duplas
      try {
        const result = await this.wordRepository.query('SELECT COUNT(*) as count FROM "words"');
        this.logger.log(`Número de registros na tabela words: ${result[0].count}`);
      } catch (error: any) {
        this.logger.error('Erro ao acessar tabela words:', error.message);
        this.logger.error('Detalhes do erro:', error);
        throw new Error('Tabela words não existe no banco de dados');
      }
      
      return isConnected;
    } catch (error) {
      this.logger.error('Erro ao verificar conexão:', error);
      return false;
    }
  }

  private async fetchWithRetry(url: string, retries = this.maxRetries): Promise<string[]> {
    try {
      const response = await axios.get(url, { responseType: 'text' });
      const words = response.data
        .split('\n')
        .map((word: string) => word.trim())
        .filter((word: string): word is string => 
          word.length > 0 && /^[a-zA-Z]+$/.test(word)
        );
      
      return Array.from(new Set(words));
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(`Falha ao baixar wordList. Tentativas restantes: ${retries}`);
        await setTimeout(this.retryDelay);
        return this.fetchWithRetry(url, retries - 1);
      }
      throw new Error(`Falha ao baixar wordList após ${this.maxRetries} tentativas: ${error.message}`);
    }
  }

  async run(): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.log('Iniciando importação de palavras...');
      
      // Verifica a conexão antes de começar
      const isConnected = await this.verifyConnection();
      if (!isConnected) {
        throw new Error('Não foi possível estabelecer conexão com o banco de dados');
      }
      
      const wordListUrl = 'https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/master/meta/wordList/english.txt';
      
      this.logger.log('Baixando wordList...');
      const words = await this.fetchWithRetry(wordListUrl);
      
      this.logger.log(`Encontradas ${words.length} palavras para importar`);
      
      const batchSize = 1000;
      let successCount = 0;
      let errorCount = 0;
      
      const progressBar = new cliProgress.SingleBar({
        format: '[{bar}] {percentage}% | {value}/{total} palavras | {speed} palavras/s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      });
      
      progressBar.start(words.length, 0, {
        speed: 'N/A',
      });
      
      for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        const batchStartTime = Date.now();
        
        try {
          // Verifica a conexão antes de cada lote
          if (!await this.verifyConnection()) {
            throw new Error('Conexão com o banco foi perdida');
          }

          const wordEntities = batch.map((word: string) => ({
            word: word.toLowerCase(),
            definition: 'TBD',
            searchCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          
          await this.wordRepository
            .createQueryBuilder()
            .insert()
            .into('"words"')
            .values(wordEntities)
            .onConflict('("word") DO NOTHING')
            .execute();
            
          successCount += batch.length;
          const batchEndTime = Date.now();
          const batchDuration = (batchEndTime - batchStartTime) / 1000;
          const wordsPerSecond = Math.round(batch.length / batchDuration);
          
          progressBar.update(i + batch.length, {
            speed: `${wordsPerSecond}`,
          });
          
          this.logger.log(`Lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(words.length / batchSize)} importado com sucesso (${wordsPerSecond} palavras/s)`);
        } catch (error) {
          errorCount += batch.length;
          this.logger.error(`Erro ao importar lote ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          
          // Se houver erro, tenta reconectar
          await this.verifyConnection();
        }
      }
      
      progressBar.stop();
      
      const endTime = Date.now();
      const totalDuration = (endTime - startTime) / 1000;
      const averageSpeed = Math.round(successCount / totalDuration);
      
      this.logger.log('Importação concluída!');
      this.logger.log(`Total de palavras importadas com sucesso: ${successCount}`);
      this.logger.log(`Total de palavras com erro: ${errorCount}`);
      this.logger.log(`Tempo total: ${totalDuration.toFixed(2)} segundos`);
      this.logger.log(`Velocidade média: ${averageSpeed} palavras/segundo`);
      
    } catch (error) {
      this.logger.error('Erro durante a importação:', error);
      throw error;
    }
  }
} 