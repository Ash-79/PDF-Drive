import axios from "axios";
import { createContext, useState, useEffect } from "react";

// Create a new context for the user
export const UserContext = createContext({});

// Provider component for the User context
export function UserContextProvider({ children }) {
  const [user, setuser] = useState(null);
  const [ready, setready] = useState(false);
  useEffect(() => {
    if (!user) {
      axios.get("/profile").then(({ data }) => {
        setuser(data);
        setready(true);
      });
    }
  }, []);

  // Render the provider with the user state, updater function, and readiness status as its value
  return (
    <UserContext.Provider value={{ user, setuser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
