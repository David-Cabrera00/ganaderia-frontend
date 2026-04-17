import { useEffect } from "react";
import AppRouter from "./app/router/AppRouter";
import { useAuthStore } from "./app/store/authStore";

const App = () => {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return <AppRouter />;
};

export default App;