import type { GeofenceStatus } from "../types/geofence.types";

interface GeofenceStatusBadgeProps {
  status: GeofenceStatus;
}

const labelMap: Record<GeofenceStatus, string> = {
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
};

const GeofenceStatusBadge = ({ status }: GeofenceStatusBadgeProps) => {
  return <span>{labelMap[status]}</span>;
};

export default GeofenceStatusBadge;