import * as XLSX from "xlsx";

const EXCLUIR = new Set(["TESTE","CAIXA","FRASCO","SOBRETAMPA","VALV","ADESIVO","BODY","SPLASH","HIDRATANTE","ODORIZANTE","DECANT"]);

export const norm = (t) =>
  String(t ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, " ").toUpperCase().trim();

function numero(v) {
  if (typeof v === "number") return v;
  let s = String(v ?? "").replace(/\u00a0/g, "").trim();
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return Number.isNaN(n) || !/^-?[\d.]+$/.test(s) ? null : n;
}

function ehPerfume100(p) {
  const n = norm(p);
  if (!/\b100 ?ML\b/.test(n)) return false;
  if (!n.includes("PERFUME") && !n.includes("INSPIRAD")) return false;
  return !n.split(" ").some((w) => EXCLUIR.has(w));
}

function nomePerfume(p) {
  let e = String(p).replace(/\s+/g, " ").trim().split(/\s*-\s*/)[0];
  e = e.split(/\s+Perfume\s+inspirado/i)[0].replace(/^PERFUME\s+/i, "");
  return e.trim().toUpperCase();
}

async function lerPlanilha(file) {
  const buf = await file.arrayBuffer();
  if (!/\.csv$/i.test(file.name)) return XLSX.read(buf, { type: "array" });
  let txt;
  try { txt = new TextDecoder("utf-8", { fatal: true }).decode(buf); }
  catch { txt = new TextDecoder("windows-1252").decode(buf); }
  txt = txt.replace(/^\uFEFF/, "");
  const l1 = txt.split(/\r?\n/)[0] ?? "";
  const fs = [";", ",", "\t", "|"].reduce((a, b) => (l1.split(b).length > l1.split(a).length ? b : a));
  return XLSX.read(txt, { type: "string", FS: fs });
}

/** Lê o relatório "Saldos em Estoque" da Olist e devolve [{sku, prod, nome, qtd, perf}] */
export async function lerExportOlist(file) {
  const wb = await lerPlanilha(file);
  const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: "" });
  const hdr = aoa[0].map((c) => String(c).trim());
  const achar = (lista) => {
    for (const c of lista) {
      const i = hdr.findIndex((h) => norm(h) === norm(c));
      if (i >= 0) return i;
    }
    return -1;
  };
  const iSku = achar(["codigo sku", "codigo", "sku"]);
  const iProd = achar(["produto", "descricao", "nome"]);
  const iQtd = achar(["Estoque disponível", "Estoque físico"]);
  if (iSku < 0 || iProd < 0 || iQtd < 0)
    throw new Error("Não encontrei as colunas de SKU, produto e saldo. Colunas do arquivo: " + hdr.join(", "));

  const vistos = new Set();
  const rows = [];
  for (const r of aoa.slice(1)) {
    const sku = String(r[iSku] ?? "").trim();
    if (!sku || vistos.has(sku.toLowerCase())) continue;
    vistos.add(sku.toLowerCase());
    const qtd = numero(r[iQtd]);
    if (qtd === null) continue;
    rows.push({ sku, prod: String(r[iProd]), nome: nomePerfume(r[iProd]), qtd, perf: ehPerfume100(r[iProd]) });
  }
  return rows;
}
