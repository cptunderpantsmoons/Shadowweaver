import { WebSocket as WSType } from 'ws';

// Define our own WebSocket type to avoid TypeScript errors
export type WebSocketClient = WSType;