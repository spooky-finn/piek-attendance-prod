import fs from 'fs'

/*
 * Object was looked like when the key of property - the fieldname in table
 * and value id filename on return
 */
export function parse_cvs_file(path, required_object){
    return new Promise( function(resolve, reject){ 
        fs.readFile(path, { encoding: 'utf-8' }, (err, buffer) => {
            if (err) reject(err);
            // Retrieve the column headers in a csv table
            const headers =  buffer.split('\n')[0].split(',');
            const lines = buffer.split('\n').slice(1);
    
            // In this case, we're changing a text value 
            //in required_object to a column number in the table.
            for (var require_field of Object.entries(required_object)){
                const column_id = headers.findIndex( column_name => column_name === require_field[1] )
                required_object[require_field[0]] = column_id
            }
            
            var parsed_objects = new Array()
    
            for (const line of lines){
                // Remove all double quories from this line's values.
                const values = line.split(',').map( value => value.replace(/['"]+/g, ''))
    
                var new_object = {}
    
                for (const property in required_object){
                    const obtained_value = values[required_object[property]] || ''
                    new_object = {
                        ...new_object,
                        [property]: obtained_value
                    }
                }
                parsed_objects.push(new_object)
            }
            resolve(parsed_objects)
        })
    })
}

