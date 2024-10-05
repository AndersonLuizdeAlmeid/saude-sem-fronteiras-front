import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import SimpleModal from "../../components/Modal";
import { apiGet } from "../../utils/api";
import { ConfirmationCode } from "../../domain/ConfirmationCode/confirmationCode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STORAGE_CONFIRMATION_CODE,
  STORAGE_EMAIL,
} from "../../constants/storage";
import { Email } from "../../domain/Email/email";

const ConfirmationCodePage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [email, setEmail] = useState<string>("");
  const [confirmationCode, setConfirmationCode] = useState<string>("");

  const handleBackPress = () => {
    router.back();
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    console.log("Labels selecionadas:", labels);
  };

  const handleValidationCode = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_CONFIRMATION_CODE);
      console.log(value);
      if (value) {
        if (confirmationCode === value) {
          router.replace("/recovery-password/new-password");
        } else {
          setErrorModalVisible(true);
        }
      } else {
        console.log("Nenhum valor encontrado no AsyncStorage");
      }
    } catch (err: any) {
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    try {
      setLoading(true);
      const value = await AsyncStorage.getItem(STORAGE_EMAIL);
      if (value) {
        const email: Email = JSON.parse(value);
        const response = await apiGet(`/Credentials/RecoveryPassword/${email}`);
        AsyncStorage.setItem(
          STORAGE_CONFIRMATION_CODE,
          JSON.stringify(response.data)
        );
      } else {
        console.log("Nenhum valor encontrado no AsyncStorage");
      }
    } catch (err: any) {
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
        title="Validar Código"
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
                label="Código de Validação"
                autoCorrect={false}
                placeholder="Informe aqui seu código de validação"
                value={confirmationCode}
                onChangeText={(value) => setConfirmationCode(value)}
                style={styles.input}
              />
              <Button
                onPress={handleValidationCode}
                loading={loading}
                style={styles.button}
              >
                VALIDAR CÓDIGO
              </Button>
              <Button
                onPress={handleSendCode}
                loading={loading}
                style={styles.button}
              >
                ENVIAR CÓDIGO NOVAMENTE
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
        message="Código inválido, favor redigitar."
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
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default ConfirmationCodePage;
