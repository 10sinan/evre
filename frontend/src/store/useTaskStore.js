import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { taskService } from '../services/api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-evre';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  stompClient: null,

  // Fetch initial tasks from REST API
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await taskService.getTasks();
      set({ tasks: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      set({ error: 'Görevler yüklenirken hata oluştu.', isLoading: false });
    }
  },

  // Set up WebSocket connection
  connectWebSocket: () => {
    const { stompClient } = get();
    if (stompClient && stompClient.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        
        // Subscribe to tasks topic
        client.subscribe('/topic/tasks', (message) => {
          if (message.body) {
            const updatedTask = JSON.parse(message.body);
            get().handleTaskUpdateFromWS(updatedTask);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketError: (error) => {
        console.error('Error with websocket', error);
      }
    });

    client.activate();
    set({ stompClient: client });
  },

  disconnectWebSocket: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
      set({ stompClient: null });
    }
  },

  // Handle updates coming from WebSocket
  handleTaskUpdateFromWS: (updatedTask) => {
    set((state) => {
      const exists = state.tasks.some(t => t.id === updatedTask.id);
      if (exists) {
        // Update existing task
        return {
          tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        };
      } else {
        // Add new task
        return {
          tasks: [...state.tasks, updatedTask]
        };
      }
    });
  },

  // Actions
  createTask: async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      // We could add it immediately, but let's wait for WS broadcast
      // or add optimistically:
      // set(state => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    }));

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert could be implemented here if needed by refetching
      get().fetchTasks();
    }
  }
}));
