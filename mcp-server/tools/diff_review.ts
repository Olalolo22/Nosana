import { z } from 'zod';

const DiffReviewSchema = z.object({
  diff_content: z.string(),
  file_path: z.string(),
  review_focus: z.enum(['security', 'performance', 'readability', 'best_practices', 'all']).optional().default('all'),
});

interface CodeIssue {
  line: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'readability' | 'best_practices' | 'style';
  message: string;
  suggestion?: string;
  code_snippet?: string;
}

interface DiffReviewResult {
  filePath: string;
  reviewFocus: string;
  issues: CodeIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  recommendations: string[];
  reviewTime: number;
}

export async function diffReviewTool(args: unknown) {
  try {
    const { diff_content, file_path, review_focus } = DiffReviewSchema.parse(args);
    
    const startTime = Date.now();
    const issues = analyzeDiff(diff_content, file_path, review_focus);
    const recommendations = generateRecommendations(issues, review_focus);
    const reviewTime = Date.now() - startTime;

    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
    };

    const result: DiffReviewResult = {
      filePath,
      reviewFocus,
      issues,
      summary,
      recommendations,
      reviewTime,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error in diff_review tool:', error);
    throw new Error(`Failed to review diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function analyzeDiff(diffContent: string, filePath: string, focus: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = diffContent.split('\n');
  
  let lineNumber = 0;
  let currentHunk = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track line numbers in hunks
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        lineNumber = parseInt(match[1]) - 1; // -1 because we increment before processing
      }
      currentHunk = line;
      continue;
    }
    
    // Skip context lines and deletion lines
    if (line.startsWith(' ') || line.startsWith('-')) {
      continue;
    }
    
    // Process addition lines
    if (line.startsWith('+')) {
      lineNumber++;
      const code = line.substring(1);
      
      // Run analysis based on focus
      if (focus === 'all' || focus === 'security') {
        issues.push(...analyzeSecurity(code, lineNumber, filePath));
      }
      
      if (focus === 'all' || focus === 'performance') {
        issues.push(...analyzePerformance(code, lineNumber, filePath));
      }
      
      if (focus === 'all' || focus === 'readability') {
        issues.push(...analyzeReadability(code, lineNumber, filePath));
      }
      
      if (focus === 'all' || focus === 'best_practices') {
        issues.push(...analyzeBestPractices(code, lineNumber, filePath));
      }
    }
  }
  
  return issues;
}

function analyzeSecurity(code: string, lineNumber: number, filePath: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  
  // SQL Injection patterns
  if (code.includes('query') && code.includes('+') && !code.includes('prepareStatement')) {
    issues.push({
      line: lineNumber,
      severity: 'critical',
      category: 'security',
      message: 'Potential SQL injection vulnerability detected',
      suggestion: 'Use parameterized queries or prepared statements',
      code_snippet: code.trim(),
    });
  }
  
  // Hardcoded secrets
  if (code.match(/(password|secret|key|token)\s*=\s*['"][^'"]+['"]/i)) {
    issues.push({
      line: lineNumber,
      severity: 'critical',
      category: 'security',
      message: 'Hardcoded secret detected',
      suggestion: 'Use environment variables or secure configuration management',
      code_snippet: code.trim(),
    });
  }
  
  // eval() usage
  if (code.includes('eval(')) {
    issues.push({
      line: lineNumber,
      severity: 'critical',
      category: 'security',
      message: 'eval() function usage detected',
      suggestion: 'Avoid eval() as it can execute arbitrary code',
      code_snippet: code.trim(),
    });
  }
  
  return issues;
}

function analyzePerformance(code: string, lineNumber: number, filePath: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  
  // Inefficient loops
  if (code.includes('for (') && code.includes('length') && code.includes('i++')) {
    issues.push({
      line: lineNumber,
      severity: 'medium',
      category: 'performance',
      message: 'Consider using forEach or for...of for better performance',
      suggestion: 'Use array methods like forEach, map, or for...of loops',
      code_snippet: code.trim(),
    });
  }
  
  // Nested loops
  if (code.match(/for\s*\([^)]+\)\s*{[^}]*for\s*\([^)]+\)/)) {
    issues.push({
      line: lineNumber,
      severity: 'high',
      category: 'performance',
      message: 'Nested loops detected - consider optimization',
      suggestion: 'Consider using more efficient algorithms or data structures',
      code_snippet: code.trim(),
    });
  }
  
  // Memory leaks - event listeners
  if (code.includes('addEventListener') && !code.includes('removeEventListener')) {
    issues.push({
      line: lineNumber,
      severity: 'medium',
      category: 'performance',
      message: 'Event listener added without cleanup',
      suggestion: 'Ensure event listeners are removed to prevent memory leaks',
      code_snippet: code.trim(),
    });
  }
  
  return issues;
}

function analyzeReadability(code: string, lineNumber: number, filePath: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  
  // Long lines
  if (code.length > 120) {
    issues.push({
      line: lineNumber,
      severity: 'low',
      category: 'readability',
      message: 'Line is too long (>120 characters)',
      suggestion: 'Break long lines for better readability',
      code_snippet: code.trim(),
    });
  }
  
  // Magic numbers
  if (code.match(/\b\d{3,}\b/) && !code.match(/\b(1024|2048|4096|3600|86400)\b/)) {
    issues.push({
      line: lineNumber,
      severity: 'low',
      category: 'readability',
      message: 'Magic number detected',
      suggestion: 'Use named constants instead of magic numbers',
      code_snippet: code.trim(),
    });
  }
  
  // Complex expressions
  if (code.split('&&').length > 3 || code.split('||').length > 3) {
    issues.push({
      line: lineNumber,
      severity: 'medium',
      category: 'readability',
      message: 'Complex boolean expression detected',
      suggestion: 'Break down complex conditions into separate variables or functions',
      code_snippet: code.trim(),
    });
  }
  
  return issues;
}

function analyzeBestPractices(code: string, lineNumber: number, filePath: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  
  // Console.log in production code
  if (code.includes('console.log') && !code.includes('// debug')) {
    issues.push({
      line: lineNumber,
      severity: 'low',
      category: 'best_practices',
      message: 'console.log found in code',
      suggestion: 'Use proper logging framework instead of console.log',
      code_snippet: code.trim(),
    });
  }
  
  // TODO comments
  if (code.includes('TODO') || code.includes('FIXME')) {
    issues.push({
      line: lineNumber,
      severity: 'low',
      category: 'best_practices',
      message: 'TODO/FIXME comment found',
      suggestion: 'Address TODO/FIXME items before merging',
      code_snippet: code.trim(),
    });
  }
  
  // Missing error handling
  if (code.includes('async') && code.includes('(') && !code.includes('try') && !code.includes('catch')) {
    issues.push({
      line: lineNumber,
      severity: 'medium',
      category: 'best_practices',
      message: 'Async function without error handling',
      suggestion: 'Add proper error handling with try-catch blocks',
      code_snippet: code.trim(),
    });
  }
  
  return issues;
}

function generateRecommendations(issues: CodeIssue[], focus: string): string[] {
  const recommendations: string[] = [];
  
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  
  if (criticalIssues.length > 0) {
    recommendations.push(`Address ${criticalIssues.length} critical security issues before merging`);
  }
  
  if (highIssues.length > 0) {
    recommendations.push(`Review ${highIssues.length} high-severity performance issues`);
  }
  
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (categoryCounts.security > 0) {
    recommendations.push('Consider security review for all authentication and data handling code');
  }
  
  if (categoryCounts.performance > 0) {
    recommendations.push('Profile performance-critical sections of the code');
  }
  
  if (issues.length > 10) {
    recommendations.push('Consider breaking this change into smaller, more manageable commits');
  }
  
  return recommendations;
}
