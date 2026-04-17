import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cowSchema, type CowSchemaValues } from "../schemas/cowSchema";
import type { CowStatus } from "../types/cow.types";

interface CowFormProps {
  onSubmit: (values: CowSchemaValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  initialValues?: Partial<CowSchemaValues>;
}

const statusOptions: CowStatus[] = ["DENTRO", "FUERA", "INACTIVA"];

const CowForm = ({
  onSubmit,
  isSubmitting = false,
  submitLabel = "Guardar",
  initialValues,
}: CowFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CowSchemaValues>({
    resolver: zodResolver(cowSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      token: initialValues?.token ?? "",
      internalCode: initialValues?.internalCode ?? "",
      latitude: initialValues?.latitude,
      longitude: initialValues?.longitude,
      status: initialValues?.status ?? "DENTRO",
      collarId: initialValues?.collarId ?? null,
      geofenceId: initialValues?.geofenceId ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Nombre</label>
        <input id="name" type="text" {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="token">Token</label>
        <input id="token" type="text" {...register("token")} />
        {errors.token && <p>{errors.token.message}</p>}
      </div>

      <div>
        <label htmlFor="internalCode">Código interno</label>
        <input id="internalCode" type="text" {...register("internalCode")} />
        {errors.internalCode && <p>{errors.internalCode.message}</p>}
      </div>

      <div>
        <label htmlFor="latitude">Latitud</label>
        <input
          id="latitude"
          type="number"
          step="any"
          {...register("latitude", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
        {errors.latitude && <p>{errors.latitude.message}</p>}
      </div>

      <div>
        <label htmlFor="longitude">Longitud</label>
        <input
          id="longitude"
          type="number"
          step="any"
          {...register("longitude", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
        {errors.longitude && <p>{errors.longitude.message}</p>}
      </div>

      <div>
        <label htmlFor="status">Estado</label>
        <select id="status" {...register("status")}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {errors.status && <p>{errors.status.message}</p>}
      </div>

      <div>
        <label htmlFor="collarId">ID collar</label>
        <input
          id="collarId"
          type="number"
          {...register("collarId", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
        />
        {errors.collarId && <p>{errors.collarId.message}</p>}
      </div>

      <div>
        <label htmlFor="geofenceId">ID geocerca</label>
        <input
          id="geofenceId"
          type="number"
          {...register("geofenceId", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
        />
        {errors.geofenceId && <p>{errors.geofenceId.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
};

export default CowForm;