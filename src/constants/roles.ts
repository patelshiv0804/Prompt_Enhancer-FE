import {
  Sparkles,
  GraduationCap,
  Megaphone,
  Briefcase,
  Search,
  Code2,
  School,
  Rocket,
  PenTool,
  BarChart3,
  Palette,
  Video,
  BookOpen,
  Layers,
  Zap,
  Award,
  Users,
  Mail,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Scale,
  ShoppingCart,
  Cpu,
  Server,
  Database,
  ShieldCheck,
  Smartphone,
  Monitor,
  FileText,
} from 'lucide-react';
import React from 'react';

export interface RoleItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const ROLES: RoleItem[] = [
  { id: 'general', label: 'General', icon: Sparkles },
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'marketer', label: 'Marketer', icon: Megaphone },
  { id: 'consultant', label: 'Consultant', icon: Briefcase },
  { id: 'researcher', label: 'Researcher', icon: Search },
  { id: 'developer', label: 'Developer', icon: Code2 },
  { id: 'educator', label: 'Educator', icon: School },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: Rocket },
  { id: 'writer', label: 'Writer', icon: PenTool },
  { id: 'analyst', label: 'Analyst', icon: BarChart3 },
  { id: 'designer', label: 'Designer', icon: Palette },
  { id: 'creator', label: 'Creator', icon: Video },
];

export const ROLE_MODES: Record<string, string[]> = {
  creator: [
    'YouTube', 'Instagram', 'TikTok', 'X/Twitter', 'LinkedIn', 'Facebook',
    'Blogging', 'Podcast', 'Streaming', 'Email Content', 'Community Building',
    'Branding', 'Monetization', 'Analytics', 'Content Strategy',
  ],
  analyst: [
    'Data Analysis', 'Business Analysis', 'Financial Analysis', 'Market Analysis',
    'Competitor Analysis', 'SWOT Analysis', 'Risk Analysis', 'Root Cause Analysis',
    'Decision Support', 'Scenario Analysis', 'KPI & Metrics Analysis', 'Product Analysis',
    'Operations Analysis', 'Visualization & Reporting', 'Strategy',
  ],
  marketer: [
    'Market Research', 'Positioning', 'Branding', 'Content Marketing', 'SEO',
    'Social Media Marketing', 'Email Marketing', 'Paid Advertising', 'Lead Generation',
    'Funnels', 'Conversion Optimization', 'Growth Marketing', 'Product Marketing',
    'Analytics', 'Retention', 'E-commerce Marketing', 'B2B Marketing', 'Local Marketing',
    'Marketing Strategy',
  ],
  educator: [
    'Lesson Planning', 'Teaching Materials', 'Assessments', 'Quiz & Test Creation',
    'Course Design', 'Teaching Strategies', 'Explanation & Simplification',
    'Classroom Management', 'Educational Technology', 'Online Education',
    'Special Education', 'Educational Research', 'Content Creation',
    'Feedback & Evaluation', 'Professional Development',
  ],
  consultant: [
    'Strategy Consulting', 'Business Consulting', 'Startup Consulting', 'Product Consulting',
    'Marketing Consulting', 'Operations Consulting', 'Technology Consulting',
    'Financial Consulting', 'HR Consulting', 'Career Consulting', 'Management Consulting',
    'Audit & Review', 'Recommendations', 'Implementation Support',
  ],
  entrepreneur: [
    'Idea & Validation', 'Market Research', 'Business Planning', 'Product',
    'Branding', 'Marketing', 'Sales', 'Pricing', 'Finance', 'Fundraising',
    'Operations', 'Legal', 'E-Commerce', 'SaaS', 'AI Startups', 'Growth',
    'Founder Career',
  ],
  researcher: [
    'Deep Research', 'Literature Research', 'Source Analysis', 'Fact Checking',
    'Comparison', 'Reports', 'Market Research', 'Data Research', 'Historical Research',
    'Scientific Research', 'Academic Research', 'Competitive Intelligence',
    'Forecasting', 'Investigative Research', 'Synthesis',
  ],
  writer: [
    'Creative Writing', 'Content Writing', 'Marketing Copywriting', 'Social Media Writing',
    'Business Writing', 'Academic Writing', 'Technical Writing', 'Career Writing',
    'Editing & Rewriting', 'Specialized Writing',
  ],
  designer: [
    'UI Design', 'UX Design', 'Figma', 'Design Systems', 'Branding', 'Graphics',
    'Landing Pages', 'Motion Design', 'Product Design', 'Presentation Design',
    'E-commerce Design', 'Email Design', '3D Design', 'Game Design',
    'AI-Assisted Design',
  ],
  developer: [
    'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Desktop', 'Database', 'APIs',
    'DSA', 'Competitive Programming', 'Debugging', 'Testing', 'System Design',
    'DevOps', 'Cloud', 'Cybersecurity', 'Operating Systems', 'Networking',
    'AI/ML', 'Agentic AI', 'Blockchain', 'Game Development', 'Embedded Systems',
    'Open Source', 'Developer Career',
  ],
  student: [
    'Study', 'Exams', 'Learnings', 'Projects', 'Research',
    'Competitive Programming', 'Productivity', 'Certifications',
    'Interview Preparation', 'Career',
  ],
  general: [
    'Creative', 'Technical', 'Academic', 'Professional', 'Concise',
    'Detailed', 'Brainstorming', 'Problem Solving',
  ],
};

export function getModeIcon(mode: string): React.ElementType {
  const m = mode.toLowerCase();
  if (m.includes('study')) return BookOpen;
  if (m.includes('exam')) return GraduationCap;
  if (m.includes('learn')) return School;
  if (m.includes('project')) return Layers;
  if (m.includes('productiv')) return Zap;
  if (m.includes('certif')) return Award;
  if (m.includes('interview')) return Users;
  if (m.includes('youtube') || m.includes('video') || m.includes('tiktok') || m.includes('motion') || m.includes('streaming') || m.includes('podcast')) return Video;
  if (m.includes('social') || m.includes('instagram') || m.includes('twitter') || m.includes('facebook') || m.includes('linkedin') || m.includes('community')) return Users;
  if (m.includes('email')) return Mail;
  if (m.includes('blog') || m.includes('writing') || m.includes('essay') || m.includes('copywriting') || m.includes('story')) return PenTool;
  if (m.includes('code') || m.includes('frontend') || m.includes('backend') || m.includes('full stack') || m.includes('dev') || m.includes('open source') || m.includes('dsa') || m.includes('programming')) return Code2;
  if (m.includes('data') || m.includes('analyt') || m.includes('kpi') || m.includes('metric') || m.includes('chart') || m.includes('swot') || m.includes('financial') || m.includes('reporting')) return BarChart3;
  if (m.includes('market') || m.includes('seo') || m.includes('growth') || m.includes('funnel') || m.includes('lead') || m.includes('ads') || m.includes('positioning')) return TrendingUp;
  if (m.includes('design') || m.includes('ui') || m.includes('ux') || m.includes('figma') || m.includes('brand') || m.includes('graphics') || m.includes('3d') || m.includes('presentation')) return Palette;
  if (m.includes('teaching') || m.includes('lesson') || m.includes('educat') || m.includes('course') || m.includes('quiz') || m.includes('test') || m.includes('assessment')) return School;
  if (m.includes('consulting') || m.includes('business') || m.includes('strategy') || m.includes('hr') || m.includes('management') || m.includes('career')) return Briefcase;
  if (m.includes('idea') || m.includes('concept') || m.includes('simplification') || m.includes('insight')) return Lightbulb;
  if (m.includes('finance') || m.includes('pricing') || m.includes('monetiz') || m.includes('fundraising')) return DollarSign;
  if (m.includes('legal') || m.includes('risk') || m.includes('audit')) return Scale;
  if (m.includes('e-commerce') || m.includes('sales')) return ShoppingCart;
  if (m.includes('ai') || m.includes('ml') || m.includes('agentic') || m.includes('saas') || m.includes('blockchain')) return Cpu;
  if (m.includes('cloud') || m.includes('devops') || m.includes('server') || m.includes('api') || m.includes('network') || m.includes('operating')) return Server;
  if (m.includes('database')) return Database;
  if (m.includes('security') || m.includes('cyber')) return ShieldCheck;
  if (m.includes('mobile')) return Smartphone;
  if (m.includes('desktop') || m.includes('web') || m.includes('landing')) return Monitor;
  if (m.includes('research') || m.includes('investigative') || m.includes('fact') || m.includes('deep') || m.includes('literature') || m.includes('source') || m.includes('comparison')) return Search;
  if (m.includes('plan') || m.includes('report') || m.includes('document') || m.includes('materials') || m.includes('synthesis')) return FileText;
  if (m.includes('startup') || m.includes('founder') || m.includes('product')) return Rocket;
  return Sparkles;
}
