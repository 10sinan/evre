import React from 'react';
import Auth from './components/Auth';
import TaskBoard from './components/TaskBoard';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const user = useTaskStore((state) => state.user);

  return user ? <TaskBoard /> : <Auth />;
}

export default App;
