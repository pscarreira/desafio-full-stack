# Desafio Full Stack

Projeto de teste técnico para vaga de Desenvolvedor Full Stack. O objetivo é criar uma aplicação web para monitoramento de alertas relacionados à educação, saúde e assistência social. O sistema deve permitir que técnicos da prefeitura visualizem e filtrem os alertas, além de fornecer uma API para consumo dos dados.

## Índice

- [Como Rodar Localmente](#como-rodar-localmente)
- [Decisões Arquiteturais](#decisões-arquiteturais)
- [Credenciais de Teste](#credenciais-de-teste)
- [O Que Faria Diferente](#o-que-faria-diferente-com-mais-tempo)

---

## Como Rodar Localmente

### Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (apenas para desenvolvimento local sem Docker)

### Opção 1: Com Docker Compose (Recomendado para avaliação)

```bash
# Clone o repositório
git clone https://github.com/seu-repo/desafio-full-stack.git
cd desafio-full-stack

# Inicie os serviços (mongo, api, web)
docker compose up -d

# Acompanhe o startup
docker compose logs -f

# Verifique o status
docker compose ps
```

**URLs após startup:**

- Frontend: <http://localhost:3000>
- API: <http://localhost:3001>
- MongoDB: <mongodb://localhost:27017>

O projeto inicia com:

1. **MongoDB** (inicializado com usuário via `docker/mongo/init-user.sh`)
2. **API NestJS** (executa seed de 25 registros automaticamente - originados de `data/seed.json` fornecido pelo teste)
3. **Web Next.js** (conecta à API via proxy)

### Opção 2: Desenvolvimento Local

```bash
# Instala as dependências
npm install

# Configura as variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# Edite .env com suas chaves JWT e credenciais MongoDB

# Para gerar chaves JWT 
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
cat private.pem | base64 -w 0  # JWT_PRIVATE_KEY
cat public.pem | base64 -w 0   # JWT_PUBLIC_KEY

# Inicie o MongoDB localmente (ex: MongoDB Compass, Atlas ou local)
# Certifique-se de criar o usuário e banco conforme .env

# Terminal 1: Rodar API
cd apps/api
npm run dev

# Terminal 2: Rodar Web
cd apps/web
npm run dev
```

### Para teste limpo (sem dados persistidos)

```bash
# Remove tudo (containers, volumes, imagens)
docker compose down -v --remove-orphans --rmi local

# Reinicie do zero
docker compose up -d
```

---

## Decisões Arquiteturais

### 1. **Monorepo com Turbo + Workspaces npm**

**Decisão:** Estrutura `apps/api` + `apps/web` com configuração Turbo.

Decidi por uma estrutura de monorepo para manter o frontend e backend juntos. O Turbo é uma ferramenta bastante interessante que otimiza builds e scripts em monorepos.

**Benefícios:**

- Compartilhamento/Gerenciamento de dependências
- Scripts unificados (`turbo run build`)
- Deploy independente de cada aplicação

**Trade-off:** a complexidade inicial de configuração é maior, mas facilita scaling a partir da configuração inicial.

---

### 2. **NestJS para Backend**

**Decisão:** Framework opinionado sobre Express puro para construção de APIs robustas.

Decidi usar NestJS por ser um framework moderno, opinionado e alinhado a boas práticas de arquitetura. Ele abstrai muita complexidade do Express puro, oferecendo uma estrutura clara para controllers, services e repositories, além de suporte nativo a Dependency Injection. É um framework que estou bastante familiarizado e que acredito ser uma ótima escolha para construir APIs robustas e escaláveis.

**Benefícios:**

- Arquitetura modular, alinhada a boas práticas de arquitetura limpa (Controllers → Services → Repositories)
- Dependency Injection nativa
- Pipes, Guards, Interceptors para validação, autenticação e logging consistentes
- Bastante suporte a comunidade e plugins para MongoDB, JWT, etc.

**Trade-off:** Mais "pesado" e "complexo" que Express, mas segurança, manutenibilidade e escalabilidade justificam.

---

### 3. **Next.js 14 com App Router**

**Decisão:** Framework React moderno.

Como único framework sugerido para o teste foi Next.js+14 + App Router, decidi seguir essa recomendação.

**Benefícios:**

- Simplicidade para criar rotas e páginas
- Middleware nativo para controle de acesso (autenticação)
- Build mais enxuto

**Trade-off:** Curva de aprendizado maior. Divisão de autenticação em vários arquivos (middleware, client).

---

### 4. **MongoDB em vez de SQL**

**Decisão:** Document database com Mongoose.

Decidi por fazer uso do mongoDB por ser um banco de dados NoSQL orientado a documentos, o que se encaixa bem com a estrutura de dados do desafio (children com alertas aninhados) fornecida em `data/seed.json`. Outro ponto é a facilidade de integração com NestJS. O Mongoose facilita a modelagem e validação dos dados. Além disso, a estrutura se torna bastante flexível para mudanças como a criação de novos tipos de alertas ou campos adicionais sem a necessidade de migrações complexas, o que é ideal para um projeto em fase inicial ou com requisitos que podem evoluir rapidamente ou que podem cada vez mais receber novos tipos de dados.

**Justificativa:**

- Schema flexível para iterações rápidas
- Boa integração com NestJS (MongooseModule)
- Escalável para dados aninhados (children + alertas)
- Flexível para mudanças rápidas no schema
- Queries naturais para dados aninhados (children + alertas)
- Seed simples (JSON → MongoDB)

**Trade-off:** Como em todo banco NoSQL, sem garantias ACID nativas (o que não é crítico para este caso), e potencial para dados inconsistentes se não modelados corretamentes, o que é um risco mitigado com validação Mongoose que garante que os dados inseridos seguem o schema definido.

---

### 5. **JWT RS256 para Autenticação**

Decidi usar JWT com algoritmo RS256 para autenticação. É um método muito comum e seguro para autenticação em APIs.

**Decisão:** JWT com RS256 - chave pública/privada para assinatura e verificação.

**Benefícios:**

- Frontend pode validar token offline
- Escalável para múltiplos servidores
- Comum e bem suportado
- NestJS tem suporte nativo (Passport + JWT)

**Trade-off:** Exige mais cuidado para trocar e manter as chaves ao longo do tempo.

---

### 6. **Docker Compose com Seed Automático**

Decidi por manter o processo de seed automático dentro do ciclo de vida da API, para garantir que os dados iniciais estejam sempre disponíveis sem necessidade de passos manuais adicionais. O script de seed é idempotente, verificando se os dados já existem antes de inserir, o que torna o processo seguro para múltiplas execuções.

**Decisão:** Configurar o projeto para carregar dados iniciais automaticamente antes da API iniciar.

**Benefícios:**

- Zero setup manual para dados iniciais
- Idempotente (verifica 25 registros antes de inserir)
- Simples para novos clones

**Trade-off:** O processo de build e inicialização fica mais dependente entre si, então exige mais cuidado na configuração.

---

### 7. **Turbo + Multi-Stage Docker Build**

Decidi usar multi-stage builds no Docker para otimizar o processo de build e gerar imagens menores. O Turbo ajuda a acelerar os builds, principalmente com dependências compartilhadas e cache.

**Decisão:** Usar estratégia de build no Docker para aproveitar cache e gerar imagens menores.

**Benefícios:**

- Builds rápidas
- Imagens menores

**Trade-off:** O arquivo Dockerfile fica mais trabalhoso de montar e manter, mas melhora a experiência no desenvolvimento e separa claramente build e runtime.

### 8. **Testes com Vitest**

Decidi usar Vitest para os testes unitários e de integração, pois é uma ferramenta moderna e leve que se integra bem com projetos Node.js e React. Ele oferece uma experiência de teste rápida e eficiente, além de ser fácil de configurar.

**Decisão:** Usar Vitest para testes unitários e de integração.

**Benefícios:**

- Rápido e leve
- Fácil de configurar
- Suporte a mocks e spies
- Integração com TypeScript
- Cobertura de testes

---

## Credenciais de Teste

### Acesso Frontend

**Usuário padrão sugerido:**

```
Email: tecnico@prefeitura.rio
Senha: painel@2024 (configurada conforme sugerido no pedido do teste)
```

Os dados já vêm seedados automaticamente no MongoDB.

### Variáveis de Ambiente (`.env`)

```bash
# API
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000

# MongoDB
MONGO_URI=mongodb://testeprefeitura:testebancoprefeitura@mongo:27017/desafio-full-stack

# JWT (gere seus próprios em produção!)
JWT_PRIVATE_KEY=<chave privada RSA em base64>
JWT_PUBLIC_KEY=<chave pública RSA em base64>

# Credenciais de teste
TEST_USER=tecnico@prefeitura.rio
TEST_USER_PASSWORD_HASH=<hash bcrypt da senha de teste>
```

**No Docker Compose, essas credenciais já vêm configuradas para facilitar a avaliação.**

### Geração de Chaves JWT caso queira rodar localmente sem Docker

**No Docker Compose, essa configuração já está pronta e você não precisa gerar as chaves manualmente.**

```bash
# Privada
openssl genrsa -out private.pem 2048
cat private.pem | base64 -w 0

# Pública
openssl rsa -in private.pem -pubout -out public.pem
cat public.pem | base64 -w 0
```

---

## O que faria diferente com mais tempo (Próximos passos)

### 1. **Autenticação Melhorada**

- Refresh dos tokens JWT
- OAuth2 / SAML para integração com SSO padrão
- 2FA para usuários técnicos
- Rate limiting (proteção contra força bruta)

### 2. **Database**

- Índices no MongoDB considerando o volume de dados alto que pode crescer historicamente
- Backup automático (MongoDB Atlas)
- Migrations versionadas (opções como migrate-mongo ou similar)

### 3. **API Robustness**

- Logging estruturado (Winston + Elasticsearch, por exemplo)
- Tracing distribuído (telemetria)
- Considerar GraphQL para consultas mais flexíveis
- Versionamento de API (v1, v2)

### 4. **Frontend UX**

- Busca avançada (filtros por data, tipo de alerta, multipla seleção de bairros)
- Export de relatórios (PDF/CSV)
- Responsive design melhorado (mobile)
- Melhorias de acessibilidade
- Testes do Playwright mais abrangentes (cobertura de fluxos críticos)

### 5. **Testing**

- Aumentar cobertura de testes unitários e de integração
- Contract testing (frontend ↔ API)
- Performance testing
- Accessibility testing

### 6. **DevOps**

- CI/CD com alguma ferramenta
- Observabilidade (monitoramento, alertas)
- Secrets manager para variáveis sensíveis
- Deploy em ambiente de staging para testes reais

### 7. **Código**

- Separar Domain Types dos DTOs (mais crítico em cadastros)
- Integration tests E2E mais abrangentes
- Error handling consistente (custom exceptions e filtros globais no NestJS)
- Documentação OpenAPI/Swagger no NestJS

### 8. **Docker/Infra**

- Verificações de saúde mais robustas
- Limites de recursos (memória, CPU)
- Políticas de rede (MongoDB isolado)
- Rotação periódica de chaves JWT (com estratégia de transição entre chave antiga e nova)

### 9. **Funcionalidades Futuras**

- Mapas para visualização geográfica dos alertas
- Páginas e APIs para técnicos cadastrarem ou atualizarem novas crianças e alertas
- Maior número de métricas e gráficos no dashboard
- Integração com sistemas de terceiros (ex: sistemas de saúde, educação, etc.) para ingestão automática de dados

---

## Estrutura do Projeto

```
desafio-full-stack/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── domain/         # Entities, types
│   │   │   ├── infra/          # Database, auth, HTTP
│   │   │   └── app.module.ts
│   │   ├── scripts/seed.ts     # Seed script
│   │   ├── docker-entrypoint.sh
│   │   └── Dockerfile
│   │
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── (public)/login
│       │   └── (private)/dashboard
│       ├── components/
│       └── Dockerfile
│
├── data/seed.json              # Dados iniciais
├── docker-compose.yml
├── docker/mongo/init-user.sh   # MongoDB init
├── .gitattributes              # LF para scripts
└── turbo.json                  # Config monorepo
```

---

## Testes

```bash
# Todos os testes configurados no Turbo
npm run test

# E2E da API (vitest)
npm run test:e2e:api

# E2E da Web (vitest)
npm run test:e2e:web

# E2E do Playwright
npm run test:e2e:web:ui
```

---

**Qualquer dúvida sobre o projeto ou decisões, estou à disposição para esclarecer!**
