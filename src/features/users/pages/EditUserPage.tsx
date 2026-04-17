import UserForm from "../components/UserForm";
import type { UserSchemaValues } from "../schemas/userSchema";

const EditUserPage = () => {
  const handleSubmit = async (values: UserSchemaValues) => {
    console.log("Editar usuario", values);
  };

  return (
    <div>
      <h1>Editar usuario</h1>
      <UserForm
        onSubmit={handleSubmit}
        submitLabel="Actualizar usuario"
        initialValues={{
          name: "",
          email: "",
          password: "",
          role: "OPERADOR",
        }}
      />
    </div>
  );
};

export default EditUserPage;