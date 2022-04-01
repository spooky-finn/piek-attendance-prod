import 'dotenv/config'

module.exports = {
    apps: [
        {
            name : 'piek_attendance',
            script: 'index.js',
            env: {
                NODE_ENV: process.env.NODE_ENV,
                HASURA_SECRET: process.env.HASURA_SECRET,
                GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
                WORKSHIFT: process.env.WORKSHIFT,
                HASURA_DATE_FORMAT: process.env.HASURA_DATE_FORMAT,
                ZK_SYSTEM_FATE_FORMAT: process.env.ZK_SYSTEM_FATE_FORMAT,
                INCOMING_DATABASE_NAME: process.env.INCOMING_DATABASE_NAME,
                SYNC_INTERVAL: process.env.SYNC_INTERVAL,
            }
        }
    ]
}