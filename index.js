import DataPreparation from "./DataPreparation";
import 'dotenv/config'
import fetch from 'node-fetch'
import Employee from "./Employee";

import GQLTransmitter from "./services/GQLTransmitter";
import { unix2timestamp} from './utils/time'
import { logger } from "./utils/logger";

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
    logger.info(`Injected ${responce.length} intervals at ${new Date()}`);
    return responce
}

async function main(){
    logger.info('The scripts was started')
    const time_since = await GQLTransmitter.getLatestEventTimestamp()
    const { sampled_events, employees_list } = await DataPreparation.getPreparedData();
    
    var employees = employees_list.map(each => new Employee(
            each.firstname, each.lastname, each.card,
            sampled_events.filter(event => each.card === event.card),
            time_since
    ));
   
    employeeSinc(employees)
    inserIntervals(employees)
}

main()

setInterval( function(){
main()
}, process.env.SYNC_INTERVAL)








































function *request() {
    var p2 = yield fetch(process.env.GRAPHQL_ENDPOINT).then( data => data.json());
    var p3 = yield fetch(process.env.GRAPHQL_ENDPOINT).then( data => data.json());
    return p3
}

function *makeRequest(){
   try{
       var p1 =  yield fetch(process.env.GRAPHQL_ENDPOINT).then( data => data.json());

       var p3 = yield *request();
        const responce = yield *request()
        logger.info('res: ', responce)
   } catch (err) {
       logger.info(err);
   }

}


// const it = makeRequest()
// const request_promise = it.next()

// request_promise.value.then( responce => {
//     // продолжить выполнение генератора makeRequest после разрешения обещания
//     it.next(responce)
// }).catch(err => {
//     it.throw(err)
// })
// спасибо Бенджамину Грюнбауму (@benjamingr на GitHub)
// за существенные улучшения!

function run(gen) {
    var args = [].slice.call( arguments, 1), it;
    // инициализировать генератор в текущем контексте
    it = gen.apply( this, args );
    
    // вернуть обещание для завершающегося генератора
    return Promise.resolve()
        .then( function handleNext(value){
            // выполнить до следующего значения, переданного
            // yield
            var next = it.next( value );
            return (function handleResult(next){
                // генератор завершил выполнение?
                if (next.done) {
                    return next.value;
                }
                // в противном случае продолжить
                else {
                    return Promise.resolve( next.value )
                        .then(
                            // возобновить асинхронный цикл
                            // в случае успеха и отправить
                            // значение, полученное в результате
                            // разрешения, обратно генератору
                            handleNext,
                            // если `value` - отклоненное
                            // обещание, распространить ошибку
                            // обратно в генератор для
                            // собственной обработки ошибок
                            function handleErr(err) {
                                return Promise.resolve(
                                    it.throw( err )
                                )
                                .then( handleResult );
                            }
                ); }
            })(next);
        });
}

