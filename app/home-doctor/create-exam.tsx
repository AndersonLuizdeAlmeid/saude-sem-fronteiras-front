import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import SelectionModal from "../../components/CustomModal";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Importar a biblioteca
import { colors } from "../../constants/colors";
import SimpleModal from "../../components/Modal";
import { apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_APPOINTMENT } from "../../constants/storage";
import { Appointment } from "../../domain/Appointment/appointment";
import Input from "../../components/Input";
import { Certificate } from "../../domain/Certificate/certificate";
import { Exam } from "../../domain/Exam/exam";

const CreateExamPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [patientId, setPatientId] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [messageModal, setMessageModal] = useState<string>("");
  const [namePatient, setNamePatient] = useState<string>("");
  const [cpfPatient, setCpfPatient] = useState<string>("");
  const [description, setDescription] = useState<string>();
  const [justification, setJustification] = useState<string>();
  const [localExam, setLocalExam] = useState<string>();
  const [start, setStart] = useState<number>();

  const handleBackPress = () => {
    router.replace("/home-doctor/documents-doctor");
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCloseErrorModal = () => {
    if (start === 1) {
      setErrorModalVisible(false);
      router.replace("/home-doctor/documents-doctor");
    } else {
      setErrorModalVisible(false);
    }
  };

  async function handleSchedule() {
    setLoading(true);
    const value = await AsyncStorage.getItem(STORAGE_APPOINTMENT);

    if (value) {
      const typeDocument = 2;
      const dateTime = getCurrentDateTime();
      const appointment: Appointment = JSON.parse(value);
      const appointmentId = appointment.id;
      console.log(typeDocument);
      await apiPost("/Document", {
        typeDocument,
        dateDocument: dateTime,
        appointmentId,
      });

      const documentResponse = await apiGet<number>(
        `/Document/last/${appointmentId}`
      );
      console.log(documentResponse.data);
      if (documentResponse.data !== null) {
        const documentId = documentResponse.data;
        await apiPost("/Exam", {
          description,
          justification,
          localExam,
          documentId,
        });
        console.log("KKKKKKKKKKKKKK");

        const responseCertificate = await apiGet<Exam>(
          `/Exam/document/${documentId}`
        );
        if (responseCertificate.data !== null) {
          setStart(1);
          setMessageModal("Exame Criado com sucesso.");
          setErrorModalVisible(true);
        } else {
          setMessageModal("Erro ao gerar documento.");
          setErrorModalVisible(true);
          setLoading(false);
        }
      } else {
        setMessageModal("Erro ao pegar documento.");
        setErrorModalVisible(true);
        setLoading(false);
      }
    }
  }

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const handleConfirm = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    setDate(formattedDate);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  useEffect(() => {
    const fetchPatientUser = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_APPOINTMENT);

        if (value) {
          const userPatient: Appointment = JSON.parse(value);
          const namePatientResponse = await apiGet<string>(
            `/Patient/name/id/${userPatient.patientId}`
          );
          setNamePatient(namePatientResponse.data);

          const cpfPatientResponse = await apiGet<string>(
            `/Patient/cpf/id/${userPatient.patientId}`
          );
          setCpfPatient(cpfPatientResponse.data);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } catch (error) {
        console.error("Erro ao recuperar ou parsear do AsyncStorage:", error);
      }
    };

    fetchPatientUser();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(offset.y, {
        toValue: 0,
        speed: 4,
        useNativeDriver: true,
        bounciness: 20,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Criação de Exame"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: opacity, transform: [{ translateY: offset.y }] },
            ]}
          >
            <View style={styles.formContainer}>
              <View style={styles.container}>
                <Input
                  label=""
                  autoCorrect={false}
                  value={`Paciente: ${namePatient}`}
                  style={styles.inputPrincipal}
                  autoCapitalize="none"
                />
                <Input
                  label=""
                  autoCorrect={false}
                  value={`CPF: ${cpfPatient}`}
                  style={styles.inputPrincipal}
                  autoCapitalize="none"
                />
                <Input
                  label="Descrição do exame necessário"
                  autoCorrect={false}
                  placeholder="Ultrasom de coluna região T12 a L5...."
                  value={description}
                  onChangeText={(value) => {
                    setDescription(value);
                  }}
                  style={styles.input}
                />
                <Input
                  label="Justificativa do exame"
                  autoCorrect={false}
                  placeholder="Após avaliação, paciente apresentar dor..."
                  value={justification}
                  onChangeText={(value) => {
                    setJustification(value);
                  }}
                  style={styles.input}
                />
                <Input
                  label="Local do exame"
                  autoCorrect={false}
                  placeholder="Regis Noal"
                  value={localExam}
                  onChangeText={(value) => {
                    setLocalExam(value);
                  }}
                  style={styles.input}
                />
              </View>
              <Button onPress={handleSchedule} style={styles.button}>
                GERAR DOCUMENTO
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
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
  scrollViewContent: {
    alignItems: "center",
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  inputPrincipal: {
    width: 320,
    height: 50,
    fontSize: 15,
    marginBottom: 5,
    backgroundColor: colors.black,
  },
  input: {
    width: 320,
    marginBottom: 15,
  },
  inputText: {
    color: colors.white,
  },
  inputName: {
    color: colors.white,
    paddingVertical: 5,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default CreateExamPage;
