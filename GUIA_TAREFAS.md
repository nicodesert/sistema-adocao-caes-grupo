# 🐾 GUIA DE TAREFAS — Sistema de Adoção de Cães

## Divisão para 11 Pessoas

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

---

## 📁 ESTRUTURA DE PASTAS

```
registration-system/
├── server.js
├── database.js
├── package.json
├── vercel.json
├── api/
│   └── index.js
├── lib/
│   ├── auth.js
│   └── uploads.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── dogs.js
│   ├── admin.js
│   └── place.js
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dogs.html
│   ├── dog-detail.html
│   ├── my-adoptions.html
│   ├── place.html
│   ├── admin/
│   │   ├── index.html
│   │   ├── dogs.html
│   │   ├── dog-form.html
│   │   ├── clients.html
│   │   ├── client-detail.html
│   │   ├── adoptions.html
│   │   └── place.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── dogs.js
│   │   ├── place.js
│   │   └── admin.js
│   └── uploads/
│       ├── dogs/
│       └── place/
└── data/
    └── database.sqlite
```

---

## 👥 DIVISÃO DE TAREFAS

| Pessoa | Tarefa                        | Arquivos                              | Dificuldade |
|--------|-------------------------------|---------------------------------------|-------------|
| **P1** | Servidor + Config             | `package.json`, `server.js`, `vercel.json`, `api/index.js` | ⭐⭐⭐ |
| **P2** | Banco de Dados                | `database.js`                         | ⭐⭐⭐      |
| **P3** | Middleware Auth                | `middleware/auth.js`                  | ⭐          |
| **P4** | API Login/Cadastro            | `routes/auth.js`                      | ⭐⭐        |
| **P5** | API Cães                      | `routes/dogs.js`                      | ⭐⭐        |
| **P11**| API Local                     | `routes/place.js`                     | ⭐⭐        |
| **P6** | API Admin (CRUD)              | `routes/admin.js` (cães)              | ⭐⭐⭐      |
| **P7** | API Admin (clientes/adoções)  | `routes/admin.js` (clientes+adoções+local) | ⭐⭐⭐ |
| **P8** | CSS + Layout + Home           | `style.css`, `index.html`             | ⭐⭐        |
| **P9** | Páginas Usuário + JS          | HTMLs do usuário + `main.js`, `auth.js`, `dogs.js`, `place.js` | ⭐⭐ |
| **P10**| Páginas Admin + JS            | `admin/*.html` + `admin.js`           | ⭐⭐⭐      |

---

## 🚀 COMO RODAR

```bash
npm install
npm run dev
# Abrir http://localhost:3000
# Login admin: admin@abrigo.com / admin123
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
const resposta = await fetch('/api/dogs');
const caes = await resposta.json();
```

### Exemplo de enviar dados (login):
```javascript
const resposta = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@abrigo.com', password: 'admin123' })
});
```

---

## 🧭 PASSO A PASSO — GUIA POR PESSOA

### 👤 P1 — Servidor + Configuração

**Objetivo:** Criar o servidor que roda toda a aplicação.

- Inicializar o projeto com `npm init`
- Instalar dependências: express, cookie-parser, bcryptjs, multer, sql.js, pg, @vercel/blob
- Criar `createApp()` com middlewares e rotas
- Criar `initializeApp()` com singleton
- Exportar funções para o Vercel (`api/index.js`)
- Configurar `vercel.json`

---

### 👤 P2 — Banco de Dados

**Objetivo:** Criar e gerenciar o banco de dados SQLite/PostgreSQL.

- Criar wrappers `wrapDb` e `wrapPostgres` com interface unificada
- Implementar `initializeDatabase()` com todas as tabelas
- Criar admin padrão e dados iniciais
- Exportar `initializeDatabase` e `getDb`

---

### 👤 P3 — Middleware de Autenticação

**Objetivo:** Proteger rotas verificando login e permissão admin.

- `isAuthenticated(req, res, next)` — verifica `req.session.user`, retorna 401 se não logado
- `isAdmin(req, res, next)` — verifica role admin, retorna 403 se não for admin
- Exportar ambas as funções

---

### 👤 P4 — API de Login/Cadastro

**Objetivo:** Criar rotas de autenticação.

- `GET /me` — retorna usuário logado
- `POST /login` — valida credenciais, seta cookie
- `POST /register` — valida campos, criptografa senha, insere usuário
- `GET /logout` — limpa sessão e cookie

---

### 👤 P5 — API de Cães

**Objetivo:** Criar rotas públicas de cães e adoção.

- `GET /` — lista cães disponíveis
- `GET /my-adoptions` — adoções do usuário (requer login)
- `GET /:id` — detalhes do cão
- `POST /:id/adopt` — solicitar adoção
- `POST /cancel-adoption/:id` — cancelar adoção

---

### 👤 P11 — API do Local

**Objetivo:** Rota pública com informações do abrigo.

- `GET /` — retorna `{ place, photos }`

---

### 👤 P6 — API Admin: CRUD de Cães

**Objetivo:** CRUD completo de cães com upload de fotos.

- Configurar multer com memoryStorage e fileFilter de imagens
- `GET /dashboard`, `GET/POST /dogs`, `POST /dogs/:id`, `POST /dogs/:id/delete`

---

### 👤 P7 — API Admin: Clientes, Adoções e Local

**Objetivo:** Completar o admin com clientes, adoções e local.

- `GET/DELETE /clients`, `GET /clients/:id`
- `GET /adoptions`, `POST /adoptions/:id/approve`, `POST /adoptions/:id/reject`
- `GET/POST /place`, `POST /place/photo`, `POST /place/photo/:id/delete`

---

### 👤 P8 — CSS + Layout + Home

**Objetivo:** Criar todo o visual do sistema.

- Variáveis CSS em `:root`
- Navbar, hero, cards, botões, formulários, tabelas, badges
- Responsividade com media queries
- `public/index.html` com seção de destaques

---

### 👤 P9 — Páginas Usuário + JavaScript

**Objetivo:** Frontend do usuário.

- `main.js`: loadUser, buildNavbar, showAlert, apiCall, loadFeaturedDogs
- `auth.js`: formulários de login e cadastro
- `dogs.js`: listagem, detalhes, adoção, minhas adoções
- `place.js`: página do local
- HTMLs: login, register, dogs, dog-detail, my-adoptions, place

---

### 👤 P10 — Páginas Admin + JavaScript

**Objetivo:** Painel administrativo completo.

- `admin.js`: verificação de acesso, dashboard, CRUD cães, clientes, adoções, local
- HTMLs admin: index, dogs, dog-form, clients, client-detail, adoptions, place

---

## ✅ CHECKLIST DE TESTES

- [ ] `npm install` roda sem erros
- [ ] `node server.js` inicia sem erros
- [ ] Login com `admin@abrigo.com` / `admin123` funciona
- [ ] Cadastro de novo usuário funciona
- [ ] Listagem de cães funciona
- [ ] Solicitação de adoção funciona
- [ ] Painel admin carrega
- [ ] CRUD de cães funciona
- [ ] Aprovação de adoção funciona

---

## ☁️ HOSPEDAGEM NO VERCEL

1. Suba para GitHub
2. Importe no Vercel
3. Adicione Vercel Postgres e Vercel Blob
4. Configure variáveis: `NODE_ENV=production`, `AUTH_COOKIE_SECRET`, `POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`
5. Deploy
