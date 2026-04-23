# 🐾 GUIA DE TAREFAS — Sistema de Adoção de Cães

## Divisão para 10 Pessoas

---

## 📌 VISÃO GERAL

Sistema web com **HTML/CSS/JS puro no frontend** + **Node.js + Express (API JSON) no backend**.

**Sem EJS, sem Bootstrap** — tudo feito com código próprio.

**Como funciona:**
- O servidor Node.js serve os arquivos HTML/CSS/JS como arquivos estáticos
- O servidor também expõe uma API REST que retorna JSON
- O frontend (JavaScript no navegador) usa `fetch()` para chamar a API e atualizar a página

---

## ☁️ AMBIENTES DE EXECUÇÃO

| | Desenvolvimento local | Produção no Vercel |
|---|---|---|
| **Banco de dados** | SQLite (`data/database.sqlite`) | **Vercel Postgres** (obrigatório) |
| **Fotos dos cães** | Pasta `public/uploads/` | **Vercel Blob** (obrigatório) |
| **Autenticação** | Cookie assinado (HMAC-SHA256) | Cookie assinado (HMAC-SHA256) |
| **Servidor** | `node server.js` na porta 3000 | Vercel Functions (serverless) |

> **Por que PostgreSQL é obrigatório no Vercel?**
> O filesystem do Vercel é efêmero — arquivos gravados (incluindo o `.sqlite`) são apagados a cada novo deploy ou reinício do servidor. Sem Vercel Postgres, todos os dados são perdidos.

> **Por que Vercel Blob é obrigatório no Vercel?**
> Pelo mesmo motivo: fotos salvas em `public/uploads/` somem a cada deploy. O Vercel Blob é o serviço de storage externo usado para persistir as imagens. *(Cloudinary seria uma alternativa, mas não é necessário — o Vercel Blob já resolve.)*

---

## 📁 ESTRUTURA DE PASTAS

```
registration-system/
├── server.js                 ← Servidor principal / app Express
├── database.js               ← Banco híbrido: SQLite local ou Postgres no Vercel
├── package.json              ← Dependências
├── vercel.json               ← Configuração de deploy no Vercel
├── api/
│   └── index.js              ← Entry point serverless do Vercel
├── lib/
│   ├── auth.js               ← Cookie assinado para autenticação
│   └── uploads.js            ← Upload local ou Vercel Blob
├── middleware/
│   └── auth.js               ← Controle de acesso
├── routes/
│   ├── auth.js               ← API: login, cadastro, logout
│   ├── dogs.js               ← API: cães (listagem, adoção)
│   ├── admin.js              ← API: painel admin (CRUD completo)
│   └── place.js              ← API: informações do local
├── public/
│   ├── index.html            ← Página inicial
│   ├── login.html            ← Tela de login
│   ├── register.html         ← Tela de cadastro
│   ├── dogs.html             ← Lista de cães
│   ├── dog-detail.html       ← Detalhes de um cão
│   ├── my-adoptions.html     ← Minhas adoções (usuário)
│   ├── place.html            ← Info do local (público)
│   ├── admin/
│   │   ├── index.html        ← Dashboard admin
│   │   ├── dogs.html         ← Gerenciar cães
│   │   ├── dog-form.html     ← Cadastrar/editar cão
│   │   ├── clients.html      ← Lista de clientes
│   │   ├── client-detail.html← Detalhes do cliente
│   │   ├── adoptions.html    ← Gerenciar adoções
│   │   └── place.html        ← Editar info do local
│   ├── css/
│   │   └── style.css         ← Todos os estilos
│   ├── js/
│   │   ├── main.js           ← Compartilhado (navbar, alertas)
│   │   ├── auth.js           ← Login + Cadastro
│   │   ├── dogs.js           ← Listagem, detalhes, adoções
│   │   ├── place.js          ← Página do local
│   │   └── admin.js          ← Todo o painel admin
│   └── uploads/
│       ├── dogs/             ← Fotos locais dos cães
│       └── place/            ← Fotos locais do local
└── data/
    └── database.sqlite       ← Banco local (desenvolvimento)
```

---

## 👥 DIVISÃO DE TAREFAS

| Pessoa | Tarefa                        | Arquivos                              | Dificuldade |
|--------|-------------------------------|---------------------------------------|-------------|
| **P1** | Servidor + Config             | `package.json`, `server.js`, `vercel.json`, `api/index.js` | ⭐⭐⭐ |
| **P2** | Banco de Dados                | `database.js`                         | ⭐⭐⭐      |
| **P3** | Middleware Auth                | `middleware/auth.js`                  | ⭐          |
| **P4** | API Login/Cadastro            | `routes/auth.js`                      | ⭐⭐        |
| **P5** | API Cães + Local              | `routes/dogs.js`, `routes/place.js`   | ⭐⭐        |
| **P6** | API Admin (CRUD)              | `routes/admin.js` (cães)              | ⭐⭐⭐      |
| **P7** | API Admin (clientes/adoções)  | `routes/admin.js` (clientes+adoções+local) | ⭐⭐⭐ |
| **P8** | CSS + Layout + Home           | `style.css`, `index.html`             | ⭐⭐        |
| **P9** | Páginas Usuário + JS          | HTMLs do usuário + `main.js`, `auth.js`, `dogs.js`, `place.js` | ⭐⭐ |
| **P10**| Páginas Admin + JS            | `admin/*.html` + `admin.js`           | ⭐⭐⭐      |

---

## 🔑 DIFERENÇAS DA VERSÃO ANTERIOR

| Antes (com EJS + Bootstrap)           | Agora (HTML/CSS/JS puro)              |
|---------------------------------------|---------------------------------------|
| EJS gerava HTML no servidor           | HTML estático + JS busca dados via API|
| Bootstrap para estilização            | CSS próprio (sem dependência externa) |
| Rotas retornavam `res.render()`       | Rotas retornam `res.json()`           |
| Layout compartilhado via EJS          | Navbar montada via JavaScript         |
| Formulário enviava dados via POST     | Frontend usa `fetch()` para enviar    |

---

## 🚀 COMO RODAR

```bash
# 1. Abrir terminal na pasta registration-system
cd registration-system

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm run dev

# 4. Abrir no navegador
# http://localhost:3000

# 5. Login admin padrão:
#    Email: admin@abrigo.com
#    Senha: admin123
```

---

## 📝 ORDEM DE DESENVOLVIMENTO

```
SEMANA 1: P1 + P2 + P3 (base: servidor, banco, middleware)
SEMANA 2: P4 + P5 + P6 + P7 (rotas da API)
SEMANA 3: P8 + P9 + P10 (frontend: HTML, CSS, JS)
SEMANA 4: Integração + testes + ajustes
```

**P1, P2 e P3 devem terminar primeiro** — todos os outros dependem deles.

---

## 📚 CONCEITOS IMPORTANTES

### Como o frontend se comunica com o backend:
```
Usuário clica botão → JavaScript chama fetch('/api/dogs') → Servidor consulta banco
→ Servidor retorna JSON → JavaScript recebe e monta o HTML na página
```

### Exemplo de chamada à API (fetch):
```javascript
// Buscar lista de cães
const resposta = await fetch('/api/dogs');
const caes = await resposta.json();
// caes = [{id: 1, name: "Rex", age: "3 anos", ...}, ...]
```

### Exemplo de enviar dados (login):
```javascript
const resposta = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@abrigo.com', password: 'admin123' })
});
const dados = await resposta.json();
// dados = { message: 'Login realizado!', user: { id: 1, name: 'Admin', ... } }
```

### Exemplo de upload de foto:
```javascript
const formData = new FormData(document.getElementById('meu-form'));
const resposta = await fetch('/api/admin/dogs', {
  method: 'POST',
  body: formData  // NÃO definir Content-Type — o navegador faz sozinho
});
```

---

## 🧭 PASSO A PASSO — GUIA POR PESSOA

Abaixo está o passo a passo que cada pessoa deve seguir para implementar sua parte. — cada passo descreve **o que fazer** e **por que fazer**

---

### 👤 P1 — Servidor + Configuração (`package.json`, `server.js`)

**Objetivo:** Criar o servidor que roda toda a aplicação.

**Passo 1 — Inicializar o projeto Node.js**
- Abra o terminal na pasta do projeto e rode `npm init` para criar o `package.json`
- Preencha nome, versão e descrição do projeto
- Defina `server.js` como arquivo principal (`main`)
- Adicione um script `"start": "node server.js"` na seção `scripts`

**Passo 2 — Instalar as dependências**
- Instale com `npm install` os seguintes pacotes:
  - `express` — framework para criar o servidor web e as rotas da API
  - `cookie-parser` — lê cookies da requisição (necessário para autenticação)
  - `bcryptjs` — criptografia de senhas
  - `multer` — upload de arquivos (fotos)
  - `sql.js` — banco SQLite que roda em memória/arquivo (desenvolvimento local)
  - `pg` — driver PostgreSQL (produção no Vercel/Neon)
  - `@vercel/blob` — armazenamento de fotos na nuvem (produção no Vercel)

**Passo 3 — Criar as pastas necessárias (apenas local)**
- No `server.js`, crie uma função `ensureLocalDirectories()` que verifica se `data/`, `public/uploads/dogs/` e `public/uploads/place/` existem e as cria se necessário
- **Importante:** só execute essa função quando não estiver no Vercel. Cheque `process.env.POSTGRES_URL` e `process.env.BLOB_READ_WRITE_TOKEN` — se existirem, pule a criação (o Vercel tem filesystem somente leitura)

**Passo 4 — Configurar o Express**
- Crie uma função `createApp()` que retorna o app Express configurado:
  - `express.static('public/')` — serve os arquivos HTML/CSS/JS
  - `express.json()` — lê JSON no body
  - `express.urlencoded({ extended: true })` — lê formulários
  - `cookieParser()` — lê cookies (necessário para autenticação)
  - `attachAuth` do `lib/auth.js` — reconstrói a sessão do usuário a partir do cookie

**Passo 5 — Registrar as rotas da API**
- Monte cada arquivo de rotas em um caminho específico:
  - `/api/auth` → `routes/auth.js`
  - `/api/dogs` → `routes/dogs.js`
  - `/api/admin` → `routes/admin.js`
  - `/api/place` → `routes/place.js`

**Passo 6 — Exportar funções para o Vercel**
- Crie e exporte `createApp()` e `initializeApp()` — o `api/index.js` usa essas funções
- `initializeApp()` usa um singleton (`initializationPromise`) para não reinicializar o banco a cada request
- `startServer()` só roda quando `require.main === module` (ou seja, só localmente)
- Use `process.env.PORT || 3000` na porta

**Passo 7 — Criar o entry point do Vercel (`api/index.js`)**
- Este arquivo é o ponto de entrada para o Vercel Functions
- Importe `createApp` e `initializeApp` do `server.js`
- Exporte uma função `async (req, res)` que chama `initializeApp()` e depois delega ao Express

**Passo 8 — Configurar o `vercel.json`**
- Crie o arquivo `vercel.json` na raiz com:
  - `builds`: define `api/index.js` como a única função serverless
  - `rewrites`: redireciona todas as requisições (`/(.*)`) para `api/index.js`

**Dicas de pesquisa:** "Express.js getting started", "Vercel serverless functions Node.js", "cookie-parser npm"

---

### 👤 P2 — Banco de Dados (`database.js`)

**Objetivo:** Criar e gerenciar o banco de dados SQLite, definindo todas as tabelas e dados iniciais.

**Passo 1 — Entender o banco híbrido**
- O projeto usa dois bancos dependendo do ambiente:
  - **Local:** `sql.js` (SQLite em memória + arquivo `data/database.sqlite`)
  - **Vercel:** `pg` (PostgreSQL via Neon, usando a variável `POSTGRES_URL` ou `DATABASE_URL`)
- A função `isPostgresEnabled()` verifica se `POSTGRES_URL` ou `DATABASE_URL` estão definidas. Se sim, usa PostgreSQL; caso contrário, usa SQLite
- Pesquise a documentação do `sql.js` para entender `initSqlJs()`, `new SQL.Database()`, `db.run()`, `db.prepare()`, `db.export()`

**Passo 2 — Criar wrappers para simplificar consultas**
- Crie dois wrappers com a mesma interface:
  - `wrapDb(rawDb)` — para SQLite (local)
  - `wrapPostgres()` — para PostgreSQL (Vercel), usando `pg.Pool` e convertendo `?` em `$1, $2...`
- Ambos expõem a mesma API:
  - `prepare(sql).get(...params)` → retorna **uma** linha
  - `prepare(sql).all(...params)` → retorna **todas** as linhas
  - `prepare(sql).run(...params)` → executa INSERT/UPDATE/DELETE
  - `exec(sql)` → executa SQL sem parâmetros
- Isso permite que as rotas usem o banco sem saber qual está ativo

**Passo 3 — Implementar a persistência**
- Crie uma função `save()` que exporta os dados do banco em memória e grava no arquivo `data/database.sqlite` usando `fs.writeFileSync`
- Chame `save()` automaticamente após cada operação de escrita (INSERT, UPDATE, DELETE)

**Passo 4 — Carregar ou criar o banco**
- Na função `initializeDatabase()`:
  - Se o arquivo `database.sqlite` já existe, leia-o e carregue no sql.js
  - Se não existe, crie um banco novo vazio

**Passo 5 — Criar as tabelas com CREATE TABLE IF NOT EXISTS**
- **users** — id, name, email (UNIQUE), phone, cpf (UNIQUE), address, password, role (default 'user'), created_at
- **dogs** — id, name, age, vaccines, condition, description, photo, available (default 1), created_at
- **adoptions** — id, user_id (FK → users), dog_id (FK → dogs), status (default 'pending'), created_at
- **place_info** — id, name, address, phone, email, description, facebook, instagram, whatsapp
- **place_photos** — id, photo, caption, created_at

**Passo 6 — Inserir dados iniciais**
- Verifique se já existe um admin. Se não existir, insira um com:
  - Email: `admin@abrigo.com`, senha `admin123` (criptografada com `bcryptjs`)
  - Role: `admin`
- Verifique se já existem dados em `place_info`. Se não, insira valores padrão

**Passo 7 — Exportar as funções**
- Exporte `initializeDatabase` (chamada pelo server.js na inicialização) e `getDb` (usada por todas as rotas para acessar o banco)

**Passo 8 — Diferenças no DDL para PostgreSQL**
- Use `SERIAL PRIMARY KEY` em vez de `INTEGER PRIMARY KEY AUTOINCREMENT`
- Use `TIMESTAMP` em vez de `DATETIME`
- Use `REFERENCES tabela(id) ON DELETE CASCADE` para chaves estrangeiras
- O PostgreSQL não aceita `?` como placeholder — use `$1, $2...` (a função `convertParams()` faz isso automaticamente)

**Dicas de pesquisa:** "sql.js documentation", "node-postgres Pool", "bcryptjs hashSync", "PostgreSQL vs SQLite syntax"

---

### 👤 P3 — Middleware de Autenticação (`middleware/auth.js`)

**Objetivo:** Criar funções que protegem rotas, verificando se o usuário está logado e se é admin.

**Passo 1 — Entender o que é um middleware no Express**
- Um middleware é uma função com os parâmetros `(req, res, next)`
- Ele roda **antes** da rota. Se tudo estiver ok, chama `next()` para continuar
- Se algo estiver errado, retorna uma resposta de erro e **não** chama `next()`

**Passo 2 — Criar a função `isAuthenticated`**
- Verifique se `req.session` e `req.session.user` existem
- Se sim: chame `next()` — o usuário está logado, pode seguir para a rota
- Se não: retorne status **401** com um JSON de erro (`{ error: 'mensagem' }`)

**Passo 3 — Criar a função `isAdmin`**
- Verifique se o usuário está logado **e** se `req.session.user.role === 'admin'`
- Se sim: chame `next()`
- Se não: retorne status **403** com JSON de erro

**Passo 4 — Exportar ambas as funções**
- Use `module.exports = { isAuthenticated, isAdmin }`
- Essas funções serão importadas pelos arquivos de rotas (P4, P5, P6, P7)

> **Nota sobre autenticação:** Este projeto usa cookie assinado em vez de `express-session`. O arquivo `lib/auth.js` é responsável por criar/verificar o token. O middleware `attachAuth` (também em `lib/auth.js`) reconstrói `req.session.user` a partir do cookie antes de cada rota. O `middleware/auth.js` (sua responsabilidade) apenas verifica se `req.session.user` existe e se o role é correto — não precisa saber como o cookie funciona.

**Dicas de pesquisa:** "Express middleware tutorial", "HTTP status codes 401 vs 403"

---

### 👤 P4 — API de Login/Cadastro (`routes/auth.js`)

**Objetivo:** Criar as rotas de autenticação: login, cadastro, logout e verificação do usuário logado.

**Passo 1 — Estruturar o arquivo de rotas**
- Importe `express`, crie um `Router()` e exporte-o no final
- Importe `bcryptjs` para comparar/criptografar senhas
- Importe `getDb` do `database.js` para acessar o banco

**Passo 2 — Rota GET `/me`**
- Retorna os dados do usuário logado (da sessão)
- Se não há sessão, retorna 401
- Essa rota é chamada pelo frontend para saber quem está logado (para montar a navbar)

**Passo 3 — Rota POST `/login`**
- Receba `email` e `password` do `req.body`
- Valide se ambos foram preenchidos (retorne 400 se não)
- Busque o usuário no banco pelo email
- Compare a senha enviada com o hash salvo usando `bcrypt.compareSync()`
- Se inválido: retorne 401
- Se válido: salve os dados do usuário em `req.session.user` (id, name, email, role — **nunca a senha!**)
- Retorne JSON com mensagem de sucesso e dados do usuário

**Passo 4 — Rota POST `/register`**
- Receba name, email, phone, cpf, address, password, confirmPassword do body
- Valide se todos os campos foram preenchidos
- Valide se as senhas coincidem
- Limpe o CPF (remova pontos e traços) e verifique se tem 11 dígitos
- Verifique no banco se já existe usuário com mesmo email ou CPF
- Criptografe a senha com `bcrypt.hashSync(senha, 10)`
- Insira o novo usuário no banco com role `'user'`
- Retorne JSON com mensagem de sucesso

**Passo 5 — Rota GET `/logout`**
- Chame `clearAuthCookie(res)` do `lib/auth.js` para apagar o cookie de autenticação
- Limpe `req.session.user` se existir
- Retorne JSON com mensagem de sucesso

> **Nota:** este projeto não usa `express-session`. A sessão é mantida por um **cookie assinado** (HMAC-SHA256) criado em `lib/auth.js`. O `req.session.user` é reconstruído a partir do cookie a cada requisição pelo middleware `attachAuth`.

**Dicas de pesquisa:** "Express Router", "bcryptjs compare password", "HMAC signed cookie authentication"

---

### 👤 P5 — API de Cães + Local (`routes/dogs.js`, `routes/place.js`)

**Objetivo:** Criar as rotas públicas de listagem de cães, detalhes, adoção e informações do local.

#### Arquivo `routes/dogs.js`

**Passo 1 — Rota GET `/` (lista de cães disponíveis)**
- Consulte todos os cães onde `available = 1`, ordenados por data de criação (mais recente primeiro)
- Retorne o array como JSON
- Esta rota é **pública** (não precisa de middleware de autenticação)

**Passo 2 — Rota GET `/my-adoptions` (minhas adoções)**
- **IMPORTANTE:** esta rota deve vir **antes** da rota `/:id`, senão o Express interpreta "my-adoptions" como um ID
- Use o middleware `isAuthenticated` para proteger
- Faça um JOIN entre `adoptions` e `dogs` filtrado pelo `user_id` da sessão
- Retorne dados relevantes: nome do cão, foto, status da adoção, data

**Passo 3 — Rota GET `/:id` (detalhes de um cão)**
- Busque o cão pelo ID recebido em `req.params.id`
- Se não encontrar, retorne 404
- Retorne o cão como JSON

**Passo 4 — Rota POST `/:id/adopt` (solicitar adoção)**
- Use `isAuthenticated` como middleware
- Verifique se o cão existe e está disponível
- Verifique se o usuário já não fez uma solicitação para este mesmo cão
- Se tudo ok, insira na tabela `adoptions` com status `'pending'`

**Passo 5 — Rota POST `/cancel-adoption/:id` (cancelar adoção)**
- Use `isAuthenticated`
- Verifique se a adoção pertence ao usuário logado
- Se a adoção já estava aprovada, volte o cão para disponível (`available = 1`)
- Delete a adoção do banco

#### Arquivo `routes/place.js`

**Passo 6 — Rota GET `/` (informações do local)**
- Busque os dados de `place_info` (LIMIT 1) e todas as fotos de `place_photos`
- Retorne ambos como JSON: `{ place, photos }`
- Esta rota é pública

**Dicas de pesquisa:** "Express route order matters", "SQL JOIN two tables", "req.params vs req.body"

---

### 👤 P6 — API Admin: CRUD de Cães (`routes/admin.js` — parte 1)

**Objetivo:** Criar as rotas do painel admin para gerenciar cães: listar, cadastrar, editar, excluir, com upload de fotos.

**Passo 1 — Configurar o multer para upload de fotos**
- Importe `multer` e use `multer.memoryStorage()` — o arquivo fica em memória (`req.file.buffer`) em vez de ser salvo direto no disco
- Crie um filtro de arquivo (`fileFilter`) que aceite apenas extensões de imagem (.jpg, .jpeg, .png, .gif, .webp)
- Defina um limite de tamanho de **4MB** (limite do Vercel Functions)
- Para salvar o arquivo, use `saveUploadedFile(req.file, 'dogs')` do `lib/uploads.js` — ele decide automaticamente se salva localmente ou no Vercel Blob

**Passo 2 — Proteger todas as rotas admin**
- Use `router.use(isAdmin)` no início. Isso aplica o middleware de admin em **todas** as rotas do arquivo
- Apenas usuários com role `'admin'` terão acesso

**Passo 3 — Rota GET `/dashboard` (estatísticas)**
- Execute consultas COUNT para obter:
  - Total de cães, cães disponíveis, total de clientes (users com role 'user'), adoções pendentes, adoções aprovadas
- Retorne tudo como um objeto JSON

**Passo 4 — Rota GET `/dogs` (listar todos os cães)**
- Diferente da rota pública, aqui liste **todos** os cães (incluindo indisponíveis)
- Ordene por data de criação, mais recente primeiro

**Passo 5 — Rota GET `/dogs/:id` (obter um cão para edição)**
- Busque pelo ID e retorne. Se não encontrar, retorne 404

**Passo 6 — Rota POST `/dogs` (cadastrar novo cão)**
- Use `uploadDog.single('photo')` como middleware para processar o upload
- Receba name, age, vaccines, condition, description do body
- Valide que nome e idade são obrigatórios
- Se houve upload, o caminho da foto estará em `req.file.filename`
- Insira no banco e retorne mensagem de sucesso

**Passo 7 — Rota POST `/dogs/:id` (atualizar cão)**
- Use `uploadDog.single('photo')` como middleware
- Carregue o cão existente no banco para obter a foto atual
- Se uma nova foto foi enviada, delete a foto antiga do disco com `fs.unlinkSync` e use a nova
- Se nenhuma nova foto foi enviada, mantenha a foto existente
- Atualize todos os campos no banco

**Passo 8 — Rota POST `/dogs/:id/delete` (excluir cão)**
- Carregue o cão para obter o caminho da foto
- Delete a foto do disco (se existir)
- Delete as adoções relacionadas ao cão
- Delete o cão do banco

**Dicas de pesquisa:** "multer disk storage express", "multer file filter images", "fs.unlinkSync node"

---

### 👤 P7 — API Admin: Clientes, Adoções e Local (`routes/admin.js` — parte 2)

**Objetivo:** Completar o arquivo de rotas admin com gerenciamento de clientes, aprovação/rejeição de adoções e edição do local.

#### Clientes

**Passo 1 — Rota GET `/clients` (listar clientes)**
- Busque todos os users com `role = 'user'`, ordenados por data de criação

**Passo 2 — Rota GET `/clients/:id` (detalhes do cliente)**
- Busque o cliente pelo ID (verificando que é role 'user')
- Busque as adoções do cliente com JOIN na tabela de dogs
- **Remova o campo password** antes de retornar (`delete client.password`)
- Retorne `{ client, adoptions }`

**Passo 3 — Rota POST `/clients/:id/delete` (excluir cliente)**
- Antes de deletar, busque as adoções aprovadas do cliente
- Para cada adoção aprovada, volte o cão para disponível (`available = 1`)
- Delete todas as adoções do cliente
- Delete o cliente (apenas se for role 'user', nunca delete um admin)

#### Adoções

**Passo 4 — Rota GET `/adoptions` (listar todas as adoções)**
- Faça um JOIN triplo: `adoptions` + `users` + `dogs`
- Retorne nome do cão, foto, nome do cliente, email, telefone, status, data

**Passo 5 — Rota POST `/adoptions/:id/approve` (aprovar adoção)**
- Mude o status da adoção para `'approved'`
- Marque o cão como indisponível (`available = 0`)
- **Rejeite automaticamente** todas as outras solicitações pendentes para o mesmo cão

**Passo 6 — Rota POST `/adoptions/:id/reject` (rejeitar adoção)**
- Apenas mude o status para `'rejected'`

#### Local

**Passo 7 — Rota GET `/place`**
- Retorne as informações do local + lista de fotos

**Passo 8 — Rota POST `/place` (atualizar informações)**
- Receba os campos do body e execute um UPDATE na tabela `place_info`

**Passo 9 — Rota POST `/place/photo` (adicionar foto)**
- Configure um multer separado para fotos do local (pasta `public/uploads/place/`)
- Receba a foto e uma legenda opcional
- Insira na tabela `place_photos`

**Passo 10 — Rota POST `/place/photo/:id/delete` (excluir foto)**
- Busque a foto no banco, delete o arquivo do disco e o registro do banco

**Dicas de pesquisa:** "SQL JOIN three tables", "delete object property javascript", "multer multiple storage configs"

---

### 👤 P8 — CSS + Layout + Home (`style.css`, `public/index.html`)

**Objetivo:** Criar todo o visual do sistema usando CSS puro e a estrutura da página inicial.

#### CSS (`public/css/style.css`)

**Passo 1 — Definir variáveis CSS**
- Use `:root` para criar variáveis de cores (primária, sucesso, perigo, aviso, fundo, texto, borda) e valores de sombra e borda-raio
- Isso facilita manter consistência visual em todo o site

**Passo 2 — Reset e base**
- Aplique `box-sizing: border-box` em todos os elementos
- Defina a fonte do body, cor de fundo, cor de texto
- Use `min-height: 100vh` e `display: flex; flex-direction: column` no body para que o footer sempre fique embaixo

**Passo 3 — Navbar**
- Estilize `.navbar` com fundo na cor primária, posição sticky no topo, layout flexbox (justify-content: space-between)
- Estilize `.navbar-brand` como link branco e sem decoração
- Estilize `.navbar-links` como lista flexbox, com links brancos que mudam de fundo ao hover
- Crie `.btn-nav` com fundo semi-transparente para botões na navbar

**Passo 4 — Containers**
- `.container` — max-width de ~1100px, centralizado com margin auto, padding
- `.container-small` — max-width de ~500px, para formulários

**Passo 5 — Alertas**
- Crie `.alert` com padding, border-radius e animação fadeIn
- `.alert-success` — verde claro
- `.alert-error` — vermelho claro

**Passo 6 — Hero**
- Seção de destaque com background gradiente, texto branco, padding generoso, texto centralizado

**Passo 7 — Cards de cães**
- `.cards-grid` — use CSS Grid com `repeat(auto-fill, minmax(280px, 1fr))`
- `.card` — fundo branco, sombra, border-radius, efeito de hover (translateY + sombra maior)
- `.card-img` — largura 100%, altura fixa com `object-fit: cover`
- `.card-placeholder` — div cinza com emoji para quando não há foto

**Passo 8 — Botões**
- Classe base `.btn` com padding, border-radius, cursor pointer
- Variantes: `.btn-primary`, `.btn-success`, `.btn-danger`, `.btn-secondary`, `.btn-warning`, `.btn-outline`, `.btn-white`, `.btn-sm`

**Passo 9 — Formulários**
- `.form-container` — fundo branco com sombra
- `.form-group` — margin-bottom para espaçamento
- Inputs/textareas/selects com largura 100%, borda, padding, efeito de foco (borda na cor primária + sombra leve)

**Passo 10 — Tabelas**
- `.table-container` com overflow-x auto (scroll horizontal no mobile)
- Cabeçalho com fundo leve, bordas entre linhas, hover nas linhas
- `.table-img` — miniatura quadrada com object-fit cover

**Passo 11 — Badges de status**
- `.badge` — inline-block com padding pequeno, border-radius arredondado, texto uppercase
- `.badge-pending` (amarelo), `.badge-approved` (verde), `.badge-rejected` (vermelho)
- `.badge-available` (verde), `.badge-unavailable` (vermelho)

**Passo 12 — Seções admin**
- `.stats-grid` — grid para cards de estatísticas do dashboard
- `.admin-nav` — navegação horizontal com links estilizados
- `.detail-grid` — grid de 2 colunas para página de detalhes

**Passo 13 — Galeria de fotos, filtros, footer e utilitários**
- `.photo-grid` com CSS Grid, `.filter-bar` com flexbox
- Footer com fundo escuro e `margin-top: auto`
- Classes utilitárias: `.text-center`, `.mt-10`, `.mt-20`, `.mb-10`, `.mb-20`, `.flex-between`

**Passo 14 — Responsividade**
- Use `@media (max-width: 768px)` para tablets: detail-grid em 1 coluna, navbar empilhada
- Use `@media (max-width: 480px)` para celulares: cards-grid em 1 coluna

#### HTML da Home (`public/index.html`)

**Passo 15 — Estruturar a página inicial**
- Inclua a navbar vazia (`<nav id="navbar">`), o container de alertas, a seção hero, um grid para cães em destaque (`id="featured-dogs"`), e o footer
- Carregue `/js/main.js` (que monta a navbar e carrega os cães em destaque)

**Dicas de pesquisa:** "CSS custom properties", "CSS Grid auto-fill minmax", "responsive design media queries"

---

### 👤 P9 — Páginas Usuário + JavaScript (`main.js`, `auth.js`, `dogs.js`, `place.js` + HTMLs)

**Objetivo:** Criar o JavaScript que faz o frontend funcionar e os HTMLs das páginas do usuário.

#### `public/js/main.js` — Código compartilhado

**Passo 1 — Verificar usuário logado ao carregar a página**
- Faça `fetch('/api/auth/me')` para verificar se há sessão ativa
- Se retornar 200, armazene os dados numa variável global `window.currentUser`
- Se retornar 401, o usuário não está logado (ok, variável fica null)

**Passo 2 — Montar a navbar dinamicamente**
- Busque o elemento `#navbar`
- Dependendo de `currentUser`:
  - **Não logado:** links para Início, Cães, Local, Login e Cadastro
  - **Admin:** links para Dashboard, Cães, Clientes, Adoções, Local, nome do usuário e Sair
  - **Usuário comum:** links para Início, Cães, Minhas Adoções, Local, nome e Sair
- Use `innerHTML` para inserir os links

**Passo 3 — Criar funções auxiliares**
- `logout()` — chama `/api/auth/logout` e redireciona para login
- `showAlert(message, type)` — cria um div com classe `alert-success` ou `alert-error`, insere no container e remove após 4 segundos
- `apiCall(url, options)` — wrapper do fetch que converte para JSON e lança erro se não for 200
- `maskCPF(input)` e `maskPhone(input)` — adicionam evento `input` que formata o valor enquanto digita
- `setupImagePreview(inputId, previewId)` — mostra preview da imagem selecionada no input file

**Passo 4 — Carregar cães em destaque**
- Se a página tem o elemento `#featured-dogs`, busque `/api/dogs` e monte cards dos primeiros 6 cães

**Passo 5 — Criar uma Promise global `window.appReady`**
- Envolva as inicializações (loadUser, buildNav, loadFeaturedDogs) numa IIFE async
- Armazene em `window.appReady` para que outros scripts possam usar `window.appReady.then(...)` e esperar a inicialização terminar

#### `public/js/auth.js` — Login e Cadastro

**Passo 6 — Redirecionar se já logado**
- Aguarde `window.appReady` e verifique: se já tem `currentUser`, redirecione (admin para /admin, user para /index)

**Passo 7 — Formulário de login**
- Capture o evento `submit` do form `#login-form`
- Previna o comportamento padrão com `e.preventDefault()`
- Envie os dados para `/api/auth/login` via POST com JSON
- Se sucesso, redirecione com base no role. Se erro, mostre mensagem

**Passo 8 — Formulário de cadastro**
- Aplique as máscaras de CPF e telefone nos inputs
- Capture o `submit` do form `#register-form`
- Envie os dados para `/api/auth/register` via POST com JSON
- Se sucesso, mostre alerta e redirecione para login após 1 segundo

#### `public/js/dogs.js` — Listagem, Detalhes e Adoções

**Passo 9 — Lista de cães**
- Se a página tem `#dogs-list`, busque `/api/dogs` e crie um card para cada cão com nome, idade, foto e link para detalhes

**Passo 10 — Detalhes do cão**
- Se a página tem `#dog-detail`, pegue o `id` da URL com `URLSearchParams`
- Busque `/api/dogs/:id` e monte a visualização com foto grande, informações e botão de adoção
- O botão muda conforme o contexto: se não logado → "Faça login", se logado e disponível → "Quero Adotar", se indisponível → "Já adotado"

**Passo 11 — Solicitar adoção**
- Crie a função `requestAdopt(dogId)` que faz POST para `/api/dogs/:id/adopt`
- Se sucesso, redirecione para "Minhas Adoções"

**Passo 12 — Minhas adoções**
- Se a página tem `#my-adoptions`, busque `/api/dogs/my-adoptions`
- Monte uma tabela com foto, nome, status (com badges coloridos) e botão cancelar
- A função `cancelAdoption` faz POST e recarrega a lista

#### `public/js/place.js` — Página do Local

**Passo 13 — Carregar informações do local**
- Busque `/api/place` e monte a visualização com nome, descrição, endereço, contatos, redes sociais e galeria de fotos

#### HTMLs das páginas de usuário

**Passo 14 — Criar as páginas HTML**
- Todas seguem o mesmo padrão: DOCTYPE, head com charset + viewport + title + link para style.css, body com navbar vazia, alert-container, main com container, footer e scripts
- `login.html` — formulário com email e senha, link para cadastro
- `register.html` — formulário com todos os campos (nome, email, telefone, CPF, endereço, senha, confirmar senha)
- `dogs.html` — título + div `#dogs-list` com "Carregando..."
- `dog-detail.html` — div `#dog-detail` com "Carregando..."
- `my-adoptions.html` — título + div `#my-adoptions` com "Carregando..."
- `place.html` — div `#place-info` com "Carregando..."
- Cada página carrega `main.js` + o JS específico da funcionalidade

**Dicas de pesquisa:** "fetch API POST JSON", "URLSearchParams get parameter", "JavaScript innerHTML template literals", "input mask javascript"

---

### 👤 P10 — Páginas Admin + JavaScript (`admin.js` + `admin/*.html`)

**Objetivo:** Criar o painel administrativo completo: dashboard, CRUD de cães, gestão de clientes, adoções e edição do local.

#### `public/js/admin.js`

**Passo 1 — Verificar acesso admin**
- Aguarde `window.appReady` e verifique se `currentUser` existe e tem `role === 'admin'`
- Se não for admin, redirecione para login

**Passo 2 — Inicializar a página correta**
- Verifique quais elementos de ID existem na página (dashboard, admin-dogs, dog-form, etc.)
- Chame a função de inicialização correspondente

**Passo 3 — Dashboard**
- Busque `/api/admin/dashboard` e monte cards com os números (total de cães, disponíveis, clientes, adoções pendentes e aprovadas)

**Passo 4 — Lista de cães (admin)**
- Busque `/api/admin/dogs` e monte uma tabela com foto, nome, idade, condição, status e botões de Editar/Excluir
- A função `deleteDog` faz POST para `/api/admin/dogs/:id/delete` com confirmação

**Passo 5 — Formulário de cão (cadastrar/editar)**
- Verifique se há `id` na URL: se sim, é edição (carregue os dados do cão e preencha os campos)
- Se está editando, mostre o campo "Disponível" (oculto por padrão)
- Configure o preview de imagem
- No submit, use `new FormData(form)` para enviar os dados incluindo o arquivo
- **Não defina Content-Type** no fetch — o navegador configura sozinho o boundary do multipart
- Envie para `/api/admin/dogs` (criação) ou `/api/admin/dogs/:id` (edição)

**Passo 6 — Lista de clientes**
- Busque `/api/admin/clients` e monte tabela com nome, email, telefone, CPF e botões
- Função `deleteClient` com confirmação

**Passo 7 — Detalhes do cliente**
- Busque `/api/admin/clients/:id` e mostre dados pessoais + tabela de adoções do cliente

**Passo 8 — Gestão de adoções**
- Busque `/api/admin/adoptions` e monte tabela com cão, cliente, contato, status e botões Aprovar/Rejeitar (só para pendentes)
- Crie filtros (Todas, Pendentes, Aprovadas, Rejeitadas) que mostram/ocultam linhas **sem recarregar a página**
- Use `data-status` nas linhas da tabela e `display: none` para filtrar

**Passo 9 — Edição do local**
- Busque `/api/admin/place` e monte um formulário com todos os campos preenchidos
- No submit, envie os dados via POST com JSON
- Abaixo do formulário, monte a seção de fotos: formulário de upload + galeria com botões de excluir
- O upload usa `FormData` (igual ao cão), as fotos são exibidas num grid

#### HTMLs do admin

**Passo 10 — Criar as páginas admin**
- Todas seguem o padrão: navbar, alert-container, container com título, navegação admin (`.admin-nav` com links para Dashboard, Cães, Clientes, Adoções, Local), conteúdo e footer
- Na `.admin-nav`, marque o link da página atual com `class="active"`
- `index.html` — div `#dashboard` com classe `stats-grid`
- `dogs.html` — botão "+ Novo Cão" + div `#admin-dogs` com classe `table-container`
- `dog-form.html` — formulário com campos de nome, idade, vacinas, condição, descrição, foto e disponibilidade (oculto)
- `clients.html` — div `#admin-clients` com classe `table-container`
- `client-detail.html` — div `#client-detail`
- `adoptions.html` — barra de filtros + div `#admin-adoptions` com classe `table-container`
- `place.html` — div `#admin-place`
- Todas carregam `main.js` + `admin.js`

**Dicas de pesquisa:** "FormData file upload fetch", "querySelectorAll data attribute filter", "JavaScript confirm dialog"

---

## ✅ CHECKLIST DE TESTES — Validação Final

Use esta checklist para verificar se **tudo** está funcionando antes de considerar o site pronto. Teste **na ordem indicada** — itens anteriores são pré-requisito para os seguintes.

### 🔧 1. Infraestrutura e Inicialização

- [ ] `npm install` roda sem erros
- [ ] `node server.js` inicia sem erros e exibe a mensagem com URL e credenciais
- [ ] A pasta `data/` é criada automaticamente (com `database.sqlite` dentro)
- [ ] As pastas `public/uploads/dogs/` e `public/uploads/place/` são criadas automaticamente
- [ ] Acessar `http://localhost:3000` abre a página inicial

### 🔑 2. Autenticação

- [ ] A página de login (`/login.html`) carrega corretamente
- [ ] Login com `admin@abrigo.com` / `admin123` funciona e redireciona para o painel admin
- [ ] Login com credenciais erradas exibe mensagem de erro
- [ ] Login com campos vazios exibe mensagem de erro
- [ ] A página de cadastro (`/register.html`) carrega corretamente
- [ ] Cadastro com todos os campos válidos funciona e redireciona para login
- [ ] Cadastro com email já existente exibe erro
- [ ] Cadastro com CPF já existente exibe erro
- [ ] Cadastro com senhas diferentes exibe erro
- [ ] Cadastro com CPF inválido (não tem 11 dígitos) exibe erro
- [ ] Máscara de CPF formata corretamente enquanto digita (000.000.000-00)
- [ ] Máscara de telefone formata corretamente enquanto digita ((00) 00000-0000)
- [ ] Após cadastro, consegue fazer login com as novas credenciais
- [ ] Botão "Sair" encerra a sessão e redireciona para login
- [ ] Após logout, acessar `/my-adoptions.html` redireciona para login

### 🧭 3. Navegação (Navbar)

- [ ] **Visitante** (não logado): vê links Início, Cães Disponíveis, Sobre o Local, Login e Cadastre-se
- [ ] **Usuário logado**: vê links Início, Cães Disponíveis, Minhas Adoções, Sobre o Local, nome e Sair
- [ ] **Admin logado**: vê links Dashboard, Cães, Clientes, Adoções, Local, nome e Sair
- [ ] Navbar aparece em todas as páginas
- [ ] Links da navbar levam às páginas corretas

### 🐕 4. Listagem de Cães (Público)

- [ ] Página `/dogs.html` carrega e exibe "Nenhum cão disponível" quando não há cães
- [ ] Após cadastrar cães pelo admin, a lista mostra cards com foto, nome e idade
- [ ] Cards sem foto mostram o placeholder com emoji
- [ ] Botão "Ver Detalhes" leva à página correta do cão
- [ ] Página inicial mostra até 6 cães em destaque

### 🐾 5. Detalhes do Cão

- [ ] Página `/dog-detail.html?id=X` exibe foto grande, nome, idade, vacinas, condição, descrição e status
- [ ] Visitante não logado vê botão "Faça login para adotar"
- [ ] Usuário logado vê botão "Quero Adotar!" para cães disponíveis
- [ ] Cão indisponível mostra badge "Já adotado" em vez do botão
- [ ] Acessar com ID inexistente mostra "Cão não encontrado"

### 💚 6. Processo de Adoção (Usuário)

- [ ] Clicar em "Quero Adotar!" mostra mensagem de sucesso e redireciona para "Minhas Adoções"
- [ ] Tentar adotar o mesmo cão duas vezes exibe erro
- [ ] Página "Minhas Adoções" lista as adoções com status (Pendente/Aprovada/Rejeitada)
- [ ] Botão "Cancelar" do usuário remove a adoção (com confirmação)
- [ ] Cancelar adoção aprovada torna o cão disponível novamente
- [ ] Sem adoções, mostra mensagem "Você ainda não solicitou nenhuma adoção"

### 📍 7. Página do Local (Público)

- [ ] Página `/place.html` exibe nome, descrição, endereço, telefone e email do local
- [ ] Links de redes sociais aparecem quando preenchidos pelo admin
- [ ] Galeria de fotos é exibida quando há fotos cadastradas

### 📊 8. Painel Admin — Dashboard

- [ ] Acessar `/admin/index.html` como admin mostra as estatísticas
- [ ] Os números refletem os dados reais (total de cães, disponíveis, clientes, adoções)
- [ ] Navegação admin (menu lateral/superior) funciona em todas as páginas admin
- [ ] Acessar páginas admin sem ser admin redireciona para login

### 🐕 9. Painel Admin — Gerenciar Cães

- [ ] Página `/admin/dogs.html` lista todos os cães (incluindo indisponíveis) com tabela
- [ ] Botão "+ Novo Cão" abre formulário em branco
- [ ] Cadastrar cão com nome e idade funciona
- [ ] Upload de foto funciona (arquivo aparece em `public/uploads/dogs/`)
- [ ] Preview da foto aparece ao selecionar o arquivo
- [ ] Botão "Editar" carrega o formulário com dados preenchidos
- [ ] Campo "Disponível" aparece apenas ao editar (não ao cadastrar)
- [ ] Editar cão com nova foto substitui a foto antiga (arquivo antigo é deletado)
- [ ] Editar cão sem trocar a foto mantém a foto existente
- [ ] Excluir cão remove o registro, as adoções associadas e a foto do disco
- [ ] Tentar cadastrar sem nome ou idade exibe erro

### 👥 10. Painel Admin — Clientes

- [ ] Lista de clientes mostra nome, email, telefone e CPF
- [ ] Botão "Detalhes" mostra dados completos + lista de adoções do cliente
- [ ] A senha do cliente **não** aparece nos detalhes
- [ ] Excluir cliente remove o cliente, suas adoções e libera os cães aprovados
- [ ] Lista vazia mostra mensagem "Nenhum cliente cadastrado"

### 📝 11. Painel Admin — Adoções

- [ ] Lista de adoções mostra cão, cliente, contato, status e data
- [ ] Botões "Aprovar" e "Rejeitar" aparecem apenas para adoções pendentes
- [ ] Aprovar adoção: muda status para "Aprovada" e cão fica indisponível
- [ ] Aprovar adoção: rejeita automaticamente outras solicitações pendentes para o mesmo cão
- [ ] Rejeitar adoção: muda status para "Rejeitada"
- [ ] Filtros (Todas, Pendentes, Aprovadas, Rejeitadas) funcionam sem recarregar a página
- [ ] O filtro ativo fica visualmente destacado

### 📍 12. Painel Admin — Editar Local

- [ ] Formulário carrega com as informações atuais do local
- [ ] Salvar informações atualiza os dados (verificar na página pública `/place.html`)
- [ ] Upload de foto do local funciona (arquivo em `public/uploads/place/`)
- [ ] Legenda opcional é salva junto com a foto
- [ ] Excluir foto remove da galeria e do disco
- [ ] Fotos aparecem na galeria com botão de excluir

### 🔒 13. Segurança e Proteção

- [ ] Acessar `/api/admin/dogs` sem estar logado retorna 401
- [ ] Acessar `/api/admin/dogs` como usuário comum retorna 403
- [ ] Acessar `/api/dogs/my-adoptions` sem estar logado retorna 401
- [ ] Senhas são armazenadas como hash (nunca em texto puro no banco)
- [ ] Não é possível deletar o admin pelo painel (rota deleta apenas role 'user')
- [ ] Upload aceita apenas imagens (testar enviar um .txt via ferramenta como Postman)
- [ ] Limite de 5MB no upload funciona (testar com arquivo grande)

### 📱 14. Responsividade e Visual

- [ ] Página inicial se adapta a telas pequenas (celular)
- [ ] Cards de cães empilham em uma coluna no mobile
- [ ] Navbar se reorganiza em telas menores
- [ ] Tabelas têm scroll horizontal no mobile
- [ ] Formulários ficam legíveis em telas pequenas
- [ ] Todas as páginas têm o footer sempre no final

### 🔄 15. Fluxo Completo (Teste de Integração)

- [ ] **Fluxo do usuário:** Cadastrar → Login → Ver cães → Ver detalhes → Solicitar adoção → Ver em "Minhas Adoções" → Cancelar adoção
- [ ] **Fluxo do admin:** Login → Cadastrar cão com foto → Ver na listagem pública → Aprovar adoção de cliente → Cão fica indisponível → Excluir cão
- [ ] **Fluxo do local:** Admin edita informações → Admin adiciona fotos → Visitante vê tudo na página pública
- [ ] Reiniciar o servidor local (`npm run dev`) mantém todos os dados locais (banco salvo no disco)
- [ ] Deletar `data/database.sqlite` e reiniciar recria o banco com dados padrão

---

## ☁️ HOSPEDAGEM NO VERCEL — O QUE MUDA

Para funcionar corretamente no Vercel, o projeto precisa destas adaptações:

- A API roda como Function em `api/index.js`
- O backend não usa sessão em memória; usa cookie assinado
- Em produção, os dados ficam no Vercel Postgres
- Em produção, as imagens ficam no Vercel Blob
- Localmente, o projeto continua usando SQLite e `public/uploads`

### Arquivos importantes para o deploy

- `server.js` exporta o app Express e só faz `listen` localmente
- `api/index.js` é a entrada serverless do Vercel
- `vercel.json` faz o rewrite de `/api/*`
- `database.js` escolhe SQLite local ou Postgres em produção
- `lib/auth.js` gerencia autenticação por cookie assinado
- `lib/uploads.js` salva uploads localmente ou no Vercel Blob

### Variáveis de ambiente no Vercel

- `NODE_ENV=production`
- `AUTH_COOKIE_SECRET=<um segredo forte>`
- `POSTGRES_URL=<gerada pelo Vercel Postgres>`
- `POSTGRES_PRISMA_URL=<gerada pelo Vercel Postgres>`
- `BLOB_READ_WRITE_TOKEN=<gerada pelo Vercel Blob>`

### Passo a passo para hospedar no Vercel

1. Suba este projeto para um repositório no GitHub.
2. Entre no Vercel e clique em **Add New Project**.
3. Importe o repositório.
4. No projeto criado, adicione o **Vercel Postgres**.
5. Adicione também o **Vercel Blob**.
6. Vá em **Settings > Environment Variables**.
7. Cadastre as variáveis listadas acima.
8. Faça o deploy.
9. Abra a URL gerada pelo Vercel.
10. Teste o login com `admin@abrigo.com` e `admin123`.
11. Cadastre um cão com foto para validar banco e upload.

### Configuração esperada no Vercel

- Framework Preset: `Other`
- Install Command: `npm install`
- Build Command: padrão do Vercel ou vazio
- Output Directory: vazio
- Node.js: versão 18 ou superior

### Observações importantes

- Sem `POSTGRES_URL`, produção no Vercel não terá persistência confiável.
- Sem `BLOB_READ_WRITE_TOKEN`, os uploads não ficam persistentes em produção.
- O modo local continua funcionando sem esses serviços externos.
