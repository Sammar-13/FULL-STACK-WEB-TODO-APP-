"use client";

import { useState } from "react";
import { useTask } from "@/hooks/useTask";
import { useAuth } from "@/hooks/useAuth";
import TaskList from "@/components/Tasks/TaskList";
import TaskForm from "@/components/Tasks/TaskForm";
import TaskFilter from "@/components/Tasks/TaskFilter";
import Modal from "@/components/Common/Modal";

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, isLoading, createTask } = useTask();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTask = async (taskData: any) => {
    try {
      setError(null);
      await createTask(taskData);
      setShowModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      console.error("Failed to create task:", err);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-50"></div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.full_name || "User"}</span>! 👋
        </h1>
        <p className="text-slate-400 text-lg">Here's what you need to get done today.</p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Your Tasks</h2>
          <div className="flex gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] transition-transform hover:scale-105 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-pulse"></span>
              {pendingCount} PENDING
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-transform hover:scale-105 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
              {completedCount} COMPLETED
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="group relative inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-500/40 active:translate-y-0 active:scale-95"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <svg className="w-5 h-5 mr-2 -ml-1 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center shadow-lg shadow-red-500/5 animate-in slide-in-from-top-2 fade-in duration-300">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Filter placeholder - you might want to style TaskFilter separately */}
      <div className="mb-6">
        <TaskFilter />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6 text-slate-400 font-medium animate-pulse tracking-wide">Loading tasks...</div>
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