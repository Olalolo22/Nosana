import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  GitBranch, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';

export default function CodeReviewPage() {
  // Mock data for code review
  const repositories = [
    {
      id: 1,
      name: 'frontend-app',
      path: '/projects/frontend-app',
      lastScan: '2024-01-15T10:30:00Z',
      files: 156,
      issues: 12,
      status: 'healthy'
    },
    {
      id: 2,
      name: 'api-service',
      path: '/projects/api-service',
      lastScan: '2024-01-15T09:15:00Z',
      files: 89,
      issues: 3,
      status: 'warning'
    },
    {
      id: 3,
      name: 'mobile-app',
      path: '/projects/mobile-app',
      lastScan: '2024-01-14T16:45:00Z',
      files: 234,
      issues: 28,
      status: 'critical'
    }
  ];

  const recentReviews = [
    {
      id: 1,
      repository: 'frontend-app',
      file: 'src/components/Auth.tsx',
      type: 'diff-review',
      status: 'completed',
      issues: 0,
      timestamp: '2 minutes ago'
    },
    {
      id: 2,
      repository: 'api-service',
      file: 'src/routes/users.js',
      type: 'lint-check',
      status: 'completed',
      issues: 3,
      timestamp: '15 minutes ago'
    },
    {
      id: 3,
      repository: 'mobile-app',
      file: 'screens/LoginScreen.tsx',
      type: 'diff-review',
      status: 'warning',
      issues: 2,
      timestamp: '1 hour ago'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Review</h1>
          <p className="text-muted-foreground">
            Analyze repositories, review diffs, and check code quality
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Code2 className="w-4 h-4 mr-2" />
            New Review
          </Button>
        </div>
      </div>

      {/* Repository Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            Repository Overview
          </CardTitle>
          <CardDescription>
            Manage and monitor your code repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repositories.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    repo.status === 'healthy' ? 'bg-green-500' :
                    repo.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="font-medium">{repo.name}</h3>
                    <p className="text-sm text-muted-foreground">{repo.path}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{repo.files} files</p>
                    <p className="text-xs text-muted-foreground">
                      Last scan: {new Date(repo.lastScan).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {repo.issues > 0 && (
                      <Badge variant={repo.status === 'critical' ? 'destructive' : 'secondary'}>
                        {repo.issues} issues
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      Scan
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Tools */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Reviews</TabsTrigger>
          <TabsTrigger value="repo-scan">Repository Scan</TabsTrigger>
          <TabsTrigger value="diff-review">Diff Review</TabsTrigger>
          <TabsTrigger value="lint-check">Lint Check</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Latest code review activities and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        review.status === 'completed' ? 'bg-green-100 text-green-600' :
                        review.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {review.type === 'diff-review' ? <FileText className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{review.file}</h3>
                        <p className="text-sm text-muted-foreground">{review.repository}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {review.issues} {review.issues === 1 ? 'issue' : 'issues'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {review.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                          {review.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repo-scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Repository Scan</CardTitle>
              <CardDescription>
                Analyze repository structure and detect files for code review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Enter repository path..."
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button>Scan Repository</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scans the repository structure, detects files, and provides an overview of the codebase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diff-review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diff Review</CardTitle>
              <CardDescription>
                Analyze code diffs for issues, bugs, and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">File Path</label>
                    <input
                      type="text"
                      placeholder="e.g., src/components/Button.tsx"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Diff Content</label>
                    <textarea
                      placeholder="Paste your git diff here..."
                      className="w-full px-3 py-2 border rounded-md mt-1 h-32"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Review Focus</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1">
                      <option value="all">All</option>
                      <option value="security">Security</option>
                      <option value="performance">Performance</option>
                      <option value="readability">Readability</option>
                      <option value="best_practices">Best Practices</option>
                    </select>
                  </div>
                  <Button>Review Diff</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lint-check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lint Check</CardTitle>
              <CardDescription>
                Run linting rules and return results with suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">File Path</label>
                    <input
                      type="text"
                      placeholder="e.g., src/utils/helpers.js"
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Linter Type</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1">
                      <option value="all">All</option>
                      <option value="eslint">ESLint</option>
                      <option value="prettier">Prettier</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                  <Button>Check Linting</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
