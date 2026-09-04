'use client';

import { useContext } from 'react';

import TaskForm from '../TaskForm/TaskForm';

import styles from './ReactFeatTrialWrapper.module.css';

import { ThemeContext } from '@/providers/ThemeProvider';
import { Task } from '@/store/slices/TaskSlice';
import { useAppStore } from '@/providers/AppStoreProvider';
import * as useTaskQueryClient from '@/hooks/useTaskQueryClient';

export default function ReactFeatTrialWrapper() {
  // [NOT NEEDED FOR TANSTACK QUERY]
  // create local state for app state and tasks (we will move this to store later but for now we want to see how it works with local state)
  // const [appState, setAppState] = useState<'loading' | 'ready' | 'error'>('loading');
  // const [tasks, setTasks] = useState<Task[]>([]);

  // load theme from context API
  const { theme, toggleTheme } = useContext(ThemeContext);

  // use Tanstack query for initial data load (appState and taskList no longer need a state)
  const { data, isLoading, error } = useTaskQueryClient.useTaskList(10);
  const tasks = data?.data ?? [];

  // register update mutator for toggle
  const { mutateAsync: updateTask } = useTaskQueryClient.useUpdateTask();

  // get required state and actions from store
  const { filter, setFilter, setSelectedTask } = useAppStore((state) => state);

  // [NOT NEEDED FOR TANSTACK QUERY]
  // create effect for initial data load
  // useEffect(() => {
  //   console.log('Fetching initial tasks...');
  //   const fetch = async () => {
  //     try {
  //       const response = await TaskService.getAll(10);

  //       // init state
  //       setTasks(response.data);
  //       setAppState('ready');
  //     } catch (error) {
  //       console.error('Error fetching tasks:', (error as AxiosError).response?.status);
  //       setAppState('error');
  //     }
  //   };

  //   // just simulate a bigger delay to see loading state
  //   setTimeout(fetch, 2000);
  // }, []);

  // create select task handler
  const selectTask = (id: number | null) => {
    const task = tasks.find((t: Task) => t.id === id) ?? null;
    setSelectedTask(task);
  };

  // create toggle handler
  const toggleTask = async (id: number | null) => {
    // [NOT NEEDED FOR TANSTACK QUERY]
    // update toggle state of tasks and recreate full array reference to trigger re-render
    // setTasks((prevTasks: Task[]) =>
    //   prevTasks.map((task) => {
    //     // create new reference for task even if its an internal object of state as otherwise it doesnt work
    //     return { ...task, completed: task.id === id ? !task.completed : task.completed };
    //   }),
    // );

    const task = tasks.find((t: Task) => t.id === id);
    if (task) {
      await updateTask({ ...task, completed: !task.completed });
    }
  };

  // handle app states
  console.log(`Rendering component with ${tasks.length} tasks`);
  if (isLoading) {
    return (
      <div style={{ padding: '1em' }} className={theme === 'dark' ? styles.dark : ''}>
        Loading tasks...
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: '1em' }} className={theme === 'dark' ? styles.dark : ''}>
        Error loading tasks. Please reload the page!
      </div>
    );
  }
  return (
    <div style={{ padding: '1em' }} className={theme === 'dark' ? styles.dark : ''}>
      <h1>Personal Task Tracker</h1>
      <TaskForm />
      <div style={{ margin: '1em' }}>
        <button
          className={`${styles.chip} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.chip} ${filter === 'todo' ? styles.active : ''}`}
          onClick={() => setFilter('todo')}
        >
          Todo
        </button>
        <button
          className={`${styles.chip} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        {tasks
          .filter((task) => {
            if (filter === 'todo') {
              return !task.completed;
            }
            if (filter === 'completed') {
              return task.completed;
            }
            return true;
          })
          .map((task) => (
            <div key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              <button
                className={`${styles.task} ${task.completed ? styles.completed : ''}`}
                onClick={() => selectTask(task.id)}
              >
                {task.title}
              </button>
              <br />
            </div>
          ))}
      </div>
      <button onClick={() => toggleTheme()}>Toggle Theme</button>
    </div>
  );
}
