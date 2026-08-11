/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUsuario,
  cadastrarUsuario,
  atualizarUsuario,
  excluirConta,
  logoutUsuario,
} from "../services/backendApi";
import { AUTH_STORAGE_KEY } from "../constants/auth";
import {
  ensureFreshToken,
  isAccessTokenExpiredOrExpiring,
} from "../services/httpClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authRefreshing, setAuthRefreshing] = useState(false);

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
  });
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const [loginLockout, setLoginLockout] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");

  // Restaurar sessão ao montar — renova access token expirado antes de liberar as rotas
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!savedAuth) {
        if (!cancelled) setAuthInitialized(true);
        return;
      }

      try {
        const parsed = JSON.parse(savedAuth);
        const storedToken = parsed.token || "";
        const storedUsuario = parsed.usuario || null;

        if (storedToken && parsed.refreshToken && isAccessTokenExpiredOrExpiring(storedToken)) {
          try {
            const freshToken = await ensureFreshToken();
            if (cancelled) return;
            setToken(freshToken || "");
            setUsuario(storedUsuario);
          } catch {
            if (cancelled) return;
            // Falha definitiva já dispara auth:logout; transitória mantém o que há no storage
            const latest = window.localStorage.getItem(AUTH_STORAGE_KEY);
            if (latest) {
              try {
                const reparsed = JSON.parse(latest);
                setToken(reparsed.token || "");
                setUsuario(reparsed.usuario || null);
              } catch {
                setToken("");
                setUsuario(null);
              }
            } else {
              setToken("");
              setUsuario(null);
            }
          }
        } else {
          if (!cancelled) {
            setToken(storedToken);
            setUsuario(storedUsuario);
          }
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

    const nextAuth = {
      token: authData.token,
      refreshToken: authData.refreshToken ?? previousAuth.refreshToken ?? "",
      usuario: authData.usuario,
    };

    setToken(nextAuth.token);
    setUsuario(nextAuth.usuario);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
  };

  const clearAuth = async () => {
    try { if (token) await logoutUsuario(token); } catch { /* ignora */ }
    setToken("");
    setUsuario(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const openAuth = (tab) => {
    setAuthMessage("");
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const closeAuth = () => setShowAuthModal(false);

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
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const openEditProfileModal = () => {
    if (usuario) {
      setEditProfileForm({
        nome: usuario.nome || "",
        telefone: usuario.telefone || "",
        nickMTGO: usuario.nickMTGO || "",
        nickArena: usuario.nickArena || "",
      });
    }
    setAuthMessage("");
    setShowEditProfileModal(true);
  };

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
    setEditProfileForm({ nome: "", telefone: "", nickMTGO: "", nickArena: "" });
    setDeleteAccountError("");
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    try {
      const payload = {};
      if (editProfileForm.nome) payload.nome = editProfileForm.nome;
      if (editProfileForm.telefone) payload.telefone = editProfileForm.telefone;
      if (editProfileForm.nickMTGO) payload.nickMTGO = editProfileForm.nickMTGO;
      if (editProfileForm.nickArena) payload.nickArena = editProfileForm.nickArena;

      const updatedUsuario = await atualizarUsuario(payload, token);
      saveAuth({ token, usuario: updatedUsuario });
      setAuthMessage("Perfil atualizado com sucesso.");
      setShowEditProfileModal(false);
    } catch (error) {
      setAuthMessage(error.message);
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
    showEditProfileModal,
    editProfileForm,
    loginLockout,
    rateLimitMsg,
    setLoginForm,
    setRegisterForm,
    setEditProfileForm,
    openAuth,
    closeAuth,
    handleLogin,
    handleRegister,
    setAuthTab,
    clearAuth,
    openEditProfileModal,
    closeEditProfileModal,
    handleUpdateProfile,
    handleDeleteAccount,
    deleteAccountLoading,
    deleteAccountError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

