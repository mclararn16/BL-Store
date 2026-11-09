import type { Produto } from "./types";

/** Produtos exibidos enquanto o Back4App não está configurado. */
export const PRODUTOS_DEMO: Produto[] = [
  {
    id: "demo-1",
    nome: "Vestido Midi Linho",
    descricao:
      "Vestido midi em linho com alças finas e caimento fluido. Perfeito para o dia a dia e para eventos ao ar livre.",
    categoria: "Vestidos",
    preco: 239.9,
    precoPromocional: 189.9,
    tamanhos: ["P", "M", "G"],
    cores: [
      { nome: "Areia", hex: "#e3cdb4" },
      { nome: "Coral", hex: "#fe6960" },
    ],
    imagem: "/demo/vestido.svg",
    destaque: true,
    ativo: true,
  },
  {
    id: "demo-2",
    nome: "Blusa Cropped Canelada",
    descricao:
      "Malha canelada com toque macio e modelagem justa. Combina com calça de alfaiataria e saia midi.",
    categoria: "Blusas",
    preco: 89.9,
    tamanhos: ["P", "M", "G", "GG"],
    cores: [
      { nome: "Off-white", hex: "#f6f1e3" },
      { nome: "Pêssego", hex: "#febf97" },
      { nome: "Preto", hex: "#2c1b16" },
    ],
    imagem: "/demo/blusa.svg",
    destaque: false,
    ativo: true,
  },
  {
    id: "demo-3",
    nome: "Calça Pantalona Alfaiataria",
    descricao:
      "Cintura alta, pregas frontais e barra ampla. Tecido com leve elastano para conforto o dia inteiro.",
    categoria: "Calças",
    preco: 219.9,
    tamanhos: ["36", "38", "40", "42"],
    cores: [
      { nome: "Creme", hex: "#fefac2" },
      { nome: "Caramelo", hex: "#c98b5e" },
    ],
    imagem: "/demo/calca.svg",
    destaque: true,
    ativo: true,
  },
  {
    id: "demo-4",
    nome: "Saia Plissada Midi",
    descricao:
      "Saia plissada com elástico embutido na cintura. Movimento leve e brilho discreto no tecido.",
    categoria: "Saias",
    preco: 149.9,
    tamanhos: ["P", "M", "G"],
    cores: [
      { nome: "Coral", hex: "#fe6960" },
      { nome: "Areia", hex: "#e3cdb4" },
    ],
    imagem: "/demo/saia.svg",
    destaque: false,
    ativo: true,
  },
  {
    id: "demo-5",
    nome: "Conjunto Tricô Manteiga",
    descricao:
      "Top e saia em tricô leve, na cor manteiga. Peça versátil para usar junto ou separada.",
    categoria: "Conjuntos",
    preco: 259.9,
    tamanhos: ["Único"],
    cores: [{ nome: "Manteiga", hex: "#fdf6b2" }],
    imagem: "/demo/conjunto.svg",
    destaque: true,
    ativo: true,
  },
  {
    id: "demo-6",
    nome: "Bolsa Tote Couro Eco",
    descricao:
      "Bolsa tote espaçosa com alça de ombro e fecho magnético. Cabe notebook de 13 polegadas.",
    categoria: "Acessórios",
    preco: 179.9,
    tamanhos: ["Único"],
    cores: [
      { nome: "Caramelo", hex: "#c98b5e" },
      { nome: "Preto", hex: "#2c1b16" },
    ],
    imagem: "/demo/bolsa.svg",
    destaque: false,
    ativo: true,
  },
  {
    id: "demo-7",
    nome: "Vestido Longo Terracota",
    descricao:
      "Vestido longo com decote transpassado e fenda lateral. Ideal para festas e casamentos.",
    categoria: "Vestidos",
    preco: 329.9,
    tamanhos: ["P", "M"],
    cores: [{ nome: "Terracota", hex: "#d1745c" }],
    imagem: "/demo/vestido.svg",
    destaque: false,
    ativo: true,
  },
  {
    id: "demo-8",
    nome: "Camisa Oversized Off-white",
    descricao:
      "Camisa de botões em algodão com modelagem ampla. Use por cima do biquíni ou com calça pantalona.",
    categoria: "Blusas",
    preco: 139.9,
    tamanhos: ["P", "M", "G"],
    cores: [
      { nome: "Off-white", hex: "#f6f1e3" },
      { nome: "Pêssego", hex: "#febf97" },
    ],
    imagem: "/demo/blusa.svg",
    destaque: false,
    ativo: true,
  },
];
