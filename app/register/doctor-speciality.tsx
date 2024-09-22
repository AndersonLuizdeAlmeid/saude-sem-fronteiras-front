import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderPage from "../../components/HeaderPage";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import CardIcon from "../../components/CardIcon";
import WaitingListPage from "../../components/WaitingListPage";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { apiDelete, apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_DOCTOR, STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";
import SelectionModal from "../../components/CustomModal";
import { Doctor } from "../../domain/Doctor/doctor";

const SpecialitiesRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState<number>(0);
  const [doctorId, setDoctorId] = useState<number>(0);
  const [consultations, setConsultations] = useState<
    { id: number; data: string }[]
  >([]);

  const handleBackPress = () => {
    router.back();
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
    console.log(userId);
  }, []);

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

  const handleSelectConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_USER);
        if (value) {
          const user: User = JSON.parse(value);
          setUserId(user.id);
        } else {
          console.log("Nenhum valor enconatrado no AsyncStorage");
        }
      } catch (error) {
        console.error("Erro ao recuperar ou parsear do AsyncStorage:", error);
      }
    };

    fetchUser();
  }, []);

  const getSpecialitiesByDoctorId = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_DOCTOR);
      if (value) {
        console.log("valuea");
        const doctor: Doctor = JSON.parse(value);
        console.log("Doctor recuperado:", doctor); // Adicione isso para verificar o valor
        setDoctorId(doctor.id); // Certifique-se de que este valor está correto
        const response = await apiGet(`/Speciality/${doctor.id}`);
        if (response && Array.isArray(response.data)) {
          const formattedConsultations = response.data.map((item: any) => ({
            id: item.id,
            data: item.description,
          }));
          setConsultations(formattedConsultations);
        } else {
          console.error("Formato de resposta inespserado:", response);
        }
      } else {
        console.log("Nenhum valor encontrado no AsyncStorage");
      }
    } catch (error) {
      console.error("Erro ao buscar especialidades:", error);
    }
  };

  const handleDeletetShift = async () => {
    if (selectedConsultation && selectedConsultation.id) {
      try {
        await apiDelete(`/Speciality/${selectedConsultation.id}`);
        const updatedConsultations = consultations.filter(
          (consultation) => consultation.id !== selectedConsultation.id
        );
        setConsultations(updatedConsultations);

        if (updatedConsultations.length > 0) {
          // Se houver itens restantes, selecione o próximo item
          const nextIndex =
            (consultations.findIndex((c) => c.id === selectedConsultation.id) +
              1) %
            updatedConsultations.length;
          setSelectedConsultation(updatedConsultations[nextIndex]);
        } else {
          // Se não houver itens restantes, desmarque a seleção
          setSelectedConsultation(null);
        }

        getSpecialitiesByDoctorId(); // Atualiza a lista de telefones
      } catch (error) {
        console.error("Erro ao delsetar consulta:", error);
      }
    } else {
      console.log("Nenhuma consulta selecionada para deletar");
    }
  };

  const handleSavetShift = async () => {
    if (description.trim()) {
      console.log(doctorId);
      await apiPost("/Speciality", {
        description,
        doctorId,
      });
      console.log("doctorId");
      getSpecialitiesByDoctorId();
      setDescription(" ");
    } else {
      setErrorModalVisible(true);
    }
  };

  const handleFinishtShift = async () => {
    router.replace("/home-doctor");
  };

  useEffect(() => {
    getSpecialitiesByDoctorId();
  }, []);

  const items = [
    {
      text: "Especialidade",
      icon: "syringe",
      //TODO remover esse onpress futuramente
      onPress: handleSavetShift,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Minha Página"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <Animated.View
        style={[
          styles.container,
          { opacity: opacity, transform: [{ translateY: offset.y }] },
        ]}
      >
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* CardIcon e outros elementos antes do botão */}
            {items.map((i) => (
              <React.Fragment key={i.text}>
                <CardIcon {...i} />
                <View style={styles.separator} />
              </React.Fragment>
            ))}
            <Input
              label="Especialidade"
              autoCorrect={false}
              placeholder="Pediatra"
              value={description}
              onChangeText={(value) => {
                setDescription(value);
              }}
              style={styles.input}
              autoCapitalize="none"
            />
            <WaitingListPage
              onSelect={handleSelectConsultation}
              consultations={consultations} // Passa os dados para o WaitingListPage
            />
            <Button onPress={handleDeletetShift} style={styles.button}>
              EXCLUIR
            </Button>
            <Button onPress={handleSavetShift} style={styles.button}>
              SALVAR
            </Button>
            <Button onPress={handleFinishtShift} style={styles.button}>
              CONCLUIR
            </Button>
          </ScrollView>
        </View>
      </Animated.View>
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
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: 20 },
  input: {
    width: 320,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default SpecialitiesRegistryPage;
