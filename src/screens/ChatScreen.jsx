import React, {useState} from 'react';
import {View, StyleSheet, Clipboard, Text} from 'react-native';
import {GoogleGenerativeAI} from '@google/generative-ai';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import Toast from 'react-native-toast-message';
import apiKey from '../config/apiKey';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getThemeColors, constants} from '../config/constants';
import {useSelector} from 'react-redux';

// Initialize the API
const genAI = new GoogleGenerativeAI(apiKey.API_KEY);

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentTheme = useSelector(state => state.theme.theme);
  const colors = getThemeColors(currentTheme);

  const handleSend = async text => {
    if (text.trim() === '') return;
    if (text.trim() === 'cls') {
      setMessages([]);
      return;
    }

    const newMessage = {id: Date.now(), text, user: true};
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({model: 'gemini-pro'});
      const result = await model.generateContent(text);
      const response = await result.response;
      const aiResponse = {
        id: Date.now() + 1,
        text: response.text(),
        user: false,
      };

      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Error chatting with Gemini:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        user: false,
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageLongPress = text => {
    Clipboard.setString(text);
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Copied to clipboard',
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  return (
    <View
      style={[styles.container, {backgroundColor: colors.primaryBackground}]}>
      <ChatHeader />
      {messages.length === 0 && (
        <View
          style={[
            styles.welcomeContainer,
            {backgroundColor: colors.secondaryBackground},
          ]}>
          <Icon name="robot" size={60} color={colors.primary} />
          <Text style={[styles.welcomeTitle, {color: colors.primaryText}]}>
            Welcome to Gemini Chat
          </Text>
          <Text style={[styles.welcomeText, {color: colors.secondaryText}]}>
            How can I assist you today? Feel free to ask me anything!
          </Text>
        </View>
      )}
      <ChatMessages
        messages={messages}
        onMessageLongPress={handleMessageLongPress}
        isLoading={isLoading}
      />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: constants.fontSizes.xlarge,
    fontFamily: constants.fontFamilies.bold,
    marginVertical: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: constants.fontSizes.medium,
    fontFamily: constants.fontFamilies.regular,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ChatScreen;
