export const GET_LATEST_EVENT_TIMESTAMP = `
query MyQuery ($database: String!){
    attendance_intervals_aggregate(where: {database: {_eq: $database}}) {
      aggregate {
        max {
          ext
        }
      }
    }
  }
`

export const GET_USERS = `
query MyQuery {
  attendance_users {
      card
      firstname
      lastname
  }
}
`

export const INSERT_USERS_OBJECT =`
mutation ($objects: [attendance_users_insert_input!]!) {
    insert_attendance_users(objects: $objects){   
    returning {
    card
    firstname
    lastname
    }
  }
}
`

export const INSERT_INTERVALS_OBJECT =`
mutation pushIntervals($objects: [attendance_intervals_insert_input!]!) {
  insert_attendance_intervals(objects: $objects){   
      returning {
      id
      }
  }
}
`

export const GET_LATEST_TIMESTAMP_FOR_EACH = `
query MyQuery {
  attendance_users_aggregate {
    nodes {
      card
      intervals(order_by: {id: desc}, limit: 1) {
        ent
        ext
      }
    }
  }
}
`