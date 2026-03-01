import { useAuth } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { Search } from "./pages/Search";

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Search /> : <Login />;
}
