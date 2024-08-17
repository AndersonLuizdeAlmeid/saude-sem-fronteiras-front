import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Page from "../../components/Page";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import SimpleModal from "../../components/Modal"; // Importe o modal personalizado

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

  const handleBackPress = () => {
    router.replace("/");
  };

  async function handleAddressRegistry() {
    // SÓ DESCOMENTAR
    // if (
    //   name.trim() &&
    //   cpf.trim() &&
    //   motherName.trim() &&
    //   dateOfBirth.trim() &&
    //   gender.trim() &&
    //   language.trim()
    // ) {
    //   router.replace("/register/address-registry");
    // } else {
    //   setErrorModalVisible(true); // Exibe o modal de erro se algum campo não estiver preenchido
    // }
    router.replace("/register/address-registry");
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
              secureTextEntry
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
              secureTextEntry
              style={styles.input}
            />
            <Input
              label="Data de Nascimento"
              autoCorrect={false}
              placeholder="17/07/1997"
              value={dateOfBirth}
              onChangeText={(value) => {
                setDateOfBirth(value);
              }}
              secureTextEntry
              style={styles.input}
            />
            <Input
              label="Gênero"
              autoCorrect={false}
              placeholder="masculino"
              value={gender}
              onChangeText={(value) => {
                setGender(value);
              }}
              secureTextEntry
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
              secureTextEntry
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
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default AppointmentsDoctorPage;
