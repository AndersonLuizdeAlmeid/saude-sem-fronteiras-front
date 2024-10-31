import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import { ScrollView } from "react-native";
import CardIcon from "../../components/CardIcon";
import WaitingListPage from "../../components/WaitingListPage";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PATIENT } from "../../constants/storage";
import { apiGet, apiPut } from "../../utils/api";
import { Patient } from "../../domain/Patient/patient";
import Button from "../../components/Button";
import SimpleModal from "../../components/Modal";
import {
  ANY_APPOINTMENT_DELETE,
  ERROR_APPOINTMENT_DELETE,
  STATUS_SCHEDULED_INVALID,
} from "../../utils/messages";
import IconButton from "../../components/Button/iconButton";
import ComboBox from "../../components/ComboBox";

const EmergencyPatientPage: React.FC = () => {
  const predefinedTypes = [
    { id: 1, label: "Aguardando", comparativeId: 101 },
    { id: 2, label: "Confirmado", comparativeId: 102 },
    { id: 3, label: "Cancelado", comparativeId: 103 },
    { id: 4, label: "Finalizado", comparativeId: 104 },
  ];

  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [resetSelection, setResetSelection] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [messageModal, setMessageModal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState<
    { id: number; data: string; status: number }[]
  >([]);

  const [appointments, setAppointments] =
    useState<{ id: number; label: string; comparativeId: number }[]>(
      predefinedTypes
    );
  const [appointment, setAppointment] = useState<{
    id: number;
    description: string;
  }>({
    id: 1,
    description: "Aguardando",
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
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

  useEffect(() => {
    setSelectedConsultation(null);
    getAppointments();
  }, [appointment]);

  const resetAppointmentSelection = () => {
    setResetSelection(true);
  };

  useEffect(() => {
    if (resetSelection) {
      resetAppointmentSelection();
      setResetSelection(false);
    }
  }, [resetSelection]);

  const getAppointments = async () => {
    try {
      resetAppointmentSelection();
      const value = await AsyncStorage.getItem(STORAGE_PATIENT);
      if (value) {
        const patient = JSON.parse(value);
        const response = await apiGet(`/Emergency/patient/list/${patient.id}`);
        if (response && Array.isArray(response.data)) {
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            };
            return date.toLocaleDateString("pt-BR", options);
          };

          const formatPrice = (price: number) => {
            return price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
          };

          const filteredConsultations = response.data
            .filter((item) => item.status === appointment?.id) // Filtra conforme o `appointmentId` selecionado
            .map((item) => ({
              id: item.id,
              data: `${formatDate(item.date)} - Preço: ${formatPrice(
                item.price
              )}`,
              status: item.status,
            }));

          setConsultations(filteredConsultations);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } else {
        console.error("Formato de resposta inesperado.");
      }
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
    }
  };

  const handleDeletetShift = async () => {
    setLoading(true);

    if (selectedConsultation && selectedConsultation.id) {
      try {
        if (selectedConsultation.status === 1) {
          const id = selectedConsultation.id;
          const price = 0;
          const status = 3;

          const dateAwait = await apiGet<string>(
            `/Appointment/dateAppointment/emergencyId/${selectedConsultation.id}`
          );

          if (dateAwait && dateAwait.data) {
            // Ajuste a forma de acessar a data conforme necessário
            const date = new Date(dateAwait.data);

            if (isNaN(date.getTime())) {
              console.error("Data inválida:", dateAwait.data);
            } else {
              const now = Date.now();
              const differenceInMs = now - date.getTime();

              const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              const minutes = Math.floor(
                (differenceInMs % (1000 * 60 * 60)) / (1000 * 60)
              );

              const waitTime = `${days} dias, ${hours} horas e ${minutes} minutos`;
              await apiPut("/Emergency/", { id, price, waitTime, status });
            }
          }

          selectedConsultation.status = 3;
          const updatedConsultations = consultations.filter(
            (consultation) => consultation.id !== selectedConsultation.id
          );
          setConsultations(updatedConsultations);

          if (updatedConsultations.length > 0) {
            const nextIndex =
              (consultations.findIndex(
                (c) => c.id === selectedConsultation.id
              ) +
                1) %
              updatedConsultations.length;
            setSelectedConsultation(updatedConsultations[nextIndex]);
          } else {
            setSelectedConsultation(null);
          }

          getAppointments();
        } else {
          setMessageModal(STATUS_SCHEDULED_INVALID);
          setErrorModalVisible(true);
          setLoading(false);
        }
      } catch (error) {
        setMessageModal(ERROR_APPOINTMENT_DELETE);
        setErrorModalVisible(true);
        setLoading(false);
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_DELETE);
      setErrorModalVisible(true);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAppointments();
  }, []);

  useEffect(() => {}, [appointment]);

  const handleStartShift = async () => {
    router.replace("/home-patient/screenings-patient");
  };

  const items = [
    {
      text: "Criar Consulta Emergencial",
      icon: "comments",
      onPress: handleStartShift,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Emergências"
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
          <ComboBox
            label="Status"
            data={appointments}
            onSelect={(selectedAppointment) => {
              setAppointment({
                id: selectedAppointment.id,
                description: selectedAppointment.label,
              });
            }}
            placeholder="Escolha o Status"
            value={appointment ? appointment.description : ""}
          />
          <WaitingListPage
            onSelect={handleSelectConsultation}
            consultations={consultations}
            resetSelection={resetSelection}
          />
        </ScrollView>
        <Button
          onPress={handleDeletetShift}
          style={styles.button}
          loading={loading}
        >
          CANCELAR AGENDAMENTO
        </Button>
      </View>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={messageModal}
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
  button: {
    marginTop: 20,
    width: 250,
  },
  buttonPrincipal: {
    marginTop: 5,
    width: 90,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 150,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  activeButton: {
    margin: 5,
    backgroundColor: colors.gray_1,
  },
});

export default EmergencyPatientPage;
