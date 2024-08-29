/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    // const heygenApiKey = process.env.REACT_APP_HEYGEN_API_KEY;
    // const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };
  
  const handleSend = async () => {
    const userMessage = input;
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setInput('');
  
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [...messages, { role: 'user', content: userMessage }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
      }
    );
  
    const botMessage = openaiResponse.data.choices[0].message.content;
    setMessages([...messages, { role: 'user', content: userMessage }, { role: 'bot', content: botMessage }]);
  
    // Speak the bot's message
    speak(botMessage);
  
    // Generate and display the avatar
    generateAvatar(botMessage);
  };
  

  const generateAvatar = async (text) => {
    // Call Heygen API to generate the avatar with the bot's message as voice
    const heygenResponse = await axios.post(
      'https://api.heygen.com/v1/avatar/speak',
      {
        text: text,
        voice: 'en_us_male', // or any other available voice option
        language: 'en',
      },
      {
        headers: {
          // eslint-disable-next-line no-undef
          Authorization: `Bearer ${process.env.REACT_APP_HEYGEN_API_KEY}`,
        },
      }
    );

    const avatarUrl = heygenResponse.data.avatar_url;

    // Display the avatar in the UI (you might want to adjust how you show this)
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'avatar', content: <img src={avatarUrl} alt="avatar" /> },
    ]);
  };


  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.start();
  
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      handleSend();
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
    };
  };
  
  
  return (
    <div>
    <div>
      {messages.map((message, index) => (
        <p key={index}>
          <strong>{message.role === 'user' ? 'You: ' : message.role === 'bot' ? 'Bot: ' : ''}</strong>
          {message.role !== 'avatar' ? message.content : <>{message.content}</>}
        </p>
      ))}
    </div>
    <button onClick={startListening}>🎤 Speak</button>
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
    <button onClick={handleSend}>Send</button>
  </div>
  );
};

export default Chatbot;
