import { execSync } from 'child_process';
import fs from 'fs';
import 'dotenv/config'

import { timestamp2unix } from './utils/time.js';
import { parse_cvs_file } from './utils/csv.js';

import GQLTransmitter from './services/GQLTransmitter.js'
import { logger } from './utils/logger.js';

export default class DataPreparation {

    static resources = {
        users: './resources/users.csv',
        events: './resources/events.csv'
    }

    static async getPreparedData(){
        await this._transformDatabasetoCSV();

        const pr_users = parse_cvs_file(DataPreparation.resources.users, {
            firstname: 'lastname',
            lastname: 'name',
            card: 'CardNo'
        })

        const pr_events = parse_cvs_file(DataPreparation.resources.events, {
            id: 'id',
            time: 'time',
            point_name: 'event_point_name',
            card: 'card_no'
        })

        try {
            const [ events, employees_list ] = await Promise.all( [pr_events, pr_users ] )
            logger.info(`Successfully collected ${events.length} events and ${employees_list.length} employees.`);

            const sampled_events = await this._primarySampling(events)
            return {
                sampled_events: sampled_events,
                employees_list: employees_list.filter(each => {
                    if (each.card) return each
                })
            }
        }
        catch(e){
            logger.error(e);
        }
    }

    static async _primarySampling(events){
        const zk_format = process.env.ZK_SYSTEM_FATE_FORMAT
        // Remove all events that were caused not by a card
        events = events.filter( function(each){
            if (each.card === '0') return;
            return each
        })
        
        // Since this moment all events contains the time in unix format.
        events.forEach(each => {
            each.time = timestamp2unix(each.time, zk_format)
        });

        var u_time_since = await GQLTransmitter.getLatestEventTimestamp()
        // if we didnt have at least one event with this database name
        if (!u_time_since) u_time_since = 0;
        // For initial sampling, we must analyze each employee`s previous events in order
        // to accurately mark them.
        // We starts abnalyze since -30 days of the latest event that we have in common base.
        else u_time_since -= 2592000;

        events = events.filter(each => each.time > u_time_since)
        logger.info(`There were ${events.length} events remained after primary sampling.`);
        return events
    }

    static async _transformDatabasetoCSV(){
        try {
            const access_path = fs.readFileSync('./path.txt', 'utf-8').split('\n')[0].trim();

            const files = [
                {
                    name: 'users',
                    result_path: DataPreparation.resources.users,
                    command: `${"./mdbtools-win-master/mdb-export"} ${access_path}  USERINFO > `,
                },
                {
                    name: 'events',
                    result_path: DataPreparation.resources.events,
                    command: `${"./mdbtools-win-master/mdb-export"} ${access_path}  acc_monitor_log > `,
                }
            ]
            for (const file of files){

                try {
                    const stdout = execSync(file.command + file.result_path, { encoding: 'utf-8'})
                    logger.info(`Successfuly created file: ${file.result_path}`, stdout)
                } catch (e) {
                    logger.error(e);
                    process.exit(1);
                }
            }

        } catch (error) {
            logger.error(`Cant open the txt file with pathname to access database ${error}`);
            logger.error(new Error(`Cant open the txt file with pathname to access database ${error}`))
        }
    }
}
    
