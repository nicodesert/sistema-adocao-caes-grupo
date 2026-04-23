# 📋 INSTRUÇÕES PARA OS PARTICIPANTES DO GRUPO

---

## 1. O que você precisa instalar (uma vez)

- [Node.js](https://nodejs.org) — versão 18 ou superior
- [Git](https://git-scm.com/downloads) — para gerenciar o código
- [VS Code](https://code.visualstudio.com) — editor de código (recomendado)

Para verificar se já estão instalados, abra o terminal e execute:
```bash
node -v
git -v
```

---

## 2. Clonar o repositório (uma vez)

Abra o terminal, navegue até a pasta onde quer salvar o projeto e execute:

```bash
git clone https://github.com/USUARIO/NOME-DO-REPOSITORIO.git
cd NOME-DO-REPOSITORIO
npm install
```

> Substitua a URL pelo link real do repositório que o líder do grupo vai te passar.

---

## 3. Antes de começar a trabalhar (sempre)

Sempre atualize seu código com as últimas mudanças do grupo antes de começar:

```bash
git pull origin main
```

---

## 4. Criar seu branch de trabalho

Cada pessoa trabalha em um branch separado para não conflitar com os outros.
Crie o seu com o nome da sua tarefa:

```bash
git checkout -b feature/p2-banco-de-dados
```

Exemplos de nomes:
- `feature/p1-servidor`
- `feature/p3-middleware`
- `feature/p8-css-layout`

---

## 5. Trabalhar nos seus arquivos

Edite apenas os arquivos da **sua responsabilidade** (descritos no `GUIA_TAREFAS.md`).

Para testar localmente:
```bash
npm run dev
```
Acesse `http://localhost:3000` no navegador.

Login admin padrão:
- Email: `admin@abrigo.com`
- Senha: `admin123`

---

## 6. Salvar e enviar seu trabalho

Quando quiser salvar o progresso ou terminar sua parte:

```bash
# Ver o que você alterou
git status

# Marcar todos os arquivos para envio
git add .

# Criar um commit com uma descrição clara
git commit -m "feat: criar tabelas do banco de dados"

# Enviar para o GitHub
git push origin feature/p2-banco-de-dados
```

---

## 7. Abrir um Pull Request

Depois de fazer o push:

1. Acesse o repositório no GitHub
2. Vai aparecer um botão amarelo **"Compare & pull request"** — clique nele
3. Escreva uma descrição do que você implementou
4. Clique em **Create pull request**
5. Avise o líder do grupo para revisar e fazer o merge

---

## 8. Boas práticas

- **Não edite arquivos de outra pessoa** sem combinar antes
- **Sempre faça `git pull origin main`** antes de começar
- **Commits frequentes** — salve o progresso com frequência
- **Mensagens de commit claras** — descreva o que foi feito
- Se aparecer **conflito**: chame o líder do grupo para resolver junto

---

## 9. Mensagens de commit — exemplos

| Tipo | Exemplo |
|---|---|
| Nova funcionalidade | `feat: criar rota de login` |
| Correção de bug | `fix: corrigir validação de CPF` |
| Estilo/CSS | `style: ajustar responsividade do card` |
| Documentação | `docs: atualizar comentários do código` |

---

## 10. Dúvidas

Consulte o arquivo `GUIA_TAREFAS.md` para entender sua tarefa em detalhes.
