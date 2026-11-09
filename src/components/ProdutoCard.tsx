import { formatarPreco } from "../lib/formato";
import type { Produto } from "../lib/types";

type Props = {
  produto: Produto;
  onAbrir: (produto: Produto) => void;
};

export default function ProdutoCard({ produto, onAbrir }: Props) {
  const preco = produto.precoPromocional ?? produto.preco;

  return (
    <button
      type="button"
      className="card"
      onClick={() => onAbrir(produto)}
      aria-label={`Ver detalhes de ${produto.nome}`}
    >
      <div className="card__foto">
        <img
          src={produto.imagem ?? "/demo/vestido.svg"}
          alt={produto.nome}
          loading="lazy"
          decoding="async"
        />
        {produto.destaque && <span className="card__selo">Destaque</span>}
      </div>

      <div className="card__info">
        <span className="card__cat">{produto.categoria}</span>
        <h3 className="card__nome">{produto.nome}</h3>

        <p className="card__preco">
          <strong>{formatarPreco(preco)}</strong>
          {produto.precoPromocional ? <s>{formatarPreco(produto.preco)}</s> : null}
        </p>

        <div className="card__meta">
          <span>
            {produto.tamanhos.length > 0 ? produto.tamanhos.join(" · ") : "Tamanho único"}
          </span>
          {produto.cores.length > 0 && (
            <span
              className="cores"
              aria-label={produto.cores.length === 1 ? "1 cor" : `${produto.cores.length} cores`}
            >
              {produto.cores.slice(0, 4).map((cor, indice) => (
                <i
                  key={`${cor.nome}-${indice}`}
                  style={{ background: cor.hex }}
                  title={cor.nome}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
