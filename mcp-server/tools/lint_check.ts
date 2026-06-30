import { promises as fs } from 'fs';
import { extname } from 'path';
import { z } from 'zod';

const LintCheckSchema = z.object({
  file_path: z.string(),
  linter_type: z.enum(['eslint', 'prettier', 'typescript', 'python', 'all']).optional().default('all'),
});

interface LintIssue {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  fix?: string;
  code_snippet?: string;
}

interface LintResult {
  filePath: string;
  linterType: string;
  issues: LintIssue[];
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    infos: number;
    fixableIssues: number;
  };
  recommendations: string[];
  lintTime: number;
}

export async function lintCheckTool(args: unknown) {
  try {
    const { file_path, linter_type } = LintCheckSchema.parse(args);
    
    const startTime = Date.now();
    
    // Check if file exists
    try {
      await fs.access(file_path);
    } catch (error) {
      throw new Error(`File does not exist: ${file_path}`);
    }
    
    const fileContent = await fs.readFile(file_path, 'utf-8');
    const fileExtension = extname(file_path);
    const issues = await runLinting(fileContent, file_path, fileExtension, linter_type);
    const recommendations = generateLintRecommendations(issues, fileExtension);
    const lintTime = Date.now() - startTime;

    const summary = {
      totalIssues: issues.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      infos: issues.filter(i => i.severity === 'info').length,
      fixableIssues: issues.filter(i => i.fix).length,
    };

    const result: LintResult = {
      filePath: file_path,
      linterType: linter_type,
      issues,
      summary,
      recommendations,
      lintTime,
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
    console.error('Error in lint_check tool:', error);
    throw new Error(`Failed to lint file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function runLinting(
  content: string,
  filePath: string,
  fileExtension: string,
  linterType: string
): Promise<LintIssue[]> {
  const issues: LintIssue[] = [];
  
  // Determine which linters to run based on file type and requested type
  const lintersToRun = determineLinters(fileExtension, linterType);
  
  for (const linter of lintersToRun) {
    switch (linter) {
      case 'eslint':
        issues.push(...runESLintRules(content, filePath));
        break;
      case 'prettier':
        issues.push(...runPrettierRules(content, filePath));
        break;
      case 'typescript':
        issues.push(...runTypeScriptRules(content, filePath));
        break;
      case 'python':
        issues.push(...runPythonRules(content, filePath));
        break;
    }
  }
  
  return issues;
}

function determineLinters(fileExtension: string, linterType: string): string[] {
  if (linterType === 'all') {
    const linters: string[] = [];
    
    if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExtension)) {
      linters.push('eslint', 'prettier', 'typescript');
    } else if (fileExtension === '.py') {
      linters.push('python');
    } else {
      linters.push('prettier'); // Basic formatting for other files
    }
    
    return linters;
  }
  
  return [linterType];
}

function runESLintRules(content: string, filePath: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Unused variables
    if (line.includes('var ') && !line.includes('=')) {
      issues.push({
        line: lineNumber,
        column: 1,
        severity: 'warning',
        rule: 'no-unused-vars',
        message: 'Unused variable declaration',
        fix: 'Remove unused variable or use it',
        code_snippet: line.trim(),
      });
    }
    
    // Missing semicolons
    if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && 
        !line.trim().endsWith('}') && !line.includes('//') && !line.includes('if') && 
        !line.includes('for') && !line.includes('while') && !line.includes('function')) {
      issues.push({
        line: lineNumber,
        column: line.length,
        severity: 'error',
        rule: 'semi',
        message: 'Missing semicolon',
        fix: line + ';',
        code_snippet: line.trim(),
      });
    }
    
    // Double quotes instead of single quotes
    if (line.includes('"') && !line.includes("'")) {
      issues.push({
        line: lineNumber,
        column: line.indexOf('"') + 1,
        severity: 'warning',
        rule: 'quotes',
        message: 'Use single quotes instead of double quotes',
        fix: line.replace(/"/g, "'"),
        code_snippet: line.trim(),
      });
    }
    
    // Trailing spaces
    if (line.endsWith(' ') || line.endsWith('\t')) {
      issues.push({
        line: lineNumber,
        column: line.length,
        severity: 'warning',
        rule: 'no-trailing-spaces',
        message: 'Trailing whitespace',
        fix: line.trimEnd(),
        code_snippet: line.trim(),
      });
    }
    
    // Console statements
    if (line.includes('console.log') || line.includes('console.warn') || line.includes('console.error')) {
      issues.push({
        line: lineNumber,
        column: 1,
        severity: 'warning',
        rule: 'no-console',
        message: 'Console statement should be removed in production',
        code_snippet: line.trim(),
      });
    }
  });
  
  return issues;
}

function runPrettierRules(content: string, filePath: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Line length
    if (line.length > 80) {
      issues.push({
        line: lineNumber,
        column: 81,
        severity: 'warning',
        rule: 'print-width',
        message: 'Line exceeds 80 characters',
        code_snippet: line.trim(),
      });
    }
    
    // Inconsistent indentation
    if (line.startsWith(' ') && line.startsWith('  ') === false && line.trim()) {
      issues.push({
        line: lineNumber,
        column: 1,
        severity: 'error',
        rule: 'indent',
        message: 'Inconsistent indentation (use 2 spaces)',
        fix: line.replace(/^ /, '  '),
        code_snippet: line.trim(),
      });
    }
    
    // Missing trailing newline
    if (index === lines.length - 1 && line.trim() && !content.endsWith('\n')) {
      issues.push({
        line: lineNumber,
        column: line.length,
        severity: 'warning',
        rule: 'end-of-line',
        message: 'File should end with a newline',
        code_snippet: line.trim(),
      });
    }
  });
  
  return issues;
}

function runTypeScriptRules(content: string, filePath: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Any type usage
    if (line.includes(': any')) {
      issues.push({
        line: lineNumber,
        column: line.indexOf(': any') + 1,
        severity: 'warning',
        rule: '@typescript-eslint/no-explicit-any',
        message: 'Avoid using "any" type',
        suggestion: 'Use specific types or interfaces',
        code_snippet: line.trim(),
      });
    }
    
    // Missing return type annotations
    if (line.includes('function ') && !line.includes('):')) {
      issues.push({
        line: lineNumber,
        column: 1,
        severity: 'info',
        rule: '@typescript-eslint/explicit-function-return-type',
        message: 'Function should have explicit return type',
        code_snippet: line.trim(),
      });
    }
    
    // Unused imports
    if (line.includes('import ') && line.includes(' from ')) {
      const importMatch = line.match(/import\s+{([^}]+)}/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(i => i.trim());
        // This is a simplified check - in reality, you'd need to analyze the entire file
        issues.push({
          line: lineNumber,
          column: 1,
          severity: 'warning',
          rule: '@typescript-eslint/no-unused-vars',
          message: 'Check for unused imports',
          code_snippet: line.trim(),
        });
      }
    }
  });
  
  return issues;
}

function runPythonRules(content: string, filePath: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Line length
    if (line.length > 79) {
      issues.push({
        line: lineNumber,
        column: 80,
        severity: 'error',
        rule: 'line-too-long',
        message: 'Line too long (over 79 characters)',
        code_snippet: line.trim(),
      });
    }
    
    // Missing docstring for functions
    if (line.trim().startsWith('def ') && !line.trim().startsWith('def _')) {
      // Check if next non-empty line has docstring
      const nextLines = lines.slice(index + 1);
      let hasDocstring = false;
      
      for (const nextLine of nextLines) {
        if (nextLine.trim() === '') {
          continue;
        }
        if (nextLine.includes('"""') || nextLine.includes("'''")) {
          hasDocstring = true;
          break;
        }
        if (nextLine.trim().startsWith('def ') || nextLine.trim().startsWith('class ')) {
          break;
        }
      }
      
      if (!hasDocstring) {
        issues.push({
          line: lineNumber,
          column: 1,
          severity: 'info',
          rule: 'missing-function-docstring',
          message: 'Function should have a docstring',
          code_snippet: line.trim(),
        });
      }
    }
    
    // Import order
    if (line.trim().startsWith('import ') && !line.trim().startsWith('from ')) {
      issues.push({
        line: lineNumber,
        column: 1,
        severity: 'warning',
        rule: 'import-order',
        message: 'Standard library imports should come before third-party imports',
        code_snippet: line.trim(),
      });
    }
  });
  
  return issues;
}

function generateLintRecommendations(issues: LintIssue[], fileExtension: string): string[] {
  const recommendations: string[] = [];
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const fixable = issues.filter(i => i.fix);
  
  if (errors.length > 0) {
    recommendations.push(`Fix ${errors.length} errors before committing`);
  }
  
  if (warnings.length > 0) {
    recommendations.push(`Address ${warnings.length} warnings for better code quality`);
  }
  
  if (fixable.length > 0) {
    recommendations.push(`Auto-fix ${fixable.length} issues using your IDE or linter`);
  }
  
  if (fileExtension === '.ts' || fileExtension === '.tsx') {
    recommendations.push('Consider using stricter TypeScript compiler options');
    recommendations.push('Add type definitions for better type safety');
  }
  
  if (issues.length > 20) {
    recommendations.push('Consider breaking this file into smaller, more focused modules');
  }
  
  return recommendations;
}
