import { useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";
import type { User } from "../types/user.types";
import UsersTable from "../components/UsersTable";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, []);

  if (isLoading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div>
      <h1>Usuarios</h1>
      <UsersTable users={users} />
    </div>
  );
};

export default UsersPage;