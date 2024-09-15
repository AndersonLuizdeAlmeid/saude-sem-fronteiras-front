import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import CardIcon from "../../components/CardIcon";
import WaitingListPage from "../../components/WaitingListPage";
import Button from "../../components/Button";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PATIENT } from "../../constants/storage";
import { apiGet } from "../../utils/api";
import { Patient } from "../../domain/Patient/patient";

const ScheduledAppointmentPage: React.FC = () => {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [patientId, setPatientId] = useState<number>(0);
  const [consultations, setConsultations] = useState<
    { id: number; data: string }[]
  >([]);

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    router.replace("/home-doctor/appointments");
  };

  const handleSelectConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const getAppointments = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_PATIENT);
      if (value) {
        const patient: Patient = JSON.parse(value);
        setPatientId(patient.id);
        console.log(patient.id);
        const response = await apiGet(`/Appointment/patient/${patient.id}`);
        console.log(response.data);
        if (response && Array.isArray(response.data)) {
          // Mapear os dados para a estrutura esperada
          const formattedConsultations = response.data.map((item: any) => ({
            id: item.id,
            data: item.description,
          }));
          setConsultations(formattedConsultations);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } else {
        console.error("Formato de respsosta inesperado.");
      }
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStartShift = () => {
    if (selectedConsultation) {
      // Processar a consulta selecionada
      router.replace("/registry");
    } else {
      // Mostrar uma mensagem de erro ou alerta
      console.log("Nenhuma consulta selecionada");
    }
  };

  const items = [
    {
      text: "Iniciar Consulta",
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
            </React.Fragment>
          ))}
          <WaitingListPage
            onSelect={handleSelectConsultation}
            consultations={consultations}
          />
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
    backgroundColor: colors.black,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScheduledAppointmentPage;
