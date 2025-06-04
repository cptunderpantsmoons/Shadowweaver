import { useState, useEffect, useCallback } from "react";
import { Message, MessageType } from "@/lib/tools";

interface UseWebSocketProps {
  setTargetInfo: (info: any) => void;
  setAttackPaths: (paths: any[]) => void;
}

export function useWebSocket({ setTargetInfo, setAttackPaths }: UseWebSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    
    try {
      // Forced use of ws:// protocol for Replit environment to avoid mixed content errors
      // Properly handle errors for secure contexts
      const host = window.location.host;
      const wsUrl = `ws://${host}/ws`;
      
      // Create WebSocket connection
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setSocket(ws);
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        setSocket(null);
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        // Handle the error by showing a message in the UI instead of failing silently
        setMessages(prevMessages => [
          ...prevMessages,
          {
            type: MessageType.SYSTEM,
            content: "Connection error. The server might be restarting or unavailable.",
            timestamp: Date.now()
          }
        ]);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      // Add a fallback mechanism - use regular HTTP for commands if WebSocket fails
      setMessages(prevMessages => [
        ...prevMessages,
        {
          type: MessageType.SYSTEM,
          content: "Unable to establish real-time connection. Using HTTP fallback.",
          timestamp: Date.now()
        }
      ]);
    }
    
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'message') {
          const newMessage: Message = {
            type: data.messageType,
            content: data.content,
            timestamp: Date.now()
          };
          
          if (data.output) {
            newMessage.output = data.output;
          }
          
          if (data.steps) {
            newMessage.steps = data.steps;
          }
          
          setMessages(prevMessages => [...prevMessages, newMessage]);
        } 
        else if (data.type === 'activeTool') {
          setActiveTool(data.tool);
          setIsExecuting(data.executing);
        }
        else if (data.type === 'targetInfo') {
          setTargetInfo(data.info);
        }
        else if (data.type === 'attackPaths') {
          setAttackPaths(data.paths);
        }
      };
    }
    
    // Cleanup
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [setTargetInfo, setAttackPaths]);

  // Function to send messages to the server
  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      
      // If it's a user message, add it to the messages list
      if (message.type === MessageType.USER_MESSAGE) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            type: MessageType.USER,
            content: message.payload.text,
            timestamp: Date.now()
          }
        ]);
      }
    } else {
      console.error("WebSocket is not connected");
    }
  }, [socket]);

  return {
    messages,
    sendMessage,
    connected,
    activeTool,
    isExecuting
  };
}
