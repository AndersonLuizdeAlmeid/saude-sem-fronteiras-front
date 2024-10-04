import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

// Função para salvar o atestado gerado como um arquivo local e permitir compartilhamento ou download
export const downloadAndOpenDocument = async (
  certificateContent: string, // Conteúdo do atestado gerado
  fileName: string // Nome do arquivo (ex: "atestado.txt")
) => {
  try {
    // Solicita a permissão de armazenamento no Android
    const permissionGranted = await requestStoragePermission();

    if (!permissionGranted) {
      console.log(
        "Permissão de armazenamento é necessária para baixar o arquivo."
      );
      return;
    }

    // Define o caminho do arquivo local
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Grava o conteúdo do atestado no arquivo
    await FileSystem.writeAsStringAsync(fileUri, certificateContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log("Arquivo gravado com sucesso:", fileUri);

    // Verifica se o compartilhamento está disponível
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log("Compartilhamento não disponível.");
    }
  } catch (error) {
    console.error("Erro ao salvar e abrir o arquivo:", error);
  }
};

// Função para solicitar permissão de armazenamento (necessária no Android)
async function requestStoragePermission() {
  if (Platform.OS === "android") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log("Status da permissão de armazenamento:", status);
    return status === "granted";
  }
  return true; // No iOS, não é necessário pedir permissão
}
