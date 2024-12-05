import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { STORAGE_TOKEN } from "../constants/storage";

//const BASE_URL = "http://192.168.0.103:5000";
const BASE_URL = "https://Saude-sem-Fronteiras-3.onrender.com"; //dev...

export async function apiGet<T>(url: string): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.get<T>(`${BASE_URL}${url}`, {
    headers: { Authorization: token },
  });
}

export async function apiPost<T>(
  url: string,
  data?: any
): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.post<T>(`${BASE_URL}${url}`, data, {
    headers: { Authorization: token },
  });
}

export async function apiDelete<T>(url: string): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.delete<T>(`${BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiPut<T>(
  url: string,
  data?: any
): Promise<AxiosResponse<T>> {
  const token = await AsyncStorage.getItem(STORAGE_TOKEN);

  return await axios.put<T>(`${BASE_URL}${url}`, data, {
    headers: { Authorization: token },
  });
}
