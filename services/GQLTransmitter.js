import { request } from './request.js';
import { GET_LATEST_EVENT_TIMESTAMP, GET_LATEST_TIMESTAMP_FOR_EACH, GET_USERS, INSERT_INTERVALS_OBJECT, INSERT_USERS_OBJECT } from './queries.js'
import 'dotenv/config'
import { timestamp2unix } from '../utils/time.js'
import { logger } from '../utils/logger.js';

class GQLTransmitter {

    // The closure return a unix time od latest events we have at common base
    static async getLatestEventTimestamp(){
        const variables = { database: process.env.INCOMING_DATABASE_NAME }
        var timestamp = 0;
        try {
            const res = await request(GET_LATEST_EVENT_TIMESTAMP, variables);

            if (res.errors)
                throw new Error(JSON.stringify(res.errors));

            timestamp = res.data.attendance_intervals_aggregate.aggregate.max.ext

            // if we didnt have at least one event with this database name
            if (!timestamp) timestamp = 0;
            logger.info(`Recived the timestamp of latest event ${timestamp}`)
            logger.info(`Gql Endpoint is ${process.env.GRAPHQL_ENDPOINT}`)
            
            return timestamp2unix(timestamp, process.env.HASURA_DATE_FORMAT)
        } catch (err) {
            logger.error(`Hasura bad responce ${err}`);
        }
    };
    
    static async getEmployees(){
       try {
            const res = await request(GET_USERS);
            if (res.errors)
                throw new Error(JSON.stringify(res.errors));

            return res.data.attendance_users
       } catch (err) {
            logger.error(`Hasura bad responce ${err}`);
       }

    }

    static async insertEmployees(variables){
        try {
            const res = await request(INSERT_USERS_OBJECT, variables);
            if (res.errors)
                throw new Error(JSON.stringify(res.errors));

            return res.data.insert_attendance_users.returning
        } catch (err) {
            logger.error(`Hasura bad responce ${err}`);
        }
    }

    static async inserIntervals(variables){
        try {
            const res = await request(INSERT_INTERVALS_OBJECT, variables);
            if (res.errors)
                throw new Error(JSON.stringify(res.errors));

            return res.data.insert_attendance_intervals.returning
        } catch (err) {
            logger.error(`Hasura bad responce ${err}`);
        }
    }

    static async getLatestTimestampForEach(){
        try {
            const res = await request(GET_LATEST_TIMESTAMP_FOR_EACH);
            if (res.errors)
                throw new Error(JSON.stringify(res.errors));            

            return res.data.attendance_users_aggregate.nodes
        } catch (err) {
            logger.error(`Hasura bad responce ${err}`);
        }
    }
}

export default GQLTransmitter