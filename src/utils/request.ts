/**
 * Convert a given http uri to a websocket uri
 */
export const httpToWebSocket = (uri: string) => uri.replace('http://', 'ws://');
