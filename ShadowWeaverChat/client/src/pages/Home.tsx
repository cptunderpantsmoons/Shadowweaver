import { useState } from "react";
import ToolsPanel from "@/components/ToolsPanel";
import MainConsole from "@/components/MainConsole";
import AttackVisualization from "@/components/AttackVisualization";
import AttackPlanModal from "@/components/modals/AttackPlanModal";
import ExploitGeneratorModal from "@/components/modals/ExploitGeneratorModal";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MessageType, Tool } from "@/lib/tools";

export default function Home() {
  const [activeTools, setActiveTools] = useState<Tool[]>([]);
  const [useProxy, setUseProxy] = useState(true);
  const [useVpn, setUseVpn] = useState(false);
  const [showAttackPlanModal, setShowAttackPlanModal] = useState(false);
  const [showExploitModal, setShowExploitModal] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<string>("");
  const [targetInfo, setTargetInfo] = useState<any>(null);
  const [attackPaths, setAttackPaths] = useState<any[]>([]);
  
  const { 
    messages, 
    sendMessage, 
    connected, 
    activeTool, 
    isExecuting 
  } = useWebSocket({ setTargetInfo, setAttackPaths });

  const handleToolClick = (tool: Tool) => {
    const isActive = activeTools.some(t => t.name === tool.name);
    
    if (isActive) {
      setActiveTools(activeTools.filter(t => t.name !== tool.name));
    } else {
      setActiveTools([...activeTools, tool]);
    }
  };

  const handleToggleProxy = () => {
    setUseProxy(!useProxy);
    sendMessage({
      type: MessageType.SET_PROXY,
      payload: { enabled: !useProxy }
    });
  };

  const handleToggleVpn = () => {
    setUseVpn(!useVpn);
    sendMessage({
      type: MessageType.SET_VPN,
      payload: { enabled: !useVpn }
    });
  };

  const handleCommandSubmit = (command: string) => {
    if (command.trim()) {
      setCurrentTarget(extractTargetFromCommand(command));
      sendMessage({
        type: MessageType.USER_MESSAGE,
        payload: { text: command }
      });
    }
  };

  const extractTargetFromCommand = (command: string): string => {
    // Simple regex to extract IP or hostname
    const ipMatch = command.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    if (ipMatch) return ipMatch[0];
    
    // Look for domain names or hostnames (simplified)
    const domainMatch = command.match(/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/i);
    if (domainMatch) return domainMatch[0];
    
    return "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-cyber-dark border-b border-cyber-blue/30 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 text-cyber-blue neon-glow animate-pulse-glow font-rajdhani font-bold text-2xl">
              WEAVER<span className="text-cyber-red neon-glow-red">.</span>OS
            </div>
            <div className="hidden md:flex space-x-1 text-xs">
              <div className="px-2 py-1 rounded bg-cyber-blue/10 border border-cyber-blue/20">
                <span className="text-cyber-green">●</span> CLAUDE_API
              </div>
              <div className="px-2 py-1 rounded bg-cyber-blue/10 border border-cyber-blue/20">
                <span className={`${useProxy ? "text-cyber-yellow" : "text-gray-500"}`}>●</span> TOR_ACTIVE
              </div>
              <div className="px-2 py-1 rounded bg-cyber-blue/10 border border-cyber-blue/20">
                <span className={`${connected ? "text-cyber-blue" : "text-gray-500"}`}>●</span> MCP_v1.7
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="text-cyber-blue hover:text-cyber-blue-dim transition-colors" 
              title="Settings"
            >
              <i className="fas fa-cog"></i>
            </button>
            <button 
              className="text-cyber-blue hover:text-cyber-blue-dim transition-colors" 
              title="Help"
            >
              <i className="fas fa-question-circle"></i>
            </button>
            <div className="relative">
              <button 
                className="text-cyber-blue hover:text-cyber-blue-dim transition-colors" 
                title="Notifications"
              >
                <i className="fas fa-bell"></i>
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-red rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <ToolsPanel 
          activeTools={activeTools} 
          onToolClick={handleToolClick}
          useProxy={useProxy}
          useVpn={useVpn}
          onToggleProxy={handleToggleProxy}
          onToggleVpn={handleToggleVpn}
          connected={connected}
        />
        
        <MainConsole 
          messages={messages}
          onCommandSubmit={handleCommandSubmit}
          onShowAttackPlan={() => setShowAttackPlanModal(true)}
          onShowExploits={() => setShowExploitModal(true)}
          isExecuting={isExecuting}
        />
        
        <AttackVisualization 
          targetInfo={targetInfo} 
          attackPaths={attackPaths}
          currentTarget={currentTarget}
          activeTool={activeTool}
          onShowExploitBuilder={() => setShowExploitModal(true)}
        />
      </main>
      
      {/* Modals */}
      <AttackPlanModal 
        isOpen={showAttackPlanModal} 
        onClose={() => setShowAttackPlanModal(false)}
        attackPaths={attackPaths}
        targetInfo={targetInfo}
      />
      
      <ExploitGeneratorModal 
        isOpen={showExploitModal} 
        onClose={() => setShowExploitModal(false)}
        target={currentTarget}
        sendMessage={sendMessage}
      />
    </div>
  );
}
