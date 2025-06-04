import { 
  InsertEvent, Event, 
  InsertTool, Tool, 
  InsertExploit, Exploit, 
  InsertTarget, Target,
  InsertUser, User
} from "@shared/schema";

export interface IStorage {
  // User methods (from the existing interface)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;

  // Tool methods
  getTool(id: number): Promise<Tool | undefined>;
  getToolByName(name: string): Promise<Tool | undefined>;
  getTools(): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<Tool>): Promise<Tool | undefined>;

  // Exploit methods
  createExploit(exploit: InsertExploit): Promise<Exploit>;
  getExploit(id: number): Promise<Exploit | undefined>;
  getExploits(): Promise<Exploit[]>;

  // Target methods
  createTarget(target: InsertTarget): Promise<Target>;
  getTarget(id: number): Promise<Target | undefined>;
  getTargetByIp(ip: string): Promise<Target | undefined>;
  updateTarget(id: number, target: Partial<Target>): Promise<Target | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private tools: Map<number, Tool>;
  private exploits: Map<number, Exploit>;
  private targets: Map<number, Target>;
  
  private currentUserId: number;
  private currentEventId: number;
  private currentToolId: number;
  private currentExploitId: number;
  private currentTargetId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.tools = new Map();
    this.exploits = new Map();
    this.targets = new Map();
    
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentToolId = 1;
    this.currentExploitId = 1;
    this.currentTargetId = 1;

    // Initialize default tools
    this.initializeTools();
  }

  private initializeTools() {
    const tools = [
      'nmap', 'sqlmap', 'metasploit', 'hydra', 'aircrack-ng', 
      'burpsuite', 'owasp-zap', 'john', 'nikto', 'hashcat'
    ];
    
    tools.forEach(name => {
      this.createTool({
        tool_name: name,
        installed: true,
        last_used: new Date()
      });
    });
  }

  // User methods from the existing implementation
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { 
      ...insertEvent, 
      id,
      timestamp: new Date(),
      ai_response: insertEvent.ai_response || null,
      task_output: insertEvent.task_output || null,
      attack_plan: insertEvent.attack_plan || {}
    };
    this.events.set(id, event);
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => {
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent: Event = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  // Tool methods
  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async getToolByName(name: string): Promise<Tool | undefined> {
    return Array.from(this.tools.values()).find(
      (tool) => tool.tool_name === name
    );
  }

  async getTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = this.currentToolId++;
    const tool: Tool = { 
      ...insertTool, 
      id,
      installed: insertTool.installed || false,
      last_used: insertTool.last_used || null
    };
    this.tools.set(id, tool);
    return tool;
  }

  async updateTool(id: number, toolUpdate: Partial<Tool>): Promise<Tool | undefined> {
    const tool = this.tools.get(id);
    if (!tool) return undefined;
    
    const updatedTool: Tool = { ...tool, ...toolUpdate };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }

  // Exploit methods
  async createExploit(insertExploit: InsertExploit): Promise<Exploit> {
    const id = this.currentExploitId++;
    const exploit: Exploit = { 
      ...insertExploit, 
      id,
      timestamp: new Date()
    };
    this.exploits.set(id, exploit);
    return exploit;
  }

  async getExploit(id: number): Promise<Exploit | undefined> {
    return this.exploits.get(id);
  }

  async getExploits(): Promise<Exploit[]> {
    return Array.from(this.exploits.values()).sort((a, b) => {
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  // Target methods
  async createTarget(insertTarget: InsertTarget): Promise<Target> {
    const id = this.currentTargetId++;
    const target: Target = { 
      ...insertTarget, 
      id,
      last_scanned: new Date(),
      hostname: insertTarget.hostname || null,
      os: insertTarget.os || null,
      ports: insertTarget.ports || [],
      services: insertTarget.services || {},
      vulnerabilities: insertTarget.vulnerabilities || []
    };
    this.targets.set(id, target);
    return target;
  }

  async getTarget(id: number): Promise<Target | undefined> {
    return this.targets.get(id);
  }

  async getTargetByIp(ip: string): Promise<Target | undefined> {
    return Array.from(this.targets.values()).find(
      (target) => target.ip_address === ip
    );
  }

  async updateTarget(id: number, targetUpdate: Partial<Target>): Promise<Target | undefined> {
    const target = this.targets.get(id);
    if (!target) return undefined;
    
    const updatedTarget: Target = { 
      ...target, 
      ...targetUpdate,
      last_scanned: new Date()
    };
    this.targets.set(id, updatedTarget);
    return updatedTarget;
  }
}

export const storage = new MemStorage();
