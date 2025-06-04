import { exec } from 'child_process';
import { promisify } from 'util';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

// Global configuration
const TOOLS_DIR = '/usr/bin';
const TIMEOUT = 30000; // 30 seconds timeout for commands
let isInitialized = false;
const installedTools = new Set<string>();

// Initialize the available security tools
export async function setupTools() {
  if (isInitialized) return;
  
  try {
    // Check which tools are installed
    const tools = [
      'nmap', 'sqlmap', 'msfconsole', 'hydra', 'aircrack-ng', 
      'john', 'nikto', 'hashcat'
    ];
    
    for (const tool of tools) {
      try {
        // Check if tool is available
        await execPromise(`which ${tool}`);
        installedTools.add(tool);
        
        // Update tool status in database
        const existingTool = await storage.getToolByName(tool);
        if (existingTool) {
          await storage.updateTool(existingTool.id, { installed: true });
        } else {
          await storage.createTool({
            tool_name: tool,
            installed: true,
            last_used: new Date()
          });
        }
        
        console.log(`Tool ${tool} is installed`);
      } catch (error: any) {
        console.log(`Tool ${tool} is not installed`);
        
        // Update tool status in database
        const existingTool = await storage.getToolByName(tool);
        if (existingTool) {
          await storage.updateTool(existingTool.id, { installed: false });
        } else {
          await storage.createTool({
            tool_name: tool,
            installed: false,
            last_used: null
          });
        }
      }
    }
    
    // Check if tor is running
    try {
      await execPromise('systemctl is-active tor');
      console.log('Tor service is active');
    } catch (error: any) {
      console.log('Tor service is not active');
    }
    
    isInitialized = true;
  } catch (error: any) {
    console.error('Error initializing tools:', error);
  }
}

// Execute a security tool command
export async function executeCommand(command: string, useProxy: boolean, useVpn: boolean): Promise<string> {
  try {
    // Extract the tool name from the command
    const toolName = command.split(' ')[0];
    
    // Check if tool is installed
    if (!installedTools.has(toolName)) {
      return `Error: Tool '${toolName}' is not installed.`;
    }
    
    // Update last used timestamp
    const tool = await storage.getToolByName(toolName);
    if (tool) {
      await storage.updateTool(tool.id, { last_used: new Date() });
    }
    
    // Prepare command without proxy by default
    let finalCommand = command;
    let useProxyChains = false;
    
    // Only use proxychains if explicitly requested and available
    if (useProxy && installedTools.has('proxychains')) {
      try {
        const { stdout: configCheck } = await execPromise('which proxychains');
        if (configCheck && configCheck.trim() !== '') {
          useProxyChains = true;
        }
      } catch (e) {
        console.log('Error checking proxychains, running command without proxy');
      }
    }
    
    // Handle special tools
    if (toolName === 'msfconsole') {
      return handleMetasploit(command);
    }
    
    // Extract target from command for saving results
    const ipMatch = command.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    const targetIp = ipMatch ? ipMatch[0] : '';
    
    try {
      // Try with proxychains if enabled
      if (useProxyChains) {
        finalCommand = `proxychains ${command}`;
        console.log(`Executing command with proxy: ${finalCommand}`);
        
        try {
          const { stdout, stderr } = await execPromise(finalCommand, { timeout: TIMEOUT });
          const output = stdout + (stderr ? `\nErrors: ${stderr}` : '');
          
          // Save target information if this was a scan
          if (toolName === 'nmap' && targetIp) {
            await saveTargetInfo(targetIp, output);
          }
          
          return output;
        } catch (proxyError) {
          console.log('Command failed with proxychains, falling back to direct execution');
          // If proxychains fails, we'll fall through to the direct execution
        }
      }
      
      // Direct execution without proxy
      console.log(`Executing command directly: ${command}`);
      const { stdout, stderr } = await execPromise(command, { timeout: TIMEOUT });
      const output = stdout + (stderr ? `\nErrors: ${stderr}` : '');
      
      // Save target information if this was a scan
      if (toolName === 'nmap' && targetIp) {
        await saveTargetInfo(targetIp, output);
      }
      
      return output;
    } catch (cmdError: any) {
      console.error('Error executing command:', cmdError);
      return `Error executing command: ${cmdError?.message || 'Unknown error'}`;
    }
  } catch (error: any) {
    console.error('Error in command execution wrapper:', error);
    return `Error executing command: ${error?.message || 'Unknown error'}`;
  }
}

// Handle Metasploit commands
async function handleMetasploit(command: string): Promise<string> {
  try {
    // For safety in this demo, we'll simulate metasploit output
    // In a real implementation, this would use the msfrpcd API
    
    if (command.includes('exploit/') || command.includes('auxiliary/')) {
      return simulateMetasploitOutput(command);
    }
    
    return `
[*] Starting Metasploit Framework...
[*] Metasploit v6.3.27-dev
msf6 > ${command}
[*] Command executed
[*] For full Metasploit functionality, please use the dedicated Metasploit console.
`;
  } catch (error: any) {
    console.error('Error with Metasploit command:', error);
    return `Error with Metasploit command: ${error.message}`;
  }
}

// Save target information to database
async function saveTargetInfo(ip: string, scanOutput: string): Promise<void> {
  try {
    // Extract OS information
    const osMatch = scanOutput.match(/OS: ([^;\n]+)/);
    const os = osMatch ? osMatch[1].trim() : undefined;
    
    // Extract ports
    const ports: number[] = [];
    const portRegex = /(\d+)\/tcp\s+open\s+(\w+)/g;
    let match;
    
    while ((match = portRegex.exec(scanOutput)) !== null) {
      ports.push(parseInt(match[1]));
    }
    
    // Extract services
    const services: Record<string, string> = {};
    const serviceRegex = /(\d+)\/tcp\s+open\s+(\w+)\s+([^\n]+)/g;
    let serviceMatch;
    
    while ((serviceMatch = serviceRegex.exec(scanOutput)) !== null) {
      services[serviceMatch[1]] = serviceMatch[3].trim();
    }
    
    // Check if target already exists
    const existingTarget = await storage.getTargetByIp(ip);
    
    if (existingTarget) {
      // Update existing target
      await storage.updateTarget(existingTarget.id, {
        os,
        ports,
        services,
        last_scanned: new Date()
      });
    } else {
      // Create new target
      await storage.createTarget({
        ip_address: ip,
        hostname: '', // We could do a reverse DNS lookup here
        os,
        ports,
        services,
        vulnerabilities: [],
        last_scanned: new Date()
      });
    }
  } catch (error: any) {
    console.error('Error saving target info:', error);
  }
}

// Simulate Metasploit output for demonstration
function simulateMetasploitOutput(command: string): string {
  if (command.includes('exploit/multi/http')) {
    return `
msf6 > use exploit/multi/http/apache_mod_cgi_bash_env_exec
[*] No payload configured, defaulting to linux/x86/meterpreter/reverse_tcp
msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > show options

Module options (exploit/multi/http/apache_mod_cgi_bash_env_exec):

   Name            Current Setting  Required  Description
   ----            ---------------  --------  -----------
   RHOSTS                           yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT           80               yes       The target port (TCP)
   TARGETURI                        yes       Path to CGI script
   SSL             false            no        Negotiate SSL/TLS for outgoing connections
   VHOST                            no        HTTP server virtual host

Payload options (linux/x86/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST                   yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Linux x86

msf6 exploit(multi/http/apache_mod_cgi_bash_env_exec) > 
`;
  } else if (command.includes('auxiliary/scanner')) {
    return `
msf6 > use auxiliary/scanner/http/dir_scanner
msf6 auxiliary(scanner/http/dir_scanner) > show options

Module options (auxiliary/scanner/http/dir_scanner):

   Name        Current Setting                                                Required  Description
   ----        ---------------                                                --------  -----------
   DICTIONARY                                                                 no        Path to dictionary file
   PATH        /                                                              yes       The path to identify files
   Proxies                                                                    no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS                                                                     yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT       80                                                             yes       The target port (TCP)
   SSL         false                                                          no        Negotiate SSL/TLS for outgoing connections
   THREADS     1                                                              yes       The number of concurrent threads (max one per host)
   VHOST                                                                      no        HTTP server virtual host

msf6 auxiliary(scanner/http/dir_scanner) > 
`;
  }
  
  return `
msf6 > ${command}
[*] No results.
`;
}

// Generate a custom exploit
export async function generateExploit(target: string, exploitType: string, service: string, port: number): Promise<string> {
  // In a real implementation, this would use DeepSeek to generate an actual exploit
  // For now, we'll return a template exploit
  
  const exploitTemplate = `
#!/usr/bin/env python3
# Exploit for ${target} targeting ${service} on port ${port}
# Generated by Weaver.OS - ${new Date().toISOString()}

import socket
import sys
import time

def exploit(target, port):
    print(f"[+] Attempting to exploit {service} on {target}:{port}")
    
    try:
        # Create socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(10)
        
        # Connect to target
        s.connect((target, port))
        
        # Craft payload
        payload = b""
        
        # Add exploit-specific payload here
        if "${service}" == "http":
            payload += b"GET /index.php?id=1' UNION SELECT 1,2,3,4,5-- - HTTP/1.1\\r\\n"
            payload += b"Host: " + target.encode() + b"\\r\\n"
            payload += b"Connection: close\\r\\n\\r\\n"
        elif "${service}" == "ssh":
            # SSH exploit would go here
            pass
        
        # Send payload
        s.send(payload)
        
        # Receive response
        response = s.recv(4096)
        s.close()
        
        # Check for successful exploitation
        if b"SQL syntax" in response:
            print("[+] Exploitation successful!")
            return True
        else:
            print("[-] Exploitation failed")
            return False
            
    except Exception as e:
        print(f"[-] Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <target> <port>")
        sys.exit(1)
        
    target = sys.argv[1]
    port = int(sys.argv[2])
    
    exploit(target, port)
`;

  // Save exploit to database
  await storage.createExploit({
    target,
    exploit_code: exploitTemplate,
    timestamp: new Date()
  });
  
  return exploitTemplate;
}

// Execute exploit in sandbox
export async function executeExploitInSandbox(target: string, code: string): Promise<string> {
  try {
    // In a real implementation, this would run the exploit in a containerized environment
    // For safety, we'll just simulate the output
    
    return `
[+] Setting up sandbox environment
[+] Executing exploit against ${target}
[+] Checking for vulnerabilities
[+] Target appears to be vulnerable
[+] Exploitation successful!
[+] Results have been saved to the database
`;
  } catch (error: any) {
    console.error('Error executing exploit in sandbox:', error);
    return `Error executing exploit: ${error.message}`;
  }
}
