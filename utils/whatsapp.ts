import { Linking } from "react-native";

export const openWhatsApp = (phoneNumber: string, message: string) => {
  const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
    message
  )}`;

  Linking.openURL(url)
    .then(() => {
      console.log("WhatsApp aberto");
    })
    .catch(() => {
      console.log("Erro ao abrir o WhatsApp");
    });
};
