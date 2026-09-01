import { useParams } from "react-router-dom";
import { isValidUuid } from "../../utils/validateUuid";
import { PageShell } from "./PageShell";
import { InlineAlert } from "./InlineAlert";

/**
 * Blocks detail routes when the URL param is not a valid UUID (backend returns 400).
 */
export function UuidParamGuard({ param = "id", allowSlug = false, allowTournamentSlug = false, children }) {
  const params = useParams();
  const value = params[param];

  const isTournamentSlug = (allowSlug || allowTournamentSlug) && /^[a-z0-9]{5}-[a-z0-9-]+$/i.test(value || "");
  if (!isValidUuid(value) && !isTournamentSlug) {
    return (
      <PageShell>
        <InlineAlert type="error">
          Identificador inválido. Verifique o link e tente novamente.
        </InlineAlert>
      </PageShell>
    );
  }

  return children;
}
