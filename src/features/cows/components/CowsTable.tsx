import type { Cow } from "../types/cow.types";
import CowStatusBadge from "./CowStatusBadge";

interface CowsTableProps {
  cows: Cow[];
}

const CowsTable = ({ cows }: CowsTableProps) => {
  if (cows.length === 0) {
    return <p>No hay vacas registradas.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Token</th>
          <th>Código interno</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {cows.map((cow) => (
          <tr key={cow.id}>
            <td>{cow.name}</td>
            <td>{cow.token}</td>
            <td>{cow.internalCode}</td>
            <td>
              <CowStatusBadge status={cow.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CowsTable;