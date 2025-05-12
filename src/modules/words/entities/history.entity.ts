import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Word } from './word.entity';

@Entity('histories')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Word)
  @JoinColumn({ name: 'word_id' })
  word: Word;

  @Column()
  wordId: string;

  @CreateDateColumn()
  searchedAt: Date;
}