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

const ScheduledAppointmentPage: React.FC = () => {
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

  const getAppointments = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_PATIENT);
      if (value) {
        const patient: Patient = JSON.parse(value);
        setPatientId(patient.id);
        const response = await apiGet(`/Schedule/patient/${patient.id}`);
        if (response && Array.isArray(response.data)) {
          // Função para formatar a data
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
          }));

          setConsultations(formattedConsultations);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } else {
        setMessageModal("Formato de resposta inesperado");
        setErrorModalVisible(true);
      }
    } catch (error) {
      setMessageModal("Erro ao buscar consultas:");
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
          setMessageModal("Status do agendamento inválido");
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessageModal("Erro ao deletar consulta");
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal("Nenhuma consulta selecionada para deletar");
      setErrorModalVisible(true);
    }
  };

  useEffect(() => {
    getAppointments();
    setResetSelection(true);
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
                  "Olá, sou o paciente e estou pronto para a consulta"
                );
                router.replace("/home-patient");
              } else {
                setMessageModal("Problema com o número de telefone");
                setErrorModalVisible(true);
              }
            } else {
              setMessageModal("Telefone do médico é invalido.");
              setErrorModalVisible(true);
            }
          } else {
            setMessageModal("Consulta não pode ser iniciada ainda.");
            setErrorModalVisible(true);
          }
        } else {
          setMessageModal("Status do agendamento inválido");
          setErrorModalVisible(true);
        }
      }
    } else {
      setMessageModal("Nenhuma consulta selecionada");
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
