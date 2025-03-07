import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Edit, Check } from "lucide-react";
import { useResumeEdit } from "../../context/ResumeEditContext";

interface SkillsProps {
  isEditMode?: boolean;
}

export default function Skills({ isEditMode }: SkillsProps) {
  const { editableResume, updateSkills } = useResumeEdit();
  const [newSkill, setNewSkill] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{category: string, index: number, value: string} | null>(null);
  
  const handleAddSkill = (category: string) => {
    if (!newSkill.trim()) return;
    
    const currentSkills = editableResume.skills?.[category] || [];
    updateSkills(category, [...currentSkills, newSkill.trim()]);
    setNewSkill("");
  };
  
  const handleRemoveSkill = (category: string, skillToRemove: string) => {
    const currentSkills = editableResume.skills?.[category] || [];
    updateSkills(
      category, 
      currentSkills.filter(skill => skill !== skillToRemove)
    );
  };
  
  const startEditingSkill = (category: string, skillIndex: number, skillValue: string) => {
    setEditingSkill({
      category,
      index: skillIndex,
      value: skillValue
    });
  };
  
  const updateSkillText = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingSkill) return;
    
    setEditingSkill({
      ...editingSkill,
      value: e.target.value
    });
  };
  
  const saveEditedSkill = () => {
    if (!editingSkill || !editingSkill.value.trim()) return;
    
    const { category, index, value } = editingSkill;
    const currentSkills = [...(editableResume.skills?.[category] || [])];
    currentSkills[index] = value.trim();
    
    updateSkills(category, currentSkills);
    setEditingSkill(null);
  };
  
  // Render categories from the editable resume, not the original props
  const categories = editableResume.skills ? Object.keys(editableResume.skills) : [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Skills</h3>
      
      {categories.map(category => {
        const categorySkills = editableResume.skills?.[category] || [];
        const isActive = editing && activeCategory === category;
        
        return (
          <div key={category} className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-base capitalize">
                {category.replace(/_/g, ' ')}
              </h4>
              {isEditMode && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (!editing) {
                      setActiveCategory(category);
                    } else if (activeCategory === category) {
                      setActiveCategory(null);
                    } else {
                      setActiveCategory(category);
                    }
                    setEditing(!editing);
                    // Reset any in-progress skill editing
                    setEditingSkill(null);
                  }} 
                  variant="ghost" 
                  size="sm"
                >
                  {editing && activeCategory === category ? "Done" : "Edit"}
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill, index) => (
                <div 
                  key={`${category}-${index}`} 
                  className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center"
                >
                  {editingSkill && 
                   editingSkill.category === category && 
                   editingSkill.index === index ? (
                    <div className="flex items-center">
                      <Input
                        value={editingSkill.value}
                        onChange={updateSkillText}
                        className="text-sm w-32 h-6 py-0 px-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEditedSkill();
                          }
                        }}
                      />
                      <button
                        onClick={saveEditedSkill}
                        className="ml-1 text-green-500"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {skill}
                      {isActive && (
                        <div className="flex ml-1.5">
                          <button 
                            onClick={() => startEditingSkill(category, index, skill)}
                            className="text-gray-500 hover:text-blue-500 mr-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleRemoveSkill(category, skill)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {isActive && (
                <div className="flex items-center gap-2 mt-2 w-full">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(category);
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleAddSkill(category)}
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 