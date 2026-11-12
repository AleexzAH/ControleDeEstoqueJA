import { useCallback, useEffect, useState } from "react";
import { calcularStatus } from "../lib/status.js";

export function useEstoque(intervaloMs = 120000) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ atualizadoEm: null, arquivo: null });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch("/api/estoque", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || "Erro ao carregar");
      setRows((d.rows ?? []).map((x) => ({ ...x, st: calcularStatus(x.qtd) })));
      setMeta({ atualizadoEm: d.atualizadoEm, arquivo: d.arquivo });
      setErro("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(() => !document.hidden && carregar(), intervaloMs);
    return () => clearInterval(id);
  }, [carregar, intervaloMs]);

  const enviar = useCallback(async (arquivo, linhas) => {
    const r = await fetch("/api/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arquivo, rows: linhas }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.erro || "Falha ao enviar");
    await carregar();
    return d.total;
  }, [carregar]);

  return { rows, meta, erro, carregando, enviar };
}
