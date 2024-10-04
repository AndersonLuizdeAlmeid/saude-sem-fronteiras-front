import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import SimpleModal from "../../components/Modal"; // Importe o modal personalizado
import { apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PATIENT } from "../../constants/storage";
import { Patient } from "../../domain/Patient/patient";

const ScreeningPatientPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false); // Estado para controlar a visibilidade do modal de erro
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [symptons, setSymptons] = useState("");
  const [dateSymptons, setDateSymptons] = useState("");
  const [continuosMedicine, setContinuosMedicine] = useState("");
  const [allergies, setAllergies] = useState("");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [confirmForm, setConfirmForm] = useState<number>(0);

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCloseErrorModal = () => {
    if (confirmForm === 1) {
      setErrorModalVisible(false);
      router.replace("/home-patient/emergency-patient");
    } else {
      setErrorModalVisible(false);
    }
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  async function handleAppointmentRegistry() {
    setLoading(true);
    if (symptons.trim() || dateSymptons.trim()) {
      const duration = 0;
      const doctorId = 0;
      const dateTime = getCurrentDateTime();

      const value = await AsyncStorage.getItem(STORAGE_PATIENT);

      if (value) {
        const patient: Patient = JSON.parse(value);

        const patientId = patient.id;
        await apiPost("/Appointment", {
          date: dateTime,
          duration,
          doctorId,
          patientId,
        });

        const response = await apiGet(
          `/Appointment/lastAppointment/patient/${patientId}`
        );
        if (response.data !== null) {
          const price = 100;
          const appointmentId = response.data;
          await apiPost("/Emergency", {
            price,
            appointmentId,
          });
          const responseEmergency = await apiGet(
            `/Emergency/lastEmergency/patient/${patientId}`
          );
          if (responseEmergency.data !== null) {
            const emergencyId = responseEmergency.data;
            await apiPost("/Screening", {
              symptons,
              dateSymptons,
              continuosMedicine,
              allergies,
              observations,
              emergencyId,
            });
            setConfirmForm(1);
            setMessage(
              "Consulta emergencial cadastrada. Um médico entrará em contato com você via whatsapp, aguarde!"
            );
            setErrorModalVisible(true);
          } else {
            setMessage("Problema ao selecionar a ultima consulta emergencial");
            setErrorModalVisible(true);
          }
        } else {
          setMessage("Problema ao selecionar a ultima consulta");
          setErrorModalVisible(true);
        }
      } else {
        console.log("Nenhum valor encontrado no AsyncStorage");
      }
    } else {
      setMessage("Necessário popular os campos de sintomas e data do sintoma.");
      setErrorModalVisible(true);
    }
    setLoading(false);
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
        title="Triagem"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <KeyboardAvoidingView
        style={styles.formContainer}
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
              <Input
                label="Sintomas"
                autoCorrect={false}
                placeholder="Febre, Dor de cabeça...."
                value={symptons}
                onChangeText={(value) => {
                  setSymptons(value);
                }}
                style={styles.input}
              />
              <Input
                label="Data dos sintomas"
                autoCorrect={false}
                placeholder="21-10 de manhã"
                value={dateSymptons}
                onChangeText={(value) => {
                  setDateSymptons(value);
                }}
                style={styles.input}
              />
              <Input
                label="Medicamento contínuo"
                autoCorrect={false}
                placeholder="Omeprazol, nenhum..."
                value={continuosMedicine}
                onChangeText={(value) => {
                  setContinuosMedicine(value);
                }}
                style={styles.input}
              />
              <Input
                label="Alergia"
                autoCorrect={false}
                placeholder="Camarão, nenhum..."
                value={allergies}
                onChangeText={(value) => {
                  setAllergies(value);
                }}
                style={styles.input}
              />
              <Input
                label="Observações"
                autoCorrect={false}
                placeholder="Dor começou após comer tal coisa.."
                value={observations}
                onChangeText={(value) => {
                  setObservations(value);
                }}
                style={styles.input}
              />
              <Button
                onPress={handleAppointmentRegistry}
                style={styles.button}
                loading={loading}
              >
                CRIAR
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
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={handleCloseErrorModal}
        message={message}
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
  input: {
    width: 320, // Defina o tamanho desejado aqui
    marginBottom: 20,
    alignSelf: "center", // Isso ajuda a centralizar
  },
  inputData: {
    width: 320,
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.gray_2,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: 5,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
  inputText: {
    color: colors.white,
  },
  scrollViewContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default ScreeningPatientPage;
