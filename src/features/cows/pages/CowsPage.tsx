import { useEffect, useState } from "react";
import { getCows } from "../api/cowsApi";
import type { Cow } from "../types/cow.types";
import CowsTable from "../components/CowsTable";

const CowsPage = () => {
  const [cows, setCows] = useState<Cow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCows = async () => {
      try {
        const data = await getCows();
        setCows(data);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCows();
  }, []);

  if (isLoading) {
    return <p>Cargando vacas...</p>;
  }

  return (
    <div>
      <h1>Vacas</h1>
      <CowsTable cows={cows} />
    </div>
  );
};

export default CowsPage;