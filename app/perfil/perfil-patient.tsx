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
import { apiGet, apiPut } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import { Patient } from "../../domain/Patient/patient";
import { City } from "../../domain/City/city";
import { Address } from "../../domain/Address/address";
import ComboBox from "../../components/ComboBox";
import { State } from "../../domain/State/state";
import { Country } from "../../domain/Country/country";

const PerfilPatientPage: React.FC = () => {
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
  const [nameInput, setNameInput] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [erro, setErro] = useState<number>(0);
  const [cpf, setCpf] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [credentialsId, setCredentialsId] = useState<number>(0);
  const [country, setCountry] = useState<{
    id: number;
    description: string;
  } | null>(null);
  const [state, setState] = useState<{
    id: number;
    description: string;
    countryId: number;
  } | null>(null);
  const [city, setCity] = useState<{
    id: number;
    description: string;
    stateId: number;
  } | null>(null);
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [countries, setCountries] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [allStates, setAllStates] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [allCities, setAllCities] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [filteredStates, setFilteredStates] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [filteredCities, setFilteredCities] = useState<
    { id: number; label: string; comparativeId: number }[]
  >([]);
  const [countryString, setCountryString] = useState<string>("");
  const [stateString, setStateString] = useState<string>("");
  const [cityString, setCityString] = useState<string>("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
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
      const id = userId;
      var statusUser = true;
      await apiPut("/Users", {
        id,
        name,
        cpf,
        motherName,
        dateOfBirth,
        gender,
        language,
        statusUser,
        credentialsId,
      });
      const cityId = city?.id;
      await apiPut("/Address", {
        district,
        street,
        number,
        complement,
        cityId,
        userId,
      });

      router.replace("/home-patient");
    } catch (err: any) {
      console.log("FERROU");
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
    await handlePatientRegistry(); // Envia os dados para o backend antes de redirecionar
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês começa do 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const UserValue = await AsyncStorage.getItem(STORAGE_USER);
        if (UserValue) {
          const user: User = JSON.parse(UserValue);
          setUserId(user.id);
          setNameInput(user.name);
          setName(user.name);
          setCpf(user.cpf);
          setMotherName(user.motherName);
          setDateOfBirth(formatDate(user.dateBirth));
          setGender(user.gender);
          setLanguage(user.language);

          const patientResponse = await apiGet<Patient>(
            `/Patient/id/${user.id}`
          );
          setBloodType(patientResponse.data.bloodType);
          setAllergies(patientResponse.data.allergies);
          setMedicalCondition(patientResponse.data.medicalCondition);
          setPreviousSurgeries(patientResponse.data.previousSurgeries);
          setMedicines(patientResponse.data.medicines);
          seteEmergencyNumber(patientResponse.data.emergencyNumber);

          const address = await apiGet<Address>(`/Address/id/${user.id}`);
          setDistrict(address.data.district);
          setStreet(address.data.street);
          setNumber(address.data.number);
          setComplement(address.data.complement);

          const cityResponse = await apiGet<City>(
            `/City/id/${address.data.cityId}`
          );
          setCity(cityResponse.data);
          setCityString(`Cidade Atual -> ${cityResponse.data.description}`);

          const stateResponse = await apiGet<State>(
            `/State/id/${cityResponse.data.stateId}`
          );
          setState(stateResponse.data);
          setStateString(`Estado atual -> ${stateResponse.data.description}`);

          const countryResponse = await apiGet<Country>(
            `/Country/id/${stateResponse.data.countryId}`
          );
          setCountry(countryResponse.data);
          setCountryString(`País atual -> ${countryResponse.data.description}`);
        } else {
          setErro(1); // Define o erro se o usuário não for encontrado
        }
      } catch (error) {
        console.error("Erro ao recuperar ou parsear do AsyncStorage:", error);
      }
    };

    fetchUser();
    loadCountries();
  }, []);

  useEffect(() => {
    if (country) {
      setFilteredStates(
        allStates.filter((state) => state.comparativeId === country.id)
      );
    } else {
      setFilteredStates(allStates);
    }
    loadStates();
  }, [country]);

  useEffect(() => {
    if (state) {
      setFilteredCities(
        allCities.filter((city) => city.comparativeId === state.id)
      );
    } else {
      setFilteredCities(allCities);
    }
    loadCities();
  }, [state]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/Country/all");

      if (response && Array.isArray(response.data)) {
        const formattedCountries = response.data.map(
          (country: { id: number; description: string }) => ({
            id: country.id,
            label: country.description,
            comparativeId: country.id,
          })
        );
        setCountries(formattedCountries);
      } else {
        setCountries([]);
        console.log("KKKKKKKKKKKKKKKKKKKKK");
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      console.log("K");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/State/all");
      if (response && Array.isArray(response.data)) {
        const formattedStates = response.data.map(
          (state: { id: number; description: string; countryId: number }) => ({
            id: state.id,
            label: state.description,
            comparativeId: state.countryId,
          })
        );
        setAllStates(formattedStates);
      } else {
        setAllStates([]);
        console.log("KKKKKK");
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      console.log("KKKK");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/City/all");
      if (response && Array.isArray(response.data)) {
        const formattedCities = response.data.map(
          (city: { id: number; description: string; stateId: number }) => ({
            id: city.id,
            label: city.description,
            comparativeId: city.stateId,
          })
        );
        setAllCities(formattedCities);
      } else {
        setAllCities([]);
        console.log("KKK");
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      console.log("KK");
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
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
        title="Perfil Paciente"
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
                value={nameInput}
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
              <ComboBox
                label={countryString}
                data={countries}
                onSelect={(selectedCountry) => {
                  setCountry({
                    id: selectedCountry.id,
                    description: selectedCountry.label,
                  });
                }}
                placeholder="Escolha um país"
                value={country?.description || ""}
              />
              <ComboBox
                label={stateString}
                data={filteredStates}
                onSelect={(selectedState) => {
                  setState({
                    id: selectedState.id,
                    description: selectedState.label,
                    countryId: selectedState.comparativeId,
                  });
                }}
                placeholder="Escolha um Estado"
                value={state?.description || ""}
              />
              <ComboBox
                label={cityString}
                data={filteredCities}
                onSelect={(selectedCity) =>
                  setCity({
                    id: selectedCity.id,
                    description: selectedCity.label,
                    stateId: selectedCity.comparativeId,
                  })
                }
                placeholder="Escolha uma Cidade"
                value={city?.description || ""}
              />
              <Input
                label="Bairro"
                autoCorrect={false}
                placeholder="Ponte Seca"
                value={district}
                onChangeText={(value) => setDistrict(value)}
                style={styles.input}
              />
              <Input
                label="Rua"
                autoCorrect={false}
                placeholder="Evaristo Canal"
                value={street}
                onChangeText={(value) => setStreet(value)}
                style={styles.input}
              />
              <Input
                label="Número"
                autoCorrect={false}
                placeholder="186"
                value={number}
                onChangeText={(value) => setNumber(value)}
                style={styles.input}
              />
              <Input
                label="Complemento"
                autoCorrect={false}
                placeholder="Casa de dois andares"
                value={complement}
                onChangeText={(value) => setComplement(value)}
                style={styles.input}
              />
              <Button onPress={handleAddressRegistry} style={styles.button}>
                ALTERAR DADOS DO USUÁRIO
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

export default PerfilPatientPage;
