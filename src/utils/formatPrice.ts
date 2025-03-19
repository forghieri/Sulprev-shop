export const formatPrice = (price: string | number): string => {
    let parsedPrice: number;
    if (typeof price === "string") {
      const cleanPrice = price.replace(/R\$|\s/g, "").replace(/\./g, "").replace(",", ".");
      parsedPrice = parseFloat(cleanPrice);
    } else {
      parsedPrice = price;
    }
    if (isNaN(parsedPrice)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parsedPrice);
  };