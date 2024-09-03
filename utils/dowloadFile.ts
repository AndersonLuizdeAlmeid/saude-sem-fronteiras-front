import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

export const downloadAndOpenFile = async (url: string, fileName: string) => {
  try {
    // Solicita a permissão de armazenamento no Android
    const permissionGranted = await requestStoragePermission();

    if (!permissionGranted) {
      console.log(
        "Permissão de armazenamento é necessária para baixar o arquivo."
      );
      return;
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    const download = await FileSystem.downloadAsync(url, fileUri);

    if (download.status === 200) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(download.uri);
      } else {
        console.log("Compartilhamento não disponível.");
      }
    } else {
      console.log("Falha ao baixar o arquivo:", download.status);
    }
  } catch (error) {
    console.error("Erro ao baixar o arquivo:", error);
  }
};

async function requestStoragePermission() {
  if (Platform.OS === "android") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log("Status da permissão de armazenamento:", status);
    return status === "granted";
  }
  return true;
}
