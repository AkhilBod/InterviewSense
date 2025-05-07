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

interface JobRoleSelectProps {
  onJobDetailsChange: (details: {
    jobTitle: string;
    company: string;
    industry: string;
    experienceLevel: string;
  }) => void;
}

export default function JobRoleSelect({ onJobDetailsChange }: JobRoleSelectProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('Entry-level');
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);

  // Show suggestions as user types job title
  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobTitle(value);
    onJobDetailsChange({
      jobTitle: value,
      company,
      industry,
      experienceLevel: experience
    });

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
    onJobDetailsChange({
      jobTitle: suggestion,
      company,
      industry,
      experienceLevel: experience
    });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompany(value);
    onJobDetailsChange({
      jobTitle,
      company: value,
      industry,
      experienceLevel: experience
    });
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    onJobDetailsChange({
      jobTitle,
      company,
      industry: value,
      experienceLevel: experience
    });
  };

  const handleExperienceChange = (value: string) => {
    setExperience(value);
    onJobDetailsChange({
      jobTitle,
      company,
      industry,
      experienceLevel: value
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

          <div>
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
      </div>
    </div>
  );
}
