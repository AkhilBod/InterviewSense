// Data sets for programmatic SEO generation
// Based on CS internship trends and top hiring companies

export const jobRoles = [
  {
    title: "Software Engineer Intern",
    slug: "software-engineer-intern",
    description: "Entry-level software development positions",
    skills: ["Data Structures", "Algorithms", "System Design", "Coding"],
    difficulty: "Medium"
  },
  {
    title: "Software Developer Intern", 
    slug: "software-developer-intern",
    description: "Software development and programming roles",
    skills: ["Programming", "Web Development", "APIs", "Databases"],
    difficulty: "Medium"
  },
  {
    title: "SDE Intern",
    slug: "sde-intern", 
    description: "Software Development Engineer internship positions",
    skills: ["Data Structures", "Algorithms", "System Design", "Object-Oriented Programming"],
    difficulty: "Medium-Hard"
  },
  {
    title: "Data Science Intern",
    slug: "data-science-intern",
    description: "Data analysis and machine learning internships", 
    skills: ["Statistics", "Python", "Machine Learning", "SQL"],
    difficulty: "Medium-Hard"
  },
  {
    title: "Machine Learning Intern",
    slug: "machine-learning-intern",
    description: "AI and ML engineering positions",
    skills: ["Machine Learning", "Python", "Statistics", "Deep Learning"],
    difficulty: "Hard"
  },
  {
    title: "Frontend Developer Intern",
    slug: "frontend-developer-intern", 
    description: "Frontend web development internships",
    skills: ["JavaScript", "React", "HTML/CSS", "Web Development"],
    difficulty: "Medium"
  },
  {
    title: "Backend Developer Intern",
    slug: "backend-developer-intern",
    description: "Backend system development roles",
    skills: ["APIs", "Databases", "System Design", "Server Architecture"],
    difficulty: "Medium-Hard"
  },
  {
    title: "Full Stack Developer Intern",
    slug: "full-stack-developer-intern",
    description: "End-to-end web development positions",
    skills: ["JavaScript", "React", "APIs", "Databases"],
    difficulty: "Medium-Hard"
  },
  {
    title: "DevOps Intern",
    slug: "devops-intern",
    description: "Infrastructure and deployment automation",
    skills: ["Cloud Computing", "CI/CD", "Docker", "System Administration"],
    difficulty: "Medium-Hard"
  },
  {
    title: "Cybersecurity Intern",
    slug: "cybersecurity-intern",
    description: "Information security and cybersecurity roles",
    skills: ["Security", "Networking", "Cryptography", "Risk Assessment"],
    difficulty: "Medium-Hard"
  }
];

// Top companies hiring CS interns (based on GitHub repos and industry data)
export const companies = [
  {
    name: "Google",
    slug: "google",
    tier: "FAANG",
    locations: ["Mountain View", "New York", "Seattle", "Austin"],
    hiring_seasons: ["Summer", "Fall", "Spring"],
    typical_questions: 350,
    difficulty: "Hard",
    focus_areas: ["Algorithms", "System Design", "Behavioral"]
  },
  {
    name: "Meta",
    slug: "meta", 
    tier: "FAANG",
    locations: ["Menlo Park", "New York", "Seattle", "Austin"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 320,
    difficulty: "Hard",
    focus_areas: ["Data Structures", "System Design", "Behavioral"]
  },
  {
    name: "Amazon",
    slug: "amazon",
    tier: "FAANG", 
    locations: ["Seattle", "New York", "Austin", "Boston"],
    hiring_seasons: ["Summer", "Fall", "Spring"],
    typical_questions: 400,
    difficulty: "Medium-Hard",
    focus_areas: ["Leadership Principles", "Algorithms", "System Design"]
  },
  {
    name: "Apple",
    slug: "apple",
    tier: "FAANG",
    locations: ["Cupertino", "Austin", "New York"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 280,
    difficulty: "Hard",
    focus_areas: ["System Design", "Coding", "Product Thinking"]
  },
  {
    name: "Netflix",
    slug: "netflix",
    tier: "FAANG",
    locations: ["Los Gatos", "Los Angeles", "New York"],
    hiring_seasons: ["Summer"],
    typical_questions: 180,
    difficulty: "Hard",
    focus_areas: ["Culture Fit", "System Design", "Algorithms"]
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    tier: "Big Tech",
    locations: ["Redmond", "New York", "Austin", "San Francisco"],
    hiring_seasons: ["Summer", "Fall", "Spring"],
    typical_questions: 340,
    difficulty: "Medium-Hard",
    focus_areas: ["Algorithms", "System Design", "Behavioral"]
  },
  {
    name: "Nvidia",
    slug: "nvidia",
    tier: "Big Tech",
    locations: ["Santa Clara", "Austin", "Tel Aviv"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 220,
    difficulty: "Hard",
    focus_areas: ["GPU Computing", "AI/ML", "System Design"]
  },
  {
    name: "Tesla",
    slug: "tesla",
    tier: "Innovative",
    locations: ["Palo Alto", "Austin", "Fremont"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 200,
    difficulty: "Medium-Hard",
    focus_areas: ["Problem Solving", "System Design", "Behavioral"]
  },
  {
    name: "Uber",
    slug: "uber",
    tier: "Unicorn",
    locations: ["San Francisco", "New York", "Seattle"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 250,
    difficulty: "Medium-Hard",
    focus_areas: ["System Design", "Algorithms", "Behavioral"]
  },
  {
    name: "Airbnb",
    slug: "airbnb",
    tier: "Unicorn", 
    locations: ["San Francisco", "Seattle", "Portland"],
    hiring_seasons: ["Summer"],
    typical_questions: 180,
    difficulty: "Medium-Hard",
    focus_areas: ["System Design", "Product Thinking", "Culture Fit"]
  },
  {
    name: "Spotify",
    slug: "spotify",
    tier: "Unicorn",
    locations: ["New York", "Boston", "San Francisco"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 160,
    difficulty: "Medium",
    focus_areas: ["Algorithms", "System Design", "Product Thinking"]
  },
  {
    name: "Stripe",
    slug: "stripe",
    tier: "Fintech",
    locations: ["San Francisco", "New York", "Seattle"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 190,
    difficulty: "Hard",
    focus_areas: ["System Design", "API Design", "Problem Solving"]
  },
  {
    name: "Square",
    slug: "square",
    tier: "Fintech",
    locations: ["San Francisco", "Atlanta", "New York"],
    hiring_seasons: ["Summer"],
    typical_questions: 150,
    difficulty: "Medium-Hard",
    focus_areas: ["Payment Systems", "APIs", "Security"]
  },
  {
    name: "Robinhood",
    slug: "robinhood",
    tier: "Fintech", 
    locations: ["Menlo Park", "New York"],
    hiring_seasons: ["Summer"],
    typical_questions: 140,
    difficulty: "Medium-Hard",
    focus_areas: ["Fintech", "System Design", "Security"]
  },
  {
    name: "Salesforce",
    slug: "salesforce",
    tier: "Enterprise",
    locations: ["San Francisco", "Seattle", "Indianapolis"],
    hiring_seasons: ["Summer", "Fall"],
    typical_questions: 200,
    difficulty: "Medium",
    focus_areas: ["Cloud Computing", "APIs", "System Design"]
  }
];

// Interview topics and skills for CS roles
export const skills = [
  {
    name: "Data Structures",
    slug: "data-structures",
    category: "Technical",
    difficulty: "Medium",
    topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables", "Stacks", "Queues"],
    question_count: 120
  },
  {
    name: "Algorithms", 
    slug: "algorithms",
    category: "Technical",
    difficulty: "Medium-Hard",
    topics: ["Sorting", "Searching", "Dynamic Programming", "Greedy", "Graph Algorithms"],
    question_count: 150
  },
  {
    name: "System Design",
    slug: "system-design",
    category: "Technical", 
    difficulty: "Hard",
    topics: ["Scalability", "Load Balancing", "Databases", "Caching", "Microservices"],
    question_count: 80
  },
  {
    name: "Behavioral Questions",
    slug: "behavioral",
    category: "Soft Skills",
    difficulty: "Medium",
    topics: ["Leadership", "Teamwork", "Problem Solving", "Communication", "Conflict Resolution"],
    question_count: 90
  },
  {
    name: "Object-Oriented Programming",
    slug: "oop",
    category: "Technical",
    difficulty: "Medium", 
    topics: ["Inheritance", "Polymorphism", "Encapsulation", "Design Patterns"],
    question_count: 70
  },
  {
    name: "Database Design",
    slug: "database-design",
    category: "Technical",
    difficulty: "Medium",
    topics: ["SQL", "NoSQL", "Schema Design", "Normalization", "Indexing"],
    question_count: 60
  },
  {
    name: "Web Development",
    slug: "web-development", 
    category: "Technical",
    difficulty: "Medium",
    topics: ["HTML/CSS", "JavaScript", "React", "APIs", "Frontend/Backend"],
    question_count: 85
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    category: "Technical",
    difficulty: "Hard",
    topics: ["Supervised Learning", "Unsupervised Learning", "Neural Networks", "Model Evaluation"],
    question_count: 65
  },
  {
    name: "Python Programming",
    slug: "python",
    category: "Technical", 
    difficulty: "Medium",
    topics: ["Syntax", "Libraries", "Data Science", "Web Frameworks", "Testing"],
    question_count: 95
  },
  {
    name: "JavaScript",
    slug: "javascript",
    category: "Technical",
    difficulty: "Medium", 
    topics: ["ES6+", "Async Programming", "DOM Manipulation", "Frameworks", "Testing"],
    question_count: 80
  }
];

// Level specifications for different career stages
export const levels = [
  {
    name: "Intern",
    slug: "intern", 
    description: "Summer/co-op internship positions",
    experience: "0-1 years",
    expectations: "Basic CS fundamentals, eagerness to learn"
  },
  {
    name: "New Grad",
    slug: "new-grad",
    description: "Entry-level full-time positions", 
    experience: "0-2 years",
    expectations: "Strong CS fundamentals, some project experience"
  },
  {
    name: "Entry Level",
    slug: "entry-level",
    description: "Junior developer positions",
    experience: "0-2 years", 
    expectations: "CS degree, basic programming skills"
  }
];

// Generate all possible page combinations
export function generatePageCombinations() {
  const combinations = [];
  
  // Company + Role combinations
  companies.forEach(company => {
    jobRoles.forEach(role => {
      combinations.push({
        type: 'company-role',
        title: `${company.name} ${role.title} Interview Questions`,
        slug: `${company.slug}-${role.slug}`,
        company,
        role,
        keyword: `${company.name} ${role.title} interview questions`,
        description: `Ace your ${company.name} ${role.title} interview with real questions and AI-powered practice.`
      });
    });
  });

  // Company + Skill combinations  
  companies.forEach(company => {
    skills.forEach(skill => {
      combinations.push({
        type: 'company-skill',
        title: `${company.name} ${skill.name} Interview Questions`,
        slug: `${company.slug}-${skill.slug}`,
        company,
        skill,
        keyword: `${company.name} ${skill.name} interview questions`,
        description: `Master ${skill.name} questions asked at ${company.name} interviews.`
      });
    });
  });

  // Role + Skill combinations
  jobRoles.forEach(role => {
    skills.forEach(skill => {
      combinations.push({
        type: 'role-skill', 
        title: `${role.title} ${skill.name} Questions`,
        slug: `${role.slug}-${skill.slug}`,
        role,
        skill,
        keyword: `${role.title} ${skill.name} questions`,
        description: `Practice ${skill.name} questions specifically for ${role.title} positions.`
      });
    });
  });

  // Company + Role + Skill combinations (premium long-tail)
  companies.slice(0, 10).forEach(company => { // Top 10 companies only
    jobRoles.slice(0, 5).forEach(role => { // Top 5 roles only
      skills.slice(0, 5).forEach(skill => { // Top 5 skills only
        combinations.push({
          type: 'company-role-skill',
          title: `${company.name} ${role.title} ${skill.name} Questions`,
          slug: `${company.slug}-${role.slug}-${skill.slug}`,
          company,
          role, 
          skill,
          keyword: `${company.name} ${role.title} ${skill.name} questions`,
          description: `Targeted ${skill.name} practice for ${company.name} ${role.title} interviews.`
        });
      });
    });
  });

  return combinations;
}

export const allCombinations = generatePageCombinations();
console.log(`Generated ${allCombinations.length} page combinations for programmatic SEO`);
