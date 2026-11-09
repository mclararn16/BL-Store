import { Link } from "react-router-dom";
import { site } from "../config";

export default function Topo() {
  return (
    <header className="topo">
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
            <span>{site.assinatura}</span>
          </span>
        </Link>

        <nav className="topo__nav" aria-label="Navegação principal">
          <a href="#catalogo">Catálogo</a>
          <a href="#contato">Contato</a>
          <Link to="/admin" className="botao botao--fantasma">
            Painel
          </Link>
        </nav>
      </div>
    </header>
  );
}
