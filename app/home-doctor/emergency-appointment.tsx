import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
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
import { ScreeningShow } from "../../domain/Screening/screeningShow";
import { Screening } from "../../domain/Screening/screening";
import { Appointment } from "../../domain/Appointment/appointment";

const EmergencyAppointmentPage: React.FC = () => {
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

          // Função para formatar o preço
          const formatPrice = (price: number) => {
            return price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });
          };
          // Mapear os dados para a estrutura esperada com a data, preço e status formatados
          const formattedConsultations = response.data.map((item: any) => ({
            id: item.id,
            data: `${formatDate(item.date)} - Preço: ${formatPrice(
              item.price
            )}`, // Concatena a data com o preço
            status: item.status,
            doctor: item.doctorId,
          }));
          setConsultations(formattedConsultations);
        } else {
          setMessageModal("Problema ao pegar valores do médico.");
          setErrorModalVisible(true);
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } else {
        setMessageModal("Formato de resposta inesperado.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal("Erro ao buscar consultas.");
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
            setMessageModal("O número de telefone não é uma string válida.");
            setErrorModalVisible(true);
          }
        } else {
          setMessageModal("Nenhum número de telefone encontrado.");
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal("Consulta não pode ser iniciada.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error("Erro ao tentar iniciar a consulta via WhatsApp:", error);
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
          setMessageModal(
            "Status do agendamento inválido para iniciar consulta."
          );
          setErrorModalVisible(true);
        }
      }
    } else {
      setMessageModal("Nenhuma consulta selecionada.");
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
        setMessageModal("Status do agendamento inválido para aceitação.");
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal("Nenhum agendamento selecionado");
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
        setMessageModal("Status do agendamento inválido para finalização.");
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal("Nenhum agendamento selecionado");
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
          setMessageModal("Status do agendamento inválido para cancelamento.");
          setErrorModalVisible(true);
        }
      } catch (error) {
        console.error("Erro ao deletar consulta:", error);
      }
    } else {
      setMessageModal("Nenhuma consulta selecionada para deletar.");
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
    if (resetSelection) {
      setSelectedConsultation(null);
      setConsultation(null);
      setResetSelection(false); // Reseta o controlador após o reset
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
