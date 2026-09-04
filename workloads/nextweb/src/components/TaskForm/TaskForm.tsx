'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import * as useTaskQueryClient from '@/hooks/useTaskQueryClient';
import { useAppStore } from '@/providers/AppStoreProvider';
import { Task } from '@/store/slices/TaskSlice';

type FormVals = {
  title: string;
};

export default function TaskForm() {
  // get required state and actions from store
  const { selectedTask, setSelectedTask } = useAppStore((state) => state);
  console.log('Rendering TaskForm with selectedTask:', selectedTask);

  // init form hooks with default values
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>({ defaultValues: { title: selectedTask?.title ?? '' } });

  // register the task mutator for create/update task
  const { mutateAsync: createTask } = useTaskQueryClient.useCreateTask();
  const { mutateAsync: updateTask } = useTaskQueryClient.useUpdateTask();

  // create effect to reset form when selectedTask changes
  useEffect(() => {
    reset({ title: selectedTask?.title ?? '' });
  }, [selectedTask, reset]);

  // create cancel handler
  const onCancel = () => {
    setSelectedTask(null);
    reset();
  };

  // create submit handler
  const onSubmit = async (data: FormVals) => {
    // for now we will just simulate a delay and log it to console but eventually we want to add/edit tasks in store
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Submitting form with data:', data);

    // depending on selectedTask, add or edit the corresponding task
    if (selectedTask) {
      await updateTask({ ...selectedTask, title: data.title });
    } else {
      const newTask: Task = { userId: null, id: null, title: data.title, completed: false };
      await createTask(newTask);
    }

    setSelectedTask(null);
    reset();
  };

  return (
    <div style={{ padding: '1em', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h2>Enter Task</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Task title"
          style={{ marginRight: '1em' }}
          disabled={isSubmitting}
          {...register('title', { required: 'Title is required' })}
        />
        <button type="button" onClick={() => onCancel()}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <br />
        {errors.title && <span style={{ color: 'red' }}>{errors.title.message}</span>}
      </form>
    </div>
  );
}
