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

const EmergencyPatientPage: React.FC = () => {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [resetSelection, setResetSelection] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [messageModal, setMessageModal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
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
        console.log(value);
        const patient: Patient = JSON.parse(value);
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
        } else {
          setMessageModal("Status do agendamento inválido");
          setErrorModalVisible(true);
          setLoading(false);
        }
      } catch (error) {
        setMessageModal("Erro ao deletar consulta");
        setErrorModalVisible(true);
        setLoading(false);
      }
    } else {
      setMessageModal("Nenhuma consulta selecionada para deletar");
      setErrorModalVisible(true);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAppointments();
  }, []);

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
});

export default EmergencyPatientPage;
