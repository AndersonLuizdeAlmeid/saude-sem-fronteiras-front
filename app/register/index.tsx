import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
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
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Importar a biblioteca
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_CREDENTIALS, STORAGE_USER } from "../../constants/storage";
import { Credentials } from "../../domain/Credentials/credentials";

const RegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false); // Estado para controlar a visibilidade do modal de erro
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dateBirth, setDateBirth] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [phone, setPhone] = useState("");
  const [credentialsId, setCredentialsId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const sendToBackend = async () => {
    try {
      setLoading(true);
      console.log(dateBirth);
      await apiPost("/Users", {
        name,
        cpf,
        motherName,
        dateBirth,
        gender,
        language,
        phone,
        credentialsId,
      });
      const response = await apiGet<Credentials>(
        `/Users/credentialsId/${credentialsId}`
      );
      AsyncStorage.setItem(STORAGE_USER, JSON.stringify(response.data)).then(
        () => router.push("/register/address-registry")
      );
    } catch (err: any) {
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_CREDENTIALS);
        if (value) {
          const credentials: Credentials = JSON.parse(value);
          setCredentialsId(credentials.id);
        } else {
          console.log("Nenhum valor encontrado no AsyncStorage");
        }
      } catch (error) {
        console.error("Erro ao recuperar ou parsear do AsyncStorage:", error);
      }
    };
    fetchCredentials();
  }, []);

  async function handleAddressRegistry() {
    if (
      name.trim() &&
      cpf.trim() &&
      motherName.trim() &&
      dateBirth.trim() &&
      gender.trim() &&
      language.trim()
    ) {
      await sendToBackend(); // Envia os dados para o backend antes de redirecionar
    } else {
      setErrorModalVisible(true); // Exibe o modal de erro se algum campo não estiver preenchido
    }
  }

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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleConfirm = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setDateBirth(formattedDate);
    console.log(dateBirth);
    console.log(formattedDate);
    setDatePickerVisibility(false);
  };

  const validateCPF = (value: string) => {
    // Remove todos os caracteres que não sejam números
    const cleanCPF = value.replace(/\D/g, "");

    if (cleanCPF.length !== 11) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++)
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++)
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
  };

  const formatCPF = (value: string) => {
    // Remove todos os caracteres que não sejam números
    const cleanCPF = value.replace(/\D/g, "");

    if (cleanCPF.length !== 11) return value;

    // Formata o CPF com pontos e hífen
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleCPFInput = (
    value: string,
    setTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Valida o CPF
    if (validateCPF(value)) {
      // Se for válido, formata o CPF
      const formattedCPF = formatCPF(value);
      setCpf(formattedCPF);
    } else {
      // Se for inválido, pode exibir uma mensagem de erro ou limpar o campo
      setErrorModalVisible(true);
      setCpf("");
    }
  };

  const validatePhone = (value: string) => {
    const cleanPhone = value.replace(/\D/g, "");
    if (cleanPhone.length < 12 || cleanPhone.length > 13) return false;
    if (!cleanPhone.startsWith("55")) return false;

    return true;
  };

  const formatPhone = (value: string) => {
    const cleanPhone = value.replace(/\D/g, "");
    if (cleanPhone.length < 12 || cleanPhone.length > 13) return value;

    if (cleanPhone.length === 13) {
      return cleanPhone.replace(
        /(\d{2})(\d{2})(\d{5})(\d{4})/,
        "($1) $2 $3-$4"
      );
    } else {
      return cleanPhone.replace(
        /(\d{2})(\d{2})(\d{4})(\d{4})/,
        "($1) $2 $3-$4"
      );
    }
  };

  const handlePhoneInput = (
    value: string,
    setTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Valida o telefone
    if (validatePhone(value)) {
      const formattedPhone = formatPhone(value);
      setPhone(formattedPhone);
    } else {
      setErrorModalVisible(true);
      setPhone("");
    }
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
        title="Minha Página"
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
                onBlur={() => handleCPFInput(cpf, setCpf)}
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
                    {dateBirth || "Aperte aqui para adicionar a data"}
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
                label="Telefone"
                autoCorrect={false}
                placeholder="5554997020294"
                value={phone}
                onBlur={() => handlePhoneInput(phone, setPhone)}
                onChangeText={(value) => {
                  setPhone(value);
                }}
                style={styles.input}
              />
              <Button onPress={handleAddressRegistry} style={styles.button}>
                PRÓXIMO
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
        onClose={() => setErrorModalVisible(false)}
        message="Algum campo não foi preenchido, ou foi preenchido de maneira incorreta."
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
    padding: 10, // Ajuste de acordo com a necessidade
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
  inputName: {
    color: colors.white,
    paddingVertical: 5,
  },
  scrollViewContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default RegistryPage;
