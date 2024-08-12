"use client";
import { useEffect, useState } from "react";
import styles from '../page.module.css';

export default async function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(""); // Add this line to define the input state
  
  const fetchInitialMessage = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ role: "system", content: "Initial message" }]),
      });
      const data = await response.json();
      setMessages(data.data);
    } catch (error) {
      console.error("Error fetching initial message:", error);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ role: "user", content: input }]),
      });
      const data = await response.json();
      setMessages([...newMessages, data.data[data.data.length - 1]]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
    useEffect(() => {
    fetchInitialMessage();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.chatContainer}>
        {messages.map((message, index) => (
          <div key={index} className={message.role === "assistant" ? styles.botMessage : styles.userMessage}>
            {message.content}
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className={styles.input}
        />
        <button onClick={sendMessage} className={styles.sendButton}>Send</button>
      </div>
    </main>
  );
}
