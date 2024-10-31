import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

const WaitingListPageInvoice: React.FC<{
  onSelect: (item: any) => void;
  consultations: { id: number; data: string; status: number }[]; // Adiciona o status
  resetSelection: boolean;
}> = ({ onSelect, consultations, resetSelection }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (resetSelection) {
      setSelectedIndex(null);
    }
  }, [resetSelection]);

  const handleSelectConsultation = (index: number, item: any) => {
    setSelectedIndex(index);
    onSelect(item);
  };

  // Função para determinar a cor com base no status
  const getBackgroundColorByStatus = (status: number) => {
    switch (status) {
      case 1:
        return colors.gray_2; // Status 1 - mesma cor padrão
      case 2:
        return "#3CB371"; // Status 2 - Verde
      case 3:
        return "#F08080"; // Status 3 - Vermelho
      default:
        return colors.gray_2; // Padrão - mesma cor
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        style={{ maxHeight: 320 }}
      >
        {consultations.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.consultationItem,
              { backgroundColor: getBackgroundColorByStatus(item.status) }, // Cor com base no status
              selectedIndex === index && { opacity: 0.5 }, // Adiciona opacidade ao item selecionado
            ]}
            onPress={() => handleSelectConsultation(index, item)}
          >
            <Text style={styles.consultationText}>{item.data}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    paddingTop: -20,
  },
  consultationItem: {
    padding: 15,
    borderRadius: 5,
    borderColor: colors.black,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 320,
  },
  consultationText: {
    color: colors.black,
    textAlign: "center",
    fontSize: 16,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginBottom: 5, // Espaço entre o box colorido e o texto
  },
  legendText: {
    color: "#fff",
  },
});

export default WaitingListPageInvoice;
