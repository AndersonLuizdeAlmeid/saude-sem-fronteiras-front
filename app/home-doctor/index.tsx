import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import CardIcon from "../../components/CardIcon";
import SelectionModal from "../../components/CustomModal";

const HomePage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const handleBackPress = () => {
    router.replace("/");
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const items = [
    {
      text: "Consultas",
      icon: "notes-medical",
      onPress: () => {
        router.push("/home-doctor/appointments");
      },
    },
    {
      text: "Faturas",
      icon: "dollar-sign",
      onPress: () => {
        router.push("");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Página Inicial"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <View style={styles.content}>
        <ScrollView>
          {items?.map((i) => (
            <React.Fragment key={i.text}>
              <CardIcon {...i} />
              <View style={styles.separator} />
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black, // Temporariamente troque para branco
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: colors.white,
  },
  separator: { height: 40 },
});

export default HomePage;
