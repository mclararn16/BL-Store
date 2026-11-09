import { site } from "../config";

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/** Remove acentos e caixa para uma busca tolerante. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function linkWhatsApp(mensagem: string, numero: string = site.whatsapp): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}

const ORDEM_TAMANHOS = ["pp", "p", "m", "g", "gg", "xg", "unico", "u"];

/** P · M · G antes de números, e números em ordem crescente. */
export function ordenarTamanhos(tamanhos: string[]): string[] {
  return [...tamanhos].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;

    const ia = ORDEM_TAMANHOS.indexOf(normalizarTexto(a));
    const ib = ORDEM_TAMANHOS.indexOf(normalizarTexto(b));
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "pt-BR");
  });
}

export function ehImagemValida(arquivo: File): string | null {
  if (!arquivo.type.startsWith("image/")) {
    return "Escolha um arquivo de imagem (JPG, PNG ou WEBP).";
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    return "A imagem precisa ter no máximo 5 MB.";
  }
  return null;
}
