# Sistema de Adocao de Caes

Aplicacao com frontend em HTML/CSS/JS puro e backend em Node.js + Express.

## Modos de execucao

- Desenvolvimento local: SQLite com `sql.js` e uploads em `public/uploads`
- Producao no Vercel: Vercel Functions, Neon Postgres e Vercel Blob

## Arquivos principais

```text
registration-system/
|- api/index.js
|- lib/auth.js
|- lib/uploads.js
|- public/
|- routes/
|- database.js
|- server.js
|- vercel.json
`- GUIA_TAREFAS.md
```

## Variaveis de ambiente

Use o arquivo `.env.example` como referencia.

- `NODE_ENV=production`
- `AUTH_COOKIE_SECRET=um-segredo-forte`
- `POSTGRES_URL=...` (gerada pelo Neon ao conectar ao Vercel)
- `DATABASE_URL=...` (gerada pelo Neon ao conectar ao Vercel)
- `BLOB_READ_WRITE_TOKEN=...` (gerada pelo Vercel Blob)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Login admin padrao:

- Email: `admin@abrigo.com`
- Senha: `admin123`

## Deploy no Vercel

1. Envie o projeto para um repositorio GitHub.
2. Importe o repositorio no Vercel.
3. Adicione Neon Postgres (Storage > Create Database > Neon).
4. Adicione Vercel Blob (Storage > Create Database > Blob).
5. Configure as variaveis `NODE_ENV=production` e `AUTH_COOKIE_SECRET`.
6. Faca o deploy.

O guia detalhado esta em `GUIA_TAREFAS.md`.
