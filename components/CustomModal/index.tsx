// components/CustomModal.tsx
import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import CardIcon from "../CardIcon";
import Button from "../Button";
import { downloadAndOpenFile } from "../../utils/dowloadFile";

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (labels: string[]) => void;
}

const handleStartShift = () => {
  router.replace("/");
};

const items = [
  {
    text: "Perfil",
    icon: "user",
    onPress: () => {
      router.push("/../../perfil");
    },
  },
  {
    text: "Tutoriais",
    icon: "globe",
    onPress: () => {
      downloadAndOpenFile(
        "https://drive.google.com/uc?export=download&id=1ewF86gZGLLSYNOUKJNoveB74pzjuBnoZ",
        "Tutoriais.pdf"
      );
    },
  },
  {
    text: "Sobre",
    icon: "toolbox",
    onPress: () => {
      downloadAndOpenFile(
        "https://drive.google.com/uc?export=download&id=1SU1nP9IaPy-sdzmUEvzGsGOONdku1b33",
        "Sobre.pdf"
      );
    },
  },
];

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
}) => {
  const handleItemPress = (item: (typeof items)[number]) => {
    item.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
          <ScrollView>
            {items.map((item) => (
              <React.Fragment key={item.text}>
                <TouchableOpacity onPress={() => handleItemPress(item)}>
                  <CardIcon {...item} />
                </TouchableOpacity>
                <View style={styles.separator} />
              </React.Fragment>
            ))}
            <Button onPress={handleStartShift} style={{ marginBottom: 20 }}>
              SAIR
            </Button>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "70%",
    backgroundColor: colors.black,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  separator: { height: 10 },
});

export default SelectionModal;
