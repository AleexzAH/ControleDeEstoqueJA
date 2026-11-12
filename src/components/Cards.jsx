import { ORDEM } from "../lib/status.js";

export default function Cards({ contagem, ativo, onSelecionar }) {
  return (
    <div className="cards">
      {ORDEM.map((s) => (
        <button key={s} aria-pressed={ativo === s} onClick={() => onSelecionar(ativo === s ? "" : s)}>
          <span className="n">{contagem[s] ?? 0}</span>
          <span className="l">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
        </button>
      ))}
    </div>
  );
}
