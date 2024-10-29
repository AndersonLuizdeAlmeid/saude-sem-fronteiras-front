import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import ComboBox from "../../components/ComboBox";
import { router } from "expo-router";
import SelectionModal from "../../components/CustomModal";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { colors } from "../../constants/colors";
import SimpleModal from "../../components/Modal";
import { apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_APPOINTMENT, STORAGE_DOCTOR } from "../../constants/storage";
import { Doctor } from "../../domain/Doctor/doctor";
import { Appointment } from "../../domain/Appointment/appointment";
import Input from "../../components/Input";
import {
  APPOINTMENT_DONT_HAVE_DOCTOR,
  CREATE_INVOICE,
  FAIL_STORAGE_DOCTOR,
  SELECT_APPOINTMENT_BEFORE,
  SELECT_PATIENT_BEFORE,
} from "../../utils/messages";

const CreateInvoicePage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [agency, setAgency] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [digit, setDigit] = useState<string>("");
  const [patientId, setPatientId] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<number>();

  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [messageModal, setMessageModal] = useState<string>("");

  const [patients, setPatients] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);

  const [patient, setPatient] = useState<{
    id: number;
    description: string;
  } | null>(null);

  const [appointments, setAppointments] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);

  const [appointment, setAppointment] = useState<{
    id: number;
    date: string;
  } | null>(null);

  const handleBackPress = () => {
    router.replace("/home-doctor/invoice-doctor");
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
      router.replace("/home-doctor/invoice-doctor");
    } else {
      setErrorModalVisible(false);
    }
  };

  async function handleSchedule() {
    if (patientId !== null) {
      const value = await AsyncStorage.getItem(STORAGE_APPOINTMENT);
      if (value) {
        const appointmentObject: Appointment = JSON.parse(value);
        if (appointmentObject !== null) {
          await apiPost("/Invoice", {
            dueDate: date,
            description,
            agency,
            account,
            digit,
            patientId,
            doctorId: appointmentObject.doctorId,
            appointmentId: appointmentObject.id,
          });
          setStart(1);
          setMessageModal(CREATE_INVOICE);
          setErrorModalVisible(true);
        } else {
          setMessageModal(APPOINTMENT_DONT_HAVE_DOCTOR);
          setErrorModalVisible(true);
        }
      } else {
        setMessageModal(SELECT_APPOINTMENT_BEFORE);
        setErrorModalVisible(true);
      }
    } else {
      setMessageModal(SELECT_PATIENT_BEFORE);
      setErrorModalVisible(true);
    }
  }

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
    const loadPatients = async () => {
      try {
        setLoading(true);

        const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
        if (value) {
          const doctor: Doctor = JSON.parse(value);
          const responsePatients = await apiGet(
            `/Appointment/patients/doctor/${doctor.id}`
          );
          if (responsePatients && Array.isArray(responsePatients.data)) {
            const formattedPatients = responsePatients.data.map(
              (patient: { id: number; name: string }) => ({
                id: patient.id,
                label: patient.name,
                comparativeId: patient.id,
              })
            );
            setPatients(formattedPatients);
          }
        } else {
          setMessageModal(FAIL_STORAGE_DOCTOR);
          setErrorModalVisible(true);
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } catch {}
    };
    loadPatients();
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
        if (value) {
          const doctor: Doctor = JSON.parse(value);
          const responseAppointments = await apiGet(
            `/Appointment/doctor/patient/${doctor.id}/${patientId}`
          );
          if (
            responseAppointments &&
            Array.isArray(responseAppointments.data)
          ) {
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

            const formattedAppointments = responseAppointments.data.map(
              (appointment: { id: number; date: string }) => ({
                id: appointment.id,
                label: formatDate(appointment.date),
                comparativeId: appointment.id,
              })
            );
            setAppointments(formattedAppointments);
          }
        } else {
          setMessageModal(FAIL_STORAGE_DOCTOR);
          setErrorModalVisible(true);
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } catch {}
    };
    loadAppointments();
  }, [patientId]);

  const setAppointmentStorage = async (appointment: number) => {
    const appointmentResponse = await apiGet<Appointment>(
      `/Appointment/id/${appointment}`
    );
    AsyncStorage.setItem(
      STORAGE_APPOINTMENT,
      JSON.stringify(appointmentResponse.data)
    );
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
        title="Criação de fatura"
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
                <ComboBox
                  label="Paciente"
                  data={patients}
                  onSelect={(selectedPatient) => {
                    setPatient({
                      id: selectedPatient.id,
                      description: selectedPatient.label,
                    });
                    setPatientId(selectedPatient.id);
                  }}
                  placeholder="Escolha o paciente"
                  value={patient ? patient.description : ""}
                />
                <ComboBox
                  label="Consulta"
                  data={appointments}
                  onSelect={(selectedAppointment) => {
                    setAppointment({
                      id: selectedAppointment.id,
                      date: selectedAppointment.label,
                    });
                    setAppointmentStorage(selectedAppointment.id);
                  }}
                  placeholder="Escolha a consulta"
                  value={appointment ? appointment.date : ""}
                />
                <TouchableOpacity onPress={showDatePicker}>
                  <Text style={styles.inputName}>Data da vencimento</Text>
                  <View style={styles.input}>
                    <Text style={styles.inputText}>
                      {date || "Aperte aqui para adicionar a data"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Input
                  label="Descrição"
                  autoCorrect={false}
                  placeholder="Cobrar juros após vencimento"
                  value={description}
                  onChangeText={(value) => {
                    setDescription(value);
                  }}
                  style={styles.inputSecundary}
                />
                <Input
                  label="Agencia"
                  autoCorrect={false}
                  placeholder="1234"
                  value={agency}
                  onChangeText={(value) => {
                    setAgency(value);
                  }}
                  style={styles.inputSecundary}
                />
                <Input
                  label="Conta"
                  autoCorrect={false}
                  placeholder="56789"
                  value={account}
                  onChangeText={(value) => {
                    setAccount(value);
                  }}
                  style={styles.inputSecundary}
                />
                <Input
                  label="Digito da Conta"
                  autoCorrect={false}
                  placeholder="0"
                  value={digit}
                  onChangeText={(value) => {
                    setDigit(value);
                  }}
                  style={styles.inputSecundary}
                />
              </View>
              <Button onPress={handleSchedule} style={styles.button}>
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
    paddingVertical: 20,
    alignItems: "center",
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.gray_2,
    borderColor: colors.white,
    borderWidth: 2,
    borderRadius: 5,
  },
  inputText: {
    color: colors.white,
  },
  inputName: {
    color: colors.white,
    paddingVertical: 5,
  },
  inputSecundary: {
    width: 320,
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default CreateInvoicePage;
