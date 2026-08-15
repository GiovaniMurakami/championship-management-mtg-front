import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, beforeEach } from "vitest";
import { CookieConsentBanner } from "../components/ui/CookieConsentBanner";
import { COOKIE_CONSENT_STORAGE_KEY, openCookiePreferences } from "../utils/cookieConsent";

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exibe o aviso LGPD ate o usuario escolher", () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: /cookies e privacidade/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /aceitar todos/i }));
    expect(screen.queryByRole("dialog", { name: /cookies e privacidade/i })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).marketing).toBe(true);
  });

  it("somente necessarios registra recusa de anuncios personalizados", () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /somente necessários/i }));
    expect(screen.queryByRole("dialog", { name: /cookies e privacidade/i })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).marketing).toBe(false);
  });

  it("reabre preferencias pelo evento do rodape", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 1, marketing: false, decidedAt: "2026-08-15" }),
    );

    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      openCookiePreferences();
    });
    expect(screen.getByRole("dialog", { name: /cookies e privacidade/i })).toBeInTheDocument();
  });
});
