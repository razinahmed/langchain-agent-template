const request = require('supertest');
const app = require('../../src/server');
const { resetMemoryStore } = require('../../src/memory');

let server;

beforeAll(() => {
  server = app.listen(0);
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  resetMemoryStore();
});

describe('Agent Tool Invocation E2E', () => {
  it('should invoke the search tool when the prompt requires web lookup', async () => {
    const res = await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'What is the current population of Tokyo?', tools: ['web_search'] });

    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
    expect(res.body.toolCalls).toEqual(
      expect.arrayContaining([expect.objectContaining({ tool: 'web_search' })])
    );
  });

  it('should invoke the calculator tool for math questions', async () => {
    const res = await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'What is 1547 * 283?', tools: ['calculator'] });

    expect(res.status).toBe(200);
    expect(res.body.toolCalls).toEqual(
      expect.arrayContaining([expect.objectContaining({ tool: 'calculator' })])
    );
    expect(res.body.result).toContain('437801');
  });

  it('should chain multiple tools in a single agent run', async () => {
    const res = await request(server)
      .post('/api/agent/run')
      .send({
        prompt: 'Search for the GDP of France and calculate 5% of it.',
        tools: ['web_search', 'calculator'],
      });

    expect(res.status).toBe(200);
    expect(res.body.toolCalls.length).toBeGreaterThanOrEqual(2);
    const toolNames = res.body.toolCalls.map((tc) => tc.tool);
    expect(toolNames).toContain('web_search');
    expect(toolNames).toContain('calculator');
  });

  it('should return an error when no tools are available for the prompt', async () => {
    const res = await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'Look up stock prices', tools: [] });

    expect(res.status).toBe(200);
    expect(res.body.result).toContain('unable to assist');
  });
});

describe('Conversation Memory E2E', () => {
  it('should remember context from previous messages in the same session', async () => {
    const session = `sess_${Date.now()}`;

    await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'My name is Alice.', sessionId: session, tools: [] });

    const res = await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'What is my name?', sessionId: session, tools: [] });

    expect(res.status).toBe(200);
    expect(res.body.result.toLowerCase()).toContain('alice');
  });

  it('should not leak memory between different sessions', async () => {
    await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'Secret code is 42.', sessionId: 'session_a', tools: [] });

    const res = await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'What is the secret code?', sessionId: 'session_b', tools: [] });

    expect(res.body.result.toLowerCase()).not.toContain('42');
  });

  it('should respect the max memory window length', async () => {
    const session = `sess_${Date.now()}`;
    for (let i = 0; i < 25; i++) {
      await request(server)
        .post('/api/agent/run')
        .send({ prompt: `Message number ${i}`, sessionId: session, tools: [] });
    }
    const res = await request(server)
      .post('/api/agent/run')
      .send({ prompt: 'What was message number 0?', sessionId: session, tools: [] });

    expect(res.status).toBe(200);
    // Early messages should have been evicted from the window
  });
});
