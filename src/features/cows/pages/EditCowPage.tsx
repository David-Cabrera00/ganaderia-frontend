import CowForm from "../components/CowForm";
import type { CowSchemaValues } from "../schemas/cowSchema";

const EditCowPage = () => {
  const handleSubmit = async (values: CowSchemaValues) => {
    console.log("Editar vaca", values);
  };

  return (
    <div>
      <h1>Editar vaca</h1>
      <CowForm
        onSubmit={handleSubmit}
        submitLabel="Actualizar vaca"
        initialValues={{
          name: "",
          token: "",
          internalCode: "",
          status: "DENTRO",
          collarId: null,
          geofenceId: null,
        }}
      />
    </div>
  );
};

export default EditCowPage;