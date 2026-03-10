import { useEffect, useState } from "react";
import { loginUsuario, cadastrarUsuario } from "../services/backendApi";
import { AUTH_STORAGE_KEY } from "../constants/auth";

export function useAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registerForm, setRegisterForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  // Restaurar sessão ao montar
  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) return;

    try {
      const parsed = JSON.parse(savedAuth);
      setToken(parsed.token || "");
      setUsuario(parsed.usuario || null);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
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

  const isAuthenticated = Boolean(token && usuario);

  return {
    // State
    showAuthModal,
    authTab,
    authLoading,
    authMessage,
    token,
    usuario,
    loginForm,
    registerForm,
    isAuthenticated,
    // Setters
    setLoginForm,
    setRegisterForm,
    // Handlers
    openAuth,
    closeAuth,
    handleLogin,
    handleRegister,
    setAuthTab,
    clearAuth,
  };
}
