import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import Button from "../Button";

interface SimpleModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  visible,
  onClose,
  message,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.message}>{message}</Text>
          <Button onPress={onClose}>FECHAR</Button>
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
  message: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    color: colors.white,
  },
});

export default SimpleModal;
