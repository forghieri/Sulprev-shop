// src/utils/formatPrice.ts
export const formatPrice = (price: string | number): string => {
    let parsedPrice: number;
  
    if (typeof price === "string") {
      // Remove "R$", espaços, pontos de milhar e substitui vírgula por ponto decimal
      const cleanPrice = price.replace(/R\$|\s/g, "").replace(/\./g, "").replace(",", ".");
      parsedPrice = parseFloat(cleanPrice);
    } else {
      parsedPrice = price;
    }
  
    if (isNaN(parsedPrice)) {
      console.error("Erro ao formatar preço: valor inválido", price);
      return "R$ 0,00"; // Retorno seguro
    }
  
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parsedPrice);
  };