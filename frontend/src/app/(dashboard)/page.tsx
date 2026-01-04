"use client";

import { useState } from "react";
import { useTask } from "@/hooks/useTask";
import { TaskStatus } from "@/types";
import TaskList from "@/components/Tasks/TaskList";
import TaskForm from "@/components/Tasks/TaskForm";
import TaskFilter from "@/components/Tasks/TaskFilter";
import Modal from "@/components/Common/Modal";

export default function DashboardPage() {
  const { tasks, isLoading, createTask } = useTask();
  const [showModal, setShowModal] = useState(false);

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
  const completedCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {pendingCount} pending • {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + New Task
        </button>
      </div>

      <TaskFilter />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-2xl mb-2">📝</div>
          <p className="text-gray-600 mb-4">No tasks yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-indigo-600 hover:underline"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <TaskList tasks={tasks} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task">
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
