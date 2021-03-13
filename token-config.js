//const startTime = Math.round((new Date().getTime() + (86400000 * 1))/1000); // 1 day from now
//const  endTime = Math.round((new Date().getTime() + (86400000 * 5))/1000); // 5 days from now

// Will use ganache to move time forward
//ganache-cli --time ‘2021-04-01T15:00:00+00:00’ (Start)

// Utils https://www.epochconverter.com/ unix time converter

// Timestamp in seconds
// Example transfers open 1 April 2021- 2 April 2021 for a day e.g (24 hours window period)
// Ensure startTime is value ahead of the running of tests 
const startTime = 1617289200 //Date and time (GMT): Thursday, April 1, 2021 3:00:00 PM
const endTime   = 1617375600 //Date and time (GMT): Friday, April 2, 2021 3:00:00 PM

module.exports = {
    totalSupply: 1000000,
    name : 'Token',
    symbol: 'Token',
    decimal: 18,
    startTime,
    endTime 
}

