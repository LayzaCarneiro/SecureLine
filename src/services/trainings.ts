/**
 * Serviço de treinamentos — agora busca da API real em vez de dados mock.
 */
import { fetchTrainingsFromAPI, getTrainingByIdFromAPI } from "@/services/tiposGolpe";
import type { Training } from "@/types/training";

export async function fetchTrainings(): Promise<Training[]> {
  const apiTrainings = await fetchTrainingsFromAPI();
  return apiTrainings as Training[];
}

export async function getTrainingById(id: string): Promise<Training | null> {
  const training = await getTrainingByIdFromAPI(id);
  return training as Training | null;
}
