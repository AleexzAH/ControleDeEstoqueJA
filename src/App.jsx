import { useMemo, useState } from "react";
import { useEstoque } from "./hooks/useEstoque.js";
import { ORDEM } from "./lib/status.js";
import { norm } from "./lib/parse.js";
import Cards from "./components/Cards.jsx";
import Tabela from "./components/Tabela.jsx";
import Upload from "./components/Upload.jsx";

export default function App() {
  const { rows, meta, erro, carregando, enviar } = useEstoque();
  const [busca, setBusca] = useState("");
  const [so100, setSo100] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [ordem, setOrdem] = useState({ k: "qtd", asc: true });

  const base = useMemo(() => {
    const q = norm(busca);
    return rows.filter(
      (r) => (!so100 || r.perf) && (!q || norm(r.nome + " " + r.prod).includes(q) || norm(r.sku).includes(q))
    );
  }, [rows, busca, so100]);

  const contagem = useMemo(() => {
    const c = {};
    base.forEach((r) => (c[r.st] = (c[r.st] ?? 0) + 1));
    return c;
  }, [base]);

  const linhas = useMemo(() => {
    const d = ordem.asc ? 1 : -1;
    return base.filter((r) => !filtro || r.st === filtro).sort((a, b) => {
      if (ordem.k === "qtd") return (a.qtd - b.qtd) * d;
      if (ordem.k === "st") return (ORDEM.indexOf(a.st) - ORDEM.indexOf(b.st)) * d;
      return String(a[ordem.k]).localeCompare(String(b[ordem.k]), "pt-BR", { numeric: true }) * d;
    });
  }, [base, filtro, ordem]);

  const ordenar = (k) => setOrdem((o) => (o.k === k ? { k, asc: !o.asc } : { k, asc: true }));

  const info = erro
    ? `Não foi possível carregar os dados: ${erro}`
    : carregando ? "Carregando…"
    : meta.atualizadoEm
      ? `Atualizado em ${new Date(meta.atualizadoEm).toLocaleString("pt-BR")}${meta.arquivo ? " · " + meta.arquivo : ""}`
      : "Ainda não há dados. Use “Atualizar estoque” para enviar o primeiro relatório.";

  return (
    <main>
      <h1>Status do Estoque</h1>
      <p className="mu">{info}</p>
      <Cards contagem={contagem} ativo={filtro} onSelecionar={setFiltro} />
      <div className="bar">
        <input type="search" placeholder="Buscar por nome ou SKU" aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <label><input type="checkbox" checked={so100} onChange={(e) => setSo100(e.target.checked)} /> Somente perfumes 100ML</label>
      </div>
      <Tabela linhas={linhas} ordem={ordem} onOrdenar={ordenar} />
      <p className="mu" style={{ marginTop: 10 }}>Acima de 60: abastecido · 21 a 60: moderado · 1 a 20: crítico · 0 ou menos: zerado.</p>
      <Upload onEnviar={enviar} />
    </main>
  );
}
