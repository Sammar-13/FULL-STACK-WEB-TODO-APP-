"use client";

import { Task, TaskStatus } from "@/types";
import Link from "next/link";
import { useTask } from "@/hooks/useTask";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
}

const priorityStyles = {
  low: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  high: "bg-red-500/10 text-red-300 border-red-500/20",
};

export default function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useTask();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    try {
      await updateTask(task.id, {
        status: task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-slate-800/80 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="pt-1">
              <input
                type="checkbox"
                checked={task.status === TaskStatus.COMPLETED}
                onChange={handleToggleComplete}
                className="w-5 h-5 rounded-md border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 cursor-pointer transition-all"
              />
            </div>
            
            <div className="flex-1">
              <Link
                href={`/tasks/${task.id}`}
                className={`text-lg font-semibold block mb-1 transition-colors ${
                  task.status === TaskStatus.COMPLETED
                    ? "text-slate-500 line-through decoration-slate-600"
                    : "text-slate-100 hover:text-indigo-400"
                }`}
              >
                {task.title}
              </Link>

              {task.description && (
                <p className={`text-sm mb-3 line-clamp-2 ${
                  task.status === TaskStatus.COMPLETED ? "text-slate-600" : "text-slate-400"
                }`}>
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${priorityStyles[task.priority as keyof typeof priorityStyles]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                
                {task.due_date && (
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-md border border-slate-700">
                    <span>📅</span>
                    {new Date(task.due_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          title="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}