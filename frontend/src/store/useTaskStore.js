import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { taskService, projectService, logService, userService, subTaskService, commentService } from '../services/api';
import { authService } from '../services/authService';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-evre';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  projects: [],
  myTasks: [],
  currentProjectId: null,
  logs: [],
  users: [],
  isLoading: false,
  error: null,
  activeView: 'board',
  stompClient: null,
  user: authService.getCurrentUser(),
  isTerminalOpen: false,
  
  // Filter States
  searchQuery: '',
  filterAssignee: 'All',
  filterPriority: 'All',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setActiveView: (view) => set({ activeView: view }),
  toggleTerminal: (isOpen) => set((state) => ({ isTerminalOpen: isOpen !== undefined ? isOpen : !state.isTerminalOpen })),

  getFilteredTasks: () => {
    const { tasks, searchQuery, filterAssignee, filterPriority } = get();
    return tasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAssignee = 
        filterAssignee === 'All' || 
        task.assignedToId === Number(filterAssignee);

      const matchesPriority = 
        filterPriority === 'All' || 
        task.priority === filterPriority;

      return matchesSearch && matchesAssignee && matchesPriority;
    });
  },

  login: async (username, password) => {
    try {
      const data = await authService.login(username, password);
      set({ user: data, error: null });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  register: async (username, email, password) => {
    try {
      const data = await authService.register(username, email, password);
      set({ user: data, error: null });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, currentProjectId: null, projects: [], tasks: [], logs: [] });
    get().disconnectWebSocket();
  },

  // Fetch projects list
  fetchProjects: async () => {
    try {
      const data = await projectService.getProjects();
      set({ projects: data });
      if (data.length > 0 && !get().currentProjectId) {
        get().setCurrentProjectId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  },

  // Fetch users list
  fetchUsers: async () => {
    try {
      const data = await userService.getUsers();
      set({ users: data });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },

  // Fetch My Tasks
  fetchMyTasks: async () => {
    const { user } = get();
    if (!user) return;
    try {
      set({ isLoading: true });
      const allTasks = await taskService.getTasks();
      const myTasks = allTasks.filter(task => task.assignedToId === user.id);
      set({ myTasks });
    } catch (error) {
      console.error('Failed to fetch my tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentProjectId: (projectId) => {
    set({ currentProjectId: projectId, tasks: [], logs: [] });
    get().fetchTasks();
    get().fetchLogs();
  },

  createProject: async (projectData) => {
    try {
      const newProject = await projectService.createProject(projectData);
      set((state) => ({ projects: [...state.projects, newProject] }));
      if (!get().currentProjectId) {
        get().setCurrentProjectId(newProject.id);
      }
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },

  fetchLogs: async () => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;
    try {
      const data = await logService.getLogsByProject(currentProjectId);
      set({ logs: data });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  },

  addLog: (log) => {
    set((state) => ({ logs: [log, ...state.logs].slice(0, 50) }));
  },

  // Fetch initial tasks from REST API
  fetchTasks: async () => {
    const { currentProjectId } = get();
    if (!currentProjectId) {
      set({ tasks: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await taskService.getTasksByProject(currentProjectId);
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

    const token = localStorage.getItem('token');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
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
      let newTasks = state.tasks;
      const exists = state.tasks.some(t => t.id === updatedTask.id);
      if (exists) {
        newTasks = state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      } else {
        newTasks = [...state.tasks, updatedTask];
      }

      let newMyTasks = state.myTasks;
      const existsInMyTasks = state.myTasks.some(t => t.id === updatedTask.id);
      if (existsInMyTasks) {
        newMyTasks = state.myTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      } else if (state.user && updatedTask.assignedToId === state.user.id) {
        newMyTasks = [...state.myTasks, updatedTask];
      }

      return { tasks: newTasks, myTasks: newMyTasks };
    });
  },

  // Actions
  createTask: async (taskData) => {
    const { currentProjectId } = get();
    try {
      const newTask = await taskService.createTask({
        ...taskData,
        projectId: currentProjectId
      });
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
  },

  deleteTask: async (taskId) => {
    // Optimistic delete
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      await taskService.deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
      get().fetchTasks(); // revert on failure
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        myTasks: state.myTasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  addSubTask: async (taskId, title) => {
    try {
      const updatedTask = await subTaskService.addSubTask(taskId, { title, isCompleted: false });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        myTasks: state.myTasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));
      return updatedTask;
    } catch (error) {
      console.error('Failed to add subtask:', error);
      throw error;
    }
  },

  toggleSubTask: async (subTaskId, taskId) => {
    try {
      const updatedTask = await subTaskService.toggleSubTask(subTaskId);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        myTasks: state.myTasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));
      return updatedTask;
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
      throw error;
    }
  },

  addComment: async (taskId, content) => {
    const { user } = get();
    try {
      const updatedTask = await commentService.addComment(taskId, {
        content,
        authorId: user ? user.id : null
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      }));
      return updatedTask;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }
}));
