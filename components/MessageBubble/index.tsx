import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

interface MessageBubbleProps {
  message: string;
  sent: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sent }) => {
  return (
    <View
      style={[
        styles.messageBubble,
        sent ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.gray_2,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.gray_1,
  },
  messageText: {
    color: colors.white,
  },
});

export default MessageBubble;
