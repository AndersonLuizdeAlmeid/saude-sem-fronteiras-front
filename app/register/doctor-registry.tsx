import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import { STORAGE_DOCTOR, STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiPost } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import { Doctor } from "../../domain/Doctor/doctor";

const daysOfWeek = [
  { id: 0, label: "D", value: "Sunday" },
  { id: 1, label: "S", value: "Monday" },
  { id: 2, label: "T", value: "Tuesday" },
  { id: 3, label: "Q", value: "Wednesday" },
  { id: 4, label: "Q", value: "Thursday" },
  { id: 5, label: "S", value: "Friday" },
  { id: 6, label: "S", value: "Saturday" },
];

const DoctorRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [registryNumber, setRegistryNumber] = useState("");
  const [initialHour, setInitialHour] = useState("");
  const [finalHour, setFinalHour] = useState("");
  const [consultationPrice, setConsultationPrice] = useState("");
  const [userId, setUserId] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  async function handleDoctorRegistry() {
    try {
      setLoading(true);

      const days = selectedDays.sort().join("");

      await apiPost("/Doctor", {
        registryNumber,
        initialHour,
        finalHour,
        consultationPrice,
        days,
        userId,
      });

      const response = await apiGet<Doctor>(`/Doctor/id/${userId}`);
      AsyncStorage.setItem(STORAGE_DOCTOR, JSON.stringify(response.data)).then(
        () => router.push("/register/doctor-speciality")
      );
    } catch (err: any) {
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  const handleTimeInput = (
    value: string,
    setTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Remove qualquer caractere que não seja número
    const cleanedValue = value.replace(/[^0-9]/g, "");

    if (cleanedValue.length === 1) {
      setTime(`0${cleanedValue}:00`); // Adiciona 0 à esquerda e :00
    } else if (cleanedValue.length === 2) {
      const hours = parseInt(cleanedValue, 10);
      if (hours >= 0 && hours <= 24) {
        setTime(`${cleanedValue.padStart(2, "0")}:00`); // Formata horas corretamente
      } else {
        // Se as horas forem inválidas, não faça nada ou exiba um erro
        setTime("");
      }
    } else {
      setTime("");
    }
  };

  const handleDaySelection = (id: number) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(id)
        ? prevSelectedDays.filter((day) => day !== id)
        : [...prevSelectedDays, id]
    );
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_USER);
        if (value) {
          const user: User = JSON.parse(value);
          setUserId(user.id);
          setName(user.name);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } catch (error) {
        console.error("Erro ao recuperar ou parsear do AsyncStorage:", error);
      }
    };

    fetchUser();
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
        title="Cadastro do Médico"
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
              <Input
                label=""
                autoCorrect={false}
                value={name}
                style={styles.inputPrincipal}
                autoCapitalize="none"
              />
              <Input
                label="Número de Registro"
                autoCorrect={false}
                placeholder="RS-12345"
                value={registryNumber}
                onChangeText={(value) => {
                  setRegistryNumber(value);
                }}
                style={styles.input}
              />
              <Input
                label="Horário inicial de atendimento"
                autoCorrect={false}
                placeholder="18:00"
                value={initialHour}
                onChangeText={setInitialHour} // Permite que o usuário insira o valor sem formatação
                onBlur={() => handleTimeInput(initialHour, setInitialHour)} // Formatação quando o campo perde o foco
                style={styles.input}
              />
              <Input
                label="Horário final de atendimento"
                autoCorrect={false}
                placeholder="06:00"
                value={finalHour}
                onChangeText={setFinalHour} // Permite que o usuário insira o valor sem formatação
                onBlur={() => handleTimeInput(finalHour, setFinalHour)} // Formatação quando o campo perde o foco
                style={styles.input}
              />
              <View style={styles.daysOfWeekContainer}>
                <Text style={styles.daysOfWeekLabel}>
                  Dia da semana com atendimento
                </Text>
                <View style={styles.daysOfWeek}>
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day.id) &&
                          styles.selectedDayButton,
                      ]}
                      onPress={() => handleDaySelection(day.id)}
                    >
                      <Text style={styles.dayLabel}>{day.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Input
                label="Preço de consulta"
                autoCorrect={false}
                placeholder="R$100,00"
                value={consultationPrice}
                onChangeText={(value) => {
                  setConsultationPrice(value);
                }}
                style={styles.input}
              />
              <Button onPress={handleDoctorRegistry} style={styles.button}>
                CADASTRAR
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
        onClose={() => setErrorModalVisible(false)}
        message="Por favor, preencha todos os campos."
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
  },
  inputPrincipal: {
    width: 320,
    height: 50,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: colors.black,
  },
  daysOfWeekContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  daysOfWeekLabel: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 10,
  },
  daysOfWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 320,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayButton: {
    backgroundColor: colors.gray_2,
  },
  dayLabel: {
    color: colors.white,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default DoctorRegistryPage;
