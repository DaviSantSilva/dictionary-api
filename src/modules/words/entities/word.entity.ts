import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The word itself' })
  word: string;

  @Column('jsonb')
  @ApiProperty({ description: 'Word details from dictionary API' })
  details: any;

  @Column('text')
  definition: string;

  @Column('text', { nullable: true })
  example: string;

  @Column('text', { nullable: true })
  etymology: string;

  @Column('simple-array', { nullable: true })
  synonyms: string[];

  @Column('simple-array', { nullable: true })
  antonyms: string[];

  @Column({ nullable: true })
  partOfSpeech: string;

  @Column({ default: 0 })
  searchCount: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}