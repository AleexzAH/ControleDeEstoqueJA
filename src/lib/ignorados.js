import { norm } from "./parse.js";

// Perfumes que NÃO devem aparecer no site (nem nas contagens).
// Para incluir ou tirar um, edite esta lista. Acentos e maiúsculas não importam.
const NOMES = [
  "AMETISTA", "APPLE BLOSSOM", "BAD GIRL", "BUBBLE", "CRUSH", "EFFET PAPILLON",
  "LEONIDAS", "MALE FLOWER", "MYSTÈRE", "BRANDY MAÇÃ", "CARTA DE AMOR", "CERISE SMOKE",
  "COMMANDER", "CONTEMPORARY HERITAGE", "SUN GOLD", "PURP", "SARTORIALE",
  "SEDUCTION AND PROTECTION", "TERRE", "TIMELESS LOVE", "TRAJANO", "VIBRANT SOOTHING",
];

export const IGNORADOS = new Set(NOMES.map(norm));
export const ehIgnorado = (nome) => IGNORADOS.has(norm(nome));
