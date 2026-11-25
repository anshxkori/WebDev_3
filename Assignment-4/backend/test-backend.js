const http = require('http');
const { io } = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING LAB 4 BACKEND VALIDATION TESTS ===\n');

  try {
    // 1. Health check
    console.log('1. Testing Health Endpoint: GET /api/health');
    const health = await request('GET', '/api/health');
    console.log('   Status:', health.status, 'Body:', health.body);

    // 2. Unauthorized notes access
    console.log('\n2. Testing Protected Route without Token: GET /api/notes');
    const unauth = await request('GET', '/api/notes');
    console.log('   Status:', unauth.status, '(Expected 403)');
    console.log('   Body:', unauth.body);
    if (unauth.status !== 403 || unauth.body.message !== 'No token provided') {
      throw new Error('Unauthorized check failed');
    }
    console.log('   [PASS] Successfully blocked with 403 and "No token provided"');

    // 3. User Registration (Matches Screenshot Fig 1)
    const testTimestamp = Date.now();
    const testUsername = `victor_${testTimestamp.toString().slice(-4)}`;
    const testEmail = `victor_${testTimestamp}@example.com`;
    console.log(`\n3. Testing Registration: POST /api/auth/signup (${testUsername}, ${testEmail})`);
    const signupRes = await request('POST', '/api/auth/signup', {
      username: testUsername,
      email: testEmail,
      password: '123456',
    });
    console.log('   Status:', signupRes.status, '(Expected 201)');
    console.log('   Body:', signupRes.body);
    if (signupRes.status !== 201 || !signupRes.body.id) {
      throw new Error('Registration failed');
    }
    console.log('   [PASS] User registered successfully with ID:', signupRes.body.id);

    // 4. User Login (Matches Screenshot Fig 1)
    console.log('\n4. Testing Login: POST /api/auth/login');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: '123456',
    });
    console.log('   Status:', loginRes.status, '(Expected 200)');
    console.log('   Token received (prefix):', loginRes.body.token ? loginRes.body.token.substring(0, 25) + '...' : 'NONE');
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error('Login failed');
    }
    const token = loginRes.body.token;
    console.log('   [PASS] User logged in and received JWT');

    // 5. Create Note (Matches Screenshot Fig 4 bottom)
    console.log('\n5. Testing Create Note: POST /api/notes');
    const note1Res = await request('POST', '/api/notes', {
      title: 'My First Note',
      content: 'This is my first note of web dev -III',
    }, token);
    console.log('   Status:', note1Res.status, '(Expected 201)');
    console.log('   Created Note:', note1Res.body);
    if (note1Res.status !== 201 || !note1Res.body._id) {
      throw new Error('Note creation failed');
    }
    const noteId = note1Res.body._id;
    console.log('   [PASS] Note created successfully with ID:', noteId);

    // 6. Get Notes (Matches Screenshot Fig 2 top)
    console.log('\n6. Testing Get Notes: GET /api/notes');
    const notesRes = await request('GET', '/api/notes', null, token);
    console.log('   Status:', notesRes.status, '(Expected 200)');
    console.log('   Total notes for user:', notesRes.body.length);
    console.log('   First note:', notesRes.body[0]);
    if (notesRes.status !== 200 || !Array.isArray(notesRes.body) || notesRes.body.length === 0) {
      throw new Error('Get notes failed');
    }
    console.log('   [PASS] Successfully retrieved notes for authenticated user');

    // 7. Update Note: PUT /api/notes/:id
    console.log(`\n7. Testing Update Note: PUT /api/notes/${noteId}`);
    const updateRes = await request('PUT', `/api/notes/${noteId}`, {
      title: 'My Updated First Note',
      content: 'Updated content for web dev III practical.',
    }, token);
    console.log('   Status:', updateRes.status, 'Title:', updateRes.body.title);
    if (updateRes.status !== 200 || updateRes.body.title !== 'My Updated First Note') {
      throw new Error('Update note failed');
    }
    console.log('   [PASS] Note updated successfully');

    // 8. Test Socket.IO Real-Time Chat (Matches Screenshot Fig 3)
    console.log('\n8. Testing Real-Time Chat via Socket.IO');
    await new Promise((resolveSocket, rejectSocket) => {
      const socket = io(BASE_URL, { transports: ['websocket'] });

      socket.on('connect', () => {
        console.log('   Socket connected with client ID:', socket.id);
        socket.emit('joinRoom', { room: 'general', username: 'Aditi', userId: signupRes.body.id });
      });

      socket.on('receiveMessage', (msg) => {
        console.log('   Socket received message:', msg);
        if (msg.message === 'Hey team, backend is ready 👋') {
          console.log('   [PASS] Real-time message broadcast verified');
          socket.disconnect();
          resolveSocket();
        }
      });

      // Send a test message shortly after joining
      setTimeout(() => {
        socket.emit('sendMessage', {
          room: 'general',
          username: 'Aditi',
          message: 'Hey team, backend is ready 👋',
        });
      }, 500);

      setTimeout(() => {
        socket.disconnect();
        rejectSocket(new Error('Socket.IO message timeout'));
      }, 5000);
    });

    // 9. Verify EventEmitter activity logs
    console.log('\n9. Testing EventEmitter Logs: GET /api/events');
    const eventsRes = await request('GET', '/api/events');
    console.log('   Status:', eventsRes.status, 'Total logged events:', eventsRes.body.events?.length);
    console.log('   Sample recent events:', eventsRes.body.events?.slice(0, 3).map(e => `${e.type} @ ${e.timestamp}`));
    if (!eventsRes.body.events || eventsRes.body.events.length === 0) {
      throw new Error('EventEmitter logs empty');
    }
    console.log('   [PASS] Node.js EventEmitter verified and logging events');

    console.log('\n=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[TEST FAILED]:', err.message);
    process.exit(1);
  }
}

// Allow server a moment to start if run together
setTimeout(runTests, 1000);
