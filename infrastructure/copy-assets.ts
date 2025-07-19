import { copyFile, mkdir, readdir } from 'fs/promises';
import { dirname, join, relative } from 'path';

async function copyJsonFiles(srcDir: string, destDir: string) {
  async function walkDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walkDir(srcPath);
      } else if (entry.name.endsWith('.json')) {
        const relativePath = relative(srcDir, srcPath);
        const destPath = join(destDir, relativePath);
        const destDirPath = dirname(destPath);
        
        await mkdir(destDirPath, { recursive: true });
        await copyFile(srcPath, destPath);
        console.log(`Copied assets: ${relativePath}`);
      }
    }
  }
  
  await walkDir(srcDir);
}

copyJsonFiles('src', 'lib').catch(console.error);
