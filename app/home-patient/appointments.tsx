import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import CardIcon from "../../components/CardIcon";
import { router } from "expo-router";
import React, { useState } from "react";
import HeaderPage from "../../components/HeaderPage";
import { colors } from "../../constants/colors";
import SelectionModal from "../../components/CustomModal";

const AppointmentsPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const handleBackPress = () => {
    router.back();
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
      text: "Emergencial",
      icon: "hospital",
      onPress: () => {
        router.push("/home-patient/emergency-patient");
      },
    },
    {
      text: "Agendadas",
      icon: "calendar-check",
      onPress: () => {
        router.push("/home-patient/scheduled-appointment");
      },
    },
    {
      text: "Agendar",
      icon: "calendar-alt",
      onPress: () => {
        router.push("/home-patient/schedule-appointment");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Consultas"
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
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    color: colors.white,
  },
  separator: { height: 40 },
});

export default AppointmentsPage;
