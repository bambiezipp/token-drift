import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runHistoryCommand } from './historyCommand';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-history-cmd-'));
const historyFile = path.join(tmpDir, 'history.json');

function writeTempJson(name: string, data: object): string {
  const file = path.join(tmpDir, name);
  fs.writeFileSync(file, JSON.stringify(data), 'utf-8');
  return file;
}

const tokenFileA = writeTempJson('tokensA.json', {
  color: { primary: { value: '#fff' }, secondary: { value: '#000' } },
});
const tokenFileB = writeTempJson('tokensB.json', {
  color: { primary: { value: '#eee' }, tertiary: { value: '#111' } },
});

afterEach(() => {
  if (fs.existsSync(historyFile)) fs.unlinkSync(historyFile);
});

describe('runHistoryCommand – record', () => {
  it('creates a history file with one entry', () => {
    runHistoryCommand({ tokenFile: tokenFileA, label: 'v1', historyFile });
    const data = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    expect(data).toHaveLength(1);
    expect(data[0].label).toBe('v1');
  });

  it('appends subsequent entries', () => {
    runHistoryCommand({ tokenFile: tokenFileA, label: 'v1', historyFile });
    runHistoryCommand({ tokenFile: tokenFileB, label: 'v2', historyFile });
    const data = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    expect(data).toHaveLength(2);
  });
});

describe('runHistoryCommand – list', () => {
  it('prints entries without error', () => {
    runHistoryCommand({ tokenFile: tokenFileA, label: 'v1', historyFile });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runHistoryCommand({ tokenFile: tokenFileA, list: true, historyFile });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('runHistoryCommand – compare', () => {
  it('outputs diff between two labels', () => {
    runHistoryCommand({ tokenFile: tokenFileA, label: 'v1', historyFile });
    runHistoryCommand({ tokenFile: tokenFileB, label: 'v2', historyFile });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runHistoryCommand({ tokenFile: tokenFileA, compare: ['v1', 'v2'], historyFile });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('runHistoryCommand – prune', () => {
  it('reduces history to max entries', () => {
    for (let i = 0; i < 6; i++) {
      runHistoryCommand({ tokenFile: tokenFileA, label: `v${i}`, historyFile });
    }
    runHistoryCommand({ tokenFile: tokenFileA, prune: 3, historyFile });
    const data = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    expect(data).toHaveLength(3);
  });
});
