import React from "react";
import { Modal, View, StyleSheet, ScrollView } from "react-native";
import RenderHTML from "react-native-render-html";
import { colors } from "../../constants/colors";
import Button from "../Button";

// Definindo a interface para os atributos do modal
interface InvoiceHtmlModalProps {
  visible: boolean;
  htmlContent: string;
  onClose: () => void;
}

const InvoiceHtmlModal: React.FC<InvoiceHtmlModalProps> = ({
  visible,
  htmlContent,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <RenderHTML
            contentWidth={300} // Defina uma largura apropriada para o conteúdo
            source={{ html: htmlContent }} // Passando o HTML recebido
          />
          <Button onPress={onClose} style={styles.button}>
            Fechar
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
    width: 320,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    alignItems: "center",
    borderColor: colors.white,
    borderWidth: 2,
  },
  button: {
    marginTop: 15,
    backgroundColor: colors.black,
  },
});

export default InvoiceHtmlModal;
