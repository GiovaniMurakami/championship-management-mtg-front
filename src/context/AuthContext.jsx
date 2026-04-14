/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUsuario,
  cadastrarUsuario,
  atualizarUsuario,
  logoutUsuario,
} from "../services/backendApi";
import { AUTH_STORAGE_KEY } from "../constants/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registerForm, setRegisterForm] = useState({ nome: "", email: "", senha: "" });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    nome: "",
    telefone: "",
    nickMTGO: "",
    nickArena: "",
  });

  const [loginLockout, setLoginLockout] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");

  // Restaurar sessão ao montar
  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) { setAuthInitialized(true); return; }
    try {
      const parsed = JSON.parse(savedAuth);
      setToken(parsed.token || "");
      setUsuario(parsed.usuario || null);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setAuthInitialized(true);
    }
  }, []);

  // Logout forçado pelo interceptor (token expirado)
  useEffect(() => {
    const handle = () => { setToken(""); setUsuario(null); };
    window.addEventListener("auth:logout", handle);
    return () => window.removeEventListener("auth:logout", handle);
  }, []);

  // Token renovado pelo refresh preventivo do interceptor
  useEffect(() => {
    const handle = (e) => setToken(e.detail.token);
    window.addEventListener("auth:tokenRefreshed", handle);
    return () => window.removeEventListener("auth:tokenRefreshed", handle);
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
    setToken(authData.token);
    setUsuario(authData.usuario);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: authData.token,
      refreshToken: authData.refreshToken,
      usuario: authData.usuario,
    }));
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
    try {
      await cadastrarUsuario(registerForm);
      const authData = await loginUsuario({ email: registerForm.email, senha: registerForm.senha });
      saveAuth(authData);
      setAuthMessage("Conta criada com sucesso! Um e-mail de boas-vindas foi enviado para você.");
      setShowAuthModal(false);
      setRegisterForm({ nome: "", email: "", senha: "" });
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

  const isAuthenticated = Boolean(token && usuario);
  const isAdmin = (usuario?.role ?? "user") === "admin";

  const value = {
    authInitialized,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

