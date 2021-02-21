# Avoiding Common Attacks, Dangers and the Security Considerations 

Smart contracts are very critical software as they hold and interact with real value and funds. As such a lot of common attacks were kept in mind and safeguarded against in addition to various security considerations and checks. 


##### 1. Overflows and underflows 
The EVM has fixed size data types eg uint8 can only store numbers in the range [0,255]. If balances exceed 255 we go back to 0. Library SafeMath from Open Zeppelin is used to prevent overflows and underflows. Example in function below update to state for balances uses functions like .add() or .sub() to add or subtract with overflow and underflow safety  

##### 3. Visibility Specifiers
Functions that need to be internal are marked as so to avoid them being called maliciously from outside e.g our _witdhraw() function in Staker .

##### 4. Testing
JavaScript testing of all the smart contracts used was use to ensure contracts behave as expected. 
See test folder 

##### 5. Owners for sepcific functions and avoid (Single party risk)
Some functions require onlyOwner like reward(), mint() . Additionally we made owners at least 3 to aovid single party risk. **In future we look to implement multisig contracts for Staker and RewardToken contracts.** 

##### 6. Security Analysis tools
Static analysis, vulnerability checking, smart contract auditing, formal verification, symbolic analysis., security bug checking tools like [Mythx](https://mythx.io/), [SmartCheck](https://tool.smartdec.net/) and [Mythril](https://github.com/ConsenSys/mythril) will be used in future to Audit, Check, Look for Vulnerabilities in Contracts
