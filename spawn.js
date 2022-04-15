import { exec, execSync, spawn } from 'child_process';
import fs from 'fs';
import 'dotenv/config'

var isWin = process.platform === "win32";

    const access_path = fs.readFileSync('./path.txt', 'utf-8').split('\n')[0].trim();
    const mdb_export = isWin ? '"./mdbtools-win/mdb-export"' : "mdb-export"
    
    const child1 = exec(`${mdb_export} ${access_path} acc_monitor_log > events.csv`, function(err, stdout, stderr){
        if (err)
            console.log(err)

        console.log(stdout);
        console.log(stderr);

        if (!stdout)
            console.log('success');
    })

