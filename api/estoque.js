// GET  /api/estoque -> último estoque salvo
// POST /api/estoque -> salva novo estoque (guarda as 5 versões mais recentes)
// Senha OPCIONAL: se existir a variável UPLOAD_PASSWORD na Vercel, o POST exige o header x-senha.
import { put, list, del } from "@vercel/blob";

const PREFIXO = "estoque-";
const MAX_LINHAS = 20000;
const VERSOES_GUARDADAS = 5;

async function versoes() {
  const { blobs } = await list({ prefix: PREFIXO });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

function limpar(rows) {
  if (!Array.isArray(rows) || rows.length > MAX_LINHAS) return null;
  const out = [];
  for (const r of rows) {
    const qtd = Number(r?.qtd);
    const sku = String(r?.sku ?? "").trim().slice(0, 100);
    if (!sku || !Number.isFinite(qtd)) continue;
    out.push({
      sku,
      prod: String(r.prod ?? "").slice(0, 300),
      nome: String(r.nome ?? "").slice(0, 150),
      qtd,
      perf: !!r.perf,
    });
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const [atual] = await versoes();
      if (!atual) return res.status(200).json({ rows: [], atualizadoEm: null, arquivo: null });
      const r = await fetch(atual.url);
      return res.status(200).json(await r.json());
    }

    if (req.method === "POST") {
      const senha = process.env.UPLOAD_PASSWORD;
      if (senha && req.headers["x-senha"] !== senha)
        return res.status(401).json({ erro: "Senha incorreta." });

      const rows = limpar(req.body?.rows);
      if (!rows?.length) return res.status(400).json({ erro: "Nenhuma linha válida no arquivo." });

      const anteriores = await versoes();
      const payload = {
        arquivo: String(req.body.arquivo ?? "").slice(0, 200),
        atualizadoEm: new Date().toISOString(),
        rows,
      };
      await put(`${PREFIXO}${Date.now()}.json`, JSON.stringify(payload), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      });
      const velhas = anteriores.slice(VERSOES_GUARDADAS - 1);
      if (velhas.length) await del(velhas.map((b) => b.url));
      return res.status(200).json({ ok: true, total: rows.length });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ erro: "Método não permitido." });
  } catch (e) {
    return res.status(500).json({ erro: "Falha no servidor: " + (e.message || e) });
  }
}
