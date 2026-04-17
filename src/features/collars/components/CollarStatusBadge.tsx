interface CollarStatusBadgeProps {
  status: string;
}

const CollarStatusBadge = ({ status }: CollarStatusBadgeProps) => {
  const normalizedStatus = status.trim().toUpperCase();

  const labelMap: Record<string, string> = {
    ACTIVO: "Activo",
    INACTIVO: "Inactivo",
    ASIGNADO: "Asignado",
    DISPONIBLE: "Disponible",
  };

  return <span>{labelMap[normalizedStatus] ?? status}</span>;
};

export default CollarStatusBadge;