// Faixas de status por quantidade. Para mudar as regras, edite só este arquivo.
export const ORDEM = ["ZERADO", "CRÍTICO", "MODERADO", "ABASTECIDO"];

export function calcularStatus(qtd) {
  if (qtd > 60) return "ABASTECIDO";
  if (qtd >= 21) return "MODERADO";
  if (qtd >= 1) return "CRÍTICO";
  return "ZERADO";
}

export const classeStatus = (s) => s.replace("Í", "I");
