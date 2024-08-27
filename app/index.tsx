import { useEffect, useState } from "react";
import { Animated, Keyboard, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiPost } from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { router } from "expo-router";
import { STORAGE_TOKEN } from "../constants/storage";
import Page from "../components/Page";

export default function LoginPage() {
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoSize] = useState(new Animated.Value(280));

  async function handleLogin() {
    try {
      // setLoading(true);
      // const response = await apiPost<string>("/Authentication", {
      //   email,
      //   password,
      // });

      //await AsyncStorage.setItem(STORAGE_TOKEN, response.data);
      router.replace("/home-patient");
    } catch (err: any) {
      setErrorMessage(err.request.response);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistry() {
    router.push("/register");
  }

  async function handleForgotPassword() {
    try {
      setLoading(true);
      const response = await apiPost<string>("/ForgotPassword", {
        email,
        password,
      });

      await AsyncStorage.setItem(STORAGE_TOKEN, response.data);
      router.replace("/forgotPassword");
    } catch (err: any) {
      setErrorMessage(err.request.response);
    } finally {
      setLoading(false);
    }
  }

  async function validateToken() {
    try {
      await apiGet("/Authentication");

      router.replace("/home");
    } catch (err: any) {
      await AsyncStorage.removeItem(STORAGE_TOKEN);
    } finally {
      setLoading(false);
    }
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
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_TOKEN).then((token) => {
      if (!token) {
        setLoading(false);
        return;
      }

      validateToken();
      setLoading(false);
    });
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
          onPress={handleForgotPassword}
          loading={loading}
          style={{ marginBottom: 10 }}
        >
          ESQUECEU A SENHA?
        </Button>
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
