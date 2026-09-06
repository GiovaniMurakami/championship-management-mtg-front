import { DeckNameInput } from "./DeckNameInput";
import { TOURNAMENT_FORMATS } from "../../constants/tournament";
import { FormFeedback } from "./FormFeedback";
import { useEffect, useState } from "react";
import { BaseModal } from "./BaseModal";
import { registrarPartidaExterna, buscarMetagame } from "../../services/backendApi";
import { BTN_GHOST, BTN_PRIMARY, MODAL_INPUT_CLASS } from "../../styles/uiClasses";

export function ExternalMatchModal({ token, onClose, onSaved }) {
  const [formato, setFormato] = useState("pauper");
  const [catalogo, setCatalogo] = useState({ formato: "", decks: [], error: "" });
  useEffect(() => {
    let active = true;
    buscarMetagame({ formato, dias: 30 }).then(response => {
      if (active) setCatalogo({ formato, decks: response?.arquetipos || [], error: "" });
    }).catch(err => {
      if (active) setCatalogo({ formato, decks: [], error: err.message || "Não foi possível carregar os decks do metagame." });
    });
    return () => { active = false; };
  }, [formato]);
  const decks = catalogo.formato === formato ? catalogo.decks : [];
  const loadingDecks = catalogo.formato !== formato;
  const [resultado, setResultado] = useState("vitoria");
  const [data, setData] = useState(new Date().toLocaleDateString("en-CA"));
  const [campeonato, setCampeonato] = useState("");
  const [oponente, setOponente] = useState("");
  const [deckNome, setDeckNome] = useState("");
  const [deckAdversarioNome, setDeckAdversarioNome] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await registrarPartidaExterna({ resultado, data, oponente: oponente.trim(), ...(campeonato.trim() ? { campeonato: campeonato.trim() } : {}), deckNome: deckNome.trim(), deckAdversarioNome: deckAdversarioNome.trim() }, token);
    } catch (err) {
      setError(err.message || "Não foi possível salvar a partida.");
      setSaving(false);
      return;
    }
    onSaved();
  };
  return (
    <BaseModal isOpen onClose={() => !saving && onClose()} ariaLabelledBy="external-match-title" ariaDescribedBy="external-match-description">
      <h2 id="external-match-title" className="text-xl text-white">Adicionar partida externa</h2>
      <p id="external-match-description" className="text-sm text-text-soft">O resultado conta apenas nas estatísticas deste perfil. Não aparece no metagame, nas ligas ou nos torneios.</p>
      <form onSubmit={submit} className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1">
        <label className="grid gap-1 text-text-main">Resultado
          <select value={resultado} onChange={(event) => setResultado(event.target.value)} disabled={saving} className={MODAL_INPUT_CLASS}>
            <option value="vitoria">Vitória</option><option value="derrota">Derrota</option><option value="empate">Empate</option>
          </select>
        </label>
        <label className="grid gap-1 text-text-main">Data da partida
          <input type="date" required max={new Date().toLocaleDateString("en-CA")} value={data} onChange={(event) => setData(event.target.value)} disabled={saving} className={MODAL_INPUT_CLASS} />
        </label>
        <label className="grid gap-1 text-text-main">Campeonato (opcional)
          <input maxLength={150} value={campeonato} onChange={event => setCampeonato(event.target.value)} disabled={saving} className={MODAL_INPUT_CLASS} placeholder="Nome do campeonato" />
        </label>
        <label className="grid gap-1 text-text-main">Oponente (opcional)
          <input maxLength={100} value={oponente} onChange={(event) => setOponente(event.target.value)} disabled={saving} className={MODAL_INPUT_CLASS} />
        </label>
        <label className="grid gap-1 text-text-main">Formato dos decks
          <select value={formato} disabled={saving} onChange={event => { setFormato(event.target.value); setDeckNome(""); setDeckAdversarioNome(""); }} className={MODAL_INPUT_CLASS}>
            {TOURNAMENT_FORMATS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <p className="m-0 text-xs text-text-soft">{loadingDecks ? "Carregando decks do metagame…" : decks.length ? "Sugestões do metagame dos últimos 30 dias. Você também pode digitar outro deck." : "Nenhum deck disponível neste formato. Digite o nome do deck."}</p>
        <FormFeedback message={catalogo.formato === formato ? catalogo.error : ""} variant="error" />
        <DeckNameInput label="Meu deck" value={deckNome} onChange={setDeckNome} options={decks.map(deck => deck.nome).filter(Boolean)} disabled={saving} />
        <DeckNameInput label="Deck adversário" value={deckAdversarioNome} onChange={setDeckAdversarioNome} options={decks.map(deck => deck.nome).filter(Boolean)} disabled={saving} />
        <FormFeedback message={error} variant="error" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className={BTN_GHOST}>Cancelar</button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>{saving ? "Salvando..." : "Salvar resultado"}</button>
        </div>
      </form>
    </BaseModal>
  );
}
