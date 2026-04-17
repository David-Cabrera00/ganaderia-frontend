import type { User } from "../types/user.types";
import UserStatusBadge from "./UserStatusBadge";

interface UsersTableProps {
  users: User[];
}

const UsersTable = ({ users }: UsersTableProps) => {
  if (users.length === 0) {
    return <p>No hay usuarios registrados.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <UserStatusBadge active={user.active} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;