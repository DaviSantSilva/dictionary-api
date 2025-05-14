import { createConnection } from 'typeorm';
import axios from 'axios';
import * as path from 'path';

async function importWords() {
  try {
    // Conectar ao banco de dados
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'dictionary_db',
      entities: [path.join(__dirname, '../modules/words/entities/word.entity.ts')],
      synchronize: false,
    });

    console.log('Conectado ao banco de dados');

    // Baixar a lista de palavras
    const wordListUrl = 'https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/master/meta/wordList/english.txt';
    console.log('Baixando lista de palavras...');
    const response = await axios.get(wordListUrl);
    const words = response.data
      .split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0 && /^[a-zA-Z]+$/.test(word));

    console.log(`Encontradas ${words.length} palavras para importar`);

    // Processar em lotes
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      console.log(`Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(words.length / batchSize)}`);

      try {
        // Inserir palavras em lote
        await connection.query(`
          INSERT INTO words (word, definition, "searchCount", "createdAt", "updatedAt")
          SELECT unnest($1::text[]), 'TBD', 0, NOW(), NOW()
          ON CONFLICT (word) DO NOTHING
        `, [batch]);

        successCount += batch.length;
        console.log(`Lote ${Math.floor(i / batchSize) + 1} importado com sucesso`);
      } catch (error) {
        errorCount += batch.length;
        console.error(`Erro ao importar lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      }
    }

    console.log('\nImportação concluída!');
    console.log(`Total de palavras importadas com sucesso: ${successCount}`);
    console.log(`Total de erros: ${errorCount}`);

    // Fechar conexão
    await connection.close();
  } catch (error) {
    console.error('Erro durante a importação:', error);
    process.exit(1);
  }
}

// Executar o script
importWords(); 