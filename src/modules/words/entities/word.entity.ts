import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  word: string;

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}