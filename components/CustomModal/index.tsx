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
import { apiGet } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (labels: string[]) => void;
}

const handleStartShift = () => {
  router.replace("/");
};

const doctorOrPatient = async () => {
  const value = await AsyncStorage.getItem(STORAGE_USER);
  if (value) {
    const user: User = JSON.parse(value);
    const userOrDoctor = await apiGet<number>(`/Users/id/${user.id}`);
    console.log(userOrDoctor);
    if (userOrDoctor.data === 1) {
      router.replace("/perfil/perfil-doctor");
    } else if (userOrDoctor.data === 2) {
      router.replace("/perfil/perfil-patient");
    }
  } else {
    console.log("Nenhum valor encontrado no AsyncStorage");
  }
};

const items = [
  {
    text: "Perfil",
    icon: "user",
    onPress: () => {
      doctorOrPatient();
    },
  },
  {
    text: "Tutoriais",
    icon: "globe",
    onPress: () => {
      router.push("/../../perfil/tutorial");
      // downloadAndOpenFile(
      //   "https://drive.google.com/uc?export=download&id=1ewF86gZGLLSYNOUKJNoveB74pzjuBnoZ",
      //   "Tutoriais.pdf"
      // );
    },
  },
  {
    text: "Sobre",
    icon: "toolbox",
    onPress: () => {
      router.push("/../../perfil/about");
      // downloadAndOpenFile(
      //   "https://drive.google.com/uc?export=download&id=1SU1nP9IaPy-sdzmUEvzGsGOONdku1b33",
      //   "Sobre.pdf"
      // );
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
