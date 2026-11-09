import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProdutoCard from "../components/ProdutoCard";
import ProdutoModal from "../components/ProdutoModal";
import Rodape from "../components/Rodape";
import Topo from "../components/Topo";
import { site } from "../config";
import { bancoConfigurado, listarProdutos, mensagemDeErro } from "../lib/back4app";
import { PRODUTOS_DEMO } from "../lib/demo";
import { formatarPreco, linkWhatsApp, normalizarTexto } from "../lib/formato";
import type { Produto } from "../lib/types";

export default function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [selecionado, setSelecionado] = useState<Produto | null>(null);

  useEffect(() => {
    let vivo = true;

    if (!bancoConfigurado) {
      setProdutos(PRODUTOS_DEMO);
      setCarregando(false);
      return;
    }

    listarProdutos()
      .then((lista) => {
        if (vivo) setProdutos(lista);
      })
      .catch((e) => {
        if (vivo) setErro(mensagemDeErro(e));
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });

    return () => {
      vivo = false;
    };
  }, []);

  const categorias = useMemo(() => {
    const nomes = Array.from(new Set(produtos.map((p) => p.categoria).filter(Boolean)));
    nomes.sort((a, b) => a.localeCompare(b, "pt-BR"));
    return ["Todos", ...nomes];
  }, [produtos]);

  const filtrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    return produtos.filter((produto) => {
      if (categoria !== "Todos" && produto.categoria !== categoria) return false;
      if (!termo) return true;
      const alvo = normalizarTexto(
        [
          produto.nome,
          produto.categoria,
          produto.descricao,
          produto.tamanhos.join(" "),
          produto.cores.map((cor) => cor.nome).join(" "),
        ].join(" "),
      );
      return alvo.includes(termo);
    });
  }, [produtos, categoria, busca]);

  const fecharModal = useCallback(() => setSelecionado(null), []);

  const fotos = produtos.filter((p) => p.imagem).slice(0, 2);
  const foto1 = fotos[0]?.imagem ?? "/demo/vestido.svg";
  const foto2 = fotos[1]?.imagem ?? "/demo/saia.svg";
  const menorPreco = produtos.length
    ? Math.min(...produtos.map((p) => p.precoPromocional ?? p.preco))
    : 0;

  const totalTexto =
    filtrados.length === 1 ? "1 peça encontrada" : `${filtrados.length} peças encontradas`;

  return (
    <>
      <Topo />

      <main>
        <div className="container">
          <section className="hero">
            <div className="hero__texto">
              <span className="olho">
                <i aria-hidden="true" />
                Novidades da semana
              </span>
              <h1>
                Sai do salão <em>com look novo.</em>
              </h1>
              <p className="hero__sub">
                Roupas e acessórios escolhidos a dedo para você provar sem pressa. Fotos,
                preço, tamanho e cor — tudo aqui, do jeitinho que você vê na arara.
              </p>
              <div className="hero__acoes">
                <a className="botao" href="#catalogo">
                  Ver o catálogo
                </a>
                <a
                  className="botao botao--escuro"
                  href={linkWhatsApp("Olá! Queria saber mais sobre as peças do catálogo.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Falar no WhatsApp
                </a>
              </div>
              {!carregando && produtos.length > 0 && (
                <p className="hero__nota">
                  {produtos.length} peças disponíveis agora no {site.nome}.
                </p>
              )}
            </div>

            <div className="hero__arte" aria-hidden="true">
              <div className="hero__foto hero__foto--1">
                <img src={foto1} alt="" />
              </div>
              <div className="hero__foto hero__foto--2">
                <img src={foto2} alt="" />
              </div>
              {menorPreco > 0 && (
                <div className="hero__selo">
                  <span>A partir de</span>
                  <strong>{formatarPreco(menorPreco)}</strong>
                </div>
              )}
            </div>
          </section>

          {!bancoConfigurado && (
            <div className="aviso-demo">
              <span>
                <strong>Modo demonstração.</strong> Estes produtos são exemplos. Preencha as
                chaves do Back4App para exibir as peças reais.
              </span>
              <Link className="link-botao" to="/admin">
                Configurar agora →
              </Link>
            </div>
          )}

          <section className="catalogo" id="catalogo">
            <div className="catalogo__topo">
              <div className="catalogo__titulo">
                <h2>Todas as peças</h2>
                <p>{carregando ? "Carregando catálogo…" : totalTexto}</p>
              </div>

              <label className="busca">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" strokeWidth="1.8" stroke="currentColor" />
                  <path
                    d="M16 16l4 4"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                  />
                </svg>
                <span className="sr-only" hidden>
                  Buscar peça
                </span>
                <input
                  type="search"
                  placeholder="Buscar por nome, cor ou tamanho"
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                />
              </label>
            </div>

            {!carregando && categorias.length > 1 && (
              <div className="chips">
                {categorias.map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    className="chip"
                    aria-pressed={categoria === nome}
                    onClick={() => setCategoria(nome)}
                  >
                    {nome}
                  </button>
                ))}
              </div>
            )}

            {erro && <div className="erro">{erro}</div>}

            {carregando ? (
              <div className="grade">
                {Array.from({ length: 8 }).map((_, indice) => (
                  <div className="esqueleto" key={indice} />
                ))}
              </div>
            ) : filtrados.length === 0 ? (
              <div className="vazio">
                <h3>Nenhuma peça por aqui</h3>
                <p>
                  {produtos.length === 0
                    ? "O catálogo ainda está sendo montado. Volte em breve!"
                    : "Tente outra busca ou escolha outra categoria."}
                </p>
                {(busca || categoria !== "Todos") && (
                  <button
                    type="button"
                    className="botao botao--fantasma"
                    style={{ marginTop: 18 }}
                    onClick={() => {
                      setBusca("");
                      setCategoria("Todos");
                    }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grade">
                {filtrados.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    onAbrir={setSelecionado}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Rodape />

      {selecionado && (
        <ProdutoModal produto={selecionado} onFechar={fecharModal} />
      )}
    </>
  );
}
