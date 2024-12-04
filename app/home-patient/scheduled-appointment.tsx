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
import { apiDelete, apiGet, apiPut } from "../../utils/api";
import { Patient } from "../../domain/Patient/patient";
import Button from "../../components/Button";
import { openWhatsApp } from "../../utils/whatsapp";
import SimpleModal from "../../components/Modal";
import {
  ANY_APPOINTMENT_DELETE,
  APPOINTMENT_NOT_START_YET,
  ERROR_APPOINTMENT_DELETE,
  ERROR_GET_APPOINTMENTS,
  ERROR_GET_PATIENT,
  ERROR_PHONE_DOCTOR,
  ERROR_PHONE_NUMBER,
  STATUS_SCHEDULED_INVALID,
} from "../../utils/messages";
import ComboBox from "../../components/ComboBox";

const ScheduledAppointmentPage: React.FC = () => {
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
  const [patientId, setPatientId] = useState<number>(0);
  const [messageModal, setMessageModal] = useState<string>("");
  const [consultations, setConsultations] = useState<
    { id: number; data: string; status: number }[]
  >([]);
  const [consultation, setConsultation] = useState<{
    id: number;
    description: string;
  } | null>(null);

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

  const resetAppointmentSelection = () => {
    setResetSelection(true);
  };

  useEffect(() => {
    setSelectedConsultation(null);
    getAppointments();
  }, [appointment]);

  useEffect(() => {
    if (resetSelection) {
      resetAppointmentSelection();
      setResetSelection(false);
    }
  }, [resetSelection]);

  const getAppointments = async () => {
    try {
      setResetSelection(true);
      const value = await AsyncStorage.getItem(STORAGE_PATIENT);
      if (value) {
        const patient: Patient = JSON.parse(value);
        setPatientId(patient.id);
        const response = await apiGet(`/Schedule/patient/${patient.id}`);
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
            .filter((item) => item.status === appointment?.id)
            .map((item) => ({
              id: item.id,
              data: `${formatDate(item.date)} - Preço: ${formatPrice(
                item.price
              )}`,
              status: item.status,
            }));

          setConsultations(filteredConsultations);
        } else {
          setMessageModal(ERROR_GET_PATIENT);
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal(ERROR_GET_PATIENT);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal(ERROR_GET_APPOINTMENTS);
      setErrorModalVisible(true);
    }
  };

  const handleDeletetShift = async () => {
    if (selectedConsultation && selectedConsultation.id) {
      try {
        if (
          selectedConsultation.status === 2 ||
          selectedConsultation.status === 1
        ) {
          const id = selectedConsultation.id;
          const price = 0;
          const status = 3;

          await apiPut("/Schedule/", { id, price, status });

          selectedConsultation.status = 3;
          const updatedConsultations = consultations.filter(
            (consultation) => consultation.id !== selectedConsultation.id
          );
          setConsultations(updatedConsultations);

          if (updatedConsultations.length > 0) {
            // Se houver itens restantes, selecione o próximo item
            const nextIndex =
              (consultations.findIndex(
                (c) => c.id === selectedConsultation.id
              ) +
                1) %
              updatedConsultations.length;
            setSelectedConsultation(updatedConsultations[nextIndex]);
          } else {
            // Se não houver itens restantes, desmarque a seleção
            setSelectedConsultation(null);
          }

          getAppointments();
          setResetSelection(true);
        } else {
          setMessageModal(STATUS_SCHEDULED_INVALID);
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessageModal(ERROR_APPOINTMENT_DELETE);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_DELETE);
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  useEffect(() => {
    if (resetSelection) {
      setSelectedConsultation(null);
      setConsultation(null);
      setResetSelection(false); // Reseta o controlador após o reset
    }
  }, [resetSelection]);

  const handleStartShift = async () => {
    if (selectedConsultation) {
      if (selectedConsultation && selectedConsultation.id) {
        if (selectedConsultation.status === 2) {
          const validateDate = await apiGet<number>(
            `/Appointment/scheduled/validation/${selectedConsultation.id}`
          );
          if (validateDate.data > 0) {
            const phoneNumber = await apiGet(
              `/Schedule/doctor/phone/${selectedConsultation.id}`
            );
            if (phoneNumber !== null) {
              if (typeof phoneNumber.data === "string") {
                // Verifique e formate o número de telefone, se necessário
                const formattedPhoneNumber = formatPhoneNumber(
                  phoneNumber.data
                );
                openWhatsApp(
                  formattedPhoneNumber,
                  "Olá, sou paciente e estou pronto para sua consulta."
                );
                router.replace("/home-patient");
              } else {
                setMessageModal(ERROR_PHONE_NUMBER);
                setErrorModalVisible(true);
              }
            } else {
              setMessageModal(ERROR_PHONE_DOCTOR);
              setErrorModalVisible(true);
            }
          } else {
            setMessageModal(APPOINTMENT_NOT_START_YET);
            setErrorModalVisible(true);
          }
        } else {
          setMessageModal(STATUS_SCHEDULED_INVALID);
          setErrorModalVisible(true);
        }
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_DELETE);
      setErrorModalVisible(true);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");

    // Adiciona o código do país, se necessário (por exemplo, +55 para Brasil)
    if (!cleaned.startsWith("55")) {
      return `+55${cleaned}`;
    }

    return `+${cleaned}`;
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
        title="Agendamentos"
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
        <Button onPress={handleDeletetShift} style={styles.button}>
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
});

export default ScheduledAppointmentPage;
