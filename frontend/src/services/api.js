import axios from 'axios';

// Backend URL fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const taskService = {
  // Get all tasks
  getTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  // Get tasks by project ID
  getTasksByProject: async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Update task details (optional)
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete a task (optional)
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }
};

export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  }
};

export const subTaskService = {
  addSubTask: async (taskId, subTaskData) => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, subTaskData);
    return response.data;
  },
  toggleSubTask: async (subTaskId) => {
    const response = await api.put(`/subtasks/${subTaskId}/toggle`);
    return response.data;
  }
};

export const commentService = {
  addComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data;
  }
};

export const logService = {
  getLogsByProject: async (projectId) => {
    const response = await api.get(`/logs/project/${projectId}`);
    return response.data;
  }
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  }
};

export const analyticsService = {
  getProjectAnalytics: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}`);
    return response.data;
  }
};

export default api;
