import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { site } from "../config";
import {
  bancoConfigurado,
  CLASSE_PRODUTOS,
  entrar,
  excluirProduto,
  listarProdutos,
  mensagemDeErro,
  sair,
  salvarProduto,
  sessaoAtual,
  type UsuarioSessao,
} from "../lib/back4app";
import { ehImagemValida, formatarPreco } from "../lib/formato";
import type { Cor, DadosProduto, Produto } from "../lib/types";

type Formulario = {
  nome: string;
  categoria: string;
  descricao: string;
  preco: string;
  precoPromocional: string;
  tamanhos: string;
  cores: Cor[];
  destaque: boolean;
  ativo: boolean;
};

const FORMULARIO_VAZIO: Formulario = {
  nome: "",
  categoria: "",
  descricao: "",
  preco: "",
  precoPromocional: "",
  tamanhos: "",
  cores: [{ nome: "", hex: "#fe6960" }],
  destaque: false,
  ativo: true,
};

function numeroDoCampo(valor: string): number {
  return Number(valor.replace(",", ".").trim());
}

export default function Admin() {
  const [verificandoSessao, setVerificandoSessao] = useState(bancoConfigurado);
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);

  const [loginUsuario, setLoginUsuario] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(FORMULARIO_VAZIO);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  const formularioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bancoConfigurado) {
      setVerificandoSessao(false);
      return;
    }
    let vivo = true;
    sessaoAtual()
      .then((sessao) => {
        if (vivo && sessao) setUsuario(sessao);
      })
      .catch(() => undefined)
      .finally(() => {
        if (vivo) setVerificandoSessao(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const carregarLista = useCallback(async () => {
    setCarregandoLista(true);
    try {
      setProdutos(await listarProdutos(true));
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: mensagemDeErro(erro) });
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) void carregarLista();
  }, [usuario, carregarLista]);

  useEffect(() => {
    if (!arquivo) {
      setPrevia(null);
      return;
    }
    const url = URL.createObjectURL(arquivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const produtoEmEdicao = produtos.find((p) => p.id === idEditando);
  const imagemAtual = produtoEmEdicao?.imagem ?? null;
  const categoriasExistentes = Array.from(
    new Set(produtos.map((p) => p.categoria).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarCor(indice: number, campo: keyof Cor, valor: string) {
    setFormulario((atual) => ({
      ...atual,
      cores: atual.cores.map((cor, i) => (i === indice ? { ...cor, [campo]: valor } : cor)),
    }));
  }

  function adicionarCor() {
    setFormulario((atual) => ({
      ...atual,
      cores: [...atual.cores, { nome: "", hex: "#febf97" }],
    }));
  }

  function removerCor(indice: number) {
    setFormulario((atual) => ({
      ...atual,
      cores: atual.cores.filter((_, i) => i !== indice),
    }));
  }

  function limparFormulario() {
    setIdEditando(null);
    setFormulario(FORMULARIO_VAZIO);
    setArquivo(null);
  }

  async function aoEntrar(evento: FormEvent) {
    evento.preventDefault();
    setErroLogin(null);
    setEntrando(true);
    try {
      setUsuario(await entrar(loginUsuario, loginSenha));
      setLoginSenha("");
    } catch (erro) {
      setErroLogin(mensagemDeErro(erro));
    } finally {
      setEntrando(false);
    }
  }

  async function aoSair() {
    try {
      await sair();
    } catch {
      /* sessão já encerrada */
    }
    setUsuario(null);
    setProdutos([]);
    limparFormulario();
  }

  function aoEscolherImagem(evento: ChangeEvent<HTMLInputElement>) {
    const escolhido = evento.target.files?.[0] ?? null;
    if (!escolhido) {
      setArquivo(null);
      return;
    }
    const problema = ehImagemValida(escolhido);
    if (problema) {
      setMensagem({ tipo: "erro", texto: problema });
      evento.target.value = "";
      return;
    }
    setArquivo(escolhido);
  }

  function aoEditar(produto: Produto) {
    setIdEditando(produto.id);
    setFormulario({
      nome: produto.nome,
      categoria: produto.categoria,
      descricao: produto.descricao,
      preco: produto.preco.toFixed(2).replace(".", ","),
      precoPromocional: produto.precoPromocional
        ? produto.precoPromocional.toFixed(2).replace(".", ",")
        : "",
      tamanhos: produto.tamanhos.join(", "),
      cores:
        produto.cores.length > 0 ? produto.cores : [{ nome: "", hex: "#fe6960" }],
      destaque: produto.destaque,
      ativo: produto.ativo,
    });
    setArquivo(null);
    setMensagem(null);
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    setMensagem(null);

    if (!formulario.nome.trim()) {
      setMensagem({ tipo: "erro", texto: "Informe o nome da peça." });
      return;
    }

    const preco = numeroDoCampo(formulario.preco);
    if (!Number.isFinite(preco) || preco <= 0) {
      setMensagem({ tipo: "erro", texto: "Informe um preço válido (ex.: 189,90)." });
      return;
    }

    const promocional = formulario.precoPromocional.trim()
      ? numeroDoCampo(formulario.precoPromocional)
      : undefined;

    if (promocional !== undefined && (!Number.isFinite(promocional) || promocional <= 0)) {
      setMensagem({ tipo: "erro", texto: "O preço promocional precisa ser válido." });
      return;
    }

    const dados: DadosProduto = {
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim(),
      categoria: formulario.categoria.trim() || "Outros",
      preco,
      precoPromocional: promocional,
      tamanhos: formulario.tamanhos
        .split(/[,;/]/)
        .map((t) => t.trim())
        .filter(Boolean),
      cores: formulario.cores
        .map((cor) => ({ nome: cor.nome.trim(), hex: cor.hex }))
        .filter((cor) => cor.nome.length > 0),
      destaque: formulario.destaque,
      ativo: formulario.ativo,
    };

    setSalvando(true);
    try {
      await salvarProduto(dados, arquivo, idEditando ?? undefined);
      setMensagem({
        tipo: "ok",
        texto: idEditando ? "Peça atualizada com sucesso." : "Peça publicada no catálogo.",
      });
      limparFormulario();
      await carregarLista();
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: mensagemDeErro(erro) });
    } finally {
      setSalvando(false);
    }
  }

  async function aoExcluir(produto: Produto) {
    const confirmar = window.confirm(
      `Excluir "${produto.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmar) return;

    try {
      await excluirProduto(produto.id);
      if (idEditando === produto.id) limparFormulario();
      await carregarLista();
      setMensagem({ tipo: "ok", texto: "Peça excluída do catálogo." });
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: mensagemDeErro(erro) });
    }
  }

  return (
    <div className="admin">
      <header className="admin__topo">
        <div className="container topo__inner">
          <Link to="/" className="marca">
            <span className="marca__sinal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M7.2 10.4c0-2.6 2.1-4.8 4.8-4.8s4.8 2.2 4.8 4.8"
                  stroke="#fefac2"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path d="M12 6.6v2.6" stroke="#fefac2" strokeWidth="1.7" strokeLinecap="round" />
                <path
                  d="M12 8.8l7 4c1 .6.7 1.9-.5 1.9H5.5c-1.2 0-1.5-1.3-.5-1.9l7-4z"
                  fill="#fefac2"
                />
              </svg>
            </span>
            <span className="marca__texto">
              <strong>{site.nome}</strong>
              <span>painel da loja</span>
            </span>
          </Link>

          <div className="admin__sessao">
            {usuario && <span>Olá, {usuario.nome}</span>}
            <Link to="/" className="botao botao--fantasma">
              Ver catálogo
            </Link>
            {usuario && (
              <button
                type="button"
                className="botao botao--fantasma"
                onClick={() => void aoSair()}
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container admin__corpo">
        {!bancoConfigurado ? (
          <div className="cartao cartao--estreito">
            <h1>Conecte o Back4App</h1>
            <p className="cartao__sub">
              Falta só ligar o catálogo ao seu banco. Depois disso, todas as peças que você
              cadastrar aqui aparecem na hora no site.
            </p>
            <ol className="passos">
              <li>
                Crie um app em <strong>back4app.com</strong> e abra{" "}
                <strong>App Settings → Security &amp; Keys</strong>.
              </li>
              <li>
                Copie o <code>Application ID</code> e o <code>JavaScript Key</code>.
              </li>
              <li>
                Crie um arquivo <code>.env</code> na raiz do projeto (use o{" "}
                <code>.env.example</code> como modelo).
              </li>
              <li>
                No Back4App, crie a classe <code>{CLASSE_PRODUTOS}</code> e um usuário em{" "}
                <strong>Dashboard → App Settings → Users</strong>.
              </li>
              <li>
                Reinicie o <code>npm run dev</code> e entre com esse usuário em{" "}
                <code>/admin</code>.
              </li>
            </ol>
            <pre className="codigo">{`VITE_BACK4APP_APP_ID=cole_aqui
VITE_BACK4APP_JS_KEY=cole_aqui
VITE_BACK4APP_SERVER_URL=https://parseapi.back4app.com`}</pre>
            <p className="campo__dica" style={{ marginTop: 14 }}>
              Na Vercel, cadastre essas mesmas variáveis em{" "}
              <strong>Settings → Environment Variables</strong>.
            </p>
          </div>
        ) : verificandoSessao ? (
          <div className="cartao cartao--estreito">
            <p className="cartao__sub">Verificando sessão…</p>
          </div>
        ) : !usuario ? (
          <div className="cartao cartao--estreito">
            <h1>Painel da loja</h1>
            <p className="cartao__sub">
              Entre com o usuário administrador criado no Back4App para publicar e editar as
              peças.
            </p>
            <form className="pilha" onSubmit={aoEntrar}>
              <div className="campo">
                <label htmlFor="usuario">Usuário ou e-mail</label>
                <input
                  id="usuario"
                  value={loginUsuario}
                  onChange={(e) => setLoginUsuario(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {erroLogin && <p className="retorno retorno--erro">{erroLogin}</p>}
              <button className="botao botao--bloco" type="submit" disabled={entrando}>
                {entrando ? "Entrando…" : "Entrar"}
              </button>
            </form>
          </div>
        ) : (
          <div className="admin__grade">
            <div className="cartao" ref={formularioRef}>
              <h2>{idEditando ? "Editar peça" : "Nova peça"}</h2>
              <p className="cartao__sub">
                Preencha os dados que aparecem no catálogo. A foto é o que mais chama atenção —
                use uma imagem vertical com boa luz.
              </p>

              <form className="pilha" onSubmit={aoSalvar}>
                <div className="campo">
                  <label htmlFor="nome">Nome da peça</label>
                  <input
                    id="nome"
                    value={formulario.nome}
                    onChange={(e) => atualizar("nome", e.target.value)}
                    placeholder="Ex.: Vestido Midi Linho"
                    required
                  />
                </div>

                <div className="dupla">
                  <div className="campo">
                    <label htmlFor="categoria">Categoria</label>
                    <input
                      id="categoria"
                      list="categorias-disponiveis"
                      value={formulario.categoria}
                      onChange={(e) => atualizar("categoria", e.target.value)}
                      placeholder="Vestidos"
                    />
                    <datalist id="categorias-disponiveis">
                      {categoriasExistentes.map((categoria) => (
                        <option key={categoria} value={categoria} />
                      ))}
                    </datalist>
                  </div>

                  <div className="campo">
                    <label htmlFor="preco">Preço (R$)</label>
                    <input
                      id="preco"
                      inputMode="decimal"
                      value={formulario.preco}
                      onChange={(e) => atualizar("preco", e.target.value)}
                      placeholder="189,90"
                      required
                    />
                  </div>
                </div>

                <div className="campo">
                  <label htmlFor="promocional">Preço promocional (opcional)</label>
                  <input
                    id="promocional"
                    inputMode="decimal"
                    value={formulario.precoPromocional}
                    onChange={(e) => atualizar("precoPromocional", e.target.value)}
                    placeholder="149,90"
                  />
                  <span className="campo__dica">
                    Se preencher, o preço antigo aparece riscado no catálogo.
                  </span>
                </div>

                <div className="campo">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    value={formulario.descricao}
                    onChange={(e) => atualizar("descricao", e.target.value)}
                    placeholder="Tecido, caimento, dicas de uso…"
                  />
                </div>

                <div className="campo">
                  <label htmlFor="tamanhos">Tamanhos</label>
                  <input
                    id="tamanhos"
                    value={formulario.tamanhos}
                    onChange={(e) => atualizar("tamanhos", e.target.value)}
                    placeholder="P, M, G"
                  />
                  <span className="campo__dica">Separe por vírgula.</span>
                </div>

                <div className="campo">
                  <label>Cores</label>
                  <div className="cores-editor">
                    {formulario.cores.map((cor, indice) => (
                      <div className="cor-linha" key={indice}>
                        <input
                          type="color"
                          value={cor.hex}
                          onChange={(e) => atualizarCor(indice, "hex", e.target.value)}
                          aria-label={`Cor ${indice + 1}`}
                        />
                        <input
                          value={cor.nome}
                          onChange={(e) => atualizarCor(indice, "nome", e.target.value)}
                          placeholder="Nome da cor (ex.: Coral)"
                        />
                        <button
                          type="button"
                          className="remover"
                          onClick={() => removerCor(indice)}
                          aria-label="Remover cor"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="link-botao" onClick={adicionarCor}>
                    + Adicionar cor
                  </button>
                </div>

                <div className="campo">
                  <label htmlFor="foto">Foto da peça</label>
                  <div className="upload">
                    {(previa || imagemAtual) && (
                      <img
                        className="upload__previa"
                        src={previa ?? imagemAtual ?? ""}
                        alt="Prévia da foto"
                      />
                    )}
                    <div>
                      <input
                        id="foto"
                        type="file"
                        accept="image/*"
                        onChange={aoEscolherImagem}
                      />
                      <p className="campo__dica" style={{ marginTop: 8 }}>
                        JPG, PNG ou WEBP até 5 MB. Formato vertical (4:5) fica melhor.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="admin__acoes" style={{ gap: 20 }}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={formulario.ativo}
                      onChange={(e) => atualizar("ativo", e.target.checked)}
                    />
                    Ativa no catálogo
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={formulario.destaque}
                      onChange={(e) => atualizar("destaque", e.target.checked)}
                    />
                    Destaque
                  </label>
                </div>

                {mensagem && (
                  <p
                    className={
                      mensagem.tipo === "erro" ? "retorno retorno--erro" : "retorno"
                    }
                  >
                    {mensagem.texto}
                  </p>
                )}

                <div className="admin__acoes">
                  <button className="botao" type="submit" disabled={salvando}>
                    {salvando
                      ? "Salvando…"
                      : idEditando
                        ? "Salvar alterações"
                        : "Publicar peça"}
                  </button>
                  {idEditando && (
                    <button
                      type="button"
                      className="botao botao--fantasma"
                      onClick={limparFormulario}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="cartao">
              <h2>Peças cadastradas</h2>
              <p className="cartao__sub">
                {produtos.length} no total ·{" "}
                {produtos.filter((p) => p.ativo).length} ativas no catálogo
              </p>

              {carregandoLista ? (
                <p className="campo__dica" style={{ marginTop: 18 }}>
                  Carregando…
                </p>
              ) : produtos.length === 0 ? (
                <p className="campo__dica" style={{ marginTop: 18 }}>
                  Nenhuma peça cadastrada ainda. Use o formulário ao lado para publicar a
                  primeira.
                </p>
              ) : (
                <div className="lista-admin">
                  {produtos.map((produto) => (
                    <div className="item-admin" key={produto.id}>
                      <img
                        src={produto.imagem ?? "/demo/vestido.svg"}
                        alt={produto.nome}
                        loading="lazy"
                      />
                      <div>
                        <strong>{produto.nome}</strong>
                        <small>
                          {produto.categoria} ·{" "}
                          {formatarPreco(produto.precoPromocional ?? produto.preco)}
                          {!produto.ativo && " · oculta"}
                        </small>
                      </div>
                      <div className="item-admin__botoes">
                        <button
                          type="button"
                          className="mini"
                          onClick={() => aoEditar(produto)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="mini mini--perigo"
                          onClick={() => void aoExcluir(produto)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
