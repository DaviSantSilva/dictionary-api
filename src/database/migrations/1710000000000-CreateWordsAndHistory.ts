import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateWordsAndHistory1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'words',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'word',
            type: 'varchar',
          },
          {
            name: 'details',
            type: 'jsonb',
          },
          {
            name: 'definition',
            type: 'text',
          },
          {
            name: 'example',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'etymology',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'synonyms',
            type: 'text',
            isNullable: true,
            isArray: true,
          },
          {
            name: 'antonyms',
            type: 'text',
            isNullable: true,
            isArray: true,
          },
          {
            name: 'partOfSpeech',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'searchCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'wordId',
            type: 'uuid',
          },
          {
            name: 'searchedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'favorites',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'wordId',
            type: 'uuid',
          },
          {
            name: 'favoritedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Foreign Keys para History
    await queryRunner.createForeignKey(
      'history',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'history',
      new TableForeignKey({
        columnNames: ['wordId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'words',
        onDelete: 'CASCADE',
      }),
    );

    // Foreign Keys para Favorites
    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['wordId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'words',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const historyTable = await queryRunner.getTable('history');
    const favoritesTable = await queryRunner.getTable('favorites');

    if (historyTable) {
      const historyUserForeignKey = historyTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      const historyWordForeignKey = historyTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('wordId') !== -1,
      );

      if (historyUserForeignKey) {
        await queryRunner.dropForeignKey('history', historyUserForeignKey);
      }
      if (historyWordForeignKey) {
        await queryRunner.dropForeignKey('history', historyWordForeignKey);
      }
    }

    if (favoritesTable) {
      const favoritesUserForeignKey = favoritesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      const favoritesWordForeignKey = favoritesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('wordId') !== -1,
      );

      if (favoritesUserForeignKey) {
        await queryRunner.dropForeignKey('favorites', favoritesUserForeignKey);
      }
      if (favoritesWordForeignKey) {
        await queryRunner.dropForeignKey('favorites', favoritesWordForeignKey);
      }
    }

    await queryRunner.dropTable('favorites');
    await queryRunner.dropTable('history');
    await queryRunner.dropTable('words');
  }
}
