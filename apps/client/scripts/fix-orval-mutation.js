#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix Orval bug: replace query mutation with object spread (React immutability rule)
 * This script walks through the generated API files and fixes the mutation pattern
 * where `query.queryKey = queryOptions.queryKey` is replaced with object spread syntax.
 */
function walkDir(dir) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkDir(fullPath));
      } else if (entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  return files;
}

function fixOrvalMutation(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Fix the mutation pattern: query.queryKey = queryOptions.queryKey; ... return query;
    // Replace with: return { ...query, queryKey: queryOptions.queryKey };
    content = content.replace(
      /query\.queryKey = queryOptions\.queryKey;[\s\S]{1,150}?return query;/g,
      'return { ...query, queryKey: queryOptions.queryKey };'
    );
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main execution
const generatedDir = path.join(__dirname, '../src/api/generated');

if (!fs.existsSync(generatedDir)) {
  console.warn(`Directory ${generatedDir} does not exist. Skipping fix.`);
  process.exit(0);
}

const files = walkDir(generatedDir);
let fixedCount = 0;

files.forEach((file) => {
  if (fixOrvalMutation(file)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} file(s) out of ${files.length} total file(s).`);

