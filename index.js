import DataPreparation from './DataPreparation.js';
import Employee from './Employee.js';
import 'dotenv/config'
import fetch from 'node-fetch'

import GQLTransmitter from "./services/GQLTransmitter.js";
import { unix2timestamp} from './utils/time.js'
import { logger } from "./utils/logger.js";


async function employeeSinc(employees){
    const current_employess = employees.map(each => each?.card)

    // An employeess that already existing common database
    const existing_employess = await GQLTransmitter.getEmployees().then( arr => arr.map( each => each.card) );

    const current_employess_set  = new Set(current_employess);
    const existing_employess_set  = new Set(existing_employess);

    // The employess we must to contribute to hasura
    const difference = new Set([...current_employess_set].filter(x => !existing_employess_set.has(x))); 
    // const difference_empl = [...difference].reduce().map( card => employees.find( each_empl => each_empl.card == card))

    const employess_differeence = []
    for (const card of difference){

        const finded = employees.find(each => each.card === card)
        employess_differeence.push(finded)
    }

    const forward_objects = employess_differeence.map(each => ({
        card: each.card,
        firstname: each.firstname,
        lastname: each.lastname
    }))
    const responce = await GQLTransmitter.insertEmployees({ objects: forward_objects })

    logger.info('Eployeee synchronization procedure finished with result:');

    if (responce.length) {
        logger.info('\n', '-'.repeat(80));
       
        logger.info(JSON.stringify(responce));
        logger.info('-'.repeat(80));
    } else logger.info('No one employee was added')
}

async function inserIntervals(employees){
    var intervals_pool = []

    for (const empl of employees){
        intervals_pool = intervals_pool.concat(empl.intervals)
    }

    intervals_pool = intervals_pool.map(each => ({
        ent:  unix2timestamp(each.ent),
        ext:  unix2timestamp(each.ext),
        card: each.card,
        database: each.database
    }))

    const responce = await GQLTransmitter.inserIntervals({ objects: intervals_pool})
    console.log(responce);

    logger.info(`Injected ${responce.length} intervals at ${new Date()}`);
    return responce
}

async function main(){
    logger.info('The scripts was started')
    const time_since = await GQLTransmitter.getLatestEventTimestamp()
    const { sampled_events, employees_list } = await DataPreparation.getPreparedData();
    
    const latestsTimestamps = await GQLTransmitter.getLatestTimestampForEach();
    
    var employees = employees_list.map(each => new Employee(
            each.firstname, each.lastname, each.card,
            sampled_events.filter(event => each.card === event.card),
            latestsTimestamps.find( item => item.card === each.card)
    ));
   
    employeeSinc(employees)
    inserIntervals(employees)
}

main()

// setInterval( function(){
// main()
// }, process.env.SYNC_INTERVAL)