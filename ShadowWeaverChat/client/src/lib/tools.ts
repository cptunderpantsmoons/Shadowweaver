export enum MessageType {
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

export interface Message {
  type: MessageType;
  content?: string;
  output?: string;
  steps?: string[];
  timestamp?: number;
}

export interface Tool {
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export const allTools: Tool[] = [
  {
    name: "nmap",
    shortName: "nmap",
    description: "Network scanning and discovery tool",
    icon: "fa-network-wired"
  },
  {
    name: "sqlmap",
    shortName: "sqlmap",
    description: "SQL injection detection and exploitation tool",
    icon: "fa-database"
  },
  {
    name: "metasploit",
    shortName: "msf",
    description: "Vulnerability exploitation framework",
    icon: "fa-bug"
  },
  {
    name: "hydra",
    shortName: "hydra",
    description: "Password cracking and brute force tool",
    icon: "fa-key"
  },
  {
    name: "aircrack-ng",
    shortName: "aircrack",
    description: "WiFi security auditing tools suite",
    icon: "fa-wifi"
  },
  {
    name: "john",
    shortName: "john",
    description: "John the Ripper password cracker",
    icon: "fa-unlock"
  },
  {
    name: "nikto",
    shortName: "nikto",
    description: "Web server scanner for dangerous files/CGIs",
    icon: "fa-search"
  },
  {
    name: "hashcat",
    shortName: "hashcat",
    description: "Advanced password recovery utility",
    icon: "fa-hashtag"
  }
];
