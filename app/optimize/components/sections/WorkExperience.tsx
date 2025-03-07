import React, { useState } from "react";
import { Calendar, Briefcase, MapPin, Plus, Trash2 } from "lucide-react";
import {  Project } from "../../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useResumeEdit } from "../../context/ResumeEditContext";

interface WorkExperienceProps {
  isEditMode?: boolean;
}

export default function WorkExperienceSection({ isEditMode = true }: WorkExperienceProps) {
  const { editableResume, updateWorkExperience } = useResumeEdit();
  const [editing, setEditing] = useState(false);
  const [activeExpIndex, setActiveExpIndex] = useState<number | null>(null);
  const [bulletEdits, setBulletEdits] = useState<{[key: string]: string}>({});
  
  // Only use experiences from the editable resume
  const experiences = editableResume.work_experience || [];

  // Add debugging to help identify issues
  console.log("isEditMode:", isEditMode);
  console.log("editableResume:", editableResume);
  console.log("experiences:", experiences);

  // Add new work experience - moved up before first usage
  const handleAddExperience = () => {
    const newExperience = {
      title: "New Position Title",
      company: "Company Name",
      dates: "Month Year - Present",
      location: "City, State",
      bullets: ["Add your accomplishments here"]
    };
    
    const updatedExperiences = [...experiences, newExperience];
    
    const newIndex = updatedExperiences.length - 1;
    updateWorkExperience(newIndex, 'work_experience' as keyof Project, updatedExperiences);
    
    // Set this new experience as active for editing
    handleEditExperience(newIndex);
  };

  if (!experiences || experiences.length === 0) {
    return (
      <>
        <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
        {isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            className="mb-4"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Work Experience
          </Button>
        )}
        <p className="text-gray-500 italic">No work experience available</p>
      </>
    );
  }

  // Update the function to handle when user clicks "Done"
  const handleEditExperience = (index: number) => {
    console.log("Edit experience triggered for index:", index);
    
    if (editing && activeExpIndex === index) {
      // User is clicking "Done" - ensure all edits are committed
      console.log("Finishing edits for experience:", index);
      
      // Apply any pending bullet edits to the work experience
      const updatedExperiences = [...experiences];
      const currentExp = updatedExperiences[index];
      
      // Check if there are any bullet edits for this experience
      const bulletKeys = Object.keys(bulletEdits).filter(key => key.startsWith(`${index}-`));
      
      if (bulletKeys.length > 0) {
        console.log("Committing bullet edits:", bulletKeys);
        
        // Apply each edit to the final object
        bulletKeys.forEach(key => {
          const bulletIndex = parseInt(key.split('-')[1]);
          currentExp.bullets[bulletIndex] = bulletEdits[key];
        });
        
        // Commit the final state
        updateWorkExperience(index, 'work_experience' as keyof Project, updatedExperiences);
        
        // Clear the bullet edits for this experience
        const newBulletEdits = {...bulletEdits};
        bulletKeys.forEach(key => delete newBulletEdits[key]);
        setBulletEdits(newBulletEdits);
      }
      
      // Exit edit mode
      setEditing(false);
      setActiveExpIndex(null);
    } else {
      // User is starting to edit
      setActiveExpIndex(index);
      setEditing(true);
    }
  };

  // Add check for updateWorkExperience function
  const handleUpdateField = (index: number, field: string, value: string) => {
    console.log("Updating field:", field, "with value:", value);
    if (!updateWorkExperience) {
      console.error("updateWorkExperience function is not available");
      return;
    }
    
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    
    try {
      // Check if updateWorkExperience expects more parameters
      console.log("Calling updateWorkExperience with:", updatedExperiences);
      updateWorkExperience(index, 'work_experience' as keyof Project, updatedExperiences);
    } catch (error) {
      console.error("Error updating work experience:", error);
    }
  };

  // Update the function to handle bullet point editing
  const handleUpdateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    console.log("Updating bullet at index:", bulletIndex, "in experience:", expIndex);
    console.log("New value:", value);
    
    // Store the edit in local state first for immediate UI feedback
    const editKey = `${expIndex}-${bulletIndex}`;
    setBulletEdits({
      ...bulletEdits,
      [editKey]: value
    });
    
    const updatedExperiences = [...experiences];
    const bullets = [...updatedExperiences[expIndex].bullets];
    bullets[bulletIndex] = value;
    updatedExperiences[expIndex] = {
      ...updatedExperiences[expIndex],
      bullets
    };
    
    // Call the update function from context
    updateWorkExperience(expIndex, 'work_experience' as keyof Project, updatedExperiences);
  };

  // Function to get the current value of a bullet (either from edits or original)
  const getBulletValue = (expIndex: number, bulletIndex: number, originalValue: string) => {
    const editKey = `${expIndex}-${bulletIndex}`;
    return bulletEdits[editKey] !== undefined ? bulletEdits[editKey] : originalValue;
  };
  
  // Add new bullet point to an experience
  const handleAddBullet = (expIndex: number) => {
    console.log("handleAddBullet called with index:", expIndex);
    
    // Directly modify the bullets array in the original experiences array
    const updatedExperiences = [...experiences];
    const currentExp = updatedExperiences[expIndex];
    
    // Initialize bullets array if it doesn't exist
    if (!currentExp.bullets) {
      currentExp.bullets = [];
    }
    
    // Add the new bullet
    currentExp.bullets.push("New bullet point - add your accomplishment here");
    
    // Force update by directly calling the context update function
    updateWorkExperience(expIndex, 'work_experience' as keyof Project, updatedExperiences);
    
    // Force a complete component re-render with a different approach
    // This is a workaround to ensure the UI updates
    setTimeout(() => {
      // Force the component to re-render
      setEditing(false);
      setTimeout(() => {
        setEditing(true);
        setActiveExpIndex(expIndex);
      }, 10);
    }, 10);
    
    console.log("After update, bullet count should be:", currentExp.bullets.length);
  };
  
  // Delete a bullet point
  const handleDeleteBullet = (expIndex: number, bulletIndex: number) => {
    console.log("Deleting bullet at index:", bulletIndex, "from experience:", expIndex);
    
    if (experiences[expIndex].bullets.length <= 1) {
      alert("You need to keep at least one bullet point.");
      return;
    }
    
    // Directly modify the bullets array in the original experiences array
    const updatedExperiences = [...experiences];
    const currentExp = updatedExperiences[expIndex];
    
    // Remove the bullet
    currentExp.bullets.splice(bulletIndex, 1);
    
    console.log("After delete, bullets array:", currentExp.bullets);
    
    // Force update by directly calling the context update function
    updateWorkExperience(expIndex, 'work_experience' as keyof Project, updatedExperiences);
    
    // Force a complete component re-render
    setTimeout(() => {
      setEditing(false);
      setTimeout(() => {
        setEditing(true);
        setActiveExpIndex(expIndex);
      }, 10);
    }, 10);
  };
  
  // Delete an entire work experience
  const handleDeleteExperience = (index: number) => {
    if (confirm("Are you sure you want to delete this work experience?")) {
      console.log("Deleting experience at index:", index);

      // Create a new array without the item at the specified index
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      console.log("Updated experiences after deletion:", updatedExperiences);

      // Add the missing 'work_experience' field parameter
      updateWorkExperience(index, 'work_experience' as keyof Project, updatedExperiences);

      // Reset editing state if we deleted the active experience
      if (activeExpIndex === index) {
        setEditing(false);
        setActiveExpIndex(null);
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Work Experience</h3>
        {isEditMode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddExperience}
            className="text-xs"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Experience
          </Button>
        )}
      </div>
      <div className="space-y-8">
        {experiences.map((exp, index) => (
          <div key={`exp-${index}-${experiences.length}-${exp.bullets?.length || 0}`} className="border-l-2 border-gray-200 pl-4 py-1 hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start">
              {editing && activeExpIndex === index ? (
                <Input 
                  value={exp.title}
                  onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
                  className="font-semibold text-lg"
                />
              ) : (
                <h4 className="font-semibold text-lg text-gray-800">{exp.title}</h4>
              )}
              
              <div className="flex items-center gap-2">
                {editing && activeExpIndex === index ? (
                  <Input 
                    value={exp.dates}
                    onChange={(e) => handleUpdateField(index, 'dates', e.target.value)}
                    className="text-sm w-36"
                  />
                ) : (
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> {exp.dates}
                  </span>
                )}
                
                {isEditMode && (
                  <div className="flex gap-1">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (editing && activeExpIndex === index) {
                          handleEditExperience(index); // This now commits the changes
                        } else {
                          handleEditExperience(index);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      {editing && activeExpIndex === index ? "Done" : "Edit"}
                    </Button>
                    
                    {!editing && (
                      <Button
                        onClick={() => handleDeleteExperience(index)}
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-gray-700 font-medium mb-2 flex items-center">
              {editing && activeExpIndex === index ? (
                <div className="flex gap-2 w-full">
                  <Input 
                    value={exp.company}
                    onChange={(e) => handleUpdateField(index, 'company', e.target.value)}
                    className="w-1/2"
                  />
                  <Input 
                    value={exp.location || ''}
                    onChange={(e) => handleUpdateField(index, 'location', e.target.value)}
                    className="w-1/2"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-1 text-gray-500" /> {exp.company}
                  {exp.location && (
                    <>
                      <span className="mx-2">•</span>
                      <MapPin className="h-3 w-3 mr-1 text-gray-500" /> {exp.location}
                    </>
                  )}
                </>
              )}
            </div>

            <ul className="mt-2 space-y-2">
              {exp.bullets && exp.bullets.map((bullet, i) => (
                <li key={`bullet-${index}-${i}-${Date.now()}`} className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-2"></span>
                  <div className="flex-1">
                    {editing && activeExpIndex === index ? (
                      <div className="flex gap-2 items-start">
                        <Textarea 
                          value={getBulletValue(index, i, bullet)}
                          onChange={(e) => {
                            console.log("Textarea onChange triggered with value:", e.target.value);
                            handleUpdateBullet(index, i, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.target.select()}
                          autoFocus={i === exp.bullets.length - 1}
                          className="text-gray-600 min-h-[60px] flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Delete bullet button clicked for bullet:", i, "in experience:", index);
                            handleDeleteBullet(index, i);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-600">{bullet}</span>
                    )}
                  </div>
                </li>
              ))}
              
              {editing && activeExpIndex === index && (
                <li>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Add Bullet Point button clicked for index:", index);
                      handleAddBullet(index);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Bullet Point
                  </Button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
} 