import * as fs from 'fs';
import * as path from 'path';

export const mkdirPSync = (targetDir: string) => {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = path.isAbsolute(targetDir) ? __dirname : '.';

    return targetDir.split(sep).reduce((parent, child) => {
        const curDir = path.resolve(baseDir, parent, child);
        try {
            if (!fs.existsSync(curDir)) {
                fs.mkdirSync(curDir);
            }
        } catch (err) {
            if (err.code === 'EEXIST') {
                return curDir;
            }

            throw err;
        }

        return curDir;
    }, initDir);
};
