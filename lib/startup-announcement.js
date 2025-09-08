#!/usr/bin/env node

/**
 * EchoContext Factory - Startup Announcement System
 * 
 * Provides TARS-style startup announcements when Claude Code session begins
 * Features personalized messages, 3-tier TTS fallback, and accessibility support
 * 
 * Part of EchoContext Factory v2.5.0
 * @author Emmi C. (https://emmi.zone)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class StartupAnnouncement {
    constructor() {
        this.projectRoot = this.findProjectRoot();
        this.hooksPath = path.join(this.projectRoot, 'hooks');
    }

    /**
     * Find the EchoContext Factory project root directory
     */
    findProjectRoot() {
        let currentDir = __dirname;
        
        while (currentDir !== path.parse(currentDir).root) {
            const hooksDir = path.join(currentDir, 'hooks');
            if (fs.existsSync(hooksDir)) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }
        
        // Fallback to ~/.claude if not found
        return path.join(require('os').homedir(), '.claude');
    }

    /**
     * Trigger startup announcement via the start.py hook
     */
    async announceStartup() {
        try {
            const startHookPath = path.join(this.hooksPath, 'start.py');
            
            if (!fs.existsSync(startHookPath)) {
                console.log('⚠️ Startup hook not found. Please ensure EchoContext Factory is properly installed.');
                return false;
            }

            // Execute the startup hook with --startup flag
            const hookProcess = spawn('uv', ['run', startHookPath, '--startup'], {
                cwd: this.projectRoot,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Send minimal JSON data to the hook
            const startupData = {
                event: 'startup',
                timestamp: new Date().toISOString(),
                triggered_by: 'manual_command'
            };

            hookProcess.stdin.write(JSON.stringify(startupData));
            hookProcess.stdin.end();

            // Handle hook completion
            return new Promise((resolve) => {
                hookProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('🎵 Startup announcement triggered successfully!');
                        resolve(true);
                    } else {
                        console.log('ℹ️ Startup hook completed (voice may be disabled or unavailable)');
                        resolve(false);
                    }
                });

                // Timeout after 15 seconds
                setTimeout(() => {
                    hookProcess.kill();
                    console.log('⏱️ Startup announcement timed out');
                    resolve(false);
                }, 15000);
            });

        } catch (error) {
            console.log('ℹ️ Could not trigger startup announcement:', error.message);
            return false;
        }
    }

    /**
     * Display startup announcement status and configuration info
     */
    showStatus() {
        console.log('\n🎵 EchoContext Factory Startup Announcement');
        console.log('===========================================\n');

        // Check for voice configuration
        const engineerName = process.env.ENGINEER_NAME;
        const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
        const hasOpenAI = !!process.env.OPENAI_API_KEY;

        console.log('📊 Configuration Status:');
        console.log(`   👤 Engineer Name: ${engineerName ? `"${engineerName}"` : 'Not set (generic messages)'}`);
        console.log(`   🎯 ElevenLabs TTS: ${hasElevenLabs ? '✅ Configured' : '❌ Not configured'}`);
        console.log(`   🤖 OpenAI TTS: ${hasOpenAI ? '✅ Configured' : '❌ Not configured'}`);
        console.log(`   💻 System TTS: ✅ Always available`);

        console.log('\n🎵 Voice Quality Tier:');
        if (hasElevenLabs) {
            console.log('   🥇 Tier 1: ElevenLabs (Premium voice quality)');
        } else if (hasOpenAI) {
            console.log('   🥈 Tier 2: OpenAI (Good voice quality)');
        } else {
            console.log('   🥉 Tier 3: System Voice (Basic quality, always works)');
        }

        console.log('\n🎯 Usage:');
        console.log('   Run /startup-announce to trigger welcome message');
        console.log('   Use /voice-status to check full voice system status');
        console.log('   Use /voice-toggle to enable/disable voice announcements');

        console.log('\n💡 Enhancement Tips:');
        if (!engineerName) {
            console.log('   • Add ENGINEER_NAME=YourName to ~/.claude/.env for personalized messages');
        }
        if (!hasElevenLabs && !hasOpenAI) {
            console.log('   • Add ELEVENLABS_API_KEY for premium voice quality');
            console.log('   • Add OPENAI_API_KEY for good voice quality');
        }

        console.log('');
    }
}

// Main execution
async function main() {
    const announcement = new StartupAnnouncement();
    
    // Check if this is being run as a status check
    const args = process.argv.slice(2);
    if (args.includes('--status')) {
        announcement.showStatus();
        return;
    }
    
    // Otherwise, trigger the startup announcement
    console.log('🚀 Triggering EchoContext Factory startup announcement...\n');
    
    const success = await announcement.announceStartup();
    
    if (success) {
        console.log('\n✨ Welcome to your voice-enabled Claude Code session!');
    } else {
        console.log('\n💡 Startup announcement completed. If you didn\'t hear anything:');
        console.log('   • Check /voice-status to verify voice system configuration');
        console.log('   • Use /voice-toggle to enable voice announcements');
        console.log('   • Ensure audio is enabled on your system');
    }
    
    console.log('\n🎯 Pro Tip: Run this command at the start of each session for the full AI companion experience!\n');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = StartupAnnouncement;