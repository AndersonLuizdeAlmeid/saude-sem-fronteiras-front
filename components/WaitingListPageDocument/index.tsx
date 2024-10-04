import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button, // Para o botão de reset no componente pai
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

const WaitingListPageDocument: React.FC<{
  onSelect: (item: any) => void;
  consultations: { id: number; data: string; type: number }[];
  resetSelection: boolean; // Nova prop para resetar seleção
}> = ({ onSelect, consultations, resetSelection }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Resetar seleção sempre que resetSelection mudar
  useEffect(() => {
    if (resetSelection) {
      setSelectedIndex(null);
    }
  }, [resetSelection]);

  const handleSelectConsultation = (index: number, item: any) => {
    setSelectedIndex(index);
    onSelect(item);
  };

  const getBackgroundColorByStatus = (type: number) => {
    switch (type) {
      case 1:
        return "#6A5ACD";
      case 2:
        return "#4682B4";
      case 3:
        return "#191970";
      default:
        return colors.gray_2;
    }
  };

  const Legend = () => (
    <View style={styles.legendContainer}>
      <View style={styles.legendItem}>
        <View style={[styles.colorBox, { backgroundColor: "#6A5ACD" }]} />
        <Text style={styles.legendText}>Atestado</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.colorBox, { backgroundColor: "#4682B4" }]} />
        <Text style={styles.legendText}>Exame</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.colorBox, { backgroundColor: "#191970" }]} />
        <Text style={styles.legendText}>Receita</Text>
      </View>
    </View>
  );

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
              { backgroundColor: getBackgroundColorByStatus(item.type) },
              selectedIndex === index && { opacity: 0.5 },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  legendItem: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginBottom: 5,
  },
  legendText: {
    color: "#fff",
  },
});

export default WaitingListPageDocument;
