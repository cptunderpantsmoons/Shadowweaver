import React from "react";

// Define a set of SVG paths for each tool
const ToolIcons = {
  nmap: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3"/>
      <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  
  sqlmap: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 14C4 12.8954 4.89543 12 6 12H18C19.1046 12 20 12.8954 20 14V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 14L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 14L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  metasploit: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M7 8.5L12 4L17 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 20H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 15.5L12 20L17 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  hydra: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M5 7C5 5.34315 6.34315 4 8 4H16C17.6569 4 19 5.34315 19 7V7C19 8.65685 17.6569 10 16 10H8C6.34315 10 5 8.65685 5 7V7Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 10V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  aircrack: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M12 5C15.866 5 19 8.13401 19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 9C13.6569 9 15 10.3431 15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <path d="M5 12C5 8.13401 8.13401 5 12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 3"/>
      <path d="M9 12C9 10.3431 10.3431 9 12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 3"/>
    </svg>
  ),
  
  burpsuite: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M5 8C5 5.79086 6.79086 4 9 4H15C17.2091 4 19 5.79086 19 8V16C19 18.2091 17.2091 20 15 20H9C6.79086 20 5 18.2091 5 16V8Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 8L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 8L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  owasp: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M5 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 4L8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 4L14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  john: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="1" fill="currentColor"/>
      <circle cx="14" cy="10" r="1" fill="currentColor"/>
      <path d="M8 8L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 8L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  nikto: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M12 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7.05 7.05L8.464 8.464" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15.536 15.536L16.95 16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7.05 16.95L8.464 15.536" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15.536 8.464L16.95 7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  
  hashcat: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M6 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 8L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
};

export default ToolIcons;
