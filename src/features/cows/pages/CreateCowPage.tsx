import { useState } from "react";
import CowForm from "../components/CowForm";
import { createCow } from "../api/cowsApi";
import type { CowSchemaValues } from "../schemas/cowSchema";

const CreateCowPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (values: CowSchemaValues) => {
    try {
      setIsSubmitting(true);
      setMessage("");
      await createCow(values);
      setMessage("Vaca creada correctamente.");
    } catch {
      setMessage("No se pudo crear la vaca.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Crear vaca</h1>
      {message && <p>{message}</p>}
      <CowForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Crear vaca" />
    </div>
  );
};

export default CreateCowPage;