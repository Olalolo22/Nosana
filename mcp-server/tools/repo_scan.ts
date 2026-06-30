import { promises as fs } from 'fs';
import { join, extname, relative } from 'path';
import { z } from 'zod';

const RepoScanSchema = z.object({
  repo_path: z.string(),
  file_extensions: z.array(z.string()).optional().default([
    '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h'
  ]),
});

interface FileInfo {
  path: string;
  size: number;
  extension: string;
  lastModified: Date;
}

interface RepoStructure {
  totalFiles: number;
  totalSize: number;
  fileTypes: Record<string, number>;
  directories: string[];
  files: FileInfo[];
  scanTime: number;
}

export async function repoScanTool(args: unknown) {
  try {
    const { repo_path, file_extensions } = RepoScanSchema.parse(args);
    
    const startTime = Date.now();
    const repoStructure = await scanRepository(repo_path, file_extensions);
    const scanTime = Date.now() - startTime;

    const result: RepoStructure = {
      ...repoStructure,
      scanTime,
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
    console.error('Error in repo_scan tool:', error);
    throw new Error(`Failed to scan repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function scanRepository(repoPath: string, extensions: string[]): Promise<RepoStructure> {
  const files: FileInfo[] = [];
  const directories: string[] = [];
  const fileTypes: Record<string, number> = {};
  let totalSize = 0;

  // Check if path exists
  try {
    await fs.access(repoPath);
  } catch (error) {
    throw new Error(`Repository path does not exist: ${repoPath}`);
  }

  await scanDirectory(repoPath, repoPath, extensions, files, directories, fileTypes, totalSize);

  return {
    totalFiles: files.length,
    totalSize,
    fileTypes,
    directories,
    files: files.slice(0, 100), // Limit to first 100 files for response size
    scanTime: 0, // Will be set by caller
  };
}

async function scanDirectory(
  currentPath: string,
  rootPath: string,
  extensions: string[],
  files: FileInfo[],
  directories: string[],
  fileTypes: Record<string, number>,
  totalSize: number
): Promise<void> {
  try {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      
      // Skip hidden files and common ignore patterns
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === 'dist' || 
          entry.name === 'build' ||
          entry.name === '.git') {
        continue;
      }

      if (entry.isDirectory()) {
        const relativeDir = relative(rootPath, fullPath);
        directories.push(relativeDir);
        await scanDirectory(fullPath, rootPath, extensions, files, directories, fileTypes, totalSize);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        
        if (extensions.includes(ext)) {
          try {
            const stats = await fs.stat(fullPath);
            const relativePath = relative(rootPath, fullPath);
            
            const fileInfo: FileInfo = {
              path: relativePath,
              size: stats.size,
              extension: ext,
              lastModified: stats.mtime,
            };
            
            files.push(fileInfo);
            totalSize += stats.size;
            
            // Count file types
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          } catch (error) {
            console.warn(`Could not read file ${fullPath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${currentPath}:`, error);
  }
}
