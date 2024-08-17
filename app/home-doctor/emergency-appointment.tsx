import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import CardIcon from "../../components/CardIcon";
import WaitingListPage from "../../components/WaitingListPage";
import Button from "../../components/Button";

const HomePage: React.FC = () => {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  const handleBackPress = () => {
    router.replace("/home-doctor/appointments");
  };

  const handleAuxiliaryModalPress = () => {
    router.replace("/home-doctor/appointments");
  };

  const handleSelectConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  const handleStartShift = () => {
    if (selectedConsultation) {
      // Processar a consulta selecionada
      console.log("Consulta selecionada:", selectedConsultation);
      router.replace("/registry");
    } else {
      // Mostrar uma mensagem de erro ou alerta
      console.log("Nenhuma consulta selecionada");
    }
  };

  const items = [
    {
      text: "Iniciar Atendimento",
      icon: "comments",
      onPress: handleStartShift,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Minha Página"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <View style={styles.content}>
        <ScrollView>
          {items.map((i) => (
            <React.Fragment key={i.text}>
              <CardIcon {...i} />
              <View style={styles.separator} />
            </React.Fragment>
          ))}
          <WaitingListPage onSelect={handleSelectConsultation} />
          <Button
            onPress={handleStartShift}
            style={{ marginBottom: 20, marginTop: 30 }}
          >
            INICIAR PLANTÃO
          </Button>
          <Button onPress={handleStartShift} style={{ marginBottom: 20 }}>
            ENCERRAR PLANTÃO
          </Button>
        </ScrollView>
      </View>
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
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: 40 },
});

export default HomePage;
