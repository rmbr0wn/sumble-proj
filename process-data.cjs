// Simple data processing script - run with: node process-data.js
const fs = require('fs');

// Read the raw data
const rawData = JSON.parse(fs.readFileSync('./org_structure.json', 'utf8'));

console.log('🔄 Processing Apple organizational data...');

// Common abbreviations mapping (simplified from dataProcessor.ts)
const ABBREVIATIONS = {
  'AMP': 'Apple Media Products',
  'TDG': 'Technology Development Group',
  'IS&T': 'Information Systems and Technology',
  'ACS': 'Apple Cloud Services',
  'WTE': 'Wireless Technologies and Ecosystems',
  'SEG': 'Silicon Engineering Group',
  'IMG': 'Interactive Media Group',
  'SPG': 'Special Projects Group',
  'EPM': 'Engineering Program Management',
  'SRE': 'Site Reliability Engineering',
  'QA': 'Quality Assurance',
  'QE': 'Quality Engineering',
  'HW': 'Hardware',
  'SW': 'Software',
  'GPU': 'Graphics Processing Unit',
  'CPU': 'Central Processing Unit',
  'CAD': 'Computer-Aided Design',
  'AI/ML': 'Artificial Intelligence/Machine Learning',
  'AIML': 'Artificial Intelligence Machine Learning',
  'RF': 'Radio Frequency',
  'SoC': 'System on Chip',
  'SOC': 'System on Chip',
  'UI': 'User Interface',
  'UX': 'User Experience'
};

// Function to clean team names
function cleanTeamName(name) {
  if (!name || typeof name !== 'string') return '';
  

  
  let cleaned = name
    .trim()
    .replace(/[""''`]/g, '') // Remove quotes completely
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^[,\(\[\]'"~`!@#$%^&*+={}|\\:;<>?/._-]+|[,\(\[\]'"~`!@#$%^&*+={}|\\:;<>?/._-]+$/g, '') // Remove leading/trailing punctuation but preserve closing parentheses
    .trim();
  
  // Skip if too short, empty, or just punctuation/numbers
  if (cleaned.length < 3 || /^[^a-zA-Z]*$/.test(cleaned)) {
    return '';
  }
  
  // Skip obvious artifacts and common words
  const artifacts = [')', '(', ',', '&', "'", '"', 'and', 'the', 'of', 'for', 'in', 'at', 'on', 'with', 'or', 'a', 'an', 'to', 'by', 'is', 'as', 'ml', 'characterization'];
  if (artifacts.includes(cleaned.toLowerCase())) {
    return '';
  }
  
  // Skip single character teams or obvious garbage
  if (cleaned.length === 1 || /^[a-z]$/i.test(cleaned)) {
    return '';
  }
  
  // Fix possessive issues (Infrastructure's -> Infrastructure)
  cleaned = cleaned.replace(/([a-zA-Z])'s\b/g, '$1');
  
  // Fix incomplete parentheses at end
  cleaned = cleaned.replace(/\s*\([^)]*$/g, (match) => {
    // If there's an opening parenthesis but no closing one, add the closing one
    return match.replace(/\([^)]*$/, (innerMatch) => innerMatch + ')');
  });
  
  // Fix incomplete parentheses - if any word starts with ( but doesn't end with ), add closing )
  const words = cleaned.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.startsWith('(') && !word.includes(')')) {
      words[i] = word + ')';
    }
  }
  cleaned = words.join(' ');
  
  // Normalize common variations
  cleaned = cleaned
    .replace(/\b(ams|analog mixed-signal)\b/gi, 'Analog Mixed-Signal')
    .replace(/\bmixed-signals?\b/gi, 'Mixed-Signal')
    .replace(/\bap\b/gi, 'Apple')
    .replace(/\barchitecture and kinematics\b/gi, '')
    .replace(/\bbody technology\b/gi, '')
    .replace(/\bcharacterization\.+\b/gi, '');
  
  // Skip if became empty after normalization
  if (!cleaned.trim()) return '';
  
  // Expand abbreviations
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    cleaned = cleaned.replace(regex, full);
  }
  
  // Remove redundant suffixes but preserve meaningful ones
  cleaned = cleaned
    .replace(/\b(team|group|organization|dept|department)\b$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Skip if too short after processing
  if (cleaned.length < 3) return '';
  
  // Ensure starts with letter or number, ends with letter, number, or closing parenthesis
  cleaned = cleaned.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9\)]+$/, '');
  
  if (!cleaned) return '';
  
  // Smart title case
  cleaned = cleaned.split(' ').map(word => {
    // Preserve known tech acronyms and common abbreviations in parentheses
    if (/^(API|GPU|CPU|iOS|macOS|tvOS|watchOS|WiFi|NFC|RF|AI|ML|UI|UX|QA|QE|3D|2D|VR|AR|CAD|SoC|SOC)$/i.test(word)) {
      return word.toUpperCase();
    }
    // Preserve abbreviations in parentheses like (ISE), (BPR), (RCC), etc., including incomplete ones
    if (/^\([A-Z]+\)?$/i.test(word)) {
      return word.toUpperCase();
    }
    // Preserve Apple product names
    if (/^(iPhone|iPad|iPod|iMac|AirPods|HomePod|AppleTV|MacBook|iCloud)$/i.test(word)) {
      return word.charAt(0).toLowerCase() + word.slice(1, 2).toLowerCase() + word.slice(2);
    }
    // Regular title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  

  
  return cleaned;
}

// Function to categorize teams
function categorizeTeam(name) {
  const engineering = /engineering|software|hardware|development|design|architecture|platform|infrastructure|systems|technical/i;
  const marketing = /marketing|brand|advertising|communications|marcom|publicity|promotion/i;
  const operations = /operations|logistics|supply|procurement|manufacturing|finance|business|sales/i;
  const research = /research|ai|ml|machine learning|artificial intelligence|data science|analytics/i;
  const support = /support|service|quality|testing|qa|qe|validation|compliance/i;
  const management = /management|strategy|planning|program|project|executive/i;
  
  if (research.test(name)) return 'Research & AI/ML';
  if (engineering.test(name)) return 'Engineering';
  if (marketing.test(name)) return 'Marketing & Communications';
  if (operations.test(name)) return 'Operations & Business';
  if (support.test(name)) return 'Support & Quality';
  if (management.test(name)) return 'Management & Strategy';
  
  return 'Other';
}

// Process the data
const processedTeams = [];
const teamMap = new Map();

// Function to find best prefix considering similar team consolidation
function findBestPrefix(names) {
  const prefixCounts = new Map();
  
  for (const name of names) {
    const words = name.split(' ');
    for (let len = 1; len <= Math.min(3, words.length - 1); len++) {
      let prefix = words.slice(0, len).join(' ');
      
      // For single-word prefixes, prefer plural forms if available
      if (len === 1) {
        const pluralOptions = names.filter(n => 
          n.toLowerCase().startsWith(prefix.toLowerCase()) && 
          n.split(' ').length >= 2
        );
        
        // Check if there's a plural version of this prefix
        const singularPrefix = prefix.replace(/s$/, '');
        const pluralPrefix = prefix.endsWith('s') ? prefix : prefix + 's';
        
        const singularCount = pluralOptions.filter(n => 
          n.toLowerCase().startsWith(singularPrefix.toLowerCase())
        ).length;
        const pluralCount = pluralOptions.filter(n => 
          n.toLowerCase().startsWith(pluralPrefix.toLowerCase())
        ).length;
        
        // Don't naively strip 's' - keep the form that appears more
        if (pluralCount >= singularCount && pluralPrefix !== prefix + 's') {
          prefix = pluralPrefix;
        }
      }
      
      prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
    }
  }
  
  // Find the prefix with highest count
  let bestPrefix = '';
  let maxCount = 0;
  for (const [prefix, count] of prefixCounts) {
    if (count > maxCount && count > 1 && prefix.length > 2) {
      bestPrefix = prefix;
      maxCount = count;
    }
  }
  
  return bestPrefix;
}

// Function to check if two strings differ by only one letter
function differsByOneLetterOnly(str1, str2) {
  if (Math.abs(str1.length - str2.length) > 1) return false;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === shorter.length) {
    // Same length - count differences
    let differences = 0;
    for (let i = 0; i < longer.length; i++) {
      if (longer[i] !== shorter[i]) differences++;
    }
    return differences === 1;
  } else {
    // Different length by 1 - check if one is subset of other
    for (let i = 0; i <= longer.length - shorter.length; i++) {
      if (longer.substring(i, i + shorter.length) === shorter) return true;
    }
    return false;
  }
}

// Function to consolidate teams with common prefixes
function consolidateTeams(teams) {
  const consolidated = new Map();
  const processed = new Set();
  
  // First pass: merge teams that differ by only one letter
  const teamsToProcess = [];
  for (const team of teams) {
    if (processed.has(team.id)) continue;
    
    // Find teams that differ by only one letter
    const similar = teams.filter(t => 
      !processed.has(t.id) && 
      t.id !== team.id &&
      differsByOneLetterOnly(t.name.toLowerCase(), team.name.toLowerCase())
    );
    
    if (similar.length > 0) {
      // Choose the longer/more complete name (usually plural)
      const allVariants = [team, ...similar];
      const bestVariant = allVariants.reduce((best, current) => 
        current.name.length > best.name.length ? current : best
      );
      
      // Merge mention counts
      const totalMentions = allVariants.reduce((sum, variant) => sum + variant.mentionCount, 0);
      
      const mergedTeam = {
        ...bestVariant,
        mentionCount: totalMentions,
        children: [...new Set(allVariants.flatMap(v => v.children))]
      };
      
      teamsToProcess.push(mergedTeam);
      allVariants.forEach(variant => processed.add(variant.id));
    } else {
      teamsToProcess.push(team);
      processed.add(team.id);
    }
  }
  
  // Reset processed set for next passes
  processed.clear();
  
  // Second pass: Group teams with same short first words (like "Ww", "Us")
  const shortWordGroups = new Map();
  for (const team of teamsToProcess) {
    const words = team.name.split(' ');
    const firstWord = words[0].toLowerCase();
    
    // Only process teams with short (2-3 char) first words and multiple words
    if (words.length >= 2 && firstWord.length <= 3) {
      if (!shortWordGroups.has(firstWord)) {
        shortWordGroups.set(firstWord, []);
      }
      shortWordGroups.get(firstWord).push(team);
    }
  }
  
  // Create parent groups for short words with 3+ teams
  for (const [firstWord, groupedTeams] of shortWordGroups) {
    if (groupedTeams.length >= 3) {
      const groupPrefix = groupedTeams[0].name.split(' ')[0]; // Use original case from first team
      const parentId = groupPrefix.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Create parent team
      const parentTeam = {
        id: parentId,
        name: groupPrefix,
        parent: undefined,
        children: [],
        level: 0,
        mentionCount: 0,
        category: categorizeTeam(groupPrefix)
      };
      consolidated.set(parentId, parentTeam);

      
      // Process all grouped teams as children
      for (const team of groupedTeams) {
        team.parent = parentId;
        team.level = 1;
        parentTeam.children.push(team.id);
        parentTeam.mentionCount += team.mentionCount;
        
        consolidated.set(team.id, team);
        processed.add(team.id);
      }
    }
  }
  
  // Third pass: group teams by longer common prefixes
  for (const team of teamsToProcess) {
    if (processed.has(team.id)) continue;
    
    const words = team.name.split(' ');
    if (words.length < 2) {
      consolidated.set(team.id, team);
      processed.add(team.id);
      continue;
    }
    
    // Find all teams that could share a prefix with this team
    const firstWord = words[0].toLowerCase();
    const candidates = teamsToProcess.filter(t => 
      !processed.has(t.id) && 
      t.name.split(' ').length >= 2 &&
      t.name.toLowerCase().split(' ')[0] === firstWord
    );
    
    // Special handling for repeated first words (e.g., "Ww", "Us", etc.)
    // If we have multiple teams starting with the same word, group them
    if (candidates.length >= 3 && firstWord.length <= 3) {
      const groupPrefix = words[0]; // Use original case
      const parentId = groupPrefix.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Only create group if parent doesn't already exist
      if (!consolidated.has(parentId)) {
        // Create parent team with just the first word
        const parentTeam = {
          id: parentId,
          name: groupPrefix.charAt(0).toUpperCase() + groupPrefix.slice(1).toLowerCase(), // Proper case
          parent: undefined,
          children: [],
          level: 0,
          mentionCount: 0,
          category: categorizeTeam(groupPrefix)
        };
        consolidated.set(parentId, parentTeam);
        
        // Process all candidates as children
        for (const candidate of candidates) {
          candidate.parent = parentId;
          candidate.level = 1;
          parentTeam.children.push(candidate.id);
          parentTeam.mentionCount += candidate.mentionCount;
          
          consolidated.set(candidate.id, candidate);
          processed.add(candidate.id);
        }
        continue;
      }
    }
    
    if (candidates.length > 1) {
      const bestPrefix = findBestPrefix(candidates.map(t => t.name));
      
      if (bestPrefix && bestPrefix.length > 3) {
        // Create parent team
        const parentId = bestPrefix.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const parentTeam = {
          id: parentId,
          name: bestPrefix,
          parent: undefined,
          children: [],
          level: 0,
          mentionCount: 0,
          category: categorizeTeam(bestPrefix)
        };
        consolidated.set(parentId, parentTeam);
        
        // Process child teams - keep full names, don't strip prefix
        for (const candidate of candidates) {
          // Keep the full original name including the prefix
          candidate.parent = parentId;
          candidate.level = 1;
          parentTeam.children.push(candidate.id);
          parentTeam.mentionCount += candidate.mentionCount;
          
          consolidated.set(candidate.id, candidate);
          processed.add(candidate.id);
        }
      } else {
        // No good prefix found, keep teams as-is
        for (const candidate of candidates) {
          consolidated.set(candidate.id, candidate);
          processed.add(candidate.id);
        }
      }
    } else {
      // Single team, keep as-is
      consolidated.set(team.id, team);
      processed.add(team.id);
    }
  }
  
  return Array.from(consolidated.values());
}

function processNode(data, parentId, level = 0, path = []) {
  for (const [rawName, children] of Object.entries(data)) {
    const cleanName = cleanTeamName(rawName);
    
    if (!cleanName || path.includes(cleanName)) continue;
    
    const teamId = cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    let team = teamMap.get(teamId);
    if (!team) {
      team = {
        id: teamId,
        name: cleanName,
        parent: parentId,
        children: [],
        level,
        mentionCount: 1,
        category: categorizeTeam(cleanName)
      };
      teamMap.set(teamId, team);
      processedTeams.push(team);
    } else {
      team.mentionCount++;
      if (parentId && (!team.parent || level < team.level)) {
        team.parent = parentId;
        team.level = level;
      }
    }
    
    if (parentId) {
      const parent = teamMap.get(parentId);
      if (parent && !parent.children.includes(teamId)) {
        parent.children.push(teamId);
      }
    }
    
    if (children && typeof children === 'object' && Object.keys(children).length > 0) {
      processNode(children, teamId, level + 1, [...path, cleanName]);
    }
  }
}

processNode(rawData);

// Consolidate teams with common prefixes
const consolidatedTeams = consolidateTeams(processedTeams);

// Filter and sort
const finalTeams = consolidatedTeams
  .filter(team => team.name.length >= 2) // Allow 2+ character names (to include parent groups like "Ww", "Us")
  .sort((a, b) => {
    if (a.mentionCount !== b.mentionCount) {
      return b.mentionCount - a.mentionCount;
    }
    return a.name.localeCompare(b.name);
  });

// Create the processed data structure
const topLevelTeams = finalTeams.filter(team => !team.parent);
const categories = finalTeams.reduce((acc, team) => {
  const category = team.category || 'Other';
  if (!acc[category]) acc[category] = [];
  acc[category].push(team);
  return acc;
}, {});

const processedData = {
  teams: finalTeams,
  topLevelTeams,
  categories,
  metadata: {
    processedAt: new Date().toISOString(),
    totalTeams: finalTeams.length,
    totalMentions: finalTeams.reduce((sum, team) => sum + team.mentionCount, 0),
    rawDataSize: Object.keys(rawData).length
  }
};

// Write the processed data
fs.writeFileSync('./public/processed_org_structure.json', JSON.stringify(processedData, null, 2));

console.log('✅ Processing complete!');
console.log(`📊 Raw entries: ${Object.keys(rawData).length}`);
console.log(`📈 Processed teams: ${finalTeams.length}`);
console.log(`📂 Categories: ${Object.keys(categories).length}`);
console.log(`💾 Saved to: public/processed_org_structure.json`);
