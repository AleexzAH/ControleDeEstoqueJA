import { classeStatus } from "../lib/status.js";

const COLUNAS = [
  { k: "nome", rotulo: "Perfume" },
  { k: "sku", rotulo: "SKU" },
  { k: "qtd", rotulo: "Quantidade", num: true },
  { k: "st", rotulo: "Status" },
];

export default function Tabela({ linhas, ordem, onOrdenar }) {
  return (
    <div className="wrap">
      <table>
        <thead>
          <tr>
            {COLUNAS.map((c) => (
              <th key={c.k} className={c.num ? "q" : ""} onClick={() => onOrdenar(c.k)}>
                {c.rotulo}{ordem.k === c.k ? (ordem.asc ? " ↑" : " ↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 && (
            <tr><td colSpan={4} className="mu">Nenhum item encontrado.</td></tr>
          )}
          {linhas.map((r) => (
            <tr key={r.sku}>
              <td title={r.prod}>{r.nome}</td>
              <td>{r.sku}</td>
              <td className="q">{r.qtd}</td>
              <td><span className={`b ${classeStatus(r.st)}`}>{r.st}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
