import type { AlertStatus } from "../types/alert.types";

interface AlertStatusBadgeProps {
  status: AlertStatus;
}

const labelMap: Record<AlertStatus, string> = {
  PENDIENTE: "Pendiente",
  RESUELTA: "Resuelta",
  CANCELADA: "Cancelada",
};

const AlertStatusBadge = ({ status }: AlertStatusBadgeProps) => {
  return <span>{labelMap[status]}</span>;
};

export default AlertStatusBadge;