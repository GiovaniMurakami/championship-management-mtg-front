import { useEffect, useState } from "react";
import {
  loginUsuario,
  cadastrarUsuario,
  atualizarUsuario,
} from "../services/backendApi";
import { AUTH_STORAGE_KEY } from "../constants/auth";

export function useAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registerForm, setRegisterForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    nome: "",
    telefone: "",
    nickMTGO: "",
    nickArena: "",
  });

  // Restaurar sessão ao montar
  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) {
      setAuthInitialized(true);
      return;
    }

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

  // Ouvir evento de logout forçado pelo interceptor (token expirado)
  useEffect(() => {
    const handleForceLogout = () => {
      setToken("");
      setUsuario(null);
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  // Sincronizar token renovado pelo refresh preventivo do interceptor
  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      setToken(event.detail.token);
    };
    window.addEventListener("auth:tokenRefreshed", handleTokenRefreshed);
    return () => window.removeEventListener("auth:tokenRefreshed", handleTokenRefreshed);
  }, []);

  const saveAuth = (authData) => {
    setToken(authData.token);
    setUsuario(authData.usuario);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  };

  const clearAuth = () => {
    setToken("");
    setUsuario(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const openAuth = (tab) => {
    setAuthMessage("");
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const closeAuth = () => {
    setShowAuthModal(false);
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
    } catch (error) {
      setAuthMessage(error.message);
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
      const authData = await loginUsuario({
        email: registerForm.email,
        senha: registerForm.senha,
      });
      saveAuth(authData);
      setAuthMessage("Conta criada com sucesso.");
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
    setEditProfileForm({
      nome: "",
      telefone: "",
      nickMTGO: "",
      nickArena: "",
    });
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
      if (editProfileForm.nickArena)
        payload.nickArena = editProfileForm.nickArena;

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

  return {
    // State
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
    // Setters
    setLoginForm,
    setRegisterForm,
    setEditProfileForm,
    // Handlers
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
}
