import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Animated,
  Platform,
} from "react-native";
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
import { apiDelete, apiGet, apiPut } from "../../utils/api";
import Button from "../../components/Button";
import { Doctor } from "../../domain/Doctor/doctor";
import { User } from "../../domain/User/user";
import SimpleModal from "../../components/Modal";
import { openWhatsApp } from "../../utils/whatsapp";

const ScheduledAppointmentPage: React.FC = () => {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [messageModal, setMessageModal] = useState<string>("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
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
    router.replace("/home-doctor/appointments");
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

  const getAppointments = async () => {
    try {
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
          console.log(response.data);
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
        console.error("Formato de resposta inesperado.");
      }
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStartShift = async () => {
    if (selectedConsultation) {
      if (selectedConsultation && selectedConsultation.id) {
        if (selectedConsultation.status === 2) {
          const phoneNumber = await apiGet(
            `/Schedule/patient/phone/${selectedConsultation.id}`
          );
          console.log(phoneNumber.data);
          if (phoneNumber !== null) {
            if (typeof phoneNumber.data === "string") {
              // Verifique e formate o número de telefone, se necessário
              const formattedPhoneNumber = formatPhoneNumber(phoneNumber.data);
              openWhatsApp(
                formattedPhoneNumber,
                "Olá, sou o paciente e estou pronto para a consulta"
              );
              router.replace("/home-doctor");
            } else {
              console.log("O número de telefone não é uma string válida");
            }
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

        await apiPut("/Schedule/", { id, price, status });
        selectedConsultation.status = 2;

        getAppointments();
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

        await apiPut("/Schedule/", { id, price, status });
        selectedConsultation.status = 4;

        getAppointments();
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

          getAppointments(); // Atualiza a lista de telefones
        } else {
          setMessageModal("Status do agendamento inválido para cancelamento.");
          setErrorModalVisible(true);
        }
      } catch (error) {
        console.error("Erro ao deletar consulta:", error);
      }
    } else {
      console.log("Nenhuma consulta selecionada para deletar");
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
          <WaitingListPage
            onSelect={handleSelectConsultation}
            consultations={consultations}
          />
        </ScrollView>
        <Button onPress={handleAcceptShift} style={styles.button}>
          ACEITAR CONSULTA
        </Button>
        <Button onPress={handleFinishShift} style={styles.button}>
          FINALIZAR CONSULTA
        </Button>
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
  button: {
    marginTop: 5,
    width: 250,
  },
});

export default ScheduledAppointmentPage;
