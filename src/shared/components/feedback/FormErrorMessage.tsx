interface FormErrorMessageProps {
  message?: string;
}

const FormErrorMessage = ({ message }: FormErrorMessageProps) => {
  if (!message) {
    return null;
  }

  return (
    <p
      style={{
        color: "#dc2626",
        fontSize: "14px",
        marginTop: "4px",
      }}
    >
      {message}
    </p>
  );
};

export default FormErrorMessage;