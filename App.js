import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons'; // Import icon library
import { Bubble } from 'react-native-gifted-chat';

import responses from './assets/data/responses.json';
import botAvatar from './assets/robo.png';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isTTSOn, setIsTTSOn] = useState(true); // State for text-to-speech toggle
  const [currentSpeechId, setCurrentSpeechId] = useState(null); // Track the current speech

  // Initialize the bot's welcome message
  useEffect(() => {
    const welcomeMessage = "Hello! I'm your disaster management assistant. Ask me anything about disasters.";
    setMessages([
      {
        _id: 1,
        text: welcomeMessage,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Disaster Bot',
          avatar: botAvatar,
        },
      },
    ]);
    
    if (isTTSOn) {
      Speech.speak(welcomeMessage, { onDone: () => setCurrentSpeechId(null) });
      setCurrentSpeechId(welcomeMessage);
    }
  }, []);

  const generateResponse = (query) => {
    const keywords = Object.keys(responses);
    let responseText = null;
  
    for (let keyword of keywords) {
      const relatedKeywords = [keyword, ...(responses[keyword].keywords || [])];
  
      for (let related of relatedKeywords) {
        if (query.toLowerCase().includes(related)) {
          responseText = responses[keyword].response;
          break;
        }
      }
      if (responseText) break; // Break the loop if a valid response is found
    }

    if (!responseText) {
      return "I'm sorry, I don't have information on that topic. Try asking about earthquakes, floods, fires, tornadoes, or landslides.";
    }

    // Format the response as point-wise text
    return responseText.map((point) => `• ${point}`).join("\n");

  };

  const onSend = useCallback((userMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, userMessages));

    const userMessage = userMessages[0]?.text || '';
    const botResponse = generateResponse(userMessage);

    if (botResponse === "I'm sorry, I don't have information on that topic. Try asking about earthquakes, floods, fires, tornadoes, or landslides.") {
      // Only return apology message without follow-up
      const apologyMessage = {
        _id: Math.random().toString(),
        text: botResponse,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Disaster Bot',
          avatar: botAvatar,
        },
      };
      
      setMessages((previousMessages) => GiftedChat.append(previousMessages, apologyMessage));
      if (isTTSOn && currentSpeechId !== apologyMessage.text) {
        Speech.speak(apologyMessage.text, { onDone: () => setCurrentSpeechId(null) });
        setCurrentSpeechId(apologyMessage.text);
      }
    } else {
      // Add opening message, main response, and conclusion for valid responses
      const introMessage = {
        _id: Math.random().toString(),
        text: "Sure. I will help you and provide instructions. Listen carefully.",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Disaster Bot',
          avatar: botAvatar,
        },
      };

      const mainResponseMessage = {
        _id: Math.random().toString(),
        text: botResponse,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Disaster Bot',
          avatar: botAvatar,
        },
      };

      const conclusionMessage = {
        _id: Math.random().toString(),
        text: "If you have any more questions, please ask.",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Disaster Bot',
          avatar: botAvatar,
        },
      };

      // Add messages with delays to simulate a conversation
      setTimeout(() => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, introMessage));
        if (isTTSOn && currentSpeechId !== introMessage.text) {
          Speech.speak(introMessage.text, { onDone: () => setCurrentSpeechId(null) });
          setCurrentSpeechId(introMessage.text);
        }

        setTimeout(() => {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, mainResponseMessage));
          if (isTTSOn && currentSpeechId !== mainResponseMessage.text) {
            Speech.speak(mainResponseMessage.text, { onDone: () => setCurrentSpeechId(null) });
            setCurrentSpeechId(mainResponseMessage.text);
          }

          setTimeout(() => {
            setMessages((previousMessages) => GiftedChat.append(previousMessages, conclusionMessage));
            if (isTTSOn && currentSpeechId !== conclusionMessage.text) {
              Speech.speak(conclusionMessage.text, { onDone: () => setCurrentSpeechId(null) });
              setCurrentSpeechId(conclusionMessage.text);
            }
          }, 1500); // Delay for conclusion message
        }, 1500); // Delay for main response message
      }, 1000); // Delay for intro message
    }
  }, [isTTSOn, currentSpeechId]);

  const toggleTTS = () => {
    setIsTTSOn(prev => {
      if (prev) {
        // Stop speech abruptly if it's on
        Speech.stop();
      }
      return !prev;
    });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => console.log("Go Back")}>
            <Ionicons name="arrow-back" size={24} color="black" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
  
          {/* Toggle Button */}
          <TouchableOpacity style={styles.toggleButton} onPress={toggleTTS}>
            <Ionicons name={isTTSOn ? "volume-high" : "volume-mute"} size={30} color="black" />
          </TouchableOpacity>
        </View>
  
        {/* Chat Interface */}
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderBubble={(props) => {
            return (
              <Bubble
                {...props}
                wrapperStyle={{
                  left: { 
                    backgroundColor: "#ffffff", 
                    borderWidth: 0.2,  // Add border
                    borderColor: "#000", // Black border color
                  },
                  right: { backgroundColor: "#1eaad1" },
                  borderWidth: 0.2,  // Add border
                  borderColor: "#000", // Black border color
                }}
                textStyle={{
                  left: { 
                    color: '#000', 
                    fontSize: 16, 
                    fontFamily: 'Poppins_700Bold',
                  }, 
                  right: { 
                    color: '#fff', 
                    fontSize: 16, 
                    fontFamily: 'Poppins_700Bold',
                  },
                }}
              />
            );
          }}
        />
      </View>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  toggleButton: {
    padding: 10,
  },
});

export default App;
