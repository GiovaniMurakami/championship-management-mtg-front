import { describe, expect, it } from "vitest";
import { parseArquivoArtigo } from "../utils/artigoArquivo";

describe("parseArquivoArtigo", () => {
  it("extrai metadados e corpo no formato do modelo", () => {
    const texto = `Título: Tolarian Terror, qual a melhor versão?
Chamada: Em qual deck usar Tolarian Terror?

Tags: Tolarian; Terror;Pauper;tiagofuguete

Descrição: Tolarian Terror e as três opções de decks para jogar!

ARTIGO:
Salva galera, tudo beleza?
[[Tolarian Terror]]
`;
    const parsed = parseArquivoArtigo(texto);
    expect(parsed.titulo).toBe("Tolarian Terror, qual a melhor versão?");
    expect(parsed.chamada).toBe("Em qual deck usar Tolarian Terror?");
    expect(parsed.tags).toBe("Tolarian; Terror;Pauper;tiagofuguete");
    expect(parsed.descricao).toContain("Tolarian Terror");
    expect(parsed.conteudo).toContain("Salva galera");
    expect(parsed.conteudo).toContain("[[Tolarian Terror]]");
  });

  it("usa o arquivo inteiro como corpo quando não há ARTIGO:", () => {
    const parsed = parseArquivoArtigo("Só o corpo\ncom [[Lightning Bolt]]");
    expect(parsed.titulo).toBe("");
    expect(parsed.conteudo).toContain("Lightning Bolt");
  });
});
