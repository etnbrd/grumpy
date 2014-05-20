Twitter Like based on Fluxions
==============================
This is a prototype of a twitter like application based on Express and Fluxions.

How is it working ?
-------------------
- Each route has a fluxion associated which check that the parameters are set correctly.
- Each account is a fluxion and has an associated memory with :
    - The name of the account.
    - Tweets.
    - People follwed by this account.
    - People following this account. 
- One fluxion is used for the output.

For the moment, everything is done with the _GET_ method and there is no user interface. This will be added soon.

Authors
-------
- Etienne Brodu <etn@etnbrd.com>
- Guillaume Oberlé <goberle@ygg.tf>
