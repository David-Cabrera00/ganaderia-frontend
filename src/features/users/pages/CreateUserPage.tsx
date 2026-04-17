import { useState } from "react";
import UserForm from "../components/UserForm";
import { createUser } from "../api/usersApi";
import type { UserSchemaValues } from "../schemas/userSchema";

const CreateUserPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (values: UserSchemaValues) => {
    try {
      setIsSubmitting(true);
      setMessage("");
      await createUser(values);
      setMessage("Usuario creado correctamente.");
    } catch {
      setMessage("No se pudo crear el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Crear usuario</h1>
      {message && <p>{message}</p>}
      <UserForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateUserPage;