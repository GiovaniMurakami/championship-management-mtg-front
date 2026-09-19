import { useEffect, useRef, useState } from "react";
import {
  loginUsuario,
  cadastrarUsuario,
  atualizarUsuario,
  buscarMeuUsuario,
  excluirConta,
  logoutUsuario,
  obterPresignedUrl,
  uploadParaS3,
} from "../services/backendApi";
import { AUTH_STORAGE_KEY } from "../constants/auth";
import {
  ensureFreshToken,
  isAccessTokenExpiredOrExpiring,
} from "../services/httpClient";

import { AuthContext } from "./authContextStore";

export function AuthProvider({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authRefreshing, setAuthRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pendingAuthActionRef = useRef(null);
  const loggingOutRef = useRef(false);

  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registerForm, setRegisterForm] = useState({
    nome: "",
    email: "",
    senha: "",
    aceiteTermos: false,
  });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    nome: "",
    telefone: "",
    nickMTGO: "",
    nickArena: "",
    fotoUrl: "",
    newsletterMetagame: false,
  });
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [showNewsletterOptIn, setShowNewsletterOptIn] = useState(false);
  const [newsletterOptInLoading, setNewsletterOptInLoading] = useState(false);

  const [loginLockout, setLoginLockout] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");

  // Restaurar sessão ao montar — renova access token expirado antes de liberar as rotas
  useEffect(() => {
    let cancelled = false;

    const syncUsuarioDoServidor = async (accessToken, baseUsuario) => {
      if (!accessToken) return baseUsuario;
      try {
        const me = await buscarMeuUsuario(accessToken);
        if (!me?.id) return baseUsuario;
        return {
          ...(baseUsuario || {}),
          ...me,
          newsletterMetagame: me.newsletterMetagame === true
            ? true
            : me.newsletterMetagame === false
              ? false
              : null,
        };
      } catch {
        return baseUsuario;
      }
    };

    const persistSession = (accessToken, nextUsuario, refreshToken = "") => {
      let previous = {};
      try {
        previous = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
      } catch {
        previous = {};
      }
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: accessToken,
        refreshToken: refreshToken || previous.refreshToken || "",
        usuario: nextUsuario,
      }));
      setToken(accessToken);
      setUsuario(nextUsuario);
    };

    const restoreSession = async () => {
      const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!savedAuth) {
        if (!cancelled) setAuthInitialized(true);
        return;
      }

      try {
        const parsed = JSON.parse(savedAuth);
        let accessToken = parsed.token || "";
        let storedUsuario = parsed.usuario || null;

        if (accessToken && parsed.refreshToken && isAccessTokenExpiredOrExpiring(accessToken)) {
          try {
            const freshToken = await ensureFreshToken();
            if (cancelled) return;
            accessToken = freshToken || "";
          } catch {
            if (cancelled) return;
            const latest = window.localStorage.getItem(AUTH_STORAGE_KEY);
            if (latest) {
              try {
                const reparsed = JSON.parse(latest);
                accessToken = reparsed.token || "";
                storedUsuario = reparsed.usuario || null;
              } catch {
                accessToken = "";
                storedUsuario = null;
              }
            } else {
              accessToken = "";
              storedUsuario = null;
            }
          }
        }

        if (cancelled) return;

        if (accessToken) {
          const synced = await syncUsuarioDoServidor(accessToken, storedUsuario);
          if (cancelled) return;
          persistSession(accessToken, synced, parsed.refreshToken || "");
        } else {
          setToken("");
          setUsuario(null);
        }
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        if (!cancelled) setAuthInitialized(true);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!authInitialized || !usuario || showAuthModal || loggingOut) return;
    if (usuario.newsletterMetagame == null) {
      setShowNewsletterOptIn(true);
    }
  }, [authInitialized, usuario, showAuthModal, loggingOut]);

  // Ao voltar para a aba, tenta renovar antes do próximo clique falhar
  useEffect(() => {
    const refreshIfNeeded = () => {
      if (document.visibilityState !== "visible") return;
      const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!savedAuth) return;
      try {
        const parsed = JSON.parse(savedAuth);
        if (!parsed.refreshToken || !parsed.token) return;
        if (!isAccessTokenExpiredOrExpiring(parsed.token)) return;
        ensureFreshToken().catch(() => { /* transitório: mantém sessão */ });
      } catch {
        // ignore
      }
    };

    document.addEventListener("visibilitychange", refreshIfNeeded);
    window.addEventListener("focus", refreshIfNeeded);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfNeeded);
      window.removeEventListener("focus", refreshIfNeeded);
    };
  }, []);

  // Logout forçado pelo interceptor (refresh definitivamente inválido)
  useEffect(() => {
    const handle = () => { setToken(""); setUsuario(null); };
    window.addEventListener("auth:logout", handle);
    return () => window.removeEventListener("auth:logout", handle);
  }, []);

  // Token renovado pelo refresh do interceptor / ensureFreshToken
  useEffect(() => {
    const handle = (e) => setToken(e.detail.token);
    window.addEventListener("auth:tokenRefreshed", handle);
    return () => window.removeEventListener("auth:tokenRefreshed", handle);
  }, []);

  useEffect(() => {
    const onStart = () => setAuthRefreshing(true);
    const onEnd = () => setAuthRefreshing(false);
    window.addEventListener("auth:refreshStart", onStart);
    window.addEventListener("auth:refreshEnd", onEnd);
    return () => {
      window.removeEventListener("auth:refreshStart", onStart);
      window.removeEventListener("auth:refreshEnd", onEnd);
    };
  }, []);

  // Rate-limit global (429)
  useEffect(() => {
    const handle = (e) => {
      setRateLimitMsg(e.detail.message);
      setTimeout(() => setRateLimitMsg(""), 8000);
    };
    window.addEventListener("auth:rateLimited", handle);
    return () => window.removeEventListener("auth:rateLimited", handle);
  }, []);

  const saveAuth = (authData) => {
    let previousAuth = {};
    try {
      previousAuth = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
    } catch {
      previousAuth = {};
    }

    const nextUsuario = {
      ...(previousAuth.usuario || {}),
      ...(authData.usuario || {}),
    };

    const nextAuth = {
      token: authData.token,
      refreshToken: authData.refreshToken ?? previousAuth.refreshToken ?? "",
      usuario: nextUsuario,
    };

    setToken(nextAuth.token);
    setUsuario(nextUsuario);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));

    if (nextUsuario && nextUsuario.newsletterMetagame == null) {
      setShowNewsletterOptIn(true);
    }
  };

  const marcarNewsletterDescadastrada = (usuarioId) => {
    if (!usuarioId) return;
    let previousAuth = {};
    try {
      previousAuth = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
    } catch {
      previousAuth = {};
    }
    const atual = previousAuth.usuario || usuario;
    if (!atual?.id || atual.id !== usuarioId) return;

    saveAuth({
      token: previousAuth.token || token,
      refreshToken: previousAuth.refreshToken,
      usuario: {
        ...atual,
        newsletterMetagame: false,
      },
    });
    setShowNewsletterOptIn(false);
    setEditProfileForm((current) => (
      current ? { ...current, newsletterMetagame: false } : current
    ));
  };

  const responderNewsletterOptIn = async (aceitar) => {
    if (!token || newsletterOptInLoading) return;
    setNewsletterOptInLoading(true);
    try {
      const updated = await atualizarUsuario({ newsletterMetagame: Boolean(aceitar) }, token);
      saveAuth({
        token,
        usuario: {
          ...usuario,
          ...updated,
          newsletterMetagame: Boolean(aceitar),
        },
      });
      setShowNewsletterOptIn(false);
    } catch {
      // mesmo com falha, fecha para não travar o usuário; pode mudar no perfil
      setShowNewsletterOptIn(false);
      if (usuario) {
        saveAuth({
          token,
          usuario: { ...usuario, newsletterMetagame: Boolean(aceitar) },
        });
      }
    } finally {
      setNewsletterOptInLoading(false);
    }
  };

  const clearAuth = async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setLoggingOut(true);
    const startedAt = Date.now();
    try {
      if (token) await logoutUsuario(token);
    } catch {
      /* ignora */
    }
    setToken("");
    setUsuario(null);
    setShowNewsletterOptIn(false);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    const elapsed = Date.now() - startedAt;
    const minVisibleMs = 650;
    if (elapsed < minVisibleMs) {
      await new Promise((resolve) => setTimeout(resolve, minVisibleMs - elapsed));
    }
    loggingOutRef.current = false;
    setLoggingOut(false);
  };

  const openAuth = (tab) => {
    setAuthMessage("");
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const closeAuth = () => {
    pendingAuthActionRef.current = null;
    setShowAuthModal(false);
  };

  /** Se autenticado, executa a ação; senão abre o modal e retoma após login/cadastro. */
  const requireAuth = (action, tab = "login") => {
    if (token && usuario) {
      Promise.resolve(action?.({ token, usuario })).catch(() => {});
      return true;
    }
    pendingAuthActionRef.current = typeof action === "function" ? action : null;
    openAuth(tab);
    return false;
  };

  const runPendingAuthAction = (auth) => {
    const pending = pendingAuthActionRef.current;
    pendingAuthActionRef.current = null;
    if (!pending) return;
    Promise.resolve(pending(auth)).catch(() => {});
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    try {
      const response = await loginUsuario(loginForm);
      saveAuth(response);
      setAuthMessage("Login realizado com sucesso.");
      setShowAuthModal(false);
      setLoginForm({ email: "", senha: "" });
      runPendingAuthAction({ token: response.token, usuario: response.usuario });
    } catch (error) {
      if (error.message?.includes("bloqueada") || error.message?.includes("429") || error.message?.includes("Tente novamente em")) {
        setLoginLockout(true);
        setAuthMessage(error.message);
        setTimeout(() => setLoginLockout(false), 15 * 60 * 1000);
      } else {
        setAuthMessage(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    if (!registerForm.aceiteTermos) {
      setAuthMessage("Você precisa aceitar os Termos de Uso para criar uma conta.");
      setAuthLoading(false);
      return;
    }

    try {
      await cadastrarUsuario({
        nome: registerForm.nome,
        email: registerForm.email,
        senha: registerForm.senha,
        aceiteTermos: true,
      });
      const authData = await loginUsuario({ email: registerForm.email, senha: registerForm.senha });
      saveAuth(authData);
      setAuthMessage("Conta criada com sucesso! Um e-mail de boas-vindas foi enviado para você.");
      setShowAuthModal(false);
      setRegisterForm({ nome: "", email: "", senha: "", aceiteTermos: false });
      runPendingAuthAction({ token: authData.token, usuario: authData.usuario });
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const openEditProfileModal = async () => {
    setAuthMessage("");
    setShowEditProfileModal(true);

    const base = usuario;
    if (!base) return;

    setEditProfileForm({
      nome: base.nome || "",
      telefone: base.telefone || "",
      nickMTGO: base.nickMTGO || "",
      nickArena: base.nickArena || "",
      fotoUrl: base.fotoUrl || "",
      newsletterMetagame: Boolean(base.newsletterMetagame),
    });

    if (!token) return;
    try {
      const me = await buscarMeuUsuario(token);
      if (!me?.id) return;
      const newsletterMetagame = me.newsletterMetagame === true
        ? true
        : me.newsletterMetagame === false
          ? false
          : null;
      const synced = { ...base, ...me, newsletterMetagame };
      saveAuth({ token, usuario: synced });
      setEditProfileForm({
        nome: synced.nome || "",
        telefone: synced.telefone || "",
        nickMTGO: synced.nickMTGO || "",
        nickArena: synced.nickArena || "",
        fotoUrl: synced.fotoUrl || "",
        newsletterMetagame: Boolean(newsletterMetagame),
      });
    } catch {
      // mantém dados da sessão local
    }
  };

  useEffect(() => {
    if (!authInitialized || !usuario) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("newsletter") !== "preferencias") return;
    openEditProfileModal();
    params.delete("newsletter");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, [authInitialized, usuario?.id]);

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
    setEditProfileForm({ nome: "", telefone: "", nickMTGO: "", nickArena: "", fotoUrl: "", newsletterMetagame: false });
    setDeleteAccountError("");
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    try {
      const payload = {
        newsletterMetagame: Boolean(editProfileForm.newsletterMetagame),
      };
      if (editProfileForm.nome) payload.nome = editProfileForm.nome;
      if (editProfileForm.telefone) payload.telefone = editProfileForm.telefone;
      if (editProfileForm.nickMTGO) payload.nickMTGO = editProfileForm.nickMTGO;
      if (editProfileForm.nickArena) payload.nickArena = editProfileForm.nickArena;
      if (editProfileForm.fotoUrl) payload.fotoUrl = editProfileForm.fotoUrl;

      const updatedUsuario = await atualizarUsuario(payload, token);
      saveAuth({
        token,
        usuario: {
          ...usuario,
          ...updatedUsuario,
          newsletterMetagame: Boolean(editProfileForm.newsletterMetagame),
        },
      });
      setShowNewsletterOptIn(false);
      setAuthMessage("Perfil atualizado com sucesso.");
      setShowEditProfileModal(false);
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfilePhoto = async (file) => {
    if (!file) return;
    setAuthLoading(true);
    setAuthMessage("");
    try {
      const { uploadUrl, urlPublica } = await obterPresignedUrl({ contentType: file.type, tamanhoBytes: file.size }, token);
      await uploadParaS3(uploadUrl, file);
      const updatedUsuario = await atualizarUsuario({ fotoUrl: urlPublica }, token);
      saveAuth({ token, usuario: updatedUsuario });
      return updatedUsuario;
    } catch (error) {
      setAuthMessage(error.message || "Não foi possível enviar a foto.");
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteAccount = async (confirmName, onSuccess) => {
    if (!usuario?.nome || confirmName !== usuario.nome) {
      setDeleteAccountError("O nome não corresponde. Digite exatamente como está no perfil.");
      return;
    }

    setDeleteAccountLoading(true);
    setDeleteAccountError("");
    try {
      await excluirConta({ confirmacao: confirmName }, token);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setToken("");
      setUsuario(null);
      setShowEditProfileModal(false);
      onSuccess?.();
    } catch (error) {
      setDeleteAccountError(error.message || "Não foi possível excluir a conta.");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const isAuthenticated = Boolean(token && usuario);
  const isAdmin = (usuario?.role ?? "user") === "admin";
  const isEditor = (usuario?.role ?? "user") === "editor";
  const podeEditarBlog = isAdmin || isEditor;

  const value = {
    authInitialized,
    authRefreshing,
    showAuthModal,
    authTab,
    authLoading,
    authMessage,
    token,
    usuario,
    loginForm,
    registerForm,
    isAuthenticated,
    isAdmin,
    isEditor,
    podeEditarBlog,
    showEditProfileModal,
    editProfileForm,
    loginLockout,
    rateLimitMsg,
    setLoginForm,
    setRegisterForm,
    setEditProfileForm,
    openAuth,
    closeAuth,
    requireAuth,
    handleLogin,
    handleRegister,
    handleProfilePhoto,
    setAuthTab,
    clearAuth,
    loggingOut,
    showNewsletterOptIn,
    newsletterOptInLoading,
    responderNewsletterOptIn,
    marcarNewsletterDescadastrada,
    openEditProfileModal,
    closeEditProfileModal,
    handleUpdateProfile,
    handleDeleteAccount,
    deleteAccountLoading,
    deleteAccountError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
