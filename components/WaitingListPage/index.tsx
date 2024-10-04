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

const WaitingListPage: React.FC<{
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
      case 4:
        return "#87CEFA"; // Status 4 - Azul
      default:
        return colors.gray_2; // Padrão - mesma cor
    }
  };

  const Legend = () => {
    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: "#3CB371" }]} />
          <Text style={styles.legendText}>Confirmado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: "#F08080" }]} />
          <Text style={styles.legendText}>Cancelado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: "#87CEFA" }]} />
          <Text style={styles.legendText}>Finalizado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: colors.gray_2 }]} />
          <Text style={styles.legendText}>Aguardando</Text>
        </View>
      </View>
    );
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
      <Legend />
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
    borderColor: colors.white,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 320,
  },
  consultationText: {
    color: colors.white,
    textAlign: "center",
    fontSize: 16,
  },
  legendContainer: {
    flexDirection: "row", // Mantém os itens em linha
    alignItems: "center", // Centraliza os itens na vertical
    justifyContent: "center", // Centraliza os itens na horizontal
    padding: 15,
  },
  legendItem: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 1, // Adiciona espaçamento horizontal entre os itens
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

export default WaitingListPage;
