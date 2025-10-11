#!/usr/bin/env node

// Generate a secure webhook secret for GitHub
import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n========================================');
console.log('GitHub Webhook Secret Generated!');
console.log('========================================\n');
console.log('Copy this secret and add it to:\n');
console.log('1. Railway Environment Variables:');
console.log('   Variable: GITHUB_WEBHOOK_SECRET');
console.log(`   Value: ${secret}\n`);
console.log('2. GitHub Webhook Settings:');
console.log('   Settings → Webhooks → Add webhook');
console.log('   Secret field: (paste the value above)\n');
console.log('========================================\n');
console.log('⚠️  IMPORTANT: Keep this secret secure!');
console.log('Do not commit it to your repository.\n');
