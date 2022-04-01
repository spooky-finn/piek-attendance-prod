import { execSync } from 'child_process';

const stdout = execSync('mdb-export C:\Users\Миша\Documents acc_monitor_log > ./events.csv', { encoding: 'utf-8'})

console.log('stdout: ', stdout);