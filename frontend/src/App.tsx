import { AuthContext, useAuthState } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { Search } from "./pages/Search";

export default function App() {
  const auth = useAuthState();
  return (
    <AuthContext.Provider value={auth}>
      {auth.isAuthenticated ? <Search /> : <Login />}
    </AuthContext.Provider>
  );
}
