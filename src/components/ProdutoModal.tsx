import { useEffect, useState } from "react";
import { site } from "../config";
import { formatarPreco, linkWhatsApp, ordenarTamanhos } from "../lib/formato";
import type { Produto } from "../lib/types";

type Props = {
  produto: Produto;
  onFechar: () => void;
};

export default function ProdutoModal({ produto, onFechar }: Props) {
  const tamanhos = ordenarTamanhos(produto.tamanhos);
  const [tamanho, setTamanho] = useState(tamanhos[0] ?? "");
  const [cor, setCor] = useState(produto.cores[0]?.nome ?? "");

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [onFechar]);

  const preco = produto.precoPromocional ?? produto.preco;
  const mensagem = `Olá! Vi a peça "${produto.nome}" no catálogo${
    tamanho ? ` (tamanho ${tamanho})` : ""
  }${cor ? `, cor ${cor}` : ""}. Ela ainda está disponível?`;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={produto.nome}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <div className="modal__painel">
        <button
          type="button"
          className="modal__fechar"
          onClick={onFechar}
          aria-label="Fechar detalhes"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.5 3.5l9 9m0-9l-9 9"
              stroke="#2c1b16"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="modal__foto">
          <img src={produto.imagem ?? "/demo/vestido.svg"} alt={produto.nome} />
        </div>

        <div className="modal__info">
          <div>
            <span className="card__cat">{produto.categoria}</span>
            <h2 style={{ marginTop: 8 }}>{produto.nome}</h2>
          </div>

          <div className="modal__preco">
            <strong>{formatarPreco(preco)}</strong>
            {produto.precoPromocional ? <s>{formatarPreco(produto.preco)}</s> : null}
          </div>

          {produto.descricao && <p className="modal__desc">{produto.descricao}</p>}

          {tamanhos.length > 0 && (
            <div className="modal__bloco">
              <h4>Tamanho</h4>
              <div className="tamanhos">
                {tamanhos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="tamanho"
                    aria-pressed={tamanho === t}
                    onClick={() => setTamanho(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {produto.cores.length > 0 && (
            <div className="modal__bloco">
              <h4>Cor</h4>
              <div className="lista-cores">
                {produto.cores.map((c) => (
                  <button
                    key={c.nome}
                    type="button"
                    className="cor"
                    aria-pressed={cor === c.nome}
                    onClick={() => setCor(c.nome)}
                  >
                    <i style={{ background: c.hex }} aria-hidden="true" />
                    {c.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="modal__rodape">
            <a
              className="botao botao--bloco"
              href={linkWhatsApp(mensagem)}
              target="_blank"
              rel="noreferrer"
            >
              Reservar no WhatsApp
            </a>
            <p className="modal__nota">{site.recado}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
