import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import CardIcon from "../../components/CardIcon";
import Button from "../../components/Button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_TOKEN } from "../../constants/storage";
import React, { useState } from "react";
import Page from "../../components/Page";
import HeaderPage from "../../components/HeaderPage";
import { colors } from "../../constants/colors";
import SelectionModal from "../../components/CustomModal";

export default function HomePatientPage() {
  const [isModalVisible, setModalVisible] = useState(false);

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
    console.log("Labels selecionadas:", labels);
  };

  const items = [
    {
      text: "Consultas",
      icon: "notes-medical",
      onPress: () => {
        router.push("/home-patient/appointments");
      },
    },
    {
      text: "Exames, receitas e atestados",
      icon: "bars",
      onPress: () => {
        router.push("/home-patient/documents-patient");
      },
    },
    {
      text: "Faturas",
      icon: "dollar-sign",
      onPress: () => {
        router.push("/home-patient/payment-patient");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Paciente"
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black, // Temporariamente troque para branco
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    color: colors.white,
  },
  separator: { height: 40 },
});
