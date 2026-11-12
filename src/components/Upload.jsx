import { useState } from "react";
import { lerExportOlist } from "../lib/parse.js";

export default function Upload({ onEnviar }) {
  const [arquivo, setArquivo] = useState(null);
  const [msg, setMsg] = useState({ t: "", erro: false });
  const [ocupado, setOcupado] = useState(false);

  async function enviar() {
    if (!arquivo) return setMsg({ t: "Escolha o arquivo do relatório.", erro: true });
    setOcupado(true);
    setMsg({ t: "Lendo e enviando…", erro: false });
    try {
      const linhas = await lerExportOlist(arquivo);
      if (!linhas.length) throw new Error("Nenhuma linha com SKU e saldo válidos no arquivo.");
      if (!window.confirm(`Substituir o estoque atual por “${arquivo.name}” (${linhas.length} produtos)? Isso muda o site para todos.`)) {
        setMsg({ t: "Envio cancelado.", erro: false });
      } else {
        const total = await onEnviar(arquivo.name, linhas);
        setMsg({ t: `Estoque atualizado: ${total} produtos.`, erro: false });
      }
    } catch (e) {
      setMsg({ t: e.message, erro: true });
    }
    setOcupado(false);
  }

  return (
    <details>
      <summary>Atualizar estoque</summary>
      <p className="mu">Envie o relatório “Saldos em Estoque” da Olist (.xlsx ou .csv). Ele substitui os dados atuais para todos que acessarem o site.</p>
      <div className="adm">
        <input type="file" accept=".xlsx,.xlsm,.csv" aria-label="Arquivo" onChange={(e) => setArquivo(e.target.files[0] ?? null)} />
        <button className="go" disabled={ocupado} onClick={enviar}>Enviar e atualizar</button>
      </div>
      <div role="status" className={msg.erro ? "err" : "okm"}>{msg.t}</div>
    </details>
  );
}
