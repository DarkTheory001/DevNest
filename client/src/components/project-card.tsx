import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Settings, Play, Code, Eye } from "lucide-react";
import { SiReact, SiPython, SiJavascript, SiWhatsapp } from "react-icons/si";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDeploy?: (project: Project) => void;
  onConfigure?: (project: Project) => void;
}

const projectIcons = {
  web_app: SiReact,
  whatsapp_bot: SiWhatsapp,
  api: SiPython,
  static_site: SiJavascript,
};

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  building: "bg-orange-500",
  error: "bg-red-500",
};

const statusLabels = {
  active: "Live",
  inactive: "Offline", 
  building: "Building",
  error: "Error",
};

export function ProjectCard({ project, onEdit, onDeploy, onConfigure }: ProjectCardProps) {
  const Icon = projectIcons[project.type];
  const statusColor = statusColors[project.status];
  const statusLabel = statusLabels[project.status];

  const getTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  return (
    <Card 
      className="project-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      data-testid={`project-card-${project.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="text-primary w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold" data-testid={`project-name-${project.id}`}>
                {project.name}
              </h4>
              <p className="text-sm text-muted-foreground capitalize">
                {project.type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Badge 
            className={`${statusColor} text-white text-xs px-2 py-1`}
            data-testid={`project-status-${project.id}`}
          >
            {statusLabel}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span data-testid={`project-updated-${project.id}`}>
              {getTimeAgo(project.updatedAt)}
            </span>
            <span className="flex items-center">
              <Eye className="mr-1 w-3 h-3" />
              <span>-</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {project.deploymentUrl && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.deploymentUrl!, '_blank');
                }}
                data-testid={`project-open-${project.id}`}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open
              </Button>
            )}
            
            {project.type === 'whatsapp_bot' && onConfigure && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure(project);
                }}
                data-testid={`project-configure-${project.id}`}
              >
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
            )}
            
            {project.status === 'inactive' && onDeploy && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeploy(project);
                }}
                data-testid={`project-deploy-${project.id}`}
              >
                <Play className="w-3 h-3 mr-1" />
                Deploy
              </Button>
            )}
            
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                data-testid={`project-edit-${project.id}`}
              >
                <Code className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
