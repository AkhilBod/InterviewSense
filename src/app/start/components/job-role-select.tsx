'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Common job industries
const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Marketing',
  'Consulting',
  'Government',
  'Non-profit',
  'Other'
];

// Common job roles for suggestions
const commonJobRoles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Financial Analyst',
  'Project Manager',
  'Business Analyst',
  'Sales Representative',
  'Customer Success Manager',
  'Human Resources Specialist'
];

const interviewTypes = [
  'Technical',
  'Behavioral',
  'Mixed',
  'Case Study',
  'System Design',
  'Leadership'
];

const interviewStages = [
  'Initial Screening',
  'Team Interview',
  'Final Round',
  'Executive Interview'
];

interface JobRoleSelectProps {
  onJobDetailsChange: (details: {
    jobTitle: string;
    company: string;
    industry: string;
    experienceLevel: string;
    jobAd: string;
    resume: File | null;
    interviewType: string;
    interviewStage: string;
  }) => void;
  interviewType: string;
}

export default function JobRoleSelect({ onJobDetailsChange, interviewType }: JobRoleSelectProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('Entry-level');
  const [jobAd, setJobAd] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [interviewStage, setInterviewStage] = useState('Initial Screening');
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [interviewTypeState, setInterviewTypeState] = useState(interviewType);

  // Show suggestions as user types job title
  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobTitle(value);
    updateJobDetails(value, company, industry, experience, jobAd, resume, interviewTypeState, interviewStage);

    if (value.length > 2) {
      const filtered = commonJobRoles.filter(role =>
        role.toLowerCase().includes(value.toLowerCase())
      );
      setJobSuggestions(filtered.slice(0, 5));
    } else {
      setJobSuggestions([]);
    }
  };

  const selectJobSuggestion = (suggestion: string) => {
    setJobTitle(suggestion);
    setJobSuggestions([]);
    updateJobDetails(suggestion, company, industry, experience, jobAd, resume, interviewTypeState, interviewStage);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompany(value);
    updateJobDetails(jobTitle, value, industry, experience, jobAd, resume, interviewTypeState, interviewStage);
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    updateJobDetails(jobTitle, company, value, experience, jobAd, resume, interviewTypeState, interviewStage);
  };

  const handleExperienceChange = (value: string) => {
    setExperience(value);
    updateJobDetails(jobTitle, company, industry, value, jobAd, resume, interviewTypeState, interviewStage);
  };

  const handleJobAdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobAd(value);
    updateJobDetails(jobTitle, company, industry, experience, value, resume, interviewTypeState, interviewStage);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResume(file);
    updateJobDetails(jobTitle, company, industry, experience, jobAd, file, interviewTypeState, interviewStage);
  };

  const handleInterviewTypeChange = (value: string) => {
    setInterviewTypeState(value);
    // Clear industry when switching to Behavioral interview type
    const newIndustry = value === 'Behavioral' ? '' : industry;
    if (value === 'Behavioral') {
      setIndustry('');
    }
    updateJobDetails(jobTitle, company, newIndustry, experience, jobAd, resume, value, interviewStage);
  };

  const handleInterviewStageChange = (value: string) => {
    setInterviewStage(value);
    updateJobDetails(jobTitle, company, industry, experience, jobAd, resume, interviewTypeState, value);
  };

  const updateJobDetails = (
    title: string,
    comp: string,
    ind: string,
    exp: string,
    ad: string,
    res: File | null,
    type: string,
    stage: string
  ) => {
    onJobDetailsChange({
      jobTitle: title,
      company: comp,
      industry: ind,
      experienceLevel: exp,
      jobAd: ad || '',
      resume: res,
      interviewType: type,
      interviewStage: stage
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            placeholder="e.g. Software Engineer, Marketing Manager"
            value={jobTitle}
            onChange={handleJobTitleChange}
          />

          {/* Job title suggestions */}
          {jobSuggestions.length > 0 && (
            <Card className="mt-1">
              <CardContent className="p-2">
                <div className="flex flex-wrap gap-2">
                  {jobSuggestions.map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => selectJobSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="e.g. Google, Amazon, or leave blank for general"
            value={company}
            onChange={handleCompanyChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviewTypeState !== 'Behavioral' && (
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={handleIndustryChange}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={interviewTypeState === 'Behavioral' ? 'md:col-span-2' : ''}>
            <Label htmlFor="experience">Experience Level</Label>
            <Select value={experience} onValueChange={handleExperienceChange}>
              <SelectTrigger id="experience">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entry-level">Entry-level</SelectItem>
                <SelectItem value="Mid-level">Mid-level</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="jobAd">Job Description (Optional)</Label>
          <Textarea
            id="jobAd"
            placeholder="Paste the job description here for more personalized questions..."
            value={jobAd}
            onChange={handleJobAdChange}
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="resume">Resume Upload (Optional)</Label>
          <div className="mt-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-800/50 hover:bg-zinc-700/50 border-zinc-700/50 text-zinc-300"
              onClick={() => document.getElementById('resume-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {resume ? resume.name : 'Upload Resume'}
            </Button>
            <input
              id="resume-upload"
              name="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">PDF, DOC, or DOCX up to 10MB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="interviewType">Interview Type</Label>
            <Select value={interviewTypeState} onValueChange={handleInterviewTypeChange}>
              <SelectTrigger id="interviewType">
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                {interviewTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interviewStage">Interview Stage</Label>
            <Select value={interviewStage} onValueChange={handleInterviewStageChange}>
              <SelectTrigger id="interviewStage">
                <SelectValue placeholder="Select interview stage" />
              </SelectTrigger>
              <SelectContent>
                {interviewStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
