const { Agent } = require('../../src/agent');
const { ToolRegistry } = require('../../src/tools/registry');
const { ConversationMemory } = require('../../src/memory');
const { PromptBuilder } = require('../../src/prompt-builder');

describe('ToolRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should register and retrieve a tool by name', () => {
    const tool = { name: 'web_search', description: 'Search the web', run: jest.fn() };
    registry.register(tool);
    expect(registry.get('web_search')).toBe(tool);
  });

  it('should list all registered tool names', () => {
    registry.register({ name: 'a', description: '', run: jest.fn() });
    registry.register({ name: 'b', description: '', run: jest.fn() });
    expect(registry.listNames()).toEqual(['a', 'b']);
  });

  it('should throw when retrieving an unregistered tool', () => {
    expect(() => registry.get('missing')).toThrow('Tool "missing" is not registered');
  });

  it('should prevent duplicate registration', () => {
    const tool = { name: 'dup', description: '', run: jest.fn() };
    registry.register(tool);
    expect(() => registry.register(tool)).toThrow('already registered');
  });
});

describe('ConversationMemory', () => {
  it('should store and retrieve messages for a session', () => {
    const mem = new ConversationMemory({ maxMessages: 10 });
    mem.add('s1', { role: 'user', content: 'Hello' });
    mem.add('s1', { role: 'assistant', content: 'Hi there' });
    expect(mem.get('s1')).toHaveLength(2);
  });

  it('should evict oldest messages when exceeding maxMessages', () => {
    const mem = new ConversationMemory({ maxMessages: 3 });
    mem.add('s1', { role: 'user', content: 'msg1' });
    mem.add('s1', { role: 'assistant', content: 'msg2' });
    mem.add('s1', { role: 'user', content: 'msg3' });
    mem.add('s1', { role: 'assistant', content: 'msg4' });
    const messages = mem.get('s1');
    expect(messages).toHaveLength(3);
    expect(messages[0].content).toBe('msg2');
  });

  it('should isolate sessions from each other', () => {
    const mem = new ConversationMemory({ maxMessages: 10 });
    mem.add('s1', { role: 'user', content: 'For session 1' });
    mem.add('s2', { role: 'user', content: 'For session 2' });
    expect(mem.get('s1')).toHaveLength(1);
    expect(mem.get('s2')).toHaveLength(1);
  });

  it('should clear a specific session', () => {
    const mem = new ConversationMemory({ maxMessages: 10 });
    mem.add('s1', { role: 'user', content: 'data' });
    mem.clear('s1');
    expect(mem.get('s1')).toHaveLength(0);
  });
});

describe('PromptBuilder', () => {
  it('should build a system prompt including available tool descriptions', () => {
    const tools = [
      { name: 'search', description: 'Search the web' },
      { name: 'calc', description: 'Perform math calculations' },
    ];
    const prompt = PromptBuilder.system(tools);
    expect(prompt).toContain('search');
    expect(prompt).toContain('calc');
    expect(prompt).toContain('You have access to the following tools');
  });

  it('should build a user prompt with conversation history', () => {
    const history = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
    ];
    const prompt = PromptBuilder.user('What can you do?', history);
    expect(prompt).toContain('Hi');
    expect(prompt).toContain('Hello!');
    expect(prompt).toContain('What can you do?');
  });
});

describe('Agent', () => {
  it('should select the correct tool based on the prompt', async () => {
    const searchRun = jest.fn().mockResolvedValue('42 million');
    const registry = new ToolRegistry();
    registry.register({ name: 'web_search', description: 'Search the web', run: searchRun });

    const agent = new Agent({ registry, model: 'mock' });
    const result = await agent.run('What is the population?', ['web_search']);

    expect(searchRun).toHaveBeenCalled();
    expect(result.toolCalls).toEqual(
      expect.arrayContaining([expect.objectContaining({ tool: 'web_search' })])
    );
  });

  it('should return a direct answer when no tools are needed', async () => {
    const registry = new ToolRegistry();
    const agent = new Agent({ registry, model: 'mock' });
    const result = await agent.run('Say hello', []);
    expect(result.result).toBeDefined();
    expect(result.toolCalls).toHaveLength(0);
  });

  it('should handle tool execution errors gracefully', async () => {
    const failingTool = { name: 'broken', description: 'Always fails', run: jest.fn().mockRejectedValue(new Error('API down')) };
    const registry = new ToolRegistry();
    registry.register(failingTool);

    const agent = new Agent({ registry, model: 'mock' });
    const result = await agent.run('Use the broken tool', ['broken']);
    expect(result.result).toContain('error');
  });
});
