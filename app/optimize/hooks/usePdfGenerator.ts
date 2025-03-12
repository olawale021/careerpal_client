import { useState } from "react";
import jsPDF from "jspdf";
import { ResumeData, ResumeResponse } from "../types";

export function usePdfGenerator() {
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = async (resumeData: ResumeData, resumeResponse: ResumeResponse | null) => {
    if (!resumeData) return null; // Return null if no data
    
    try {
      setIsPdfGenerating(true);
      
      // Use resumeData (which will be the edited version) for PDF generation
      // Extract contact details from the full response
      const contactDetails = resumeResponse?.contact_details || {};
      const userName = contactDetails.name || "";
      const userEmail = contactDetails.email || "";
      const userPhone = contactDetails.phone_number || "";
      const userLocation = contactDetails.location || "";
      // const userLinkedin = contactDetails.linkedin || "";
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Use Times New Roman font
      const mainFont = 'times';
      
      // Reduce margins to utilize more space
      const margin = 12; // Reduced from 15
      let yPos = 10; // Reduced from 15
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (margin * 2);
      
      // Add background color to the entire page
      pdf.setFillColor(252, 252, 253); // Very light gray/blue background
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Helper function for adding text with line breaks
    
      
      // Header with name
      pdf.setFontSize(22);
      pdf.setTextColor(26, 86, 219); // #1a56db - Blue color for headers
      pdf.setFont(mainFont, 'bold');
      pdf.text(userName || "Resume", pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      
      // Contact details with justified text instead of center alignment
      pdf.setFontSize(10);
      pdf.setTextColor(74, 85, 104); // #4a5568
      pdf.setFont(mainFont, 'normal');
      
      // Create contact parts as separate elements to prevent breaking
      const contactElements = [];
      if (userEmail) contactElements.push({ label: "Email:", value: userEmail });
      if (userPhone) contactElements.push({ label: "Phone:", value: userPhone });
      if (userLocation) contactElements.push({ label: "Location:", value: userLocation.replace(/\n/g, ' ').trim() });
      // if (userLinkedin) contactElements.push({ label: "LinkedIn:", value: userLinkedin });
      
      // Calculate how to distribute contact elements across lines
      const maxLineWidth = contentWidth - 5;
      let currentLine: string[] = [];
      const lines: string[][] = [currentLine];
      let currentLineWidth = 0;
      
      // Distribute elements across lines
      contactElements.forEach((element, index) => {
        const elementText = `${element.label} ${element.value}${index < contactElements.length - 1 ? ' | ' : ''}`;
        const elementWidth = pdf.getTextWidth(elementText);
        
        // If adding this element would exceed line width, start a new line
        if (currentLineWidth + elementWidth > maxLineWidth && currentLine.length > 0) {
          currentLine = [];
          lines.push(currentLine);
          currentLineWidth = 0;
        }
        
        currentLine.push(elementText);
        currentLineWidth += elementWidth;
      });
      
      // Render each line of contact information
      lines.forEach(line => {
        pdf.text(line.join(' '), margin, yPos);
        yPos += 4; // Spacing between lines
      });
      
      // Horizontal line
      pdf.setDrawColor(26, 86, 219); // #1a56db
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 5;
      
      // SECTION: PROFESSIONAL SUMMARY
      if (resumeData.summary) {
        pdf.setFontSize(14);
        pdf.setTextColor(26, 86, 219); // Blue color for section headers
        pdf.setFont(mainFont, 'bold');
        pdf.text("PROFESSIONAL SUMMARY", margin, yPos);
        
        yPos += 4;
        pdf.setFontSize(10); // Increased from 9
        pdf.setTextColor(45, 55, 72); // #2d3748
        pdf.setFont(mainFont, 'normal');
        
        // Limit summary to 4-5 lines to save space
        const summaryLines = pdf.splitTextToSize(resumeData.summary, contentWidth);
        const limitedSummary = summaryLines.slice(0, 4);
        pdf.text(limitedSummary, margin, yPos);
        yPos += limitedSummary.length * 4;
        
        yPos += 4;
      }
      
      // SECTION: SKILLS
      if (resumeData.skills && Object.keys(resumeData.skills).length > 0) {
        pdf.setFontSize(13);
        pdf.setTextColor(26, 86, 219); // Blue color for section headers
        pdf.setFont(mainFont, 'bold');
        pdf.text("SKILLS", margin, yPos);
        
        yPos += 6;
        
        // Process each skill category in a pill format
        Object.entries(resumeData.skills).forEach(([category, skillList]) => {
          if (!skillList || !skillList.length) return;
          
          const formattedCategory = category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          pdf.setFontSize(11.5);
          pdf.setTextColor(45, 55, 72); // #2d3748
          pdf.setFont(mainFont, 'bold');
          pdf.text(formattedCategory, margin, yPos);
          
          yPos += 5;
          
          // Create pill-style skills
          pdf.setFontSize(9); // Increased from 9
          pdf.setFont(mainFont, 'normal');
          
          let xOffset = margin;
          const pillHeight = 5;
          const pillPadding = 3;
          const pillMargin = 3;
          const maxRowWidth = contentWidth - 5;
          
          // Draw skills as pills
          (skillList as string[]).forEach((skill) => {
            const skillWidth = pdf.getTextWidth(skill) + (pillPadding * 2);
            
            // Check if we need to move to next line
            if (xOffset + skillWidth > margin + maxRowWidth) {
              xOffset = margin;
              yPos += pillHeight + 1;
            }
            
            // Draw pill background
            pdf.setFillColor(240, 240, 245); // Light gray background
            pdf.roundedRect(xOffset, yPos - 3.5, skillWidth, pillHeight, 1.5, 1.5, 'F');
            
            // Draw skill text
            pdf.setTextColor(74, 85, 104); // #4a5568
            pdf.text(skill, xOffset + pillPadding, yPos);
            
            xOffset += skillWidth + pillMargin;
          });
          
          yPos += pillHeight + 4;
          
          // Reduce space between categories
          if (Object.entries(resumeData.skills || {}).length > 1) {
            yPos += 0; // Removed extra 2mm spacing between categories
          }
        });
        
        yPos += 4;
      }
      
      // SECTION: WORK EXPERIENCE
      if (resumeData.work_experience && resumeData.work_experience.length > 0) {
        pdf.setFontSize(13);
        pdf.setTextColor(26, 86, 219); // Blue color for section headers
        pdf.setFont(mainFont, 'bold');
        pdf.text("WORK EXPERIENCE", margin, yPos);
        
        yPos += 6;
        
        // Create a light gray background for each job
        resumeData.work_experience.forEach((exp) => {
          // Calculate height needed for this job entry
          const titleHeight = 4;
          const companyHeight = 4;
          const bulletHeight = (exp.bullets?.length || 0) * 4;
          const jobHeight = titleHeight + companyHeight + bulletHeight + 6;
          
          // Draw background rectangle
          pdf.setFillColor(248, 250, 252); // Very light gray
          pdf.rect(margin - 2, yPos - 2, contentWidth + 4, jobHeight, 'F');
          
          // Job title and dates on the same line
          pdf.setFontSize(12);
          pdf.setTextColor(45, 55, 72); // #2d3748
          pdf.setFont(mainFont, 'bold');
          pdf.text(exp.title, margin, yPos);
          
          const datesWidth = pdf.getTextWidth(exp.dates);
          pdf.setFontSize(10);
          pdf.setFont(mainFont, 'normal');
          pdf.text(exp.dates, pageWidth - margin - datesWidth, yPos);
          
          yPos += 4;
          
          // Company and location
          pdf.setFontSize(10); // Increased from 9
          pdf.setTextColor(74, 85, 104); // #4a5568
          pdf.setFont(mainFont, 'italic');
          pdf.text(`${exp.company}${exp.location ? ` • ${exp.location}` : ''}`, margin, yPos);
          
          yPos += 4;
          
          // Bullet points with better spacing
          if (exp.bullets && exp.bullets.length > 0) {
            pdf.setFontSize(10); // Increased from 8
            pdf.setTextColor(45, 55, 72); // #2d3748
            pdf.setFont(mainFont, 'normal');
            
            // Limit to 3-4 bullets per job to save space
            const limitedBullets = exp.bullets.slice(0, 4);
            
            limitedBullets.forEach((bullet) => {
              // Use proper bullet character and indentation
              pdf.text("•", margin, yPos);
              
              // Calculate proper indentation for wrapped text
              const bulletIndent = margin + 3;
              const bulletWidth = contentWidth - 3;
              
              // Add the bullet text with proper wrapping (limit to 2 lines)
              const lines = pdf.splitTextToSize(bullet, bulletWidth).slice(0, 2);
              pdf.text(lines, bulletIndent, yPos);
              
              // Move position based on number of lines
              yPos += lines.length * 3.5;
            });
          }
          
          // Add space between jobs
          yPos += 3;
        });
        
        yPos += 4;
      }
      
      // SECTION: PROJECTS - Moved here after work experience
      if (resumeData.projects && resumeData.projects.length > 0) {
        pdf.setFontSize(13);
        pdf.setTextColor(26, 86, 219); // Blue color for section headers
        pdf.setFont(mainFont, 'bold');
        pdf.text("PROJECTS", margin, yPos);
        
        yPos += 5; // Reduced from 8mm to 5mm for better spacing
        
        // Use all projects instead of limiting them
        // const limitedProjects = resumeData.projects.slice(0, 1);
        resumeData.projects.forEach((project) => {
          // Project title
          pdf.setFontSize(12);
          pdf.setTextColor(45, 55, 72); // #2d3748
          pdf.setFont(mainFont, 'bold');
          pdf.text(project.title, margin, yPos);
          
          yPos += 5; // Increased spacing after project title
          
          // Project description (limited to 2 lines)
          pdf.setFontSize(10);
          pdf.setFont(mainFont, 'normal');
          const descLines = pdf.splitTextToSize(project.description, contentWidth).slice(0, 2);
          pdf.text(descLines, margin, yPos);
          
          yPos += descLines.length * 4; // Increased spacing after description
          
          // Technologies if available (on same line if possible)
          if (project.technologies) {
            pdf.setFontSize(10);
            pdf.setTextColor(44, 82, 130); // #2c5282
            pdf.setFont(mainFont, 'italic');
            
            // Add "Technologies:" label with proper indentation
            pdf.text("Technologies:", margin, yPos);
            
            // Calculate proper indentation for technologies
            const techIndent = margin + 25; // Increased indentation for technologies
            const techWidth = contentWidth - 25;
            
            let techText = "";
            if (Array.isArray(project.technologies)) {
              techText = project.technologies.join(', ');
            } else if (typeof project.technologies === 'string') {
              techText = project.technologies;
            }
            
            const techLines = pdf.splitTextToSize(techText, techWidth).slice(0, 1);
            pdf.text(techLines, techIndent, yPos);
            
            yPos += 5; // Increased spacing after technologies
          }
          
          yPos += 3; // Additional spacing after each project
        });
        
        yPos += 4; // Add space after projects section
      }
      
      // SECTION: EDUCATION (Compact version)
      if (resumeData.education && resumeData.education.length > 0) {
        pdf.setFontSize(13);
        pdf.setTextColor(26, 86, 219); // Blue color for section headers
        pdf.setFont(mainFont, 'bold');
        pdf.text("EDUCATION", margin, yPos);
        
        yPos += 5; // Reduced from 8mm to 5mm for better spacing
        
        resumeData.education.forEach((edu, index) => {
          // Degree and date on same line
          pdf.setFontSize(12);
          pdf.setTextColor(45, 55, 72); // #2d3748
          pdf.setFont(mainFont, 'bold');
          pdf.text(edu.degree, margin, yPos);
          
          const datesWidth = pdf.getTextWidth(edu.dates);
          pdf.setFontSize(10);
          pdf.setFont(mainFont, 'normal');
          pdf.text(edu.dates, pageWidth - margin - datesWidth, yPos);
          
          yPos += 4; // Increased spacing
          
          // School and location on same line
          pdf.setFontSize(10);
          pdf.setFont(mainFont, 'italic');
          pdf.text(edu.school, margin, yPos);
          
          if (edu.location) {
            const locationWidth = pdf.getTextWidth(edu.location);
            pdf.setTextColor(74, 85, 104); // #4a5568
            pdf.text(edu.location, pageWidth - margin - locationWidth, yPos);
          }
          
          // Add more space between education entries
          yPos += (index < (resumeData.education?.length || 0) - 1) ? 8 : 6;
        });
        
        yPos += 8; // Increased spacing after education section
      }
      
      // SECTION: CERTIFICATIONS (Compact version)
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        pdf.setFontSize(13);
        pdf.setTextColor(26, 86, 219); // Blue color for section headers
        pdf.setFont(mainFont, 'bold');
        pdf.text("CERTIFICATIONS", margin, yPos);
        
        yPos += 6; // Increased spacing after certifications header
        
        // Display certifications in a single line if possible
        pdf.setFontSize(10);
        pdf.setTextColor(45, 55, 72); // #2d3748
        pdf.setFont(mainFont, 'normal');
        
        // Limit to 2-3 certifications
        const limitedCerts = resumeData.certifications.slice(0, 3);
        
        limitedCerts.forEach((cert) => {
          pdf.text("•", margin, yPos);
          
          // Calculate proper indentation for wrapped text
          const bulletIndent = margin + 4; // Increased indentation
          const bulletWidth = contentWidth - 4;
          
          // Add the certification text with proper wrapping (limit to 1 line)
          const lines = pdf.splitTextToSize(cert, bulletWidth).slice(0, 1);
          pdf.text(lines, bulletIndent, yPos);
          
          // Move position based on number of lines
          yPos += 4; // Increased spacing between certification items
        });
        
        yPos += 8; // Increased spacing after certifications section
      }
      
      return pdf;
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
      return null;
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const generatePreview = async (resumeData: ResumeData, resumeResponse: ResumeResponse | null) => {
    if (!resumeData) return;
    
    try {
      setIsPdfGenerating(true);
      const pdf = await generatePdf(resumeData, resumeResponse);
      if (!pdf) throw new Error("Failed to generate PDF");
      
      const pdfBlob = pdf.output('blob');
      const previewUrl = URL.createObjectURL(pdfBlob);
      setPreviewUrl(previewUrl);
      return previewUrl;
    } catch (err) {
      setError('Failed to generate preview');
      console.error(err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const downloadPdf = async (resumeData: ResumeData, resumeResponse: ResumeResponse | null) => {
    if (!resumeData) return;
    
    try {
      setIsPdfGenerating(true);
      const pdf = await generatePdf(resumeData, resumeResponse);
      if (!pdf) throw new Error("Failed to generate PDF");
      pdf.save('optimized-resume.pdf');
    } catch (err) {
      setError('Failed to download PDF');
      console.error(err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return {
    isPdfGenerating,
    setIsPdfGenerating,
    previewUrl,
    generatePreview,
    downloadPdf,
    error
  };
} 