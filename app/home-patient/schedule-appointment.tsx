import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import ComboBox from "../../components/ComboBox"; // Atualize o caminho conforme necessário
import { router } from "expo-router";
import SelectionModal from "../../components/CustomModal";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Importar a biblioteca
import { colors } from "../../constants/colors";
import SimpleModal from "../../components/Modal";
import { apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PATIENT } from "../../constants/storage";
import { Patient } from "../../domain/Patient/patient";

const SchedulePatientPage: React.FC = () => {
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
  const [confirmForm, setConfirmForm] = useState<number>(0);
  const [specialities, setSpecialities] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [doctors, setDoctors] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [freeTimes, setFreeTimes] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);

  const [speciality, setSpeciality] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [doctor, setDoctor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [freeTime, setFreeTime] = useState<{
    id: number;
    description: string;
  } | null>(null);

  const [changeSpeciality, setChangeSpeciality] = useState<number>(0);

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
      router.replace("/home-patient");
    } else {
      setErrorModalVisible(false);
    }
  };

  async function handleSchedule() {
    if (!date || !freeTime) {
      setMessageModal("Selecione uma data e horário");
      setErrorModalVisible(true);
      return;
    }

    // Verifica se todos os campos necessários estão preenchidos
    setLoading(true);
    const duration = 0;
    const doctorId = doctor?.id;
    console.log(patientId);
    const dateTime = `${date}T${freeTime.description}:00`;
    await apiPost("/Appointment", {
      date: dateTime,
      duration,
      doctorId,
      patientId,
    });

    const responseAppointment = await apiGet(
      `/Appointment/doctorPatient/${doctorId}/${patientId}`
    );
    if (responseAppointment.data !== null) {
      const appointmentId = responseAppointment.data;
      console.log(dateTime);
      const responseAppointmentPrice = await apiGet(
        `/Doctor/price/${doctorId}`
      );
      if (responseAppointmentPrice.data !== null) {
        const price = responseAppointmentPrice.data;
        await apiPost("/Schedule", {
          price,
          scheduledDate: dateTime,
          appointmentId,
        });
        setConfirmForm(1);
        setMessageModal("Consulta agendada!");
        setErrorModalVisible(true);
      }
    }
  }

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const handleConfirm = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    const currentDate = new Date();

    if (selectedDate > currentDate) {
      setDate(formattedDate);
    } else {
      setMessageModal("Data da consulta tem que ser maior que hoje.");
      setErrorModalVisible(true);
      setDate("");
    }

    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  useEffect(() => {
    const loadSpecialities = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_PATIENT);
        if (value) {
          const patient: Patient = JSON.parse(value);
          setPatientId(patient.id);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
        setLoading(true);
        const response = await apiGet("/Speciality/all");
        if (response && Array.isArray(response.data)) {
          const formattedSpecialities = response.data.map(
            (country: { id: number; description: string }) => ({
              id: country.id,
              label: country.description,
              comparativeId: country.id,
            })
          );
          setSpecialities(formattedSpecialities);
        } else {
          setSpecialities([]);
          setMessageModal("Erro ao selecionar as especialidades");
          setErrorModalVisible(true);
        }
      } catch (err: any) {
        setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialities();
  }, []);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/Doctor/specialityId/${speciality?.id}`);
        if (response && Array.isArray(response.data)) {
          const formattedDoctors = response.data.map(
            (doctor: { id: number; name: string }) => ({
              id: doctor.id,
              label: doctor.name,
              comparativeId: doctor.id,
            })
          );

          setDoctors(formattedDoctors);
        } else {
          setDoctors([]);
          setMessageModal("Erro ao selecionar os médicos");
          setErrorModalVisible(true);
        }
      } catch (err: any) {
        //setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [changeSpeciality]);

  function formatDateWithTime(date: Date, time: string) {
    // Quebra o horário no formato HH:MM e ajusta na data
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date); // Cria uma nova instância da data para não modificar a original
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
  }

  useEffect(() => {
    const loadFreeTimes = async () => {
      try {
        setLoading(true);
        const response = await apiGet(
          `/Appointment/freeTime/${doctor?.id}/${date}`
        );
        if (response && Array.isArray(response.data)) {
          // Transformar a lista de horários em objetos com id e label
          const formattedFreeTime = response.data.map(
            (freeTime: string, index: number) => ({
              id: index + 1, // Gera um id único para cada horário
              label: freeTime, // Usa o horário como label
              comparativeId: index + 1, // Usa o mesmo id gerado como comparativo
            })
          );
          setFreeTimes(formattedFreeTime);
        } else {
          setFreeTimes([]);
          setMessageModal("Não foi possível selecionar os horários livres");
          setErrorModalVisible(true);
          setDate("");
        }
      } catch (err: any) {
        //setErrorModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadFreeTimes();
  }, [date]);

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
        title="Cadastrar Consulta"
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
                  label="Especialidade"
                  data={specialities}
                  onSelect={(selectedSpeciality) => {
                    setSpeciality({
                      id: selectedSpeciality.id,
                      description: selectedSpeciality.label,
                    });
                    setChangeSpeciality(selectedSpeciality.id);
                    console.log(changeSpeciality);
                  }}
                  placeholder="Escolha a Especialidade"
                  value={speciality ? speciality.description : ""} // Corrigido para refletir o estado atual
                />
              </View>
              <View style={styles.container}>
                <ComboBox
                  label="Médico"
                  data={doctors}
                  onSelect={(selectedDoctor) => {
                    setDoctor({
                      id: selectedDoctor.id,
                      name: selectedDoctor.label,
                    });
                  }}
                  placeholder="Escolha o Médico"
                  value={doctor?.name || ""}
                />
              </View>
              <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.inputName}>Data da Consulta</Text>
                <View style={styles.input}>
                  <Text style={styles.inputText}>
                    {date || "Aperte aqui para adicionar a data"}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.container}>
                <ComboBox
                  label="Horários"
                  data={freeTimes}
                  onSelect={(selectedFreeTime) => {
                    setFreeTime({
                      id: selectedFreeTime.id,
                      description: selectedFreeTime.label,
                    });
                  }}
                  placeholder="Escolha o Horário Inicial"
                  value={freeTime?.description || ""}
                />
              </View>
              <Button onPress={handleSchedule} style={styles.button}>
                AGENDAR
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
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default SchedulePatientPage;
