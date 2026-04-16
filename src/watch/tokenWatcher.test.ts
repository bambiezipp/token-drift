import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchTokenFile } from './tokenWatcher';

function writeTempJson(data: object): string {
  const file = path.join(os.tmpdir(), `token-drift-watch-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  return file;
}

describe('watchTokenFile', () => {
  it('calls onDrift when target differs from baseline', (done) => {
    const baselineFile = writeTempJson({ color: { primary: { value: '#000' } } });
    const targetFile = writeTempJson({ color: { primary: { value: '#fff' } } });

    const handle = watchTokenFile({
      baselineFile,
      targetFile,
      interval: 100,
      onDrift: (output) => {
        expect(output).toContain('color.primary');
        handle.stop();
        fs.unlinkSync(baselineFile);
        fs.unlinkSync(targetFile);
        done();
      },
    });
  });

  it('does not call onDrift when tokens are identical', (done) => {
    const baselineFile = writeTempJson({ color: { primary: { value: '#000' } } });
    const targetFile = writeTempJson({ color: { primary: { value: '#000' } } });
    let driftCalled = false;

    const handle = watchTokenFile({
      baselineFile,
      targetFile,
      interval: 100,
      onDrift: () => { driftCalled = true; },
    });

    setTimeout(() => {
      handle.stop();
      fs.unlinkSync(baselineFile);
      fs.unlinkSync(targetFile);
      expect(driftCalled).toBe(false);
      done();
    }, 350);
  });

  it('calls onError for missing file', (done) => {
    const handle = watchTokenFile({
      baselineFile: '/nonexistent/baseline.json',
      targetFile: '/nonexistent/target.json',
      interval: 100,
      onError: (err) => {
        expect(err).toBeInstanceOf(Error);
        handle.stop();
        done();
      },
    });
  });
});
