<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# API de Dicionário

API RESTful para busca de definições de palavras em inglês, com recursos de histórico de buscas e favoritos.

## Funcionalidades

- Busca de definições de palavras em inglês
- Histórico de buscas por usuário
- Sistema de favoritos
- Paginação baseada em cursores
- Cache com Redis
- Autenticação JWT
- Documentação Swagger

## Requisitos

- Node.js 18+
- PostgreSQL 12+
- Redis 6+

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/dictionary-api.git
cd dictionary-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=dictionary

# Configurações do Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Configurações da API
PORT=3000
JWT_SECRET=seu_segredo_jwt
DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en
```

4. Execute as migrações:
```bash
npm run migration:run
```

5. Inicie o servidor:
```bash
npm run start:dev
```

## Documentação da API

A documentação completa da API está disponível através do Swagger UI em:
```
http://localhost:3000/api
```

### Endpoints Principais

#### Buscar Palavra
```
GET /entries/en/:word
```
Retorna a definição de uma palavra em inglês.

#### Listar Palavras
```
GET /entries/en?cursor=string&limit=number
```
Retorna uma lista paginada de palavras.

#### Histórico de Buscas
```
GET /entries/history?cursor=string&limit=number
```
Retorna o histórico de buscas do usuário autenticado.

#### Favoritos
```
GET /entries/favorites?cursor=string&limit=number
```
Retorna as palavras favoritas do usuário autenticado.

```
POST /entries/en/:word/favorite
```
Adiciona uma palavra aos favoritos.

```
DELETE /entries/en/:word/favorite
```
Remove uma palavra dos favoritos.

## Testes

Execute os testes unitários:
```bash
npm run test
```

Execute os testes de integração:
```bash
npm run test:e2e
```

## Performance

A API foi otimizada para melhor performance através de:

- Índices nas tabelas do banco de dados
- Cache com Redis
- Seleção específica de campos nas consultas
- Paginação baseada em cursores
- Otimização de joins

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Diário de Desenvolvimento

### Dia 1: Configuração Inicial e Estrutura do Projeto

Escolhi começar pelo alicerce do projeto para garantir estabilidade e escalabilidade futura. Defini NestJS e TypeScript pela familiaridade e robustez do framework para APIs. Optei pelo PostgreSQL e TypeORM para um ORM maduro e bem documentado, facilitando migrações e versionamento de esquema. Reservei Redis para cache porque antecipei alta latência em chamadas repetidas à API externa.

**Fatos Objetivos**
* Analisei requisitos do desafio Coodesh
* Estruturei projeto NestJS, configurei TypeScript e ESLint
* Instalei `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/jwt`, `@nestjs/swagger` e `ioredis`
* Modelei entidades: `User`, `Word`, `Favorite`, `History`
* Criei migrações iniciais

**Resolução de Erros**
1. *TypeORM sem data-source:* percebi que faltava o arquivo de configuração central. Resolvi criando `data-source.ts` e apontando credenciais corretas
2. *Migrações não executavam:* notei caminho inválido. Ajustei `migrations` no `ormconfig` e habilitei `migrationsRun` em `app.module.ts`

### Dia 2: Implementação do Core da API

Priorizei a autenticação e integração externa porque são o coração da aplicação: sem elas não há uso prático. Primeiro implementei JWT para garantir segurança nas rotas de usuário, em seguida o proxy para a Free Dictionary API com cache Redis, evitando repetição de chamadas ao serviço externo.

**Fatos Objetivos**
* Criados endpoints `signup` e `signin` com validações
* Configurado `JwtModule` com estratégia `Bearer`
* Desenvolvido serviço de proxy para Free Dictionary API
* Integrei cache Redis e adicionei headers `x-cache` e `x-response-time`
* Escrevi script de importação de palavras com barra de progresso

**Resolução de Erros**
1. *JWT sem secret:* pipeline falhou na geração do token. Corrigi adicionando `JWT_SECRET` ao `.env`
2. *Script falhando por tabela inexistente:* executei migrações após criar entidades. Reordenei processo para rodar migrações antes de chamar o script

### Dia 3: Testes e Documentação

Integrei testes e documentação antes de expandir funcionalidades para garantir qualidade e facilidade de manutenção. Testes unitários e E2E validam o comportamento, e o Swagger documenta a API para outros desenvolvedores.

**Fatos Objetivos**
* Escrevi testes unitários para serviços e controladores
* Configurei testes E2E com banco de dados isolado
* Defini cobertura mínima de 80%
* Configurei Swagger em `main.ts`
* Atualizei `README.md` com passos de instalação e uso

**Resolução de Erros**
1. *Banco de testes não configurado:* criei `test` database e ajustei `ormconfig` de teste
2. *Conflito de versões (`nest-commander`):* atualizei dependências do NestJS para versões compatíveis

### Dia 4: Frontend e Integração

Fechei o ciclo montando o frontend para validar fluxo completo de usuário. Implementei Vite + React para produtividade e configurei Axios com interceptador para gerir tokens JWT e tratamento de erros cliente-servidor.

**Fatos Objetivos**
* Inicializei repositório React com Vite
* Estruturei componentes e páginas
* Configurei Axios e adicionei interceptor para anexar token
* Ajustei CORS no backend em `main.ts`
* Adicionei rate limiting e validações extras de segurança

**Resolução de Erros**
1. *CORS bloqueando chamadas:* habilitei `app.enableCors({ origin: [frontendUrl] })`
2. *Token não enviado:* implementei interceptor no Axios para cabeçalho `Authorization`

### Considerações Finais

Seguir essa ordem—ambiente, core, qualidade, frontend—assegurou base sólida antes de camada de apresentação. Resolvi cada erro ajustando configuração ou reordenando passos, reforçando importância de fluxo de CI/CD bem definido e documentação clara.
