interface UserStatusBadgeProps {
  active: boolean;
}

const UserStatusBadge = ({ active }: UserStatusBadgeProps) => {
  return <span>{active ? "Activo" : "Inactivo"}</span>;
};

export default UserStatusBadge;