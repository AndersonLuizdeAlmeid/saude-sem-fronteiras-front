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

const AppointmentsDoctorPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false); // Estado para controlar a visibilidade do modal de erro
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleBackPress = () => {
    router.replace("/");
  };

  const sendToBackend = async () => {
    try {
      // setLoading(true);
      // await apiPost("/Users", {
      //   name,
      //   cpf,
      //   motherName,
      //   dateOfBirth,
      //   gender,
      //   language,
      // });
      const cpf = "Jh";
      router.replace({
        pathname: "/register/address-registry",
        params: {
          id,
        },
      });
    } catch (err: any) {
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  async function handleAddressRegistry() {
    if (
      true
      // name.trim() &&
      // cpf.trim() &&
      // motherName.trim() &&
      // dateOfBirth.trim() &&
      // gender.trim() &&
      // language.trim()
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
    const formattedDate = selectedDate.toLocaleDateString(); // Formata a data conforme necessário
    setDateOfBirth(formattedDate);
    setDatePickerVisibility(false);
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
            <Button onPress={handleAddressRegistry} style={styles.button}>
              PRÓXIMO
            </Button>
          </View>
        </Animated.View>
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
    paddingTop: 20,
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
});

export default AppointmentsDoctorPage;
