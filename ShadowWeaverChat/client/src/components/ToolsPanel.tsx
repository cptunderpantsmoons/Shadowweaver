import React from "react";
import { allTools, Tool } from "@/lib/tools";
import ToolButton from "./ToolButton";

interface ToolsPanelProps {
  activeTools: Tool[];
  onToolClick: (tool: Tool) => void;
  useProxy: boolean;
  useVpn: boolean;
  onToggleProxy: () => void;
  onToggleVpn: () => void;
  connected: boolean;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({
  activeTools,
  onToolClick,
  useProxy,
  useVpn,
  onToggleProxy,
  onToggleVpn,
  connected
}) => {
  const getToolStatus = (tool: Tool) => {
    const isActive = activeTools.some(t => t.name === tool.name);
    if (tool.name === 'nmap') return isActive ? 'READY' : '';
    if (tool.name === 'metasploit') return isActive ? 'ACTIVE' : '';
    return '';
  };

  return (
    <div className="w-full md:w-64 bg-cyber-dark border-r border-cyber-blue/20 flex flex-col">
      <div className="p-3 border-b border-cyber-blue/20">
        <h2 className="font-rajdhani font-semibold text-lg text-cyber-blue">TOOLKIT</h2>
        <div className="mt-2 grid grid-cols-5 md:grid-cols-3 gap-2">
          {allTools.map((tool) => (
            <ToolButton
              key={tool.name}
              tool={tool}
              isActive={activeTools.some(t => t.name === tool.name)}
              onClick={() => onToolClick(tool)}
            />
          ))}
        </div>
      </div>
      
      {/* Tool Configuration */}
      <div className="p-3 border-b border-cyber-blue/20">
        <h3 className="font-rajdhani font-semibold text-cyber-blue">ACTIVE TOOLS</h3>
        <div className="mt-2 space-y-2">
          {activeTools.map(tool => (
            <div key={tool.name} className="bg-cyber-panel p-2 rounded">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-mono ${tool.name === 'metasploit' ? 'text-cyber-red' : 'text-cyber-blue'}`}>
                  {tool.name}
                </span>
                <span className={`text-xs ${tool.name === 'metasploit' ? 'text-cyber-red' : 'text-cyber-green'}`}>
                  {getToolStatus(tool)}
                </span>
              </div>
              {tool.name === 'nmap' && (
                <div className="mt-1 text-xs">
                  <div className="flex justify-between">
                    <span>Scan type:</span>
                    <span className="text-cyber-blue">-sV -sC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Options:</span>
                    <span className="text-cyber-blue">-p 1-1000</span>
                  </div>
                </div>
              )}
              {tool.name === 'metasploit' && (
                <div className="mt-1 text-xs">
                  <div className="flex justify-between">
                    <span>Module:</span>
                    <span className="text-cyber-red">exploit/multi/http</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-cyber-red animate-pulse">Generating exploit</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {activeTools.length === 0 && (
            <div className="text-xs text-gray-400 italic text-center py-2">
              No active tools. Select tools from the toolkit.
            </div>
          )}
        </div>
      </div>
      
      {/* Connection Settings */}
      <div className="p-3 border-b border-cyber-blue/20">
        <h3 className="font-rajdhani font-semibold text-cyber-blue">CONNECTIONS</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">TOR Proxy</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={onToggleProxy}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cyber-panel peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyber-blue"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">VPN</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useVpn}
                onChange={onToggleVpn}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cyber-panel peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyber-blue"></div>
            </label>
          </div>
          <div className="mt-4">
            <button className="w-full py-1 px-3 rounded font-rajdhani font-medium bg-cyber-panel text-cyber-blue border border-cyber-blue/50 hover:bg-cyber-blue/20 transition-colors">
              ADVANCED ROUTING
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-3 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>API Status:</span>
          <span className={connected ? "text-cyber-green" : "text-cyber-red"}>
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>MCP Server:</span>
          <span className={connected ? "text-cyber-green" : "text-cyber-red"}>
            {connected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Database:</span>
          <span className="text-cyber-green">SYNCED</span>
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel;
