/**
 * Analytical queries executed against SQLite (reference, see expected.json) and MongoDB.
 * `unordered` results are compared as sets, numbers with a small tolerance (SQLite sums
 * decimals as floating point numbers, MongoDB with exact Decimal128 arithmetic).
 */
const S = 'sales.Sales'

const cql = {
  // --- orderBy, top / skip ---
  'orderBy multiple columns asc/desc': ({ SELECT }) => SELECT.from(S).columns('ID', 'region', 'amount').orderBy('region', 'amount desc', 'ID').limit(8),
  'limit with offset (top 5 skip 10)': ({ SELECT }) => SELECT.from(S).columns('ID').orderBy('ID').limit(5, 10),
  'orderBy expression': ({ SELECT }) => SELECT.from(S).columns('ID', 'quantity', 'amount').orderBy('quantity * 2 desc', 'ID').limit(5),
  'orderBy alias of calculated column': ({ SELECT }) => SELECT.from(S).columns('ID', 'amount / quantity as unit').orderBy('unit desc', 'ID').limit(5),
  'orderBy to-one path (product.name)': ({ SELECT }) => SELECT.from(S).columns('ID', 'product.name as productName').orderBy('product.name', 'ID').limit(6),
  'orderBy nullable column': ({ SELECT }) => SELECT.from(S).columns('ID', 'channel').where('ID < 30').orderBy('channel', 'ID'),

  // --- aggregates ---
  'count(*) on the whole table': ({ SELECT }) => SELECT.one.from(S).columns('count(*) as n'),
  'sum / avg / min / max': ({ SELECT }) => SELECT.one.from(S).columns('sum(amount) as total', 'avg(quantity) as avgQty', 'min(amount) as lo', 'max(amount) as hi'),
  'aggregates with where': ({ SELECT }) => SELECT.one.from(S).columns('count(*) as n', 'sum(quantity) as qty').where({ year: 2024, region: 'EMEA' }),
  'aggregates over empty set': ({ SELECT }) => SELECT.one.from(S).columns('count(*) as n', 'sum(amount) as total', 'max(amount) as hi').where({ year: 1999 }),
  'count(column) skips nulls': ({ SELECT }) => SELECT.one.from(S).columns('count(*) as all', 'count(channel) as withChannel', 'count(discount) as withDiscount'),
  'countdistinct': ({ SELECT }) => SELECT.one.from(S).columns('countdistinct(country) as countries', 'countdistinct(product_ID) as products'),
  'min / max on dates and strings': ({ SELECT }) => SELECT.one.from(S).columns('min(date) as first', 'max(date) as last', 'min(country) as c1', 'max(country) as c2'),
  'aggregate of an expression': ({ SELECT }) => SELECT.one.from(S).columns('sum(quantity * 2) as dbl', 'sum(amount) / count(*) as avgAmount'),

  // --- groupBy / having ---
  'groupBy one column': ({ SELECT }) => SELECT.from(S).columns('region', 'count(*) as n', 'sum(amount) as total').groupBy('region').orderBy('region'),
  'groupBy two columns, orderBy aggregate desc': ({ SELECT }) =>
    SELECT.from(S).columns('region', 'year', 'sum(amount) as total').groupBy('region', 'year').orderBy('total desc', 'region', 'year'),
  'groupBy with having': ({ SELECT }) => SELECT.from(S).columns('country', 'count(*) as n').groupBy('country').having('count(*) > 15').orderBy('country'),
  'having on aggregate not in columns': ({ SELECT }) => SELECT.from(S).columns('country').groupBy('country').having('sum(quantity) > 200').orderBy('country'),
  'groupBy + top/skip of groups': ({ SELECT }) => SELECT.from(S).columns('country', 'sum(quantity) as qty').groupBy('country').orderBy('qty desc', 'country').limit(3, 1),
  'groupBy + where + orderBy groupBy column desc': ({ SELECT }) =>
    SELECT.from(S).columns('year', 'avg(amount) as avgAmount', 'max(quantity) as maxQty').where({ channel: 'Online' }).groupBy('year').orderBy('year desc'),
  'groupBy foreign key': ({ SELECT }) => SELECT.from(S).columns('product_ID', 'count(*) as n').groupBy('product_ID').orderBy('product_ID'),
  'groupBy to-one path (product.category)': ({ SELECT }) =>
    SELECT.from(S).columns('product.category as category', 'sum(amount) as total', 'count(*) as n').groupBy('product.category').orderBy('category'),
  'groupBy path, orderBy the grouped path and an aggregate, top/skip': ({ SELECT }) =>
    SELECT.from(S).columns('product.name as productName', 'count(*) as n', 'sum(quantity) as qty').groupBy('product.name').having('count(*) >=', 15).orderBy('qty desc', 'product.name').limit(3, 1),
  'orderBy grouped column not in the column list': ({ SELECT }) => SELECT.from(S).columns('sum(amount) as total').groupBy('year').orderBy('year desc'),
  'groupBy nullable column': ({ SELECT }) => SELECT.from(S).columns('channel', 'count(*) as n').groupBy('channel'),
  'distinct': ({ SELECT }) => SELECT.distinct.from(S).columns('region', 'year').orderBy('region', 'year'),
  'distinct + limit': ({ SELECT }) => SELECT.distinct.from(S).columns('country').orderBy('country desc').limit(3),

  // --- filters typically combined with analytics ---
  'where with in, between, like, path': ({ SELECT }) =>
    SELECT.from(S)
      .columns('ID')
      .where(`region in ('EMEA','APJ') and quantity between 5 and 10 and country like 'D%' and product.category = 'Hardware'`)
      .orderBy('ID'),
  'where with or / not / null': ({ SELECT }) => SELECT.from(S).columns('ID').where(`(channel is null or discount is null) and not (year = 2023)`).orderBy('ID'),
  'count with $count and paging': ({ SELECT }) => {
    const q = SELECT.from(S).columns('ID').where({ region: 'AMER' }).orderBy('ID').limit(4, 2)
    q.SELECT.count = true
    return q
  }
}

const odata = {
  '$apply groupby + sum': '/odata/v4/analytics/Sales?$apply=groupby((region),aggregate(amount with sum as total))&$orderby=region',
  '$apply groupby 2 + average, $orderby, $top': '/odata/v4/analytics/Sales?$apply=groupby((region,year),aggregate(amount with average as avg))&$orderby=avg desc&$top=3',
  '$apply aggregate without groupby': '/odata/v4/analytics/Sales?$apply=aggregate(amount with sum as total,quantity with max as maxQty)',
  '$apply filter then groupby $count': '/odata/v4/analytics/Sales?$apply=filter(year eq 2024)/groupby((region),aggregate($count as n))&$orderby=region',
  '$apply countdistinct': '/odata/v4/analytics/Sales?$apply=groupby((region),aggregate(country with countdistinct as countries))&$orderby=region',
  '$apply min/max + $skip': '/odata/v4/analytics/Sales?$apply=groupby((country),aggregate(amount with min as lo,amount with max as hi))&$orderby=country&$skip=2&$top=3',
  '$apply with $count=true': '/odata/v4/analytics/Sales?$apply=groupby((channel),aggregate(quantity with sum as qty))&$count=true&$orderby=channel',
  '$apply groupby navigation path': '/odata/v4/analytics/Sales?$apply=groupby((product/category),aggregate(amount with sum as total))&$orderby=total desc',
  '$apply groupby only': '/odata/v4/analytics/Sales?$apply=groupby((year))&$orderby=year',
  '$apply orderby/top transformations': '/odata/v4/analytics/Sales?$apply=groupby((country),aggregate(quantity with sum as qty))/orderby(qty desc)/top(2)',
  '$orderby, $top, $skip, $filter, $count (no $apply)': `/odata/v4/analytics/Sales?$filter=amount gt 1000 and region ne 'APJ'&$orderby=amount desc,ID&$top=5&$skip=5&$count=true&$select=ID,amount,region`
}

module.exports = { cql, odata, unordered: new Set(['groupBy nullable column']) }
