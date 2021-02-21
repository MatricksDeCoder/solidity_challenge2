# Design Considerations, Problems and Challenges

Idea was to get a rough working draft and improve from there and then continue to make it
- more efficient 
- functions less expensive
- smart contract code smaller and simpler 
- make contracts more secure 

Smart contracts are very critical software as they hold and interact with real value and funds. The following design patterns were considered in developing exchange.

##### 1. Deposit Times 
Users who deposit amount at start of last Schedule and those who deposit stake just before end of blockSchedule benefit
the same if they stake equal amounts. A concept of time must be incorporated that takes into account time since lastSchedule
amount has been staked 

### 2. Admins have to manually reward stakers evey block cylce
Will look into using https://www.ethereum-alarm-clock.com/ Ethereum Clock
Clock functions or some scheduling may ensure rewards updated automatically 

### 3. Expensive Looping
Maybe let users call some function that will calculate and update their rewards as opposed to looping through all stakers 
to reward them 
