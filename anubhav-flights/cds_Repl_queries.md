
cd anubhav-flights
cds repl --run .

.target sap.capire.flights.FlightsService
> .ql
cql> SELECT from Airlines { ID, name, flights { origin { ID, name } } }


1. Simple query


cql> SELECT from Airports { ID, name, city, country }

2. WHERE clause


cql> SELECT from Flights { ID, date, price, currency, free_seats } where free_seats > 0 and price < 500

3. Expand associated entities


cql> SELECT from Flights { ID, date, price, airline { name, icon }, origin { name, city }, destination { name, city } }
4. Aggregation


cql> SELECT from Flights { airline.name as airline, count(*) as numFlights, avg(price) as avgPrice } group by airline.name order by numFlights desc

