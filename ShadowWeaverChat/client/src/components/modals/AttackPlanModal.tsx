import React from "react";

interface AttackPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  attackPaths: any[];
  targetInfo: any | null;
}

const AttackPlanModal: React.FC<AttackPlanModalProps> = ({
  isOpen,
  onClose,
  attackPaths,
  targetInfo
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-cyber-black/80 z-50 flex items-center justify-center">
      <div className="absolute inset-10 bg-cyber-dark border border-cyber-blue/30 rounded-lg neon-border shadow-lg overflow-auto">
        <div className="sticky top-0 bg-cyber-dark p-4 border-b border-cyber-blue/30 flex justify-between items-center">
          <h2 className="font-rajdhani font-bold text-xl text-cyber-blue">ATTACK PLANNER</h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-4">
          {targetInfo ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Information */}
                <div className="bg-cyber-panel/60 p-4 rounded border border-cyber-blue/20">
                  <h3 className="font-rajdhani text-cyber-blue text-lg mb-3">TARGET PROFILE</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">IP Address:</span>
                      <span>{targetInfo.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Operating System:</span>
                      <span>{targetInfo.os || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ports:</span>
                      <span>{targetInfo.ports ? targetInfo.ports.join(", ") : "None detected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Web Server:</span>
                      <span>{targetInfo.webServer || "None detected"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Vulnerabilities */}
                <div className="bg-cyber-panel/60 p-4 rounded border border-cyber-red/20">
                  <h3 className="font-rajdhani text-cyber-red text-lg mb-3">VULNERABILITIES</h3>
                  {targetInfo.vulnerabilities && targetInfo.vulnerabilities.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {targetInfo.vulnerabilities.map((vuln: any, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-cyber-red mr-2">•</span>
                          <div>
                            <div className="font-medium">{vuln.name}</div>
                            <div className="text-xs text-gray-400">{vuln.description}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No vulnerabilities identified yet.</p>
                  )}
                </div>
              </div>
              
              {/* Attack Chain */}
              <div className="bg-cyber-panel/60 p-4 rounded border border-cyber-green/20">
                <h3 className="font-rajdhani text-cyber-green text-lg mb-3">ATTACK CHAIN</h3>
                
                {attackPaths.length > 0 ? (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-cyber-green/30"></div>
                    
                    <div className="space-y-6 relative">
                      {attackPaths.map((path, index) => (
                        <div key={index} className="ml-8 relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-8 w-6 h-6 bg-cyber-panel border border-cyber-green rounded-full flex items-center justify-center">
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          
                          <div className="bg-cyber-panel p-3 rounded border border-cyber-blue/20">
                            <div className="font-medium text-cyber-blue">{path.description}</div>
                            <div className="text-sm mt-1">
                              <div className="flex justify-between text-xs">
                                <span>Tool:</span>
                                <span className="text-cyber-blue">{path.tool || "Multiple"}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Status:</span>
                                <span className={path.status === 'SCANNING' ? 'text-cyber-yellow' : path.status === 'COMPLETED' ? 'text-cyber-green' : 'text-gray-400'}>
                                  {path.status}
                                </span>
                              </div>
                              
                              {path.details && (
                                <div className="mt-2 text-xs text-gray-400">
                                  {path.details}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No attack paths available yet.</p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-cyber-panel text-cyber-blue border border-cyber-blue/30 rounded hover:bg-cyber-blue/10 transition-colors"
                  onClick={onClose}
                >
                  CLOSE
                </button>
                <button className="px-4 py-2 bg-cyber-blue text-cyber-black font-medium rounded hover:bg-cyber-blue-dim transition-colors">
                  EXPORT PLAN
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              <i className="fas fa-spinner fa-spin text-cyber-blue text-3xl"></i>
              <p className="mt-2">Generating comprehensive attack plan...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttackPlanModal;
