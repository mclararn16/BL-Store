import { Link } from "react-router-dom";
import { site } from "../config";
import { linkWhatsApp } from "../lib/formato";

export default function Rodape() {
  const instagram = site.instagram.replace("@", "").trim();

  return (
    <footer className="rodape" id="contato">
      <div className="container">
        <div className="rodape__grade">
          <div>
            <h4>{site.nome}</h4>
            <p>{site.recado}</p>
          </div>

          <div>
            <h4>Atendimento</h4>
            <ul>
              <li>{site.horario}</li>
              {site.endereco && <li>{site.endereco}</li>}
              <li>
                <a href={linkWhatsApp("Olá! Queria saber mais sobre as peças do catálogo.")}>
                  WhatsApp
                </a>
              </li>
              {instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${instagram}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {site.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4>Catálogo</h4>
            <ul>
              <li>
                <a href="#catalogo">Ver todas as peças</a>
              </li>
              <li>
                <Link to="/admin">Painel da loja</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="rodape__base">
          <span>
            © {new Date().getFullYear()} {site.nome}
          </span>
          <span>Peças selecionadas no salão.</span>
        </div>
      </div>

      <div className="faixa" aria-hidden="true">
        <span style={{ background: "#fefac2" }} />
        <span style={{ background: "#febf97" }} />
        <span style={{ background: "#fe6960" }} />
      </div>
    </footer>
  );
}
