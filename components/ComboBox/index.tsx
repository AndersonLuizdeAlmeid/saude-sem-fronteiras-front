import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors"; // Atualize o caminho conforme necessário

interface ComboBoxProps {
  label: string;
  data: string[];
  onSelect: (value: string) => void;
  placeholder: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  data,
  onSelect,
  placeholder,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleSelectItem = (item: string) => {
    setSelectedValue(item);
    onSelect(item);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.inputText}>{selectedValue || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.gray_1} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)} // Fecha o modal ao clicar fora
        >
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            {/* Isso impede que o clique no conteúdo do modal feche o modal */}
            <FlatList
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectItem(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.toString()}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    color: colors.white,
    marginBottom: 5,
    fontSize: 16,
    width: 320,
    borderColor: colors.white,
  },
  input: {
    backgroundColor: colors.gray_2,
    padding: 15,
    borderRadius: 5,
    borderColor: colors.white,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    color: colors.white,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: colors.gray_2,
    width: 300,
    borderRadius: 10,
    padding: 20,
    borderColor: colors.white,
    borderWidth: 2,
  },
  modalItem: {
    paddingVertical: 15,
  },
  modalItemText: {
    color: colors.white,
    fontSize: 16,
  },
});

export default ComboBox;
