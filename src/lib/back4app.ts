import type { Cor, DadosProduto, Produto } from "./types";

const APP_ID = (import.meta.env.VITE_BACK4APP_APP_ID ?? "").trim();
const JS_KEY = (import.meta.env.VITE_BACK4APP_JS_KEY ?? "").trim();
const SERVIDOR =
  (import.meta.env.VITE_BACK4APP_SERVER_URL ?? "").trim() ||
  "https://parseapi.back4app.com";

/** Nome da classe criada no Back4App. */
export const CLASSE_PRODUTOS = "Produto";

/** `false` quando as variáveis de ambiente ainda não foram preenchidas. */
export const bancoConfigurado = Boolean(APP_ID && JS_KEY);

let moduloParse: any = null;
let iniciado = false;

/** Carrega o SDK apenas quando o banco é usado, mantendo o catálogo leve. */
async function banco(): Promise<any> {
  if (!bancoConfigurado) {
    throw new Error(
      "Back4App não configurado: preencha VITE_BACK4APP_APP_ID e VITE_BACK4APP_JS_KEY.",
    );
  }
  if (!moduloParse) {
    const carregado = await import("parse/dist/parse.min.js");
    moduloParse = (carregado as { default?: unknown }).default ?? carregado;
  }
  if (!iniciado) {
    moduloParse.initialize(APP_ID, JS_KEY);
    moduloParse.serverURL = SERVIDOR;
    iniciado = true;
  }
  return moduloParse;
}

/* ---------------------------------- leitura --------------------------------- */

function urlDaImagem(valor: unknown): string | undefined {
  if (!valor) return undefined;
  if (typeof valor === "string") return valor || undefined;
  try {
    return (valor as { url: () => string }).url() || undefined;
  } catch {
    return undefined;
  }
}

function normalizarCores(valor: unknown): Cor[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => {
      if (typeof item === "string") return { nome: item, hex: "#febf97" };
      const obj = item as Record<string, unknown>;
      const nome = String(obj.nome ?? obj.name ?? "").trim();
      const hex = String(obj.hex ?? obj.cor ?? "").trim() || "#febf97";
      return { nome: nome || hex, hex };
    })
    .filter((cor) => cor.nome.length > 0);
}

function normalizarTamanhos(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((t) => String(t).trim()).filter(Boolean);
  if (typeof valor === "string") {
    return valor
      .split(/[,;/]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function paraProduto(obj: any): Produto {
  const promocional = Number(obj.get("precoPromocional"));
  return {
    id: obj.id as string,
    nome: String(obj.get("nome") ?? "").trim(),
    descricao: String(obj.get("descricao") ?? "").trim(),
    categoria: String(obj.get("categoria") ?? "").trim() || "Outros",
    preco: Number(obj.get("preco") ?? 0),
    precoPromocional:
      Number.isFinite(promocional) && promocional > 0 ? promocional : undefined,
    tamanhos: normalizarTamanhos(obj.get("tamanhos")),
    cores: normalizarCores(obj.get("cores")),
    imagem: urlDaImagem(obj.get("imagem")),
    destaque: Boolean(obj.get("destaque")),
    ativo: obj.get("ativo") !== false,
  };
}

export async function listarProdutos(incluirInativos = false): Promise<Produto[]> {
  const P = await banco();
  const consulta = new P.Query(CLASSE_PRODUTOS);
  if (!incluirInativos) {
    // `notEqualTo` também traz registros criados sem o campo `ativo`.
    consulta.notEqualTo("ativo", false);
  }
  consulta.descending("createdAt");
  consulta.limit(500);
  const registros: unknown[] = await consulta.find();
  const produtos: Produto[] = registros.map((registro) => paraProduto(registro));
  return produtos.sort((a, b) => Number(b.destaque) - Number(a.destaque));
}

/* -------------------------------- escrita ---------------------------------- */

export async function salvarProduto(
  dados: DadosProduto,
  imagem: File | null,
  id?: string,
): Promise<Produto> {
  const P = await banco();
  const Classe = P.Object.extend(CLASSE_PRODUTOS);
  const registro = id ? Classe.createWithoutData(id) : new Classe();

  registro.set("nome", dados.nome.trim());
  registro.set("descricao", dados.descricao.trim());
  registro.set("categoria", dados.categoria.trim() || "Outros");
  registro.set("preco", dados.preco);
  if (dados.precoPromocional && dados.precoPromocional > 0) {
    registro.set("precoPromocional", dados.precoPromocional);
  } else {
    registro.unset("precoPromocional");
  }
  registro.set("tamanhos", dados.tamanhos);
  registro.set("cores", dados.cores);
  registro.set("destaque", dados.destaque);
  registro.set("ativo", dados.ativo);

  if (imagem) {
    const nomeArquivo = imagem.name.replace(/[^\w.-]+/g, "-") || "foto.jpg";
    registro.set("imagem", new P.File(nomeArquivo, imagem));
  }

  const salvo = await registro.save();
  return paraProduto(salvo);
}

export async function excluirProduto(id: string): Promise<void> {
  const P = await banco();
  const Classe = P.Object.extend(CLASSE_PRODUTOS);
  await Classe.createWithoutData(id).destroy();
}

/* --------------------------------- sessão ---------------------------------- */

export type UsuarioSessao = { nome: string };

export async function entrar(usuario: string, senha: string): Promise<UsuarioSessao> {
  const P = await banco();
  const pessoa = await P.User.logIn(usuario.trim(), senha);
  return { nome: (pessoa.get("username") || pessoa.get("email") || usuario).toString() };
}

export async function sair(): Promise<void> {
  const P = await banco();
  await P.User.logOut();
}

export async function sessaoAtual(): Promise<UsuarioSessao | null> {
  const P = await banco();
  const pessoa = await P.User.currentAsync();
  if (!pessoa) return null;
  return { nome: (pessoa.get("username") || pessoa.get("email") || "").toString() };
}

/* --------------------------------- erros ----------------------------------- */

export function mensagemDeErro(erro: unknown): string {
  const codigo =
    typeof erro === "object" && erro !== null && "code" in erro
      ? Number((erro as { code?: unknown }).code)
      : undefined;

  if (codigo === 101) return "Usuário ou senha inválidos.";
  if (codigo === 119) {
    return "Sem permissão no Back4App. Libere leitura pública da classe Produto e escrita apenas para usuários logados.";
  }
  if (codigo === 209) return "Sua sessão expirou. Entre novamente.";
  if (codigo === 100) return "Sem conexão com o Back4App. Verifique sua internet.";

  const mensagem =
    erro && typeof erro === "object" && "message" in erro
      ? String((erro as { message?: unknown }).message ?? "")
      : "";

  if (/invalid (username|login)/i.test(mensagem)) return "Usuário ou senha inválidos.";
  if (/failed to fetch|network/i.test(mensagem)) {
    return "Não consegui falar com o Back4App. Confira sua internet e as chaves de acesso.";
  }
  return mensagem || "Não foi possível concluir a operação. Tente novamente.";
}
