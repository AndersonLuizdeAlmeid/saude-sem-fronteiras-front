import React from "react";
import { Modal, View, StyleSheet, Alert } from "react-native";
import * as Clipboard from "expo-clipboard"; // Importe o novo Clipboard
import { colors } from "../../constants/colors";
import Button from "../Button";
import Input from "../Input";

interface SimpleModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const ModalInput: React.FC<SimpleModalProps> = ({
  visible,
  onClose,
  message,
}) => {
  // Função para copiar o valor para o Clipboard
  const copyToClipboard = () => {
    Clipboard.setString(message); // Copia o valor da "linha digitável"
    Alert.alert(
      "Copiado!",
      "A linha digitável foi copiada para a área de transferência."
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Input
            label="LINHA DIGITÁVEL"
            autoCorrect={false}
            value={message}
            style={styles.inputPrincipal}
            autoCapitalize="none"
            editable={false} // Faz o input ser apenas leitura
          />
          {/* Botão de Copiar */}
          <Button onPress={copyToClipboard} style={styles.button}>
            COPIAR
          </Button>
          <Button onPress={onClose} style={styles.button}>
            FECHAR
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: colors.black,
    borderRadius: 10,
    alignItems: "center",
    borderColor: colors.white,
    borderWidth: 2,
  },
  inputPrincipal: {
    width: 255,
    height: 50,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: colors.black,
    color: colors.white, // Adicione esta linha para que o texto seja visível
  },
  button: {
    marginBottom: 15,
  },
});

export default ModalInput;
