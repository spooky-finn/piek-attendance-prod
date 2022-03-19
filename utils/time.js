import moment from 'moment';

export function timestamp2unix(timestamp, format){
    if (timestamp === 0) return 0;
    return moment(timestamp, format).unix();
}

export function unix2timestamp(time){
    if (!time) return null
    return moment.unix(time).format(process.env.HASURA_DATE_FORMAT)
}