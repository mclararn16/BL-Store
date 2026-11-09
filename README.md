# Catálogo da loja do salão

Site de catálogo para as roupas e acessórios vendidos dentro do salão. Cada peça tem foto,
nome, preço (com preço promocional opcional), tamanhos e cores — e um botão que abre o
WhatsApp já com a peça escolhida na mensagem.

- **Site público:** `/` — catálogo com busca e filtro por categoria.
- **Painel:** `/admin` — login, cadastro, edição, exclusão e upload de fotos.

Stack: React + Vite + TypeScript, fonte Satoshi local e Back4App (Parse) como banco.

---

## 1. Rodar no seu computador

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Sem as chaves do Back4App o site mostra **produtos de
exemplo** e o painel exibe o passo a passo de configuração.

Para gerar a versão de produção:

```bash
npm run build   # gera a pasta dist/
```

---

## 2. Personalizar a loja

Quase tudo se edita em **`src/config.ts`**:

| Campo        | O que é                                                    |
| ------------ | ---------------------------------------------------------- |
| `nome`       | Nome da marca no topo, rodapé e título.                    |
| `assinatura` | Linha pequena embaixo do nome.                             |
| `whatsapp`   | Número com DDI + DDD, só dígitos. Ex.: `"5511987654321"`.  |
| `instagram`  | Usuário com @. Ex.: `"@studiolume"`.                       |
| `endereco`   | Endereço exibido no rodapé.                                |
| `horario`    | Horário de atendimento.                                    |
| `recado`     | Frase sobre retirada/entrega.                              |

As cores da paleta ficam em `src/styles.css` (variáveis `--creme`, `--pessego`, `--coral`).
A fonte Satoshi está em `public/fonts/` e é carregada via `@font-face`.

---

## 3. Configurar o Back4App

1. Crie uma conta em [back4app.com](https://www.back4app.com) e um novo app.
2. Em **App Settings → Security & Keys**, copie o **Application ID** e o **JavaScript Key**.
3. Na raiz do projeto, crie um arquivo **`.env`** (use o `.env.example` como modelo):

   ```env
   VITE_BACK4APP_APP_ID=seu_application_id
   VITE_BACK4APP_JS_KEY=sua_javascript_key
   VITE_BACK4APP_SERVER_URL=https://parseapi.back4app.com
   ```

4. Em **Database → Create a class**, crie a classe **`Produto`** (custom, sem nada pronto).
   As colunas são criadas automaticamente no primeiro cadastro, mas você pode criá-las já com
   estes tipos:

   | Coluna             | Tipo   |
   | ------------------ | ------ |
   | `nome`             | String |
   | `descricao`        | String |
   | `categoria`        | String |
   | `preco`            | Number |
   | `precoPromocional` | Number |
   | `tamanhos`         | Array  |
   | `cores`            | Array  |
   | `imagem`           | File   |
   | `destaque`         | Boolean|
   | `ativo`            | Boolean|

5. **Permissões da classe** (Database → `Produto` → Security): marque **Public Read** e deixe
   **Public Write desmarcado**; escrita liberada para usuários autenticados. Assim qualquer
   visitante vê o catálogo, mas só quem tem login consegue alterar peças.
6. Crie o usuário administrador em **App Settings → Users → Add user** (use seu e-mail como
   username e uma senha forte).
7. Reinicie o `npm run dev` e entre em `/admin` com esse usuário.

> As chaves `Application ID` / `JavaScript Key` são públicas por natureza (vão no navegador).
> A proteção vem das permissões da classe e do login do painel. Nunca coloque a *Master Key*
> no projeto.

---

## 4. Publicar no GitHub e na Vercel

```bash
git init
git add .
git commit -m "Catálogo da loja do salão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

Na [Vercel](https://vercel.com): **Add New → Project**, importe o repositório. Ela detecta o
Vite sozinho (build `npm run build`, saída `dist`). Antes do deploy, adicione as três
variáveis em **Settings → Environment Variables** (mesmos nomes do `.env`) e clique em
**Deploy**.

O arquivo `vercel.json` já cuida das rotas, então `/admin` funciona ao abrir direto pela URL.

> O arquivo `.env` está no `.gitignore` e não vai para o GitHub — as chaves ficam apenas na
> Vercel e no seu computador.

---

## 5. Estrutura

```
public/
  fonts/            Satoshi (Light, Regular, Medium, Bold, Black)
  demo/             imagens de exemplo dos produtos
src/
  config.ts         nome da loja, WhatsApp, Instagram, endereço
  lib/back4app.ts   login + CRUD de produtos + upload de foto
  lib/formato.ts    preço em BRL, busca sem acento, link do WhatsApp
  lib/types.ts      tipos Produto e Cor
  pages/Catalogo.tsx  vitrine com busca e filtros
  pages/Admin.tsx     painel da loja
  components/       topo, card, modal de detalhes, rodapé
  styles.css        paleta, tipografia e layout
```

Depois de conectar o Back4App, os produtos de exemplo deixam de aparecer e o painel passa a
listar apenas as peças cadastradas por você.
