import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import { colors } from "../../constants/colors";
import MessageBubble from "../../components/MessageBubble";
import Input from "../../components/Input";

const ChatPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([
    { text: "Olá, como posso ajudar?", sent: false },
    { text: "Estou com uma dúvida sobre o meu pedido.", sent: true },
    { text: "Claro! Qual é o número do seu pedido?", sent: false },
    { text: "Meu número de pedido é 123456.", sent: true },
  ]);

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
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    setMessages([...messages, { text: message, sent: true }]);
    setMessage("");

    // Simulando uma resposta automática
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Mensagem automática de resposta.", sent: false },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Chat"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          <Input
            label=""
            autoCorrect={false}
            value={"Paciente - Anderson"}
            style={styles.inputPrincipal}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.chatContainer}>
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg.text} sent={msg.sent} />
          ))}
        </View>
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.white}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
  },
  inputPrincipal: {
    width: 360,
    height: 50,
    fontSize: 15,
    marginTop: -20,
    backgroundColor: colors.black,
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray_2,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray_2,
    color: colors.white,
    padding: 10,
    borderRadius: 5,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: colors.black,
    borderRadius: 5,
  },
  sendButtonText: {
    color: colors.white,
  },
});

export default ChatPage;
