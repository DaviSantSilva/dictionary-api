import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, Matches } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  @Matches(/^[a-f0-9]{128}$/, {
    message: 'JWT_SECRET deve ser uma string hexadecimal de 128 caracteres',
  })
  JWT_SECRET: string;

  @IsString()
  @Matches(/^(\d+)([hdm])$/, {
    message: 'JWT_EXPIRATION deve estar no formato: número seguido de h (horas), d (dias) ou m (meses). Exemplo: 1d, 24h, 30d',
  })
  JWT_EXPIRATION: string;

  @IsString()
  @Matches(/^(\d+)([hdm])$/, {
    message: 'JWT_REFRESH_EXPIRATION deve estar no formato: número seguido de h (horas), d (dias) ou m (meses). Exemplo: 1d, 24h, 30d',
  })
  JWT_REFRESH_EXPIRATION: string;

  @IsString()
  DICTIONARY_API_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
} 