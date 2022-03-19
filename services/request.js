import fetch from 'node-fetch'
import 'dotenv/config'

export async function request(query, variables = {}){
    const res = await fetch(process.env.GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Hasura-Admin-Secret': process.env.HASURA_SECRET
        },
        body: JSON.stringify({
            query,
            variables
        })
    })
    return await res.json()
}

