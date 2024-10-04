import { useEffect, useState } from "react";
import { Animated, Keyboard, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiPost } from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { router } from "expo-router";
import {
  STORAGE_ADDRESS,
  STORAGE_CREDENTIALS,
  STORAGE_DOCTOR,
  STORAGE_PATIENT,
  STORAGE_TOKEN,
  STORAGE_USER,
} from "../constants/storage";
import Page from "../components/Page";
import { Credentials } from "../domain/Credentials/credentials";
import SimpleModal from "../components/Modal";
import { Address } from "../domain/Address/address";
import { Doctor } from "../domain/Doctor/doctor";

export default function LoginPage() {
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoSize] = useState(new Animated.Value(280));
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      const response = await apiPost<string>("/Authentication", {
        email,
        password,
      });

      await AsyncStorage.setItem(STORAGE_TOKEN, response.data);
      const CredentialsResponse = await apiGet<Credentials>(
        `/Credentials/${email}/${password}`
      );

      AsyncStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(response.data));
      const userResponse = await apiGet<Credentials>(
        `/Users/credentialsId/${CredentialsResponse.data.id}`
      );
      AsyncStorage.setItem(STORAGE_USER, JSON.stringify(userResponse.data));

      const address = await apiGet<Address>(
        `/Address/id/${userResponse.data.id}`
      );
      AsyncStorage.setItem(STORAGE_ADDRESS, JSON.stringify(address.data));

      const userOrDoctor = await apiGet<number>(
        `/Users/id/${userResponse.data.id}`
      );

      if (userOrDoctor.data === 1) {
        const doctorResponse = await apiGet<Doctor>(
          `/Doctor/id/${userResponse.data.id}`
        );
        AsyncStorage.setItem(
          STORAGE_DOCTOR,
          JSON.stringify(doctorResponse.data)
        );
        router.replace("/home-doctor");
      } else if (userOrDoctor.data === 2) {
        const patientResponse = await apiGet<Doctor>(
          `/Patient/id/${userResponse.data.id}`
        );
        AsyncStorage.setItem(
          STORAGE_PATIENT,
          JSON.stringify(patientResponse.data)
        );
        router.replace("/home-patient");
      } else {
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistry() {
    router.replace("/register/credentials-registry");
  }

  async function handleRecoveryPassword() {
    router.replace("/recovery-password");
  }

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
    setLoading(false);
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        Animated.timing(logoSize, {
          toValue: 150,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        Animated.timing(logoSize, {
          toValue: 280,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Page>
      <View style={styles.containerLogo}>
        <Animated.Image
          source={require("../assets/logo.png")}
          style={{ width: logoSize, height: logoSize }}
        />
      </View>

      <Animated.View
        style={[
          styles.container,
          { opacity: opacity, transform: [{ translateY: offset.y }] },
        ]}
      >
        <Input
          label="Email"
          autoCorrect={false}
          placeholder="example@example.com"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
          }}
          style={{ marginBottom: 20 }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Senha"
          autoCorrect={false}
          placeholder="*****"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
          }}
          textContentType="password"
          secureTextEntry
          style={{ marginBottom: 60 }}
        />
        <Button
          onPress={handleLogin}
          loading={loading}
          style={{ marginBottom: 10 }}
        >
          ENTRAR
        </Button>

        <Button
          onPress={handleRegistry}
          loading={loading}
          style={{ marginBottom: 10 }}
        >
          CADASTRAR
        </Button>

        <Button
          onPress={handleRecoveryPassword}
          loading={loading}
          style={{ marginBottom: 10 }}
        >
          ESQUECEU A SENHA?
        </Button>
        <SimpleModal
          visible={isErrorModalVisible}
          onClose={() => setErrorModalVisible(false)}
          message="Por favor, preencha todos os campos."
        />
      </Animated.View>
    </Page>
  );
}

const styles = StyleSheet.create({
  containerLogo: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
