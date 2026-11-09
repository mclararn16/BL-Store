export type Cor = {
  nome: string;
  hex: string;
};

export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  precoPromocional?: number;
  tamanhos: string[];
  cores: Cor[];
  imagem?: string;
  destaque: boolean;
  ativo: boolean;
};

export type DadosProduto = {
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  precoPromocional?: number;
  tamanhos: string[];
  cores: Cor[];
  destaque: boolean;
  ativo: boolean;
};
