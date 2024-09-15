import React, { useState } from "react";
import { StyleSheet, ScrollView, SafeAreaView, Text, View } from "react-native";
import HeaderPage from "../../components/HeaderPage";
import { colors } from "../../constants/colors";
import SelectionModal from "../../components/CustomModal";
import { router } from "expo-router";

const TutorialsPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Tutoriais"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bem-vindo aos Tutoriais</Text>

          <Text style={styles.text}>
            Aqui você encontrará tutoriais sobre como utilizar as principais
            funcionalidades do aplicativo.
          </Text>

          <Text style={styles.subtitle}>1. Autenticar-se:</Text>
          <Text style={styles.text}>
            1. Informar email e senha. {"\n"}
            2. Solicitar autenticação clicando no botão “ENTRAR”.
          </Text>

          <Text style={styles.subtitle}>2. Cadastrar-se:</Text>
          <Text style={styles.text}>
            1. Solicitar cadastro clicando no botão “CADASTRAR”.{"\n"}
            2. Informar os dados solicitados.{"\n"}
            3. Continuar o cadastro clicando no botão “PRÓXIMO”.{"\n"}
            4. Continuar o cadastro clicando no botão “Paciente ou médico”.
            {"\n"}
            5. Informar os dados solicitados.{"\n"}
            6. Continuar o cadastro clicando no botão “CADASTRAR”.{"\n"}
            7. Informar código de verificação enviado por email.{"\n"}
            8. Continuar o cadastro clicando no botão “VALIDAR CÓDIGO”.{"\n"}
            9. Informar senha.{"\n"}
            10. Continuar o cadastro clicando no botão “CONCLUIR”
          </Text>

          <Text style={styles.subtitle}>3. Recuperação de Senha</Text>
          <Text style={styles.text}>
            1. Solicitar recuperação de senha clicando no botão “ESQUECEU A
            SENHA?”.{"\n"}
            2. Informar o dado de email solicitado.{"\n"}
            3. Informar código de verificação enviado por email.{"\n"}
            4. Continuar o cadastro clicando no botão “VALIDAR CÓDIGO”.{"\n"}
            5. Informar senha.{"\n"}
            6. Continuar o cadastro clicando no botão “CONCLUIR”
          </Text>

          <Text style={styles.subtitle}>4. Acessar Fatura</Text>
          <Text style={styles.text}>
            1. Prosseguir com o processo clicando no botão “Faturas”.{"\n"}
            2. Selecionar fatura desejada.{"\n"}
            3. Acessar documento clicando no botão “VISUALIZAR” ou “BAIXAR” OU
            “COMPARTILHAR”.{"\n"}
            4. Voltar a tela de “Pagamentos” clicando no botão voltar.
          </Text>

          <Text style={styles.subtitle}>5. Acessar Documentos</Text>
          <Text style={styles.text}>
            1. Prosseguir com o processo clicando no botão “Exames, receitas e
            atestados”.{"\n"}
            2. Filtrar consultas através do campo “Consultas”.{"\n"}
            3. Filtrar por tipo de documento através do campo “Tipo de
            documento”.{"\n"}
            4. Visualizar documento clicando no botão “VISUALIZAR”.{"\n"}
            5. Voltar a tela de “exames, receitas e atestados” clicando no botão
            voltar
          </Text>

          <Text style={styles.subtitle}>6. Consulta Emergencial</Text>
          <Text style={styles.text}>
            1. Prosseguir com o processo clicando no botão “Consultas”.{"\n"}
            2. Escolher a forma de consulta emergencial clicando no botão
            “Emergencial”.{"\n"}
            3. Interagir na consulta através do chat.
          </Text>

          <Text style={styles.subtitle}>7. Consulta Agendada</Text>
          <Text style={styles.text}>
            1. Prosseguir com o processo clicando no botão “Consultas”.{"\n"}
            2. Escolher a forma de consulta agendada clicando no botão
            “Agendadas”.{"\n"}
            3. Selecionar consulta disponível.{"\n"}
            4. Interagir na consulta através do chat
          </Text>

          <Text style={styles.subtitle}>8. Agendar Consulta</Text>
          <Text style={styles.text}>
            1. Prosseguir com o processo clicando no botão “Consultas”.{"\n"}
            2. Prosseguir com o processo clicando no botão “Agendar”.{"\n"}
            3. Filtrar especialidade através do campo “Especialidade”.{"\n"}
            4. Filtrar especialista através do campo “Especialista”.{"\n"}
            5. Filtrar data através do campo “Data da Consulta”.{"\n"}
            6. Filtrar horário através do campo “Horário”.{"\n"}
            7. Agendar consulta clicando no botão “AGENDAR”.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: "flex-start",
  },
  textContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.white,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: colors.gray_1,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    color: colors.white,
  },
});

export default TutorialsPage;
