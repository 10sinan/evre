import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export const useWebSocket = () => {
  const stompClient = useTaskStore((state) => state.stompClient);
  const handleTaskUpdateFromWS = useTaskStore((state) => state.handleTaskUpdateFromWS);
  const currentProjectId = useTaskStore((state) => state.currentProjectId);
  const addLog = useTaskStore((state) => state.addLog);

  useEffect(() => {
    if (!stompClient) return;

    let taskSubscription = null;
    let logSubscription = null;

    const subscribeAll = () => {
      // 1. Subscribe to general task updates
      console.log('Subscribing to /topic/tasks...');
      taskSubscription = stompClient.subscribe('/topic/tasks', (payload) => {
        if (payload.body) {
          try {
            const updatedTask = JSON.parse(payload.body);
            // Only update store tasks if the task belongs to the active project
            if (updatedTask.projectId === currentProjectId) {
              handleTaskUpdateFromWS(updatedTask);
            }
          } catch (e) {
            console.error('Failed to parse task WebSocket payload:', e);
          }
        }
      });

      // 2. Subscribe to active project log feed
      if (currentProjectId) {
        const logTopic = `/topic/projects/${currentProjectId}/logs`;
        console.log(`Subscribing to logs topic: ${logTopic}`);
        logSubscription = stompClient.subscribe(logTopic, (payload) => {
          if (payload.body) {
            try {
              const logDto = JSON.parse(payload.body);
              console.log('Received log update:', logDto);
              addLog(logDto);
            } catch (e) {
              console.error('Failed to parse log WebSocket payload:', e);
            }
          }
        });
      }
    };

    if (stompClient.connected) {
      subscribeAll();
    } else {
      // Intercept stomp connect event
      const originalOnConnect = stompClient.onConnect;
      stompClient.onConnect = (frame) => {
        if (originalOnConnect) {
          originalOnConnect(frame);
        }
        subscribeAll();
      };
    }

    return () => {
      if (taskSubscription) {
        taskSubscription.unsubscribe();
      }
      if (logSubscription) {
        logSubscription.unsubscribe();
      }
    };
  }, [stompClient, currentProjectId, handleTaskUpdateFromWS, addLog]);
};
