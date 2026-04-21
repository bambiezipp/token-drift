import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runAuditCommand } from './auditCommand';

function writeTempJson(data: object): string {
  const file = path.join(os.tmpdir(), `audit-test-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  return file;
}

describe('runAuditCommand', () => {
  let exitSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exits with code 1 if token file does not exist', () => {
    runAuditCommand({ tokenFile: '/nonexistent/tokens.json' });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('passes audit for clean tokens', () => {
    const file = writeTempJson({
      color: { primary: { value: '{color.blue.500}' } },
    });
    runAuditCommand({ tokenFile: file });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅'));
    expect(exitSpy).not.toHaveBeenCalledWith(1);
    fs.unlinkSync(file);
  });

  it('fails audit and exits 1 for tokens with empty values', () => {
    const file = writeTempJson({
      color: { bad: { value: '' } },
    });
    runAuditCommand({ tokenFile: file });
    expect(exitSpy).toHaveBeenCalledWith(1);
    fs.unlinkSync(file);
  });

  it('outputs JSON when json flag is set', () => {
    const file = writeTempJson({
      color: { primary: { value: '{color.blue.500}' } },
    });
    runAuditCommand({ tokenFile: file, json: true });
    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('issues');
    expect(parsed).toHaveProperty('passed');
    fs.unlinkSync(file);
  });

  it('filters by category when provided', () => {
    const file = writeTempJson({
      color: { primary: { value: '#fff' } },
      spacing: { sm: { value: '4px' } },
    });
    runAuditCommand({ tokenFile: file, category: 'spacing', json: true });
    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    const tokens = parsed.issues.map((i: any) => i.token).join(' ');
    expect(tokens).not.toContain('color');
    fs.unlinkSync(file);
  });
});
