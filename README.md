# Sistema de Gerenciamento de Patentes - Backend

API REST robusta construída com Express.js para gerenciamento de patentes e usuários, com recursos abrangentes de segurança, cache e otimização.

## Funcionalidades

### Autenticação & Segurança
- ✅ Sistema de autenticação baseado em JWT
- ✅ Criptografia de senha usando bcrypt
- ✅ Limitação de tentativas de login (5 tentativas por 15 minutos)
- ✅ Headers de segurança com Helmet.js
- ✅ Sanitização de inputs para queries MongoDB
- ✅ Validação de entrada usando express-validator
- ✅ Proteção CORS
- ✅ Limitação de tamanho de requisição (10kb)
- ✅ Sistema completo de registro de erros

### Banco de Dados & Cache
- ✅ Conexão MongoDB com pool de conexões
- ✅ Cache Redis para buscas de patentes
- ✅ Schemas Mongoose com validação
- ✅ Indexação de texto para otimização de busca de patentes

### Recursos da API
- ✅ Arquitetura REST
- ✅ Gerenciamento de usuários (operações CRUD)
- ✅ Gerenciamento de patentes (operações CRUD)
- ✅ Controle de acesso baseado em papéis (Admin/Usuário)
- ✅ Funcionalidade de busca com cache
- ✅ Documentação da API com Swagger

### Otimização de Performance
- ✅ Compressão de respostas
- ✅ Pool de conexões para MongoDB
- ✅ Implementação de cache Redis
- ✅ Tratamento adequado de erros e logging

## Documentação da API

Documentação da API disponível em `/api/docs` usando Swagger UI.

### Endpoints Principais

#### Autenticação
- POST `/api/auth/login` - Login de usuário
- GET `/api/auth/validate` - Validação de token JWT

#### Patentes
- POST `/api/patents` - Criar nova patente
- GET `/api/patents/search` - Buscar patentes
- GET `/api/patents/:id` - Buscar patente por ID
- PUT `/api/patents/:id` - Atualizar patente
- DELETE `/api/patents/:id` - Deletar patente

#### Usuários
- POST `/api/users` - Criar novo usuário
- GET `/api/users` - Listar todos usuários (apenas admin)
- GET `/api/users/:id` - Buscar usuário por ID
- PUT `/api/users/:id` - Atualizar usuário
- DELETE `/api/users/:id` - Deletar usuário

## Medidas de Segurança

### Autenticação & Autorização
- Validação de token JWT
- Controle de acesso baseado em papéis
- Hash de senha com bcrypt
- Limitação de tentativas de login

### Proteção de Dados
- Sanitização de queries MongoDB
- Validação de entrada
- Proteção XSS com Helmet
- Limitação de tamanho de requisição

### Monitoramento & Logging
- Registro de erros com Winston
- Registro de requisições HTTP com Morgan
- Registro de falhas de autenticação
- Registro de operações (criar, atualizar, deletar)

## Recursos de Performance

### Estratégia de Cache
- Implementação Redis para buscas de patentes
- Expiração de cache configurável
- Invalidação de cache em atualizações

### Otimização de Banco de Dados
- Pool de conexões (máximo 10 conexões)
- Indexação de texto para operações de busca
- Tratamento adequado de erros e gerenciamento de conexão

### Otimização de Resposta
- Compressão de resposta
- Limitação de resposta JSON
- Códigos de status HTTP adequados

## Variáveis de Ambiente

```env
PORT=3000
MONGODB_URI=seu_mongodb_uri
JWT_SECRET=seu_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_EXPIRATION=3600
```

## Instalação & Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente
4. Inicie o servidor Redis
5. Execute a aplicação:
```bash
npm start
```

## Desenvolvimento

Para executar em modo de desenvolvimento com nodemon:
```bash
npm run dev
```

## Testes

```bash
npm test
```

## Tratamento de Erros

A aplicação implementa tratamento de erros centralizado com registro adequado:
- Erros de validação
- Erros de autenticação
- Erros de banco de dados
- Erros de servidor

## Como Contribuir

1. Faça um fork do repositório
2. Crie sua branch de feature
3. Faça commit das suas alterações
4. Faça push para a branch
5. Crie um novo Pull Request

## Requisitos Atendidos do Projeto

### Segurança
- Implementação de HTTPS
- Criptografia de senhas
- Prevenção contra injeção SQL/NoSQL
- Proteção contra XSS
- Validação de token JWT
- Registro de logs de segurança

### Otimização
- Compressão de arquivos estáticos
- Compressão de respostas do servidor
- Cache no backend
- Pool de conexões com banco de dados

### Funcionalidades Core
- Login
- Busca
- Inserção
- Validação de campos
- Mensagens de erro
- API REST completa