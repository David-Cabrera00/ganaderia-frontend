import type { CowStatus } from "../types/cow.types";

interface CowStatusBadgeProps {
  status: CowStatus;
}

const statusLabelMap: Record<CowStatus, string> = {
  DENTRO: "Dentro",
  FUERA: "Fuera",
  INACTIVA: "Inactiva",
};

const CowStatusBadge = ({ status }: CowStatusBadgeProps) => {
  return <span>{statusLabelMap[status]}</span>;
};

export default CowStatusBadge;