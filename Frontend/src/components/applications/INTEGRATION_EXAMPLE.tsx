/**
 * INTEGRATION GUIDE: Application Roadmap Components
 * 
 * This file shows how to integrate the new components:
 * - ReadinessHUD with Mission Complete state
 * - SubmissionSuccessModal
 * - TaskItem
 * - SOPGeneratorModal
 * - useApplicationTasks hook
 */

import { useState } from "react";
import { useApplicationTasks } from "@/hooks/useApplicationTasks";
import ReadinessHUD from "@/components/applications/ReadinessHUD";
import TaskItem from "@/components/applications/TaskItem";
import SOPGeneratorModal from "@/components/applications/SOPGeneratorModal";
import SubmissionSuccessModal from "@/components/applications/SubmissionSuccessModal";

export default function ApplicationRoadmapExample() {
  const universityId = "nyu-cs-masters"; // Unique ID for this application
  const universityName = "New York University";

  // Hook manages all task state
  const { tasks, toggleTask, updateTask, progress, isMissionComplete } =
    useApplicationTasks(universityId);

  // Modal states
  const [showSOPModal, setShowSOPModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Handle SOP generation
  const handleSOPAction = () => {
    setShowSOPModal(true);
  };

  const handleSOPComplete = (sopText: string) => {
    console.log("SOP Generated:", sopText);
    // Mark SOP task as done
    updateTask("sop", { status: "done" });
    setShowSOPModal(false);
  };

  // Handle submission
  const handleInitiateSubmission = () => {
    setShowSubmissionModal(true);
  };

  return (
    <div className="min-h-screen bg-[#030712] p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Task List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onAction={
                  task.actionType === "generate" && task.id === "sop"
                    ? handleSOPAction
                    : undefined
                }
              />
            ))}
          </div>
        </div>

        {/* Sidebar - Readiness HUD */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ReadinessHUD
              progress={progress}
              isMissionComplete={isMissionComplete}
              completedCount={tasks.filter((t) => t.status === "done").length}
              totalCount={tasks.length}
              onInitiateSubmission={handleInitiateSubmission}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SOPGeneratorModal
        isOpen={showSOPModal}
        onClose={() => setShowSOPModal(false)}
        onComplete={handleSOPComplete}
        universityName={universityName}
      />

      <SubmissionSuccessModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        universityName={universityName}
      />
    </div>
  );
}
