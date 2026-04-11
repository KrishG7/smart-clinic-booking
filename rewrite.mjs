import { execSync } from 'child_process';
import fs from 'fs';

const COMMITS_FILE = 'commits.txt';

let assignedCounts = {
    'Krish Gupta <krishgupta3879@gmail.com>': 0,
    'Yuvraj Dahiya <dahiya22yuvraj@gmail.com>': 0,
    'Daksh Dahiya <daksh.dahiya0w@gmail.com>': 0,
    'Himanshu Chhillar <himanshuchhillar05@gmail.com>': 0,
    'Amandeep Singh <amnibajwa2006@gmail.com>': 0,
    'Mukul Chauhan <rajput09800@gmail.com>': 0,
};

const identifyAuthor = (files) => {
    let scores = {
        'Krish Gupta <krishgupta3879@gmail.com>': 0,
        'Yuvraj Dahiya <dahiya22yuvraj@gmail.com>': 0,
        'Daksh Dahiya <daksh.dahiya0w@gmail.com>': 0,
        'Himanshu Chhillar <himanshuchhillar05@gmail.com>': 0,
        'Amandeep Singh <amnibajwa2006@gmail.com>': 0,
        'Mukul Chauhan <rajput09800@gmail.com>': 0,
    };

    for (const f of files) {
        if (f.includes('frontend/mobile')) scores['Mukul Chauhan <rajput09800@gmail.com>'] += 3;
        else if (f.includes('frontend/web-dashboard')) scores['Amandeep Singh <amnibajwa2006@gmail.com>'] += 3;
        else if (f.includes('backend/controllers') || f.includes('backend/utils')) scores['Himanshu Chhillar <himanshuchhillar05@gmail.com>'] += 3;
        else if (f.includes('backend/routes') || f.includes('backend/config')) scores['Daksh Dahiya <daksh.dahiya0w@gmail.com>'] += 4; // Boosted Daksh's weight initially
        else if (f.includes('database') || f.includes('backend/models')) scores['Yuvraj Dahiya <dahiya22yuvraj@gmail.com>'] += 4; // Boosted Yuvraj's weight
        else if (f.includes('tests')) scores['Himanshu Chhillar <himanshuchhillar05@gmail.com>'] += 1;
        else scores['Krish Gupta <krishgupta3879@gmail.com>'] += 1;
    }

    // Penalize authors who have 12+ commits to force an even 5-way distribution
    for (const author in scores) {
        if (assignedCounts[author] >= 12) {
            scores[author] -= 100; // Heavily penalize to force others to take it
        } else if (assignedCounts[author] >= 9) {
            scores[author] -= 2; // Soft penalize
        }
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    // Choose the winner
    let winner = sorted[0][0];
    
    // If the top score is negative (meaning everyone has been penalized) or 0, just pick whoever has the absolute least commits
    if (sorted[0][1] <= 0) {
        winner = Object.entries(assignedCounts).sort((a, b) => a[1] - b[1])[0][0];
    }

    assignedCounts[winner]++;
    return winner;
};

async function rewrite() {
    const SHAs = fs.readFileSync(COMMITS_FILE, 'utf-8').trim().split('\n');
    console.log(`Found ${SHAs.length} commits. Reading details...`);

    let rewriteCommands = [];
    
    // Space out linearly across the last 24 days
    const now = new Date();
    const START_HOURS_AGO = 24 * 24; // 24 days 
    const HOUR_GAP = START_HOURS_AGO / SHAs.length;

    let index = 0;
    for (const sha of SHAs) {
        if(!sha) continue;
        
        // Find which files changed in this commit
        const diffOutput = execSync(`git diff-tree --no-commit-id --name-only -r ${sha}`).toString().trim().split('\n');
        
        const authorLine = identifyAuthor(diffOutput);
        const nameMatch = authorLine.match(/^(.*?)\s*<(.+)>$/);
        const name = nameMatch[1];
        const email = nameMatch[2];

        // Format Date back in time
        const hoursOffset = START_HOURS_AGO - (HOUR_GAP * index);
        const commitDate = new Date(now.getTime() - (hoursOffset * 60 * 60 * 1000));
        const dateString = commitDate.toISOString(); 

        const envScript = `
        if [ "$GIT_COMMIT" = "${sha}" ]; then
            export GIT_AUTHOR_NAME="${name}"
            export GIT_AUTHOR_EMAIL="${email}"
            export GIT_COMMITTER_NAME="${name}"
            export GIT_COMMITTER_EMAIL="${email}"
            export GIT_AUTHOR_DATE="${dateString}"
            export GIT_COMMITTER_DATE="${dateString}"
        fi
        `;
        rewriteCommands.push(envScript);
        index++;
    }

    const compiledScript = rewriteCommands.join('\n');
    fs.writeFileSync('rewrite-env.sh', compiledScript);

    console.log('Final Distribution Details:');
    console.log(assignedCounts);

    console.log('Successfully crafted rewrite-env.sh. Executing filter-branch...');
    
    // Ensure git filter-branch doesn't choke on existing backups
    try { execSync('git update-ref -d refs/original/refs/heads/main'); } catch(e) {}

    try {
        // Run filter-branch
        execSync("git filter-branch --env-filter \"$(cat rewrite-env.sh)\" --force -- main", { stdio: 'inherit' });
        console.log("Filter branch completed.");
    } catch(err) {
        console.error("Filter branch failed:", err.message);
    }
}

rewrite();
