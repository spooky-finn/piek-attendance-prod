import { unix2timestamp } from "./utils/time"
import { detaillog } from "./utils/logger"

class Employee {

    constructor(firstname, lastname, card, sampled_events, time_since) {
        this.firstname = firstname
        this.lastname = lastname
        this.card = card
        this.unmodified_events = sampled_events
        this._time_since = time_since

        this.events = []
        this.intervals = []

        this.sortEvents()
        // there is method correcting the incoming events and changing them
        this.preventCollision()
        this.marking()
        this.intermediateSampling()
        this.composition()
        this._logDetails()
    }

    sortEvents(){
        this.events = this.unmodified_events.sort((a, b) => a.time - b.time)
    }

    /*  
    * Anthicollision algorithm, descends into primary sampling algorithm
    * The essence of the algorithm is that if a person has 2 events at +- the same time
    * then the algorithm recursively skips their similar ones so as not to spoil the statistics
    */
    preventCollision(){
        const new_arr = []
        for (var idx = 0; idx < this.events.length;){
             // Since func is recursive, it returns a valid and unique event from certain delta interval
            const resultedEvent = this._r_preventCollision(this.events, idx)

            new_arr.push(this.events[resultedEvent])
            idx = resultedEvent + 1
        }
        this.events = new_arr
    }


    // Since func is recursive, it returns a valid and unique event from certain delta interval
    _r_preventCollision(arr, idx){
        const curr = arr[idx]
        const next = arr[idx+1]
        if (!next) return idx

        const timedelta = Math.abs(next.time - curr.time)
            // 300 seconds a non-sensitive time for double  marks.
        if (timedelta < 300)
            return this._r_preventCollision(arr, idx + 1)
        else
            return idx;
    };

    /*
    * Marking events by type (ent or ext)
    * based on the module distance to the previous event
    */
    marking(){
        this.events.forEach( function(val, idx, arr){
            const curr = arr[idx]
            const next = arr[idx+1]
            if (!next) return

            const timedelta = Math.abs(next.time - curr.time)

            // For first events we are define that was an entrance
            // because it doent affect
            if (idx === 0) val.dir = 'ent';
            if (timedelta < process.env.WORKSHIFT && curr.dir === 'ent')
                next.dir = 'ext'
            else
                next.dir = 'ent'
        })
    }

    async intermediateSampling(){
        this.events = this.events.filter(each => each.time > this._time_since)
    }

    /* 
    * Collects interval based on marking events
    *
    * В этом методе интервал обозначает объект с данными о приходе и уходе
    * Интервал всегда начаинает с прихода, поэтому возможны два случая
    * (ent, ent) - такой интервал мы регистрируем, но ставим duration в 0, тк это проеб сотрудника
    * 
    * (ent, ext) - хороший интервал, то что нам надо :')
    */
    composition(){
        const employeeInstance = this;

        this.events.forEach( function(curr, idx, arr){
            const next = arr[idx+1]
            if (!next) return;

            var intrv = {
                card: employeeInstance.card,
                database: process.env.INCOMING_DATABASE_NAME
            }

            if (curr.dir === 'ent' && next.dir === 'ext'){
                intrv = {
                    ent: curr.time,
                    ext: next.time,
                    ...intrv,
                }
                employeeInstance.intervals.push(intrv);
            }
            else if (curr.dir === 'ent' && next.dir === 'ent'){
                intrv = {
                    ent: curr.time,
                    ext: 0,
                    ...intrv,
                }
                employeeInstance.intervals.push(intrv);
            }
            
        })
    }

    _logDetails(){
        detaillog.info('-'.repeat(80))
        detaillog.info(`${this.firstname} ${this.lastname} ${this.card}`)
        detaillog.info('Events after anticollision procedure and indeterminate sampling:')
        for( const event of this.events){
            var copy_event = Object.assign({}, event);
            copy_event.time = unix2timestamp(event.time)
            detaillog.info(JSON.stringify(copy_event))
        }

        detaillog.info('finally intervlas: ')
        for (const intr of this.intervals){
            var copy_intr = Object.assign({}, intr);
            copy_intr.ent = unix2timestamp(copy_intr.ent)
            copy_intr.ext = unix2timestamp(copy_intr.ext)
            detaillog.info(JSON.stringify(copy_intr))
        }
    }

}

export default Employee