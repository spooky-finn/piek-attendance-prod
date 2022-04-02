## About integration module and our task
The tasks of this module are little bit. Algorithm detects a type of event (entrance or exit), composes an intervals with pair times and sending them on our backend.

This integration module allows you to view the working time statistics of companies employess for make a reports. The some few a ZK Access controllers was placed in the our objects. One controller has only one smart-card reader. For this reason, we are trying to determine the type of event (it was the entrance of employee, or exit) in this algorithm. Determination idea will be revealated a little later.

To convert so oldest Microsoft database as Access was used mdb-tools (aviable for linux and windows).
As the data finanal endpoint we are using Hasura graphql engine.

## Production configure

First of all, in path.txt on first line we must to keep a path to access database

on unix system path look like `/Users/fin/Documents/access.mdb`
however, on windows we mast to conclude a path in double quotes like that: `"C:/Program Files/Timeformer/access.mdb"`
