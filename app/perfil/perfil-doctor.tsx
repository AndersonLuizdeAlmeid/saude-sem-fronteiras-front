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
import { STORAGE_DOCTOR, STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";
import { apiGet, apiPut } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import { Patient } from "../../domain/Patient/patient";
import { City } from "../../domain/City/city";
import { Address } from "../../domain/Address/address";
import ComboBox from "../../components/ComboBox";
import { State } from "../../domain/State/state";
import { Country } from "../../domain/Country/country";
import {
  EROR_GET_DATA,
  ERROR_CITIES,
  ERROR_COUNTRIES,
  ERROR_PHONE,
  ERROR_STATES,
  FAIL_CITIES,
  FAIL_COUNTRIES,
  FAIL_STATES,
  FAIL_STORAGE_DOCTOR,
} from "../../utils/messages";
import { Doctor } from "../../domain/Doctor/doctor";

const PerfilPatientPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [message, setMessage] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [initialHour, setInitialHour] = useState("");
  const [finalHour, setFinalHour] = useState("");
  const [dias, setDias] = useState("");
  const [consultationPrice, setConsultationPrice] = useState("");
  const [userId, setUserId] = useState<number>(0);
  const [nameInput, setNameInput] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [erro, setErro] = useState<number>(0);
  const [cpf, setCpf] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [phone, setPhone] = useState("");
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
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const daysOfWeek = [
    { id: 0, label: "D", value: "Sunday" },
    { id: 1, label: "S", value: "Monday" },
    { id: 2, label: "T", value: "Tuesday" },
    { id: 3, label: "Q", value: "Wednesday" },
    { id: 4, label: "Q", value: "Thursday" },
    { id: 5, label: "S", value: "Friday" },
    { id: 6, label: "S", value: "Saturday" },
  ];

  const handleBackPress = () => {
    router.replace("/home-doctor");
  };

  async function handlePatientRegistry() {
    try {
      setLoading(true);
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
        phone,
      });

      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        const doctor: Doctor = JSON.parse(value);
        const days = selectedDays.sort().join("");
        const id = doctor.id;

        await apiPut("/Doctor", {
          id,
          registryNumber,
          initialHour,
          finalHour,
          consultationPrice,
          days,
          userId,
        });
      } else {
        setMessage(FAIL_STORAGE_DOCTOR);
        setErrorModalVisible(true);
      }

      const cityId = city?.id;
      await apiPut("/Address", {
        district,
        street,
        number,
        complement,
        cityId,
        userId,
      });

      router.replace("/home-doctor");
    } catch (err: any) {
      setMessage(EROR_GET_DATA);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  const handleErrorAndRedirect = () => {
    if (erro === 1) {
      setErro(0);
      router.replace("/");
    }
  };

  useEffect(() => {
    handleErrorAndRedirect();
  }, [erro]);

  async function handleAddressRegistry() {
    await handlePatientRegistry();
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
          setDateOfBirth(user.dateBirth);
          setGender(user.gender);
          setLanguage(user.language);
          setPhone(user.phone);

          const patientResponse = await apiGet<Doctor>(`/Doctor/id/${user.id}`);
          setRegistryNumber(patientResponse.data.registryNumber);
          setInitialHour(patientResponse.data.initialHour);
          setFinalHour(patientResponse.data.finalHour);
          setConsultationPrice(
            patientResponse.data.consultationPrice.toString()
          );
          setDias(patientResponse.data.days);

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
          await loadCountries();
          await loadStates();
          await loadCities();
        } else {
          setErro(1); // Define o erro se o usuário não for encontrado
        }
      } catch (error) {
        console.error("Erro ao recuperar ou parsear do AsyncStorage:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (country) {
      setFilteredStates(
        allStates.filter((state) => state.comparativeId === country.id)
      );
    } else {
      setFilteredStates(allStates);
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      setFilteredCities(
        allCities.filter((city) => city.comparativeId === state.id)
      );
    } else {
      setFilteredCities(allCities);
    }
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
        setMessage(FAIL_COUNTRIES);
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      setMessage(ERROR_COUNTRIES);
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
        setMessage(FAIL_STATES);
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      setMessage(ERROR_STATES);
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
        setMessage(FAIL_CITIES);
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      setMessage(ERROR_CITIES);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeInput = (
    value: string,
    setTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const cleanedValue = value.replace(/[^0-9]/g, "");

    if (cleanedValue.length === 1) {
      setTime(`0${cleanedValue}:00`);
    } else if (cleanedValue.length === 2) {
      const hours = parseInt(cleanedValue, 10);
      if (hours >= 0 && hours <= 24) {
        setTime(`${cleanedValue.padStart(2, "0")}:00`);
      } else {
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
    if (validatePhone(value)) {
      const formattedPhone = formatPhone(value);
      setPhone(formattedPhone);
    } else {
      setMessage(ERROR_PHONE);
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
        title="Perfil Médico"
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
              <Input
                label=""
                autoCorrect={false}
                placeholder=""
                style={styles.customLine}
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

              <Input
                label=""
                autoCorrect={false}
                placeholder=""
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
        message={message}
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
});

export default PerfilPatientPage;
