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
import { Screening } from "../../domain/Screening/screening";
import { Appointment } from "../../domain/Appointment/appointment";
import {
  ANY_APPOINTMENT_DELETE,
  ANY_PHONE_FOUND,
  ANY_SCHEDULE_SELECTED,
  APPOINTMENT_NOT_START_YET,
  ERROR_APPOINTMENT_DELETE,
  ERROR_GET_APPOINTMENTS,
  ERROR_GET_VALUE_DOCTOR,
  ERROR_WHATSAPP,
  FORMAT_INCORRECT,
  PHONE_INCORRECT,
  STATUS_INCORRECT,
  STATUS_INCORRECT_ACCEPT,
  STATUS_INCORRECT_CANCEL,
  STATUS_INCORRECT_FINISH,
} from "../../utils/messages";
import ComboBox from "../../components/ComboBox";

const EmergencyAppointmentPage: React.FC = () => {
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
    { id: number; data: string; status: number; doctor: number }[]
  >([]);
  const [consultation, setConsultation] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [filter, setFilter] = useState<number>(0);
  const [validation, setValidation] = useState<number>(0);
  const [start, setStart] = useState<number>(0);
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

  const resetDocumentSelection = () => {
    setResetSelection(true); // Ativa reset
  };

  const handleCloseErrorModal = () => {
    if (start === 1) {
      setErrorModalVisible(false);
      setValidation(validation + 1);
      setStart(0);
    } else {
      setErrorModalVisible(false);
    }
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionasdas:", labels);
  };

  const getAppointments = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);

        const response = await apiGet(`/Emergency/doctor/${doctor.id}`);
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
              doctor: item.doctorId,
            }));

          setConsultations(filteredConsultations);
        } else {
          setMessageModal(ERROR_GET_VALUE_DOCTOR);
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
    setResetSelection(true);
  }, []);

  useEffect(() => {
    callWhatsapp();
  }, [validation]);

  const callWhatsapp = async () => {
    setStart(0);
    if (!selectedConsultation || !selectedConsultation.id) {
      return;
    }

    try {
      const validateDate = await apiGet<number>(
        `/Appointment/emergency/validation/${selectedConsultation.id}`
      );
      if (validateDate.data > 0) {
        const phoneNumber = await apiGet(
          `/Emergency/patient/phone/${selectedConsultation.id}`
        );
        if (phoneNumber?.data) {
          if (typeof phoneNumber.data === "string") {
            // Verifique e formate o número de telefone, se necessário
            const formattedPhoneNumber = formatPhoneNumber(phoneNumber.data);
            openWhatsApp(
              formattedPhoneNumber,
              "Olá, sou o paciente e estou pronto para a consulta"
            );
            setValidation(0);
            router.replace("/home-doctor");
          } else {
            setMessageModal(PHONE_INCORRECT);
            setErrorModalVisible(true);
          }
        } else {
          setMessageModal(ANY_PHONE_FOUND);
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal(APPOINTMENT_NOT_START_YET);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal(ERROR_WHATSAPP);
      setErrorModalVisible(true);
    }
  };

  const formatScreeningData = (data: Screening) => {
    return `
        Sintomas: ${data.symptons}\n
        Data dos Sintomas: ${data.dateSymptons}\n
        Medicamento Contínuo: ${data.continuosMedicine}\n
        Alergias: ${data.allergies}\n
    `;
  };

  const handleStartShift = async () => {
    if (selectedConsultation) {
      if (selectedConsultation && selectedConsultation.id) {
        if (selectedConsultation.status === 2) {
          const dataOfScreening = await apiGet<Screening>(
            `/Screening/${selectedConsultation.id}`
          );
          if (dataOfScreening.data !== null) {
            const formattedData = formatScreeningData(dataOfScreening.data);

            setMessageModal(formattedData);
            setErrorModalVisible(true);
            setStart(1);
          }
        } else {
          setMessageModal(STATUS_INCORRECT);
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

  const handleAcceptShift = async () => {
    if (selectedConsultation && selectedConsultation.id) {
      if (selectedConsultation.status === 1) {
        const id = selectedConsultation.id;
        const price = 0;
        const status = 2;

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

            const responseEmergency = await apiGet<Appointment>(
              `/Appointment/emergencyId/${id}`
            );
            const appointmentId = responseEmergency.data.id;
            const duration = 0;
            const patientId = responseEmergency.data.patientId;

            const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
            if (value) {
              const doctor: Doctor = JSON.parse(value);
              const doctorId = doctor.id;
              await apiPut("/Appointment/", {
                id: appointmentId,
                date,
                duration,
                doctorId,
                patientId,
              });
              selectedConsultation.status = 2;
              getAppointments();
              setResetSelection(true);
            }
          }
        }
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

        const dateAwait = await apiGet<string>(
          `/Appointment/dateAppointment/emergencyId/${selectedConsultation.id}`
        );

        if (dateAwait && dateAwait.data) {
          // Ajuste a forma de acessar a data conforme necessário
          const date = dateAwait.data;
          await apiPut("/Emergency/", { id, price, date, status });
          selectedConsultation.status = 4;

          getAppointments();
          setResetSelection(true);
        }
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
        if (selectedConsultation.status === 2) {
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
              selectedConsultation.status = 3;
            }
          }

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
        setMessageModal(ERROR_APPOINTMENT_DELETE);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(ANY_APPOINTMENT_DELETE);
      setErrorModalVisible(true);
    }
  };

  const filterConsultations = (consultations: any[]) => {
    if (filter === 0) {
      return consultations.filter((consultation) => consultation.doctor === 0); // Consultas com médico
    } else if (filter === 1) {
      return consultations.filter((consultation) => consultation.doctor !== 0); // Consultas sem médico
    }
    return consultations;
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
      setResetSelection(false); // Reseta o controlador após o reset
    }
  }, [resetSelection]);

  useEffect(() => {
    getAppointments();
  }, []);

  useEffect(() => {}, [appointment]);

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
        title="Consultas Emergenciais"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />

      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <Button
            onPress={() => {
              setFilter(1);
              resetDocumentSelection();
            }}
            style={filter === 1 ? styles.activeButton : styles.buttonPrincipal}
          >
            Minhas consultas
          </Button>
          <Button
            onPress={() => {
              setFilter(0);
              resetDocumentSelection();
            }}
            style={filter === 0 ? styles.activeButton : styles.buttonPrincipal}
          >
            Sem Médico
          </Button>
        </View>
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
            consultations={filterConsultations(consultations)}
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

  buttonPrincipal: {
    marginTop: 5,
    width: 250,
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

export default EmergencyAppointmentPage;
