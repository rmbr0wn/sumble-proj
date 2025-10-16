# Data Post-Processing for Apple Org Structure

## Identified Issues & Solutions

### 1. **Parsing Artifacts and Malformed Entries**
- **Issue**: Entries like `"),": {}`, `"'": {}`, `""": {}`, `"So": {}`, `"G": {}`, `"&": {}`
- **Solution**: 
  - Filter out entries shorter than 3 characters
  - Remove all leading/trailing punctuation completely
  - Filter obvious artifacts like single letters, common words ('and', 'the', 'of', etc.)
  - Ensure team names start and end with letters or numbers only

### 2. **Inconsistent Naming and Formatting**
- **Issue**: Same teams appear with different formatting and variations
  - "analog mixed-signal" vs "analog mixed-signals" vs "ams"
  - "Apple Media Products Engineering" vs "AMP Engineering" 
  - Inconsistent capitalization and abbreviations
- **Solution**: 
  - Normalize common variations (e.g., "ams" → "Analog Mixed-Signal")
  - Expand abbreviations with comprehensive mapping
  - Standardize capitalization with smart title case
  - Remove quotes and punctuation completely

### 3. **Team Consolidation Issues**
- **Issue**: Related teams not properly grouped:
  - "Apple Media Products Engineering", "Apple Media Products Analytics", "Apple Media Products Commerce" should be under "Apple Media Products"
  - "Ap Engineering", "Ap Videos" should be under "Apple" (after expanding "Ap")
- **Solution**: 
  - Implemented prefix-based team consolidation
  - Automatically group teams sharing common prefixes (2-3 words)
  - Create parent teams for groups with multiple related sub-teams
  - Maintain proper hierarchical relationships

### 4. **Unacceptable Top-Level Categories**
- **Issue**: Problematic top-level entries:
  - 'Architecture and Kinematics' (too specific)
  - 'characterization..' (artifact)
  - 'Body Technology' (unclear)
  - '/ml' (fragment)
- **Solution**: 
  - Filter out specific problematic patterns
  - Remove entries starting with punctuation or symbols
  - Block known problematic terms during cleaning

### 5. **Similar Team Names Differing by One Letter**
- **Issue**: Teams that are essentially the same but differ by a single character:
  - "Technologies" vs "Technology" 
  - "Engineering" vs "Engineers"
  - "Services" vs "Service"
- **Solution**: 
  - Detect teams that differ by only one letter
  - Merge them automatically, choosing the longer/more complete name
  - Combine mention counts from all merged variants
  - Prefer plural forms when available

### 6. **Short Repeated Prefix Groups** 
- **Issue**: Teams with very short (2-3 character) repeated prefixes:
  - Multiple teams starting with "Ww", "Us", "Ap", etc.
  - These create excessive nesting with unclear parent names
- **Solution**:
  - Detect groups of 3+ teams sharing short prefixes  
  - Create consolidated parent groups using the common prefix
  - Group children under the shared prefix as parent team

## Post-Processing Steps

### Step 1: Enhanced Data Cleaning
1. Remove entries with less than 3 characters
2. Strip all quotes and punctuation from start/end
3. Filter obvious artifacts and common words
4. Normalize known variations and abbreviations
5. Ensure proper start/end with alphanumeric characters

### Step 2: Advanced Team Consolidation
1. Group teams by common prefixes considering plural/singular variations
2. Prefer plural forms for parent team names (e.g., "Advertising Platforms" over "Advertising Platform")
3. Remove parent prefix from child team names (e.g., "App Store Engineering" → parent: "App Store", child: "Engineering")
4. Clean possessive forms and incomplete parentheses
5. Ensure all team names start with letters or numbers
6. Aggregate mention counts for parent teams

### Step 3: Advanced Normalization
1. Expand comprehensive abbreviation mapping
2. Apply smart title case preserving tech acronyms
3. Remove redundant suffixes while preserving meaning
4. Validate team name quality and length

### Step 4: Hierarchy Optimization
1. Resolve circular references
2. Ensure single hierarchical placement per team
3. Optimize parent-child relationships
4. Calculate proper team levels

### Step 4: Team Similarity Detection and Merging
1. Identify teams that differ by only one letter
2. Merge similar teams, choosing the longer/more complete variant
3. Aggregate mention counts from all merged variants
4. Prefer plural forms when available

### Step 5: Short Prefix Consolidation  
1. Detect groups of 3+ teams sharing short (2-3 character) prefixes
2. Create parent teams using the common prefix
3. Group related teams under appropriate parent hierarchy
4. Maintain proper parent-child relationships
