git checkout -b mtx

git push origin mtx

cds add multitenancy 
	- profile, node module, 

npm install

app router config added /cds/ - mtx-api

mta.yaml - explain the mtx module (saas registery) will take care of db deploy
         - an app router added which is useless so we just take the info and move to our app router
	 - properties: tenant_host, provides section
	 - remove the app router which was added

commit and push

Now testing locally
	- add the ananya { tenant : 't2' } and for Anubhav { tenant : 't1' }
	- In terminal 1, We will now start the on-boarding side car app cds watch mtx/sidecar    4005
	- In terminal 2, We will start the actual multi-tenant app cds watch --with-mtx                  4004
	- In the third terminal 3, we subscribe app to tenants – cds subscribe t1 --to http://localhost:4005

Change xs-security tenant mode to shared

mbt build - deploy

open new sub account and create subscription

When run error come for route issue - create route by going inside the app in dev space in PROVIDER ACCOUNT Routes bind it with the data center, app end point , path blank and bind to ui app