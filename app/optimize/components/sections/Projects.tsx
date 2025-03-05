import React from "react";
import { FolderPlus } from "lucide-react";
import { Project } from "../../types";

interface ProjectsProps {
  projects?: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  if (!projects || projects.length === 0) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Projects</h3>
        <p className="text-gray-500 italic">No projects available</p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">Projects</h3>
      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FolderPlus className="h-4 w-4 mr-2 text-blue-500" />
              {project.title}
            </h4>
            <p className="text-gray-600 mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies && Array.isArray(project.technologies) ?
                project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {tech}
                  </span>
                )) :
                project.technologies && typeof project.technologies === 'string' ?
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {project.technologies}
                  </span>
                : null
              }
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 