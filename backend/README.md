# 📱 Contacts Manager API

## 📖 Sobre o Projeto
API RESTful desenvolvida com Node.js, Express, Prisma ORM e PostgreSQL para gerenciamento de contatos, com validação de números de telefone através da integração com a API NumberVerify.

### OBS:
Este repositório contém o backend do projeto. Para rodar o frontend tambem, siga a documentação disponível nesse outro repositório:

🔗 [Contact Manager Frontend](https://github.com/conradocmatheus/contact-manager-front)

## 🛠️ Tecnologias
- **Node.js** (v22.14.0)
- **Express.js** - Framework web
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **NumVerify API** - Validação de números de telefone

## 🚀 Instalação e Configuração

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v22.14.0 ou superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/) (opcional, para testes de API)

### Configuração das Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme o seu ambiente:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contacts_manager?schema=public"
JWT_SECRET=chaveSecretaSuperSeguraInvisivelInvencivelGrande
BCRYPT_SALT_ROUNDS=10

# NumberVerify Configuration
NUMVERIFY_API_KEY=your_api_key
NUMVERIFY_API_URL=http://apilayer.net/api/validate
```

> **Nota:** Substitua os valores conforme suas configurações locais. Se precisar obter uma chave de API do NumVerify, entre em contato comigo ou crie uma conta nesse [site](https://numverify.com/).

### Instalação e Execução

#### Executar banco e API com Docker

```bash
# Construir e subir PostgreSQL e API
docker compose up --build -d

# Acompanhar os logs da API
docker compose logs -f api
```

A API estará disponível em `http://localhost:3000` e o healthcheck em `http://localhost:3000/health`. As migrations são aplicadas automaticamente antes da inicialização da API.

#### Executar a API localmente

```bash
# Subir somente o PostgreSQL
docker compose up -d postgres

# Instalar dependências
npm install

# Gerar o Prisma Client
npm run prisma:generate

# Executar as migrações no ambiente de desenvolvimento
npm run prisma:migrate:dev

# Iniciar servidor de desenvolvimento
npm run dev
```

Em produção, aplique as migrations pendentes com `npm run prisma:migrate:deploy`.

Para parar os containers sem apagar os dados, execute `docker compose stop`. Para acompanhar os logs do banco, use `docker compose logs -f postgres`.

A API estará disponível em: `http://localhost:3000`

## 📡 Endpoints

A API possui os seguintes grupos de endpoints:

- **Autenticação** - Registro e login de usuários
- **Contatos** - CRUD para gerenciamento de contatos
- **Validação** - Verificação de números de telefone

### Testes com Postman

Para testar:

1. Abra o Postman ou o Insomnia
2. Selecione o arquivo `postman_collection.json` incluído no projeto
3. Todos os endpoints estarão disponíveis para teste
