import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { Word } from './word.entity';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @Column()
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @ApiProperty({ description: 'Word ID' })
  wordId: string;

  @ManyToOne(() => Word)
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @CreateDateColumn()
  @ApiProperty({ description: 'Search timestamp' })
  searchedAt: Date;
}