import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Save, Expand, FileText } from "lucide-react";
import { Link } from "wouter";

const codeSnippets = {
  javascript: `// Express.js API server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DevCloud!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
  python: `# FastAPI Python server
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to DevCloud!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevCloud Project</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #667EEA; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to DevCloud!</h1>
        <p>Your project is running successfully.</p>
    </div>
</body>
</html>`,
  css: `/* DevCloud Project Styles */
:root {
    --primary: #667EEA;
    --secondary: #764BA2;
    --accent: #F093FB;
    --success: #48BB78;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    margin: 0;
    padding: 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}`
};

const files = [
  { name: "index.js", language: "javascript" },
  { name: "app.py", language: "python" },
  { name: "index.html", language: "html" },
  { name: "styles.css", language: "css" },
  { name: "package.json", language: "javascript" },
  { name: "README.md", language: "markdown" },
];

export function IDEEditor() {
  const [selectedFile, setSelectedFile] = useState(files[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(codeSnippets.javascript);
  const [isAutoSaved, setIsAutoSaved] = useState(true);

  const handleFileChange = (fileName: string) => {
    const file = files.find(f => f.name === fileName);
    if (file) {
      setSelectedFile(file);
      setSelectedLanguage(file.language);
      setCode(codeSnippets[file.language as keyof typeof codeSnippets] || "// No template available");
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(codeSnippets[language as keyof typeof codeSnippets] || "// No template available");
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsAutoSaved(false);
    // Simulate auto-save after 2 seconds
    setTimeout(() => setIsAutoSaved(true), 2000);
  };

  const handleRun = () => {
    console.log("Running code...");
    // In real implementation, this would execute the code
  };

  const handleSave = () => {
    console.log("Saving code...");
    setIsAutoSaved(true);
  };

  return (
    <Card className="w-full" data-testid="ide-editor">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Quick IDE</h3>
          <Link href="/ide">
            <Button variant="ghost" size="sm" data-testid="expand-ide-button">
              <Expand className="w-4 h-4 mr-2" />
              Full IDE
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedFile.name} onValueChange={handleFileChange}>
              <SelectTrigger className="w-40" data-testid="file-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.name} value={file.name}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32" data-testid="language-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted rounded-lg p-4 font-mono text-sm min-h-64 mb-4">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-64 bg-transparent border-none outline-none resize-none font-mono text-sm"
            placeholder="Start coding..."
            data-testid="code-editor-textarea"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-gradient-to-br from-primary to-secondary"
              onClick={handleRun}
              data-testid="run-code-button"
            >
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
            <Button 
              variant="secondary"
              onClick={handleSave}
              disabled={isAutoSaved}
              data-testid="save-code-button"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {isAutoSaved ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Auto-saved
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
