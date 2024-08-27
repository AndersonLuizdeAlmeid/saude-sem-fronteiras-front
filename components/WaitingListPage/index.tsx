import React, { useState } from "react";
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
  consultations: { id: number; date: string; time: string; name: string }[];
}> = ({ onSelect, consultations }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelectConsultation = (index: number, item: any) => {
    setSelectedIndex(index);
    onSelect(item);
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
              selectedIndex === index && styles.selectedItem,
            ]}
            onPress={() => handleSelectConsultation(index, item)}
          >
            <Text style={styles.consultationText}>
              {item.date} - {item.time} - {item.name}
            </Text>
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
    flex: 1,
    paddingTop: -20,
  },
  consultationItem: {
    backgroundColor: colors.gray_2,
    padding: 15,
    borderRadius: 5,
    borderColor: colors.white,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 320,
  },
  selectedItem: {
    backgroundColor: colors.gray_1,
    borderColor: colors.white,
    borderWidth: 2,
  },
  consultationText: {
    color: colors.white,
    fontSize: 16,
  },
});

export default WaitingListPage;
