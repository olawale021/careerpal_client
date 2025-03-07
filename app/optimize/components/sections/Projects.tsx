import React, { useState } from "react";
import { FolderPlus, Edit, Check, Trash2 } from "lucide-react";
import { Project } from "../../types";
import { useResumeEdit } from "../../context/ResumeEditContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectsProps {
  projects?: Project[];
  isEditMode?: boolean;
}

export default function Projects({ projects, isEditMode }: ProjectsProps) {
  const { editableResume, updateProjects } = useResumeEdit();
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  
  // Use projects from editableResume if available
  const projectsData = editableResume.projects || projects || [];

  if (!projectsData || projectsData.length === 0) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Projects</h3>
        <p className="text-gray-500 italic">No projects available</p>
      </>
    );
  }
  
  const handleUpdateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const updatedProjects = [...projectsData];
    
    if (field === 'technologies' && typeof value === 'string') {
      // Split comma-separated technologies into an array
      updatedProjects[index] = {
        ...updatedProjects[index],
        technologies: value.split(',').map(tech => tech.trim()).filter(Boolean)
      };
    } else {
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      };
    }
    
    updateProjects(updatedProjects);
  };
  
  // Add delete project functionality
  const handleDeleteProject = (index: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = [...projectsData];
      updatedProjects.splice(index, 1);
      updateProjects(updatedProjects);
      
      // Reset editing state if the active project was deleted
      if (activeProjectIndex === index) {
        setActiveProjectIndex(null);
        setEditing(false);
      }
    }
  };
  
  const handleEditProject = (index: number) => {
    setActiveProjectIndex(index);
    setEditing(true);
  };
  
  const handleSaveProject = () => {
    setEditing(false);
    setActiveProjectIndex(null);
  };
  
  // Helper function to convert technologies to string for editing
  const technologiesToString = (technologies: string[] | string | undefined): string => {
    if (!technologies) return '';
    if (Array.isArray(technologies)) return technologies.join(', ');
    return technologies;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Projects</h3>
        {isEditMode && activeProjectIndex === null && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditing(!editing)}
            className="text-xs"
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {projectsData.map((project, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              {editing && activeProjectIndex === index ? (
                <Input
                  value={project.title}
                  onChange={(e) => handleUpdateProject(index, 'title', e.target.value)}
                  className="font-semibold text-gray-800 mb-2"
                />
              ) : (
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FolderPlus className="h-4 w-4 mr-2 text-blue-500" />
                  {project.title}
                </h4>
              )}
              
              {editing && (
                <div className="flex">
                  {activeProjectIndex === index ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSaveProject}
                      className="ml-2"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditProject(index)}
                        className="ml-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteProject(index)}
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {editing && activeProjectIndex === index ? (
              <Textarea
                value={project.description}
                onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                className="text-gray-600 mb-3 min-h-[80px]"
              />
            ) : (
              <p className="text-gray-600 mb-3">{project.description}</p>
            )}
            
            {editing && activeProjectIndex === index ? (
              <Input
                value={technologiesToString(project.technologies)}
                onChange={(e) => handleUpdateProject(index, 'technologies', e.target.value)}
                placeholder="Technologies (comma separated)"
                className="mb-2"
              />
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </>
  );
} 