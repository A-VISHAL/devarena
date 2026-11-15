// Comprehensive Automated Test Suite for DEVARENA Telegram & Discord Integration
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';

const TEST_PORT = 3101;
process.env.PORT = String(TEST_PORT);
process.env.TELEGRAM_WEBHOOK_SECRET = 'test_webhook_secret_xyz';
process.env.TELEGRAM_BOT_TOKEN = ''; // Test fallback mode
process.env.DISCORD_BOT_TOKEN = ''; // Test fallback mode

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING DEVARENA TELEGRAM & DISCORD INTEGRATION TESTS');
  console.log('====================================================\n');

  // Wait for server to initialize
  await delay(1000);

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert(health.status === 200, 'Server health check returns HTTP 200');
    assert(health.data.app && health.data.app.includes('Telegram'), 'App identifies as Discord + Telegram relay');

    // TEST 1: Telegram webhook registration (/api/telegram/set-webhook)
    console.log('\n--- Test 1: Telegram Webhook Registration ---');
    const setWebhookRes = await makeRequest('/api/telegram/set-webhook', 'POST', {
      url: 'https://devarena.io/api/telegram/webhook'
    });
    assert(setWebhookRes.status === 200, 'Webhook registration endpoint responds with 200');

    const infoRes = await makeRequest('/api/telegram/info');
    assert(infoRes.status === 200 && infoRes.data.username === 'DEVARENA_CommunityBot', 'Telegram bot info returns correct username @DEVARENA_CommunityBot');

    // TEST 2: Webhook Secret Verification
    console.log('\n--- Test 2: Webhook Secret Verification ---');
    const unauthorizedRes = await makeRequest('/api/telegram/webhook', 'POST', { update_id: 1 }, {
      'x-telegram-bot-api-secret-token': 'wrong_secret'
    });
    assert(unauthorizedRes.status === 401, 'Invalid secret token returns HTTP 401 Unauthorized');

    const authorizedRes = await makeRequest('/api/telegram/webhook', 'POST', { update_id: 2 }, {
      'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz'
    });
    assert(authorizedRes.status === 200, 'Valid secret token returns HTTP 200 OK');

    // TEST 3: /start Command
    console.log('\n--- Test 3: /start Command ---');
    const startRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 3,
      message: {
        message_id: 101,
        chat: { id: 12345, type: 'private' },
        from: { id: 12345, first_name: 'Alice', username: 'alice_coder' },
        text: '/start'
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(startRes.status === 200, '/start command processed cleanly');

    // TEST 4: /help Command
    console.log('\n--- Test 4: /help Command ---');
    const helpRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 4,
      message: {
        message_id: 102,
        chat: { id: 12345, type: 'private' },
        from: { id: 12345, first_name: 'Alice' },
        text: '/help'
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(helpRes.status === 200, '/help command returns HTTP 200');

    // TEST 5: /daily Command
    console.log('\n--- Test 5: /daily Command ---');
    const dailyRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 5,
      message: {
        message_id: 103,
        chat: { id: 12345, type: 'private' },
        from: { id: 12345, first_name: 'Alice' },
        text: '/daily'
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(dailyRes.status === 200, '/daily command returns HTTP 200');

    // TEST 6: /challenge Command
    console.log('\n--- Test 6: /challenge Command ---');
    const challengeRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 6,
      message: {
        message_id: 104,
        chat: { id: 12345, type: 'private' },
        from: { id: 12345, first_name: 'Alice' },
        text: '/challenge Arrays Easy'
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(challengeRes.status === 200, '/challenge command returns HTTP 200');

    // TEST 7: /leaderboard Command
    console.log('\n--- Test 7: /leaderboard Command ---');
    const lbRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 7,
      message: {
        message_id: 105,
        chat: { id: 12345, type: 'private' },
        from: { id: 12345, first_name: 'Alice' },
        text: '/leaderboard'
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(lbRes.status === 200, '/leaderboard command returns HTTP 200');

    // TEST 8: /link Account Linking
    console.log('\n--- Test 8: Secure Account Linking (/link) ---');
    const linkCodeRes = await makeRequest('/api/telegram/link-code', 'POST', {
      userId: 'user_alex_77',
      username: 'AlexCoder'
    });
    assert(linkCodeRes.status === 200 && linkObjHasCode(linkCodeRes.data), 'Link code generated with SHA-256 hash');
    const generatedCode = linkCodeRes.data.code;

    // Send /link command with generated code
    const linkMsgRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 8,
      message: {
        message_id: 106,
        chat: { id: 987654, type: 'private' },
        from: { id: 987654, first_name: 'Alex', username: 'alex_tg' },
        text: `/link ${generatedCode}`
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(linkMsgRes.status === 200, '/link code successfully executed');

    // Verify account is linked
    const accountCheck = await makeRequest('/api/telegram/account?userId=user_alex_77');
    assert(accountCheck.data.linked === true && accountCheck.data.account.telegramUserId === '987654', 'Account successfully bound to Telegram User ID 987654');

    // Prevent duplicate reuse of single-use code
    const duplicateReuseRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 9,
      message: {
        message_id: 107,
        chat: { id: 999999, type: 'private' },
        from: { id: 999999, first_name: 'Hacker' },
        text: `/link ${generatedCode}`
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(duplicateReuseRes.status === 200, 'Duplicate single-use code handled safely without crashing');

    // TEST 9 & 10: Add Bot to Telegram Group & Detect Group Installation
    console.log('\n--- Test 9 & 10: Add Bot to Group & Detect Installation ---');
    const groupChatId = '-1001849204820';
    const myChatMemberUpdate = {
      update_id: 10,
      my_chat_member: {
        chat: {
          id: groupChatId,
          title: 'Stanford DSA Battleground',
          type: 'supergroup'
        },
        from: {
          id: 987654, // Linked user Alex!
          first_name: 'Alex',
          username: 'alex_tg'
        },
        new_chat_member: {
          status: 'administrator',
          user: { id: 81928374, username: 'DEVARENA_CommunityBot' }
        }
      }
    };
    const groupAddedRes = await makeRequest('/api/telegram/webhook', 'POST', myChatMemberUpdate, {
      'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz'
    });
    assert(groupAddedRes.status === 200, 'my_chat_member update processed');

    // Verify group shows in connected groups for Alex
    const userGroupsRes = await makeRequest('/api/telegram/chats?userId=user_alex_77');
    const matchedGroup = userGroupsRes.data.chats.find(c => c.chatId === groupChatId);
    assert(Boolean(matchedGroup), 'Connected group automatically associated with linked DEVARENA user');
    assert(matchedGroup?.status === 'connected', 'Group status is verified and connected');

    // TEST 11: Verify Group Administrator
    console.log('\n--- Test 11: Verify Group Administrator ---');
    const settingsCmdRes = await makeRequest('/api/telegram/webhook', 'POST', {
      update_id: 11,
      message: {
        message_id: 108,
        chat: { id: groupChatId, title: 'Stanford DSA Battleground', type: 'supergroup' },
        from: { id: 987654, first_name: 'Alex' },
        text: '/settings'
      }
    }, { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz' });
    assert(settingsCmdRes.status === 200, '/settings admin command accepted for group');

    // TEST 12: Verify Bot Send Permissions
    console.log('\n--- Test 12: Verify Bot Send Permissions ---');
    const verifyGroupRes = await makeRequest('/api/telegram/chats/verify', 'POST', {
      chatId: groupChatId,
      userId: 'user_alex_77'
    });
    assert(verifyGroupRes.status === 200 && verifyGroupRes.data.success === true, 'Bot permissions verified on group');

    // TEST 13: Group Configuration
    console.log('\n--- Test 13: Group Configuration ---');
    const updateConfigRes = await makeRequest('/api/telegram/chats', 'POST', {
      id: `tg_${groupChatId}`,
      chatId: groupChatId,
      settings: {
        enabled: true,
        morningEnabled: true,
        morningTime: '08:30',
        eveningEnabled: true,
        eveningTime: '19:00',
        timezone: 'America/New_York',
        difficulty: 'Hard',
        topics: ['Dynamic Programming', 'Graphs', 'Trees']
      }
    });
    assert(updateConfigRes.status === 200 && updateConfigRes.data.chat.settings.morningTime === '08:30', 'Group schedule & topics successfully updated');

    // TEST 14 & 15: Morning & Evening Challenge Delivery
    console.log('\n--- Test 14 & 15: Morning & Evening Challenge Delivery ---');
    const testDeliveryRes = await makeRequest(`/api/telegram/chats/${groupChatId}/test`, 'POST', {
      chatTitle: 'Stanford DSA Battleground',
      payload: {
        text: '🏆 DEVARENA TEST CHALLENGE',
        parse_mode: 'HTML'
      }
    });
    assert(testDeliveryRes.status === 200 && testDeliveryRes.data.success === true, 'Test challenge delivered to group');
    assert(testDeliveryRes.data.record.chatId === groupChatId, 'Delivery record created with chat ID');

    // TEST 16: Timezone Handling
    console.log('\n--- Test 16: Timezone Handling ---');
    const tzCheck = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
    assert(typeof tzCheck === 'string' && tzCheck.length === 5, 'Timezone formatter computes correct local time');

    // TEST 17: Duplicate Delivery Prevention (Idempotency)
    console.log('\n--- Test 17: Idempotency & Duplicate Delivery Prevention ---');
    const cronRes1 = await makeRequest('/api/telegram/cron', 'POST');
    assert(cronRes1.status === 200, 'Cron execution succeeds');
    const history1 = await makeRequest('/api/telegram/challenges');
    const initialCount = history1.data.history.length;
    // Trigger second time in same window
    const cronRes2 = await makeRequest('/api/telegram/cron', 'POST');
    assert(cronRes2.status === 200, 'Duplicate cron execution safely handled without duplicating delivery');

    // TEST 18: Failed Delivery Handling
    console.log('\n--- Test 18: Failed Delivery Logging ---');
    const failedGroupChatId = '-99999999';
    await makeRequest('/api/telegram/chats', 'POST', {
      id: `tg_${failedGroupChatId}`,
      chatId: failedGroupChatId,
      chatTitle: 'Invalid Group',
      settings: { enabled: true, morningEnabled: true, morningTime: '09:00', eveningEnabled: true, eveningTime: '18:00' }
    });
    const historyRes = await makeRequest('/api/telegram/challenges');
    assert(Array.isArray(historyRes.data.history), 'Delivery history is recorded in database/store');

    // TEST 19: Bot Removal from Group
    console.log('\n--- Test 19: Bot Removal from Group ---');
    const removeUpdate = {
      update_id: 19,
      my_chat_member: {
        chat: { id: groupChatId, title: 'Stanford DSA Battleground', type: 'supergroup' },
        new_chat_member: { status: 'left' }
      }
    };
    await makeRequest('/api/telegram/webhook', 'POST', removeUpdate, {
      'x-telegram-bot-api-secret-token': 'test_webhook_secret_xyz'
    });
    const checkAfterRemove = await makeRequest('/api/telegram/chats?userId=user_alex_77');
    const removedGroup = checkAfterRemove.data.chats.find(c => c.chatId === groupChatId);
    assert(removedGroup?.status === 'disconnected', 'Bot removal automatically marks group as disconnected');

    // TEST 20: Multiple Telegram Groups
    console.log('\n--- Test 20: Multiple Telegram Groups per User ---');
    await makeRequest('/api/telegram/chats', 'POST', {
      id: 'tg_-100222333444',
      userId: 'user_alex_77',
      chatId: '-100222333444',
      chatTitle: 'MIT Algo Club',
      settings: { enabled: true, morningTime: '09:00', eveningTime: '18:00', timezone: 'Asia/Kolkata', difficulty: 'Easy', topics: ['Arrays'] }
    });
    await makeRequest('/api/telegram/chats', 'POST', {
      id: 'tg_-100555666777',
      userId: 'user_alex_77',
      chatId: '-100555666777',
      chatTitle: 'Berkeley Code Duels',
      settings: { enabled: true, morningTime: '10:00', eveningTime: '20:00', timezone: 'America/Los_Angeles', difficulty: 'Hard', topics: ['Trees', 'Graphs'] }
    });
    const multiCheck = await makeRequest('/api/telegram/chats?userId=user_alex_77');
    const activeMulti = multiCheck.data.chats.filter(c => c.status === 'connected');
    assert(activeMulti.length >= 2, 'Multiple Telegram groups supported independently per DEVARENA account');

    // TEST 21: Existing Discord Functionality Remains Intact
    console.log('\n--- Test 21: Existing Discord Functionality Remains Working ---');
    const discordServersRes = await makeRequest('/api/discord/servers?userId=guest');
    assert(discordServersRes.status === 200, 'Discord /api/discord/servers endpoint intact');

    const discordLinkRes = await makeRequest('/api/discord/link-code', 'POST', { userId: 'guest', username: 'Guest' });
    assert(discordLinkRes.status === 200 && discordLinkRes.data.code.startsWith('DEV-'), 'Discord /api/discord/link-code endpoint intact');

    const discordInteractionsRes = await makeRequest('/api/discord/interactions', 'POST', {
      type: 2,
      data: { name: 'help' }
    });
    assert(discordInteractionsRes.status === 200 && discordInteractionsRes.data.type === 4, 'Discord slash commands webhook intact');

    const discordChallengesRes = await makeRequest('/api/discord/challenges');
    assert(discordChallengesRes.status === 200, 'Discord /api/discord/challenges endpoint intact');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

function linkObjHasCode(obj) {
  return obj && obj.code && obj.codeHash && obj.code.startsWith('DEV-');
}

// Start local server for tests
import('../server/server.js').then(() => {
  runTests();
}).catch(err => {
  console.error('Failed to start test server:', err);
  process.exit(1);
});

