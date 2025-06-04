import React, { useState, useRef, useEffect } from "react";
import { Message, MessageType } from "@/lib/tools";

interface MainConsoleProps {
  messages: Message[];
  onCommandSubmit: (command: string) => void;
  onShowAttackPlan: () => void;
  onShowExploits: () => void;
  isExecuting: boolean;
}

const MainConsole: React.FC<MainConsoleProps> = ({ 
  messages, 
  onCommandSubmit,
  onShowAttackPlan,
  onShowExploits,
  isExecuting
}) => {
  const [command, setCommand] = useState("");
  const [activeTab, setActiveTab] = useState("TERMINAL");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommandSubmit();
    }
  };

  const handleCommandSubmit = () => {
    onCommandSubmit(command);
    setCommand("");
    if (inputRef.current) {
      inputRef.current.textContent = "";
    }
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    setCommand(e.currentTarget.textContent || "");
  };

  const renderMessage = (message: Message, index: number) => {
    switch (message.type) {
      case MessageType.SYSTEM:
        return (
          <div key={index} className="text-gray-500">
            [SYSTEM] {message.content}
          </div>
        );
      case MessageType.USER:
        return (
          <div key={index}>
            <span className="text-cyber-blue">[USER] </span>
            <span>{message.content}</span>
          </div>
        );
      case MessageType.AI:
        return (
          <div key={index} className="pl-0 md:pl-4 border-l border-cyber-blue/20">
            <span className="text-cyber-green">[CLAUDE] </span>
            <span>{message.content}</span>
          </div>
        );
      case MessageType.COMMAND:
        return (
          <div key={index} className="pl-0 md:pl-4 border-l border-cyber-blue/20">
            <div>
              <span className="text-cyber-blue">[EXECUTING] </span>
              <span className="text-cyber-blue-dim">{message.content}</span>
            </div>
            {message.output && (
              <div className="bg-cyber-panel/50 p-2 mt-1 rounded text-xs whitespace-pre-wrap">
                {message.output}
              </div>
            )}
          </div>
        );
      case MessageType.ANALYSIS:
        return (
          <div key={index} className="pl-0 md:pl-4 border-l border-cyber-green/20">
            <span className="text-cyber-green">[ANALYSIS] </span>
            <span>{message.content}</span>
          </div>
        );
      case MessageType.CHAIN:
        return (
          <div key={index} className="pl-0 md:pl-4 border-l border-cyber-red/20 md:block">
            <span className="text-cyber-red">[CHAIN] </span>
            <span>
              Planning attack chain:
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                {message.steps?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-cyber-black overflow-hidden">
      {/* Output Display */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="bg-cyber-dark border-b border-cyber-blue/30 flex">
          <button 
            className={`py-2 px-4 text-sm font-rajdhani ${activeTab === "TERMINAL" ? "border-b-2 border-cyber-blue text-cyber-blue" : "text-gray-400 hover:text-gray-200"}`}
            onClick={() => setActiveTab("TERMINAL")}
          >
            TERMINAL
          </button>
          <button 
            className={`py-2 px-4 text-sm font-rajdhani ${activeTab === "ATTACK_PLAN" ? "border-b-2 border-cyber-blue text-cyber-blue" : "text-gray-400 hover:text-gray-200"}`}
            onClick={() => {
              setActiveTab("ATTACK_PLAN");
              onShowAttackPlan();
            }}
          >
            ATTACK PLAN
          </button>
          <button 
            className={`py-2 px-4 text-sm font-rajdhani ${activeTab === "EXPLOITS" ? "border-b-2 border-cyber-blue text-cyber-blue" : "text-gray-400 hover:text-gray-200"}`}
            onClick={() => {
              setActiveTab("EXPLOITS");
              onShowExploits();
            }}
          >
            EXPLOITS
          </button>
          <button 
            className={`py-2 px-4 text-sm font-rajdhani ${activeTab === "SANDBOX" ? "border-b-2 border-cyber-blue text-cyber-blue" : "text-gray-400 hover:text-gray-200"}`}
            onClick={() => setActiveTab("SANDBOX")}
          >
            SANDBOX
          </button>
        </div>
        
        {/* Terminal Output */}
        <div 
          className="flex-1 p-3 font-mono text-sm overflow-auto relative" 
          style={{ backgroundColor: "rgba(10, 10, 15, 0.95)" }}
          ref={terminalRef}
        >
          <div className="terminal-scan absolute inset-0 pointer-events-none"></div>
          <div className="space-y-2 relative">
            {/* System initialization messages if no messages yet */}
            {messages.length === 0 && (
              <>
                <div className="text-gray-500">
                  [SYSTEM] Weaver of Shadows v1.7.3 initialized...
                </div>
                <div className="text-gray-500">
                  [SYSTEM] Connected to DeepSeek API. TOR proxy active.
                </div>
                <div className="text-gray-500">
                  [SYSTEM] MCP server ready. 10 tools available.
                </div>
                <div className="text-gray-500">
                  [SYSTEM] Enter a target and command to begin (e.g., "Scan target 192.168.1.100 for vulnerabilities")
                </div>
              </>
            )}
            
            {/* Render all messages */}
            {messages.map(renderMessage)}
            
            {/* Show when command is executing */}
            {isExecuting && (
              <div className="text-cyber-blue animate-pulse">
                [SYSTEM] Executing command...
              </div>
            )}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-3 bg-cyber-dark border-t border-cyber-blue/30">
          <div className="flex items-center">
            <div className="flex-1 bg-cyber-panel rounded-l px-3 py-2 border-t border-b border-l border-cyber-blue/30">
              <div className="flex items-center">
                <span className="text-cyber-blue mr-2">&gt;</span>
                <div 
                  className="flex-1 font-mono text-sm cursor-blink outline-none" 
                  contentEditable="true"
                  ref={inputRef}
                  onInput={handleContentChange}
                  onKeyDown={handleKeyDown}
                  suppressContentEditableWarning={true}
                />
              </div>
            </div>
            <button 
              className="bg-cyber-blue text-cyber-black font-rajdhani font-semibold py-2 px-4 rounded-r hover:bg-cyber-blue-dim transition-colors"
              onClick={handleCommandSubmit}
              disabled={isExecuting}
            >
              EXECUTE
            </button>
          </div>
          <div className="mt-2 flex space-x-2 text-xs">
            <button className="px-2 py-1 bg-cyber-panel hover:bg-cyber-panel/70 rounded transition-colors">
              <i className="fas fa-microphone text-cyber-blue mr-1"></i> Voice
            </button>
            <button className="px-2 py-1 bg-cyber-panel hover:bg-cyber-panel/70 rounded transition-colors">
              <i className="fas fa-code text-cyber-blue mr-1"></i> Commands
            </button>
            <button className="px-2 py-1 bg-cyber-panel hover:bg-cyber-panel/70 rounded transition-colors">
              <i className="fas fa-history text-cyber-blue mr-1"></i> History
            </button>
            <div className="ml-auto">
              <button 
                className={`px-2 py-1 ${isExecuting ? 'bg-cyber-red hover:bg-cyber-red-dim text-white' : 'bg-cyber-panel/50 text-gray-500'} rounded transition-colors`}
                disabled={!isExecuting}
              >
                <i className="fas fa-stop-circle mr-1"></i> Abort
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainConsole;
