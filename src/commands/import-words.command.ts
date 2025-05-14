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
  private readonly apiBaseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {
    super();
  }

  private async verifyConnection() {
    try {
      const isConnected = this.wordRepository.manager.connection.isConnected;
      this.logger.log(`Conexão com o banco está ${isConnected ? 'ativa' : 'inativa'}`);
      
      const dbResult = await this.wordRepository.query('SELECT current_database() as db');
      this.logger.log(`Banco de dados atual: ${dbResult[0].db}`);
      
      const schemaResult = await this.wordRepository.query('SELECT current_schema() as schema');
      this.logger.log(`Schema atual: ${schemaResult[0].schema}`);
      
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

  private async fetchWordDetails(word: string, retries = this.maxRetries): Promise<any> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}${word}`);
      const data = response.data[0];
      
      return {
        word: word.toLowerCase(),
        details: data,
        definition: data.meanings?.[0]?.definitions?.[0]?.definition || 'No definition available',
        example: data.meanings?.[0]?.definitions?.[0]?.example || null,
        etymology: data.etymologies?.[0] || null,
        synonyms: data.meanings?.[0]?.definitions?.[0]?.synonyms || [],
        antonyms: data.meanings?.[0]?.definitions?.[0]?.antonyms || [],
        partOfSpeech: data.meanings?.[0]?.partOfSpeech || null,
        searchCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Palavra não encontrada
      }
      
      if (retries > 0) {
        this.logger.warn(`Falha ao buscar detalhes da palavra "${word}". Tentativas restantes: ${retries}`);
        await setTimeout(this.retryDelay);
        return this.fetchWordDetails(word, retries - 1);
      }
      
      this.logger.error(`Erro ao buscar detalhes da palavra "${word}": ${error.message}`);
      return null;
    }
  }

  async run(): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.log('Iniciando importação de palavras...');
      
      const isConnected = await this.verifyConnection();
      if (!isConnected) {
        throw new Error('Não foi possível estabelecer conexão com o banco de dados');
      }
      
      const wordListUrl = 'https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/master/meta/wordList/english.txt';
      
      this.logger.log('Baixando wordList...');
      const words = await this.fetchWithRetry(wordListUrl);
      
      this.logger.log(`Encontradas ${words.length} palavras para importar`);
      
      const batchSize = 50; // Reduzido para evitar sobrecarga da API
      let successCount = 0;
      let errorCount = 0;
      let notFoundCount = 0;
      
      const progressBar = new cliProgress.SingleBar({
        format: '[{bar}] {percentage}% | {value}/{total} palavras | {speed} palavras/s | Sucesso: {success} | Erro: {error} | Não encontradas: {notFound}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      });
      
      progressBar.start(words.length, 0, {
        speed: 'N/A',
        success: 0,
        error: 0,
        notFound: 0,
      });
      
      for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        const batchStartTime = Date.now();
        
        try {
          if (!await this.verifyConnection()) {
            throw new Error('Conexão com o banco foi perdida');
          }

          const wordDetailsPromises = batch.map(word => this.fetchWordDetails(word));
          const wordDetailsResults = await Promise.all(wordDetailsPromises);
          
          const validWordDetails = wordDetailsResults.filter(details => details !== null);
          
          if (validWordDetails.length > 0) {
            await this.wordRepository
              .createQueryBuilder()
              .insert()
              .into('"words"')
              .values(validWordDetails)
              .onConflict('("word") DO UPDATE SET details = EXCLUDED.details, definition = EXCLUDED.definition, example = EXCLUDED.example, etymology = EXCLUDED.etymology, synonyms = EXCLUDED.synonyms, antonyms = EXCLUDED.antonyms, partOfSpeech = EXCLUDED.partOfSpeech, updatedAt = EXCLUDED.updatedAt')
              .execute();
          }
          
          successCount += validWordDetails.length;
          notFoundCount += batch.length - validWordDetails.length;
          
          const batchEndTime = Date.now();
          const batchDuration = (batchEndTime - batchStartTime) / 1000;
          const wordsPerSecond = Math.round(batch.length / batchDuration);
          
          progressBar.update(i + batch.length, {
            speed: `${wordsPerSecond}`,
            success: successCount,
            error: errorCount,
            notFound: notFoundCount,
          });
          
          this.logger.log(`Lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(words.length / batchSize)} processado (${wordsPerSecond} palavras/s)`);
          
          // Aguarda um pouco entre os lotes para não sobrecarregar a API
          await setTimeout(1000);
        } catch (error) {
          errorCount += batch.length;
          this.logger.error(`Erro ao processar lote ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          
          await this.verifyConnection();
        }
      }
      
      progressBar.stop();
      
      const endTime = Date.now();
      const totalDuration = (endTime - startTime) / 1000;
      const averageSpeed = Math.round(successCount / totalDuration);
      
      this.logger.log('Importação concluída!');
      this.logger.log(`Total de palavras importadas com sucesso: ${successCount}`);
      this.logger.log(`Total de palavras não encontradas: ${notFoundCount}`);
      this.logger.log(`Total de erros: ${errorCount}`);
      this.logger.log(`Velocidade média: ${averageSpeed} palavras/s`);
      this.logger.log(`Tempo total: ${totalDuration.toFixed(2)} segundos`);
    } catch (error) {
      this.logger.error('Erro durante a importação:', error);
      throw error;
    }
  }
} 