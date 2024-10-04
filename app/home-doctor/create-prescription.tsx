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
import { Screening } from "../../domain/Screening/screeningShow";

const CreatePrescriptionPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [messageModal, setMessageModal] = useState<string>("");
  const [namePatient, setNamePatient] = useState<string>("");

  const [medicines, setMedicines] = useState<string>();

  const [quantity, setQuantity] = useState<string>();
  const [dosage, setDosage] = useState<string>();
  const [observation, setObservation] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [documentIdAux, setDocumentIdAux] = useState<number>();
  const [createDocument, setCreateDocument] = useState<number>();

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

  const includeNewDocumentAndPrescription = async () => {
    const value = await AsyncStorage.getItem(STORAGE_APPOINTMENT);
    if (createDocument !== 1) {
      if (value) {
        const typeDocument = 3;
        const dateTime = getCurrentDateTime();
        const appointment: Appointment = JSON.parse(value);
        const appointmentId = appointment.id;
        await apiPost("/Document", {
          typeDocument,
          dateDocument: dateTime,
          appointmentId,
        });

        const documentResponse = await apiGet<number>(
          `/Document/last/${appointmentId}`
        );
        if (documentResponse.data !== null) {
          setDocumentIdAux(documentResponse.data);
          const documentId = documentResponse.data;
          await apiPost("/Prescription", {
            description,
            documentId,
          });
          setCreateDocument(1);
          console.log(documentResponse.data);
          return documentResponse.data;
        }
      }
    }
    return documentIdAux;
  };

  async function handleAddMedicine() {
    if (
      description?.trim() ||
      quantity?.trim() ||
      dosage?.trim() ||
      observation?.trim()
    ) {
      try {
        setLoading(true);

        const documentId = await includeNewDocumentAndPrescription();
        const responseCertificateId = await apiGet<number>(
          `/Prescription/id/${documentId}`
        );
        if (responseCertificateId.data !== null) {
          await apiPost("/Medicine", {
            description,
            quantity,
            dosage,
            observation,
            prescriptionId: responseCertificateId.data,
          });
          if (medicines !== null && medicines !== undefined) {
            const medicinesString = `${medicines}, ${description}`;
            setMedicines(medicinesString);
          } else {
            const medicinesString = `${description}`;
            setMedicines(medicinesString);
          }
          setQuantity("");
          setDosage("");
          setObservation("");
          setDescription("");
          setMessageModal("Medicamento adicionado à receita.");
          setErrorModalVisible(true);
        }
      } catch {
        setMessageModal("Problema ao adicionar medicamento.");
        setErrorModalVisible(true);
        setLoading(false);
      }
      setLoading(false);
    }
  }

  async function handleAuxiliar() {}

  async function handleSchedule() {
    const responseCertificate = await apiGet<Screening>(
      `/Prescription/document/${documentIdAux}`
    );
    if (responseCertificate.data !== null) {
      setStart(1);
      setMessageModal("Receita médica criada com sucesso.");
      setErrorModalVisible(true);
    } else {
      setMessageModal("Erro ao gerar documento.");
      setErrorModalVisible(true);
      setLoading(false);
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
        title="Criação de Receita"
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
                  label="Medicamento"
                  autoCorrect={false}
                  placeholder="Aerolin Spary"
                  value={description}
                  onChangeText={(value) => {
                    setDescription(value);
                  }}
                  style={styles.input}
                />
                <Input
                  label="Quantidade"
                  autoCorrect={false}
                  placeholder="1 Caixa"
                  value={quantity}
                  onChangeText={(value) => {
                    setQuantity(value);
                  }}
                  style={styles.input}
                />
                <Input
                  label="Dosagem"
                  autoCorrect={false}
                  placeholder="Usar 1 dose antes de esforço físico"
                  value={dosage}
                  onChangeText={(value) => {
                    setDosage(value);
                  }}
                  style={styles.input}
                />
                <Input
                  label="Observação"
                  autoCorrect={false}
                  placeholder="Caso necessário, aumentar para 2 doses"
                  value={observation}
                  onChangeText={(value) => {
                    setObservation(value);
                  }}
                  style={styles.input}
                />
              </View>
              <Button onPress={handleAuxiliar} style={styles.buttonShow}>
                {medicines}
              </Button>
              <Button onPress={handleAddMedicine} style={styles.button}>
                ADICIONAR MEDICAMENTO
              </Button>
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
  buttonShow: {
    marginTop: 20,
    width: 380,
    borderColor: colors.black,
    alignItems: "center",
  },
});

export default CreatePrescriptionPage;
