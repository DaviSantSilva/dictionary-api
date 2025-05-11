import { registerAs } from '@nestjs/config';

export default registerAs('dictionary', () => ({
  apiUrl: process.env.DICTIONARY_API_URL,
})); 