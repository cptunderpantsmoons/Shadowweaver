import React from "react";
import { Tool } from "@/lib/tools";

interface ToolButtonProps {
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onClick }) => {
  const getButtonClasses = () => {
    let classes = "flex flex-col items-center justify-center p-2 rounded bg-cyber-panel hover:bg-cyber-panel/70 transition-all";
    
    if (isActive) {
      if (tool.name === 'metasploit') {
        classes += " neon-border-red";
      } else {
        classes += " neon-border";
      }
    }
    
    return classes;
  };
  
  const getIconClasses = () => {
    if (isActive) {
      if (tool.name === 'metasploit') {
        return "fas text-cyber-red";
      }
      return "fas text-cyber-blue";
    }
    return "fas text-gray-400";
  };

  return (
    <button 
      className={getButtonClasses()}
      onClick={onClick}
      title={tool.description}
    >
      <i className={`${getIconClasses()} ${tool.icon}`}></i>
      <span className="text-xs mt-1">{tool.shortName}</span>
    </button>
  );
};

export default ToolButton;
