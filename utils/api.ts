import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { STORAGE_TOKEN } from "../constants/storage";

export async function apiGet<T>(url: string): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.get<T>(`http://192.168.0.103:5000${url}`, {
    headers: { Authorization: token },
  });
}

export async function apiPost<T>(
  url: string,
  data?: any
): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.post<T>(`http://192.168.0.103:5000${url}`, data, {
    headers: { Authorization: token },
  });
}

export async function apiDelete<T>(url: string): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.delete<T>(`http://192.168.0.103:5000${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
