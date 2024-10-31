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
import { STORAGE_DOCTOR } from "../../constants/storage";
import { apiGet, apiPut } from "../../utils/api";
import Button from "../../components/Button";
import { Doctor } from "../../domain/Doctor/doctor";
import SimpleModal from "../../components/Modal";
import { openWhatsApp } from "../../utils/whatsapp";
import {
  ANY_APPOINTMENT_CANCEL,
  ANY_APPOINTMENT_SELECTED,
  ANY_SCHEDULE_SELECTED,
  APPOINTMENT_NOT_START_YET,
  ERROR_CANCEL_APPOINTMENT,
  ERROR_GET_APPOINTMENTS,
  FAIL_STORAGE_DOCTOR,
  FORMAT_INCORRECT,
  PHONE_INCORRECT,
  STATUS_INCORRECT,
  STATUS_INCORRECT_ACCEPT,
  STATUS_INCORRECT_CANCEL,
  STATUS_INCORRECT_FINISH,
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
  const [messageModal, setMessageModal] = useState<string>("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
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

  const handleSelectConsultation = async (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionasdas:", labels);
  };

  const handleCloseErrorModal = () => {
    setErrorModalVisible(false);
  };

  const getAppointments = async () => {
    try {
      resetAppointmentSelection();
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);

        const response = await apiGet(`/Schedule/doctor/${doctor.id}`);
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

          // Função para formatar o preço
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
          setMessageModal(FAIL_STORAGE_DOCTOR);
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal(FORMAT_INCORRECT);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal(ERROR_GET_APPOINTMENTS);
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStartShift = async () => {
    if (selectedConsultation) {
      if (selectedConsultation && selectedConsultation.id) {
        if (selectedConsultation.status === 2) {
          const validateDate = await apiGet<number>(
            `/Appointment/scheduled/validation/${selectedConsultation.id}`
          );
          if (validateDate.data > 0) {
            const phoneNumber = await apiGet(
              `/Schedule/patient/phone/${selectedConsultation.id}`
            );
            if (phoneNumber !== null) {
              if (typeof phoneNumber.data === "string") {
                // Verifique e formate o número de telefone, se necessário
                const formattedPhoneNumber = formatPhoneNumber(
                  phoneNumber.data
                );
                openWhatsApp(
                  formattedPhoneNumber,
                  "Olá, sou o paciente e estou pronto para a consulta"
                );
                router.replace("/home-doctor");
              } else {
                setMessageModal(PHONE_INCORRECT);
                setErrorModalVisible(true);
              }
            }
          } else {
            setMessageModal(APPOINTMENT_NOT_START_YET);
            setErrorModalVisible(true);
          }
        } else {
          setMessageModal(STATUS_INCORRECT);
          setErrorModalVisible(true);
        }
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_SELECTED);
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

  const handleAcceptShift = async () => {
    if (selectedConsultation && selectedConsultation.id) {
      if (selectedConsultation.status === 1) {
        const id = selectedConsultation.id;
        const price = 0;
        const status = 2;

        await apiPut("/Schedule/", { id, price, status });
        selectedConsultation.status = 2;

        getAppointments();
        setResetSelection(true);
      } else {
        setMessageModal(STATUS_INCORRECT_ACCEPT);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ANY_SCHEDULE_SELECTED);
      setErrorModalVisible(true);
    }
  };

  const handleFinishShift = async () => {
    if (selectedConsultation && selectedConsultation.id) {
      if (
        selectedConsultation.status !== 1 &&
        selectedConsultation.status !== 3 &&
        selectedConsultation.status !== 4
      ) {
        const id = selectedConsultation.id;
        const price = 0;
        const status = 4;

        await apiPut("/Schedule/", { id, price, status });
        selectedConsultation.status = 4;

        getAppointments();
        setResetSelection(true);
      } else {
        setMessageModal(STATUS_INCORRECT_FINISH);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ANY_SCHEDULE_SELECTED);
      setErrorModalVisible(true);
    }
  };

  const handleDeletetShift = async () => {
    if (selectedConsultation && selectedConsultation.id) {
      try {
        if (
          selectedConsultation.status !== 3 &&
          selectedConsultation.status !== 4
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
          setMessageModal(STATUS_INCORRECT_CANCEL);
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessageModal(ERROR_CANCEL_APPOINTMENT);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_CANCEL);
      setErrorModalVisible(true);
    }
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
      setSelectedConsultation(null);
      setConsultation(null);
      setResetSelection(false);
    }
  }, [resetSelection]);

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
        title="Consultas Agendadas"
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
        <View style={styles.buttonContainer}>
          <Button onPress={handleAcceptShift} style={styles.button}>
            ACEITAR
          </Button>
          <Button onPress={handleDeletetShift} style={styles.button}>
            CANCELAR
          </Button>
          <Button onPress={handleFinishShift} style={styles.button}>
            FINALIZAR
          </Button>
        </View>
      </View>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={handleCloseErrorModal}
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
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row", // Alinha os botões em linha
    justifyContent: "space-around", // Espaça os botões uniformemente
    marginTop: 10, // Adiciona margem acima se necessário
  },
  button: {
    marginHorizontal: 5, // Adiciona margem horizontal entre os botões
    flex: 1, // Faz com que os botões ocupem espaço igual
  },
});

export default ScheduledAppointmentPage;
