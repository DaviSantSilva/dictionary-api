import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1747083631587 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Índices para a tabela words
        await queryRunner.query(`CREATE INDEX "IDX_words_word" ON "words" ("word")`);
        await queryRunner.query(`CREATE INDEX "IDX_words_searchCount" ON "words" ("searchCount" DESC)`);
        await queryRunner.query(`CREATE INDEX "IDX_words_createdAt" ON "words" ("createdAt" DESC)`);

        // Índices para a tabela history
        await queryRunner.query(`CREATE INDEX "IDX_history_userId" ON "history" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_history_wordId" ON "history" ("wordId")`);
        await queryRunner.query(`CREATE INDEX "IDX_history_searchedAt" ON "history" ("searchedAt" DESC)`);
        await queryRunner.query(`CREATE INDEX "IDX_history_userId_searchedAt" ON "history" ("userId", "searchedAt" DESC)`);

        // Índices para a tabela favorites
        await queryRunner.query(`CREATE INDEX "IDX_favorites_userId" ON "favorites" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_favorites_wordId" ON "favorites" ("wordId")`);
        await queryRunner.query(`CREATE INDEX "IDX_favorites_favoritedAt" ON "favorites" ("favoritedAt" DESC)`);
        await queryRunner.query(`CREATE INDEX "IDX_favorites_userId_favoritedAt" ON "favorites" ("userId", "favoritedAt" DESC)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices da tabela words
        await queryRunner.query(`DROP INDEX "IDX_words_word"`);
        await queryRunner.query(`DROP INDEX "IDX_words_searchCount"`);
        await queryRunner.query(`DROP INDEX "IDX_words_createdAt"`);

        // Remover índices da tabela history
        await queryRunner.query(`DROP INDEX "IDX_history_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_history_wordId"`);
        await queryRunner.query(`DROP INDEX "IDX_history_searchedAt"`);
        await queryRunner.query(`DROP INDEX "IDX_history_userId_searchedAt"`);

        // Remover índices da tabela favorites
        await queryRunner.query(`DROP INDEX "IDX_favorites_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_favorites_wordId"`);
        await queryRunner.query(`DROP INDEX "IDX_favorites_favoritedAt"`);
        await queryRunner.query(`DROP INDEX "IDX_favorites_userId_favoritedAt"`);
    }
} 