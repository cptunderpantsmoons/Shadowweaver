import React from "react";

interface AttackVisualizationProps {
  targetInfo: any | null;
  attackPaths: any[];
  currentTarget: string;
  activeTool: string | null;
  onShowExploitBuilder: () => void;
}

const AttackVisualization: React.FC<AttackVisualizationProps> = ({
  targetInfo,
  attackPaths,
  currentTarget,
  activeTool,
  onShowExploitBuilder
}) => {
  return (
    <div className="hidden lg:block w-80 bg-cyber-dark border-l border-cyber-blue/20">
      <div className="p-3 border-b border-cyber-blue/20">
        <h2 className="font-rajdhani font-semibold text-lg text-cyber-blue">ATTACK VISUALIZATION</h2>
      </div>
      
      {/* Target Info */}
      <div className="p-3 border-b border-cyber-blue/20">
        <h3 className="text-sm font-rajdhani text-gray-400">TARGET INFO</h3>
        <div className="mt-2 bg-cyber-panel p-2 rounded text-xs">
          {targetInfo ? (
            <>
              <div className="flex justify-between">
                <span>IP Address:</span>
                <span className="text-cyber-blue">{currentTarget}</span>
              </div>
              <div className="flex justify-between">
                <span>OS:</span>
                <span className="text-cyber-blue">{targetInfo.os || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span>Open Ports:</span>
                <span className="text-cyber-blue">{targetInfo.ports ? targetInfo.ports.join(", ") : "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span>Web Server:</span>
                <span className="text-cyber-blue">{targetInfo.webServer || "Unknown"}</span>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-2">
              No target information available yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Network Map */}
      <div className="p-3 border-b border-cyber-blue/20">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-rajdhani text-gray-400">NETWORK MAP</h3>
          <div className="text-xs space-x-2">
            <button className="text-cyber-blue hover:text-cyber-blue-dim"><i className="fas fa-plus"></i></button>
            <button className="text-cyber-blue hover:text-cyber-blue-dim"><i className="fas fa-minus"></i></button>
          </div>
        </div>
        
        {/* Network Visualization */}
        <div className="mt-2 bg-cyber-black border border-cyber-blue/30 rounded h-48 relative overflow-hidden">
          {currentTarget ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-cyber-blue/30 border border-cyber-blue animate-pulse-glow absolute" style={{ left: "40%", top: "30%" }}>
                <div className="absolute inset-0 flex items-center justify-center text-xs">
                  <i className="fas fa-laptop"></i>
                </div>
              </div>
              
              {targetInfo && (
                <>
                  <div className="w-4 h-4 rounded-full bg-cyber-green/30 border border-cyber-green absolute" style={{ left: "60%", top: "40%" }}>
                    <div className="absolute inset-0 flex items-center justify-center text-xs">
                      <i className="fas fa-server"></i>
                    </div>
                  </div>
                  
                  {targetInfo.hasDatabase && (
                    <div className="w-5 h-5 rounded-full bg-cyber-red/30 border border-cyber-red animate-pulse absolute" style={{ left: "65%", top: "65%" }}>
                      <div className="absolute inset-0 flex items-center justify-center text-xs">
                        <i className="fas fa-database"></i>
                      </div>
                    </div>
                  )}
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="42%" y1="32%" x2="60%" y2="40%" stroke="#00FFFF" strokeWidth="1" strokeOpacity="0.5" />
                    
                    {targetInfo.hasDatabase && (
                      <>
                        <line x1="61%" y1="42%" x2="65%" y2="65%" stroke="#00FF66" strokeWidth="1" strokeOpacity="0.5" />
                        <line x1="40%" y1="30%" x2="65%" y2="65%" stroke="#FF0044" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4" />
                      </>
                    )}
                  </svg>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              No target specified yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Attack Paths */}
      <div className="p-3 border-b border-cyber-blue/20">
        <h3 className="text-sm font-rajdhani text-gray-400">ATTACK PATHS</h3>
        <div className="mt-2 space-y-2">
          {attackPaths.length > 0 ? (
            attackPaths.map((path, index) => (
              <div key={index} className={`bg-cyber-panel ${path.status === 'SCANNING' ? '' : 'bg-opacity-50'} p-2 rounded`}>
                <div className="flex items-center text-xs">
                  <span className={`w-4 h-4 flex items-center justify-center ${path.status === 'SCANNING' ? 'bg-cyber-blue/20' : 'bg-cyber-blue/10'} rounded-full ${path.status === 'SCANNING' ? 'text-cyber-blue' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <span className={`ml-2 ${path.status === 'SCANNING' ? '' : 'text-gray-400'}`}>
                    {path.description}
                  </span>
                  <span className={`ml-auto ${path.status === 'SCANNING' ? 'text-cyber-yellow' : ''}`}>
                    {path.status}
                  </span>
                </div>
                {path.details && (
                  <div className="mt-1 pl-6 text-xs text-gray-400">
                    {path.details}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 text-xs py-2">
              No attack paths identified yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Exploit Builder */}
      <div className="p-3">
        <h3 className="text-sm font-rajdhani text-gray-400">EXPLOIT BUILDER</h3>
        <div className="mt-2 bg-cyber-panel p-2 rounded">
          <div className="text-xs flex justify-between items-center">
            <span>Metasploit Framework</span>
            <span className={`${activeTool === 'metasploit' ? 'text-cyber-red' : 'text-gray-400'}`}>
              {activeTool === 'metasploit' ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="mt-2 text-center">
            <button 
              className="w-full py-1 px-3 rounded font-rajdhani text-xs font-medium bg-cyber-red/20 text-cyber-red border border-cyber-red/50 hover:bg-cyber-red/30 transition-colors"
              onClick={onShowExploitBuilder}
              disabled={!currentTarget}
            >
              LAUNCH EXPLOIT BUILDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackVisualization;
