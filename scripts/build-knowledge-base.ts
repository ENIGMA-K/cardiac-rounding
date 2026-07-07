import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Chunk {
  id: string; source: string; title: string; section: string; content: string; tags: string[];
}

const WIKI_DIR = path.resolve(__dirname, '../../../../wiki');
const OUTPUT = path.resolve(__dirname, '../src/data/knowledge-base.json');

function stripFrontmatter(md: string): string {
  const match = md.match(/^---\n([\s\S]*?)\n---\n/);
  return match ? md.slice(match[0].length) : md;
}

function stripWikilinks(text: string): string {
  return text
    .replace(/\[\[([^\]|#]+)(?:#[^\]]+)?(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function processFile(filePath: string, relativePath: string): Chunk[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const content = stripWikilinks(stripFrontmatter(raw));
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');
  const sections = content.split(/(?=^## )/m);
  const chunks: Chunk[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section || section.length < 50) continue;
    const sectionMatch = section.match(/^## (.+)$/m);
    const sectionName = sectionMatch ? sectionMatch[1].trim() : title;
    chunks.push({
      id: `${path.basename(filePath, '.md')}-${i}`,
      source: relativePath, title, section: sectionName,
      content: section.slice(0, 1000).trim(), tags: [],
    });
  }
  return chunks;
}

function build(): void {
  const allChunks: Chunk[] = [];

  function walkDir(dir: string, basePath: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      const rp = path.join(basePath, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) walkDir(fp, rp);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        try { allChunks.push(...processFile(fp, rp)); } catch (e) { console.warn(`Skip ${rp}`); }
      }
    }
  }

  if (fs.existsSync(WIKI_DIR)) walkDir(WIKI_DIR, 'wiki');

  const output = { version: new Date().toISOString(), builtAt: new Date().toISOString(), sourceVault: '心脏外科围术期管理', totalChunks: allChunks.length, chunks: allChunks };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Knowledge base built: ${allChunks.length} chunks → ${OUTPUT}`);
}

build();
