export function formatCareTaskType(type: string) {
  const labels: Record<string, string> = {
    vet_appointment: "Cita veterinaria",
    walk: "Paseo",
    training: "Entrenamiento",
    eye_cleaning: "Limpieza de ojos",
    ear_cleaning: "Limpieza de orejas",
    brushing: "Cepillado",
    bath: "Baño",
    grooming: "Corte de pelo",
    other: "Otro"
  };

  return labels[type] ?? type.replaceAll("_", " ");
}
