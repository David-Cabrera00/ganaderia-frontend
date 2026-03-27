export const vacasMock = [
  { id: 1, codigo: "V001", nombre: "Luna", raza: "Holstein", edad: 3, estado: "Activa" },
  { id: 2, codigo: "V002", nombre: "Canela", raza: "Jersey", edad: 4, estado: "Monitoreo" }
];

export const alertasMock = [
  {
    id: 1,
    vaca: "Luna",
    tipo: "Salida de perímetro",
    mensaje: "La vaca Luna salió del perímetro permitido.",
    severidad: "Alta",
    fecha: "2026-03-15 10:30",
    atendida: false
  },
  {
    id: 2,
    vaca: "Canela",
    tipo: "Sin reporte",
    mensaje: "La vaca Canela no reporta ubicación hace 10 minutos.",
    severidad: "Media",
    fecha: "2026-03-15 11:00",
    atendida: true
  },
  {
    id: 3,
    vaca: "Estrella",
    tipo: "Salida de perímetro",
    mensaje: "La vaca Estrella salió del área segura.",
    severidad: "Alta",
    fecha: "2026-03-15 12:15",
    atendida: false
  }
];

export const ubicacionesMock = [
  {
    id: 1,
    vaca: "Luna",
    latitud: "1.105638",
    longitud: "-77.39517",
    fecha: "2026-03-15 09:30",
    dentroPerimetro: true

  },
  {
    id: 2,
    vaca: "Canela",
    latitud: "1.10494",
    longitud: "-77.396698",
    fecha: "2026-03-15 10:10",
    dentroPerimetro: false
  }
];

export const perimetrosMock = [
  {
    id: 1,
    nombre: "Potrero Norte",
    latMin: "1.2100",
    latMax: "1.2200",
    lonMin: "-77.2900",
    lonMax: "-77.2800"
  },
  {
    id: 2,
    nombre: "Potrero Sur",
    latMin: "1.2000",
    latMax: "1.2090",
    lonMin: "-77.3000",
    lonMax: "-77.2910"
  }
];

export const collaresMock = [
  {
    id: 1,
    codigo: "COL-001",
    bateria: "85%",
    estado: "Activo",
    vaca: "Luna"
  },
  {
    id: 2,
    codigo: "COL-002",
    bateria: "62%",
    estado: "Monitoreo",
    vaca: "Canela"
  }
];

export const resumenIAMock = {
  vacaMasAlertas: "Luna",
  cantidadAlertas: 5,
  vacaMasSalidas: "Canela",
  cantidadSalidas: 3,
  totalAlertasAnalizadas: 12,
  recomendacion:
    "Se recomienda revisar el comportamiento de la vaca Luna, ya que presenta mayor frecuencia de alertas. También se sugiere verificar la zona donde Canela sale del perímetro con más frecuencia."
};

export const dashboardMock = {
  vacasMonitoreadas: 12,
  dentroPerimetro: 9,
  fueraPerimetro: 3,
  alertasActivas: 4
};