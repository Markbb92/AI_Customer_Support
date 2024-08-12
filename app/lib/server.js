"use server"

export const fetchInitialMessage = async (setMessages) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
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

  export const sendMessage = async (setMessages, messages, input, setInput) => {
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