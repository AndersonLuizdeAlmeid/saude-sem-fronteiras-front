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
      router.push("/home-doctor/emergency-appointment");
    },
  },
  {
    text: "Tutoriais",
    icon: "globe",
    onPress: () => {
      router.push("");
    },
  },
  {
    text: "Sobre",
    icon: "toolbox",
    onPress: () => {
      router.push("");
    },
  },
];

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  onClose,
}) => {
  const handleItemPress = (page: string) => {
    router.push(page);
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
            {items?.map((i) => (
              <React.Fragment key={i.text}>
                <CardIcon {...i} />
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
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: 10 },
});

export default SelectionModal;
