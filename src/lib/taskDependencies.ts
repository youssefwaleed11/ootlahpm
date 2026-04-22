import { Task, MOCK_TASKS } from './mockData';

export function isTaskBlocked(task: Task): boolean {
  if (!task.blockedBy || task.blockedBy.length === 0) {
    return false;
  }

  // Check if any of the blocking tasks are NOT done
  return task.blockedBy.some(blockingTaskId => {
    const blockingTask = MOCK_TASKS.find(t => t.id === blockingTaskId);
    return blockingTask && blockingTask.status !== 'done';
  });
}

export function getBlockingTasksInfo(task: Task): Array<{ id: string; title: string; status: Task['status'] }> {
  if (!task.blockedBy || task.blockedBy.length === 0) {
    return [];
  }

  return task.blockedBy.map(blockingTaskId => {
    const blockingTask = MOCK_TASKS.find(t => t.id === blockingTaskId);
    return {
      id: blockingTaskId,
      title: blockingTask?.title || 'Unknown Task',
      status: blockingTask?.status || 'todo',
    };
  });
}

export function canTaskBeProgressed(task: Task, fromStatus: Task['status'], toStatus: Task['status']): boolean {
  // Cannot move a task to done if it's blocked
  if (toStatus === 'done' && isTaskBlocked(task)) {
    return false;
  }
  return true;
}

export function checkUnblockedTasks(taskId: string): Task[] {
  // Find all tasks that were blocked by this task
  const unblocked: Task[] = [];

  MOCK_TASKS.forEach(task => {
    if (task.blockedBy && task.blockedBy.includes(taskId)) {
      // Check if ALL blocking tasks for this task are now done
      const allBlockersDone = task.blockedBy.every(blockerId => {
        const blocker = MOCK_TASKS.find(t => t.id === blockerId);
        return blocker?.status === 'done';
      });

      if (allBlockersDone && isTaskBlocked(task)) {
        unblocked.push(task);
      }
    }
  });

  return unblocked;
}
