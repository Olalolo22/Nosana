import { z } from 'zod';

// Code Review Prompt Templates
export const codeReviewPrompts = {
  // Repository scanning prompts
  repoScan: {
    system: `You are an expert code reviewer specializing in repository analysis and code quality assessment. Your role is to help developers understand their codebase structure and identify areas for improvement.

Focus on:
- Code organization and architecture
- Documentation quality
- Testing coverage
- Security best practices
- Performance considerations
- Maintainability

Be constructive, specific, and actionable in your recommendations.`,

    user: (repoData: any) => `Analyze the following repository structure:

Repository Path: ${repoData.repoPath}
Total Files: ${repoData.totalFiles}
Total Size: ${repoData.totalSize} bytes
File Types: ${JSON.stringify(repoData.fileTypes)}
Directories: ${repoData.directories?.slice(0, 10).join(', ')}...

Key Files Found:
${repoData.files?.slice(0, 20).map((f: any) => `- ${f.path} (${f.size} bytes, ${f.extension})`).join('\n')}

Please provide:
1. Overall repository health assessment
2. Key strengths and weaknesses
3. Specific recommendations for improvement
4. Priority areas for attention`,

    schema: z.object({
      assessment: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      recommendations: z.array(z.object({
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        category: z.enum(['security', 'performance', 'maintainability', 'testing', 'documentation']),
        description: z.string(),
        action: z.string(),
      })),
      overallScore: z.number().min(0).max(10),
    }),
  },

  // Diff review prompts
  diffReview: {
    system: `You are a senior code reviewer with expertise in identifying security vulnerabilities, performance issues, and code quality problems. You're reviewing a specific code change (diff) and need to provide detailed feedback.

Review Guidelines:
- Security: Look for injection vulnerabilities, authentication issues, data exposure
- Performance: Identify bottlenecks, inefficient algorithms, memory leaks
- Readability: Check for clear naming, proper comments, logical structure
- Best Practices: Ensure proper error handling, logging, testing

Provide specific line-by-line feedback where appropriate.`,

    user: (diffData: any) => `Review the following code change:

File: ${diffData.filePath}
Focus Area: ${diffData.reviewFocus}

Diff Content:
\`\`\`diff
${diffData.diffContent}
\`\`\`

Please analyze this change for:
1. Security implications
2. Performance impact
3. Code quality and maintainability
4. Potential bugs or edge cases
5. Adherence to best practices

Provide specific, actionable feedback with severity levels.`,

    schema: z.object({
      summary: z.object({
        overallAssessment: z.enum(['approve', 'request_changes', 'needs_discussion']),
        confidence: z.number().min(0).max(1),
        riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
      }),
      issues: z.array(z.object({
        line: z.number(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        category: z.enum(['security', 'performance', 'readability', 'best_practices', 'bug']),
        message: z.string(),
        suggestion: z.string(),
        code: z.string().optional(),
      })),
      positives: z.array(z.string()),
      recommendations: z.array(z.string()),
      testingSuggestions: z.array(z.string()),
    }),
  },

  // Linting prompts
  lintCheck: {
    system: `You are a code quality specialist focused on enforcing coding standards, style consistency, and best practices. You help developers write clean, maintainable, and consistent code.

Your expertise covers:
- ESLint rules and TypeScript best practices
- Code formatting and style consistency
- Import organization and dependency management
- Documentation standards
- Performance optimization patterns

Provide clear, actionable feedback that helps improve code quality.`,

    user: (lintData: any) => `Analyze the linting results for this file:

File: ${lintData.filePath}
Linter Type: ${lintData.linterType}

Issues Found: ${lintData.summary.totalIssues}
- Errors: ${lintData.summary.errors}
- Warnings: ${lintData.summary.warnings}
- Infos: ${lintData.summary.infos}
- Fixable: ${lintData.summary.fixableIssues}

Detailed Issues:
${lintData.issues?.map((issue: any) => 
  `Line ${issue.line}: ${issue.severity.toUpperCase()} - ${issue.message} (${issue.rule})`
).join('\n')}

Please provide:
1. Priority fixes (errors first)
2. Code quality improvements
3. Style consistency recommendations
4. Best practice suggestions`,

    schema: z.object({
      priorityFixes: z.array(z.object({
        line: z.number(),
        issue: z.string(),
        fix: z.string(),
        impact: z.enum(['low', 'medium', 'high']),
      })),
      qualityImprovements: z.array(z.string()),
      styleRecommendations: z.array(z.string()),
      bestPractices: z.array(z.string()),
      autoFixable: z.boolean(),
      estimatedTimeToFix: z.string(),
    }),
  },

  // General code review prompts
  general: {
    system: `You are an experienced software engineer and code reviewer. You help teams maintain high code quality through thorough, constructive reviews that focus on both technical excellence and team collaboration.

Your approach:
- Be constructive and educational
- Explain the "why" behind recommendations
- Consider the broader context and team goals
- Balance perfectionism with practical constraints
- Foster learning and knowledge sharing`,

    user: (context: any) => `Please provide a comprehensive code review considering:

Context: ${context.task}
Priority: ${context.priority}
Domain: Code Review

${context.additionalContext || ''}

Focus on providing actionable, constructive feedback that helps improve code quality while being mindful of the team's goals and constraints.`,

    schema: z.object({
      reviewSummary: z.string(),
      keyFindings: z.array(z.string()),
      actionItems: z.array(z.object({
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        assignee: z.string().optional(),
        estimatedEffort: z.string(),
      })),
      learningOpportunities: z.array(z.string()),
      followUpActions: z.array(z.string()),
    }),
  },
};

// Dynamic prompt selection based on context
export function getCodeReviewPrompt(context: string, data: any) {
  switch (context) {
    case 'scan_repo':
      return {
        system: codeReviewPrompts.repoScan.system,
        user: codeReviewPrompts.repoScan.user(data),
        schema: codeReviewPrompts.repoScan.schema,
      };
    case 'review_diff':
      return {
        system: codeReviewPrompts.diffReview.system,
        user: codeReviewPrompts.diffReview.user(data),
        schema: codeReviewPrompts.diffReview.schema,
      };
    case 'check_lint':
      return {
        system: codeReviewPrompts.lintCheck.system,
        user: codeReviewPrompts.lintCheck.user(data),
        schema: codeReviewPrompts.lintCheck.schema,
      };
    default:
      return {
        system: codeReviewPrompts.general.system,
        user: codeReviewPrompts.general.user(data),
        schema: codeReviewPrompts.general.schema,
      };
  }
}
