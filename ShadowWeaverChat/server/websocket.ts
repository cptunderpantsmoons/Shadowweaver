import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { processChatMessage } from './deepseek';
import { storage } from './storage';
import { executeCommand, generateExploit, executeExploitInSandbox } from './tools';

// Message types for WebSocket communication
enum MessageType {
  SYSTEM = "system",
  USER = "user",
  AI = "ai",
  COMMAND = "command",
  ANALYSIS = "analysis",
  CHAIN = "chain",
  SET_PROXY = "set_proxy",
  SET_VPN = "set_vpn",
  USER_MESSAGE = "user_message",
  GENERATE_EXPLOIT = "generate_exploit",
  EXECUTE_EXPLOIT = "execute_exploit"
}

// Global state
let useProxy: boolean = true;
let useVpn: boolean = false;
let activeTool: string | null = null;
let isExecuting: boolean = false;

// Set up WebSocket server
export function setupWebSockets(server: HttpServer) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    clientTracking: true,
    perMessageDeflate: false
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    // Send initial system messages
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: 'Weaver of Shadows v1.7.3 initialized...'
    }));

    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: 'Connected to DeepSeek API. TOR proxy active.'
    }));

    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: 'MCP server ready. 10 tools available.'
    }));

    // Send active tool status
    ws.send(JSON.stringify({
      type: 'activeTool',
      tool: activeTool,
      executing: isExecuting
    }));

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case MessageType.USER_MESSAGE:
            await handleUserMessage(ws, data.payload.text);
            break;
          
          case MessageType.SET_PROXY:
            useProxy = data.payload.enabled;
            ws.send(JSON.stringify({
              type: 'message',
              messageType: MessageType.SYSTEM,
              content: `TOR proxy ${useProxy ? 'enabled' : 'disabled'}`
            }));
            break;
          
          case MessageType.SET_VPN:
            useVpn = data.payload.enabled;
            ws.send(JSON.stringify({
              type: 'message',
              messageType: MessageType.SYSTEM,
              content: `VPN ${useVpn ? 'enabled' : 'disabled'}`
            }));
            break;
          
          case MessageType.GENERATE_EXPLOIT:
            await handleGenerateExploit(ws, data.payload);
            break;
          
          case MessageType.EXECUTE_EXPLOIT:
            await handleExecuteExploit(ws, data.payload);
            break;
            
          case MessageType.COMMAND:
            // Direct command execution (for tools like nmap, nikto, etc.)
            if (data.payload && data.payload.command) {
              isExecuting = true;
              activeTool = data.payload.command.split(' ')[0];
              updateActiveToolStatus(ws);
              
              // Send command as message first
              ws.send(JSON.stringify({
                type: 'message',
                messageType: MessageType.COMMAND,
                content: data.payload.command
              }));
              
              // Execute the command
              const result = await executeCommand(data.payload.command, useProxy, useVpn);
              
              // Send the command output
              ws.send(JSON.stringify({
                type: 'message',
                messageType: MessageType.COMMAND,
                content: data.payload.command,
                output: result
              }));
              
              // Update target info if this is a recon command
              if (data.payload.command.includes('nmap') || data.payload.command.includes('nikto')) {
                const targetInfo = extractTargetInfo(result, data.payload.command);
                if (targetInfo) {
                  ws.send(JSON.stringify({
                    type: 'targetInfo',
                    info: targetInfo
                  }));
                  
                  // Generate potential attack paths
                  const paths = generateAttackPaths(targetInfo);
                  ws.send(JSON.stringify({
                    type: 'attackPaths',
                    paths
                  }));
                }
              }
              
              isExecuting = false;
              updateActiveToolStatus(ws);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'message',
          messageType: MessageType.SYSTEM,
          content: 'Error processing your request'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
}

// Handle user chat messages
async function handleUserMessage(ws: WebSocket, message: string) {
  try {
    // Store user message in database
    const event = await storage.createEvent({
      user_input: message,
      ai_response: '',
      task_output: '',
      attack_plan: {}
    });
    
    // Process with DeepSeek
    isExecuting = true;
    updateActiveToolStatus(ws);
    
    const result = await processChatMessage(message);
    
    // Send AI response
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.AI,
      content: result.aiResponse
    }));
    
    // Update event in database
    await storage.updateEvent(event.id, {
      ai_response: result.aiResponse
    });
    
    // If there are commands to execute
    if (result.commands && result.commands.length > 0) {
      for (const command of result.commands) {
        // Send command message
        ws.send(JSON.stringify({
          type: 'message',
          messageType: MessageType.COMMAND,
          content: command
        }));
        
        // Extract tool name
        const toolName = command.split(' ')[0];
        activeTool = toolName;
        updateActiveToolStatus(ws);
        
        // Execute command
        const output = await executeCommand(command, useProxy, useVpn);
        
        // Update command message with output
        ws.send(JSON.stringify({
          type: 'message',
          messageType: MessageType.COMMAND,
          content: command,
          output: output
        }));
        
        // Update target info if applicable
        if (toolName === 'nmap' && output) {
          const targetInfo = extractTargetInfo(output, message);
          if (targetInfo) {
            ws.send(JSON.stringify({
              type: 'targetInfo',
              info: targetInfo
            }));
            
            // Also send attack paths
            const attackPaths = generateAttackPaths(targetInfo);
            ws.send(JSON.stringify({
              type: 'attackPaths',
              paths: attackPaths
            }));
          }
        }
      }
    }
    
    // If there's an analysis
    if (result.analysis) {
      ws.send(JSON.stringify({
        type: 'message',
        messageType: MessageType.ANALYSIS,
        content: result.analysis
      }));
    }
    
    // If there's an attack chain
    if (result.attackChain && result.attackChain.length > 0) {
      ws.send(JSON.stringify({
        type: 'message',
        messageType: MessageType.CHAIN,
        steps: result.attackChain
      }));
    }
    
    // Reset execution status
    isExecuting = false;
    updateActiveToolStatus(ws);
    
  } catch (error) {
    console.error('Error handling user message:', error);
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: 'Error processing your message'
    }));
    isExecuting = false;
    updateActiveToolStatus(ws);
  }
}

// Handle exploit generation
async function handleGenerateExploit(ws: WebSocket, payload: any) {
  try {
    const { target, exploitType, service, port } = payload;
    isExecuting = true;
    activeTool = 'metasploit';
    updateActiveToolStatus(ws);
    
    // Send system message about generating exploit
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: `Generating exploit for ${target} (${service}:${port})`
    }));
    
    // Generate exploit code
    const exploitCode = await generateExploit(target, exploitType, service, port);
    
    // Send the generated exploit
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.COMMAND,
      content: `msfvenom -p ${service}/reverse_tcp LHOST=${target} LPORT=${port}`,
      output: exploitCode
    }));
    
    isExecuting = false;
    updateActiveToolStatus(ws);
    
  } catch (error) {
    console.error('Error generating exploit:', error);
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: 'Error generating exploit'
    }));
    isExecuting = false;
    updateActiveToolStatus(ws);
  }
}

// Handle exploit execution
async function handleExecuteExploit(ws: WebSocket, payload: any) {
  try {
    const { target, code } = payload;
    isExecuting = true;
    activeTool = 'metasploit';
    updateActiveToolStatus(ws);
    
    // Send message about executing exploit
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: `Executing exploit against ${target} in sandbox environment`
    }));
    
    // Execute the exploit in sandbox
    const result = await executeExploitInSandbox(target, code);
    
    // Send the result
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.COMMAND,
      content: `execute -t ${target}`,
      output: result
    }));
    
    isExecuting = false;
    updateActiveToolStatus(ws);
    
  } catch (error) {
    console.error('Error executing exploit:', error);
    ws.send(JSON.stringify({
      type: 'message',
      messageType: MessageType.SYSTEM,
      content: 'Error executing exploit'
    }));
    isExecuting = false;
    updateActiveToolStatus(ws);
  }
}

// Update active tool status
function updateActiveToolStatus(ws: WebSocket) {
  ws.send(JSON.stringify({
    type: 'activeTool',
    tool: activeTool,
    executing: isExecuting
  }));
}

// Extract target information from nmap output
function extractTargetInfo(output: string, message: string): any {
  // Extract IP from message
  const ipMatch = message.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
  const ip = ipMatch ? ipMatch[0] : "Unknown";
  
  // Extract OS from output
  const osMatch = output.match(/OS: ([^;]+)/);
  const os = osMatch ? osMatch[1].trim() : "Unknown";
  
  // Extract ports
  const portMatches = output.match(/(\d+)\/tcp\s+open\s+(\w+)/g);
  const ports = portMatches 
    ? portMatches.map(p => parseInt(p.match(/(\d+)\/tcp/)?.[1] || '0'))
    : [];
  
  // Extract web server
  const webServerMatch = output.match(/http.*?Apache/i);
  const webServer = webServerMatch ? webServerMatch[0].trim() : "";
  
  return {
    ip,
    os,
    ports,
    webServer,
    hasDatabase: output.includes('mysql') || output.includes('postgres'),
    vulnerabilities: []
  };
}

// Generate attack paths based on target info
function generateAttackPaths(targetInfo: any): any[] {
  const paths = [];
  
  // Web server path
  if (targetInfo.webServer) {
    paths.push({
      description: `HTTP (${targetInfo.ports.includes(80) ? '80' : targetInfo.ports.includes(443) ? '443' : 'Unknown'}) → ${targetInfo.webServer} → Web Vuln`,
      status: 'SCANNING',
      tool: 'nikto',
      details: 'Scanning for web vulnerabilities...'
    });
  }
  
  // SMB path if port 445 is open
  if (targetInfo.ports.includes(445)) {
    paths.push({
      description: 'SMB (445) → Samba → Share Access',
      status: 'PENDING',
      tool: 'enum4linux'
    });
  }
  
  // SSH path if port 22 is open
  if (targetInfo.ports.includes(22)) {
    paths.push({
      description: 'SSH (22) → Brute Force → Access',
      status: 'PENDING',
      tool: 'hydra'
    });
  }
  
  // Database path
  if (targetInfo.hasDatabase) {
    paths.push({
      description: 'Database → SQL Injection → Data Access',
      status: 'PENDING',
      tool: 'sqlmap'
    });
  }
  
  return paths;
}
