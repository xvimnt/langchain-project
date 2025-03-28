import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/invoke?content=${encodeURIComponent(userMessage)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userMessage),
      });

      if (!res.ok) {
        throw new Error("Error");
      }

      /*
        JSON response example:
        {name:serpapi,content:{"query":"current weather in Guatemala"}}{name:final_answer,content:{"answer":"The current weather in Guatemala City is 63°F (approximately 17°C) with clouds and sun. There is a chance of thunderstorms later. For more details, you can check the full forecast on [AccuWeather](https://www.accuweather.com/en/gt/guatemala-city/187765/weather-forecast/187765).","tools_used":["serpapi"]}
      */

      const data = res.body;
      if (!data) {
        setLoading(false);
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      let currentSteps = [];
      let finalAnswer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        let chunkValue = decoder.decode(value);
        
        if (!chunkValue) continue;

        buffer += chunkValue;

        // Process the streaming response
        if (buffer.includes("</step>")) {
          const steps = buffer.split("</step>");
          buffer = steps.pop() || ""; // Keep the last incomplete step in the buffer
          
          for (const step of steps) {
            if (step.includes("<step_name>")) {
              const stepNameMatch = step.match(/<step_name>([^<]*)<\/step_name>/);
              if (stepNameMatch) {
                const stepName = stepNameMatch[1];
                const jsonMatch = step.match(/(?<=<step_name>[^<]*<\/step_name>)(.*)/);
                
                if (jsonMatch) {
                  try {
                    const result = JSON.parse(jsonMatch[1]);
                    if (stepName === "final_answer") {
                      console.log("Found final answer:", result);
                      finalAnswer = result.answer || JSON.stringify(result);
                      console.log("Processed final answer:", finalAnswer);
                    } else {
                      currentSteps.push({
                        name: stepName,
                        result: result
                      });
                    }
                  } catch (e) {
                    console.error("Failed to parse step:", e);
                  }
                }
              }
            }
          }

          // Update the assistant's message with current steps and final answer
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            const currentContent = {
              steps: [...currentSteps],
              finalAnswer: finalAnswer || ""  // Ensure finalAnswer is always a string
            };
            if (lastMessage.role === 'assistant') {
              lastMessage.content = currentContent;
            } else {
              newMessages.push({
                role: 'assistant',
                content: currentContent
              });
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred while fetching response' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content) => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content.steps) {
      return (
        <div className="message-content-container">
          {content.steps.map((step, index) => (
            <div key={index} className="step-container">
              <div className="step-name">{step.name}</div>
              <div className="step-result">
                {JSON.stringify(step.result, null, 2)}
              </div>
            </div>
          ))}
          {content.finalAnswer && (
            <div className="final-answer">
              <div className="final-answer-label">Final Answer:</div>
              <div className="final-answer-content">{content.finalAnswer}</div>
            </div>
          )}
        </div>
      );
    }

    return JSON.stringify(content, null, 2);
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                <div className="message-text">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="message-text">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App; 