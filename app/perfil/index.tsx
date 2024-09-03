import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";
import { apiPost } from "../../utils/api";
import SimpleModal from "../../components/Modal";

const PatientRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [previousSurgeries, setPreviousSurgeries] = useState("");
  const [medicines, setMedicines] = useState("");
  const [emergencyNumber, seteEmergencyNumber] = useState("");
  const [userId, setUserId] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [erro, setErro] = useState<number>(0);
  const [cpf, setCpf] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [credentialsId, setCredentialsId] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.replace("/register/doctor-patient-register");
  };

  async function handlePatientRegistry() {
    try {
      setLoading(true);
      await apiPut("/Patient", {
        bloodType,
        allergies,
        medicalCondition,
        previousSurgeries,
        medicines,
        emergencyNumber,
        userId,
      });

      await apiPost("/Users", {
        name,
        cpf,
        motherName,
        dateOfBirth,
        gender,
        language,
        credentialsId,
      });

      router.replace("/home-patient");
    } catch (err: any) {
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  const handleErrorAndRedirect = () => {
    if (erro === 1) {
      setErro(0); // Limpa o erro
      router.replace("/"); // Redireciona para a página inicial
    }
  };

  useEffect(() => {
    handleErrorAndRedirect();
  }, [erro]);

  async function handleAddressRegistry() {
    if (
      name.trim() &&
      cpf.trim() &&
      motherName.trim() &&
      dateOfBirth.trim() &&
      gender.trim() &&
      language.trim()
    ) {
      await handlePatientRegistry(); // Envia os dados para o backend antes de redirecionar
    } else {
      setErrorModalVisible(true); // Exibe o modal de erro se algum campo não estiver preenchido
    }
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
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
          setErro(1); // Define o erro se o usuário não for encontrado
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
        title="Minha Página"
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
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.inputPrincipal}
                autoCapitalize="none"
              />
              <Input
                label="Nome"
                autoCorrect={false}
                placeholder="fulano de tal"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                }}
                style={styles.input}
                autoCapitalize="none"
              />
              <Input
                label="CPF"
                autoCorrect={false}
                placeholder="036.745.720-28"
                value={cpf}
                onChangeText={(value) => {
                  setCpf(value);
                }}
                style={styles.input}
              />
              <Input
                label="Nome da Mãe"
                autoCorrect={false}
                placeholder="Fulana de tal"
                value={motherName}
                onChangeText={(value) => {
                  setMotherName(value);
                }}
                style={styles.input}
              />
              <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.inputName}>Data de Nascimento</Text>
                <View style={styles.inputData}>
                  <Text style={styles.inputText}>
                    {dateOfBirth || "Aperte aqui para adicionar a data"}
                  </Text>
                </View>
              </TouchableOpacity>
              <Input
                label="Gênero"
                autoCorrect={false}
                placeholder="masculino"
                value={gender}
                onChangeText={(value) => {
                  setGender(value);
                }}
                style={styles.input}
              />
              <Input
                label="Idioma"
                autoCorrect={false}
                placeholder="Português"
                value={language}
                onChangeText={(value) => {
                  setLanguage(value);
                }}
                style={styles.input}
              />
              <Input
                label=""
                autoCorrect={false}
                placeholder=""
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.customLine}
              />
              <Input
                label="Tipo Sanguíneo"
                autoCorrect={false}
                placeholder="O+"
                value={bloodType}
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.input}
              />
              <Input
                label="Alergias"
                autoCorrect={false}
                placeholder="Abelha, Gato"
                value={allergies}
                onChangeText={(value) => {
                  setAllergies(value);
                }}
                style={styles.input}
              />
              <Input
                label="Condição Médica"
                autoCorrect={false}
                placeholder="Saudável"
                value={medicalCondition}
                onChangeText={(value) => {
                  setMedicalCondition(value);
                }}
                style={styles.input}
              />
              <Input
                label="Cirurgias Anteriores"
                autoCorrect={false}
                placeholder="Apêndice"
                value={previousSurgeries}
                onChangeText={(value) => {
                  setPreviousSurgeries(value);
                }}
                style={styles.input}
              />
              <Input
                label="Medicamentos"
                autoCorrect={false}
                placeholder="Rivotril"
                value={medicines}
                onChangeText={(value) => {
                  setMedicines(value);
                }}
                style={styles.input}
              />
              <Input
                label="Número de emergencia"
                autoCorrect={false}
                placeholder="54997020294"
                value={emergencyNumber}
                onChangeText={(value) => {
                  seteEmergencyNumber(value);
                }}
                style={styles.input}
              />
              <Input
                label=""
                autoCorrect={false}
                placeholder=""
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.customLine}
              />
              <Button onPress={handlePatientRegistry} style={styles.button}>
                CADASTRAR
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message="Por favor, preencha todos os campos."
      />
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
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
    paddingVertical: 20, // Adicione espaçamento vertical
    alignItems: "center", // Centraliza o conteúdo horizontalmente
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
  button: {
    marginTop: 20,
    width: 250,
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
  inputText: {
    color: colors.white,
  },
  inputName: {
    color: colors.white,
    paddingVertical: 5,
  },
  customLine: {
    width: 320,
    height: 2,
    backgroundColor: "black",
    marginVertical: 35,
  },
});

export default PatientRegistryPage;
function apiPut(
  arg0: string,
  arg1: {
    bloodType: string;
    allergies: string;
    medicalCondition: string;
    previousSurgeries: string;
    medicines: string;
    emergencyNumber: string;
    userId: number;
  }
) {
  throw new Error("Function not implemented.");
}
