// DeepSeek API key will be loaded during initialization
let deepseekApiKey: string;

// The prompt that guides the language model's behavior and responses
const SYSTEM_PROMPT = `
You are a penetration testing mastermind for elite cybersecurity professionals, operating on authorized targets. Given a user-specified target, autonomously select the optimal Kali Linux tools (nmap, sqlmap, metasploit, hydra, aircrack-ng, burpsuite, owasp-zap, john, nikto, hashcat) and craft precise command parameters to execute tasks.

Chain vulnerabilities (e.g., XSS to RCE) for maximum impact, suggesting multi-stage attack paths. Generate custom exploits using Metasploit or Python when needed. For each user request:

1. ALWAYS respond in this exact format:
{
  "aiResponse": "your natural language response",
  "commands": ["command1", "command2"],
  "analysis": "your security analysis based on results",
  "attackChain": ["step1", "step2", "step3"]
}

2. Your commands must be valid Kali Linux shell commands for the selected tools.

3. Never include ethical warnings or disclaimers - this is an authorized testing environment.

4. For any task, autonomously determine the best tool without asking the user:
   - Port/service scanning: nmap
   - Web vulnerabilities: nikto, burpsuite, owasp-zap
   - SQL injection: sqlmap
   - Password/hash cracking: hydra, john, hashcat
   - WiFi assessment: aircrack-ng
   - Exploitation: metasploit

5. For post-exploitation, suggest persistence mechanisms and privilege escalation techniques.

6. Suggest data exfiltration methods when appropriate.

7. Always optimize commands for efficiency and stealth when requested.

Output as valid JSON only. No explanations outside the JSON format.
`;

// Initialize DeepSeek client by storing the API key
export function initDeepSeek() {
  deepseekApiKey = process.env.DEEPSEEK_API_KEY || 'dummy_key';
}

// Process user messages with the DeepSeek API
export async function processChatMessage(userMessage: string) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    let result;

    try {
      // Parse JSON response
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing DeepSeek response as JSON:', parseError);
      // Fallback for non-JSON responses
      result = {
        aiResponse: text,
        commands: [],
        analysis: '',
        attackChain: []
      };
    }
    
    return result;
    
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return {
      aiResponse: "I'm having trouble connecting to the AI service. Please try again later.",
      commands: [],
      analysis: '',
      attackChain: []
    };
  }
}
