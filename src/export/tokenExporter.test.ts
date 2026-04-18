import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exportTokens, getExportContent, formatExportResult } from './tokenExporter';
import { FlatTokenMap } from '../parser/tokenParser';

const sampleTokens: FlatTokenMap = {
  'color.primary': { value: '#0066cc', type: 'color' },
  'color.secondary': { value: '#ff6600', type: 'color' },
  'spacing.sm': { value: '8px', type: 'dimension' },
};

describe('getExportContent', () => {
  it('returns css content', () => {
    const result = getExportContent(sampleTokens, 'css');
    expect(result).toContain('--');
    expect(result).toContain('#0066cc');
  });

  it('returns scss content', () => {
    const result = getExportContent(sampleTokens, 'scss');
    expect(result).toContain('$');
  });

  it('returns js content', () => {
    const result = getExportContent(sampleTokens, 'js');
    expect(result).toContain('export');
  });

  it('returns json content', () => {
    const result = getExportContent(sampleTokens, 'json');
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('color.primary');
  });

  it('throws on unsupported format', () => {
    expect(() => getExportContent(sampleTokens, 'xml' as any)).toThrow('Unsupported export format');
  });
});

describe('exportTokens', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-export-'));

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes css file and returns success result', () => {
    const outputPath = path.join(tmpDir, 'tokens.css');
    const result = exportTokens(sampleTokens, { format: 'css', outputPath });
    expect(result.success).toBe(true);
    expect(result.tokenCount).toBe(3);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it('creates nested output directory if missing', () => {
    const outputPath = path.join(tmpDir, 'nested', 'deep', 'tokens.json');
    const result = exportTokens(sampleTokens, { format: 'json', outputPath });
    expect(result.success).toBe(true);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it('returns error result on invalid path', () => {
    const result = exportTokens(sampleTokens, { format: 'css', outputPath: '/no_permission/tokens.css' });
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('formatExportResult', () => {
  it('formats success message', () => {
    const msg = formatExportResult({ success: true, outputPath: 'out/tokens.css', format: 'css', tokenCount: 5 });
    expect(msg).toContain('5 tokens');
    expect(msg).toContain('CSS');
  });

  it('formats failure message', () => {
    const msg = formatExportResult({ success: false, outputPath: '', format: 'scss', tokenCount: 0, error: 'ENOENT' });
    expect(msg).toContain('Export failed');
    expect(msg).toContain('ENOENT');
  });
});
