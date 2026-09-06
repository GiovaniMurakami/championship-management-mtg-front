import { useContext } from "react";
import { AuthContext } from "../context/authContextStore";

export function useAuth() {
  return useContext(AuthContext);
}
