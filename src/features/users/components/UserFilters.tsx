interface UserFiltersProps {
  value: "ALL" | "ACTIVE" | "INACTIVE";
  onChange: (value: "ALL" | "ACTIVE" | "INACTIVE") => void;
}

const UserFilters = ({ value, onChange }: UserFiltersProps) => {
  return (
    <div>
      <label htmlFor="user-filter">Filtrar por estado</label>
      <select
        id="user-filter"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")
        }
      >
        <option value="ALL">Todos</option>
        <option value="ACTIVE">Activos</option>
        <option value="INACTIVE">Inactivos</option>
      </select>
    </div>
  );
};

export default UserFilters;