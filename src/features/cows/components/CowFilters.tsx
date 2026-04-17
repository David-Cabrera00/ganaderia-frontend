import type { CowStatus } from "../types/cow.types";

interface CowFiltersProps {
  value: "ALL" | CowStatus;
  onChange: (value: "ALL" | CowStatus) => void;
}

const CowFilters = ({ value, onChange }: CowFiltersProps) => {
  return (
    <div>
      <label htmlFor="cow-filter">Filtrar por estado</label>
      <select
        id="cow-filter"
        value={value}
        onChange={(event) => onChange(event.target.value as "ALL" | CowStatus)}
      >
        <option value="ALL">Todas</option>
        <option value="DENTRO">Dentro</option>
        <option value="FUERA">Fuera</option>
        <option value="INACTIVA">Inactivas</option>
      </select>
    </div>
  );
};

export default CowFilters;