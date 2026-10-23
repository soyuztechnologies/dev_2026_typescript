const cds = require('@sap/cds')

/**
 * Central error handling for @anubhav-cap-js/mongo.
 *
 * Every error raised by this plugin carries
 *  - a `status` (HTTP status the CAP protocol adapters will use),
 *  - a stable `code` (prefixed with MONGO_ unless it is a CAP standard code),
 *  - a human readable `message` with a hint on how to fix the problem,
 *  - the original driver error as `cause` (never exposed to HTTP clients in production).
 */

const HINTS = {
  network:
    'Check that the cluster host is correct and reachable. For MongoDB Atlas, add the outbound IP addresses of your ' +
    'SAP BTP region (or 0.0.0.0/0 for a quick test) to "Network Access > IP Access List".',
  auth:
    'Check user name and password of the database user (Atlas: "Database Access"). ' +
    'Passwords are taken from cds.requires["anubhav-mongo"].credentials or from the BTP destination.',
  config:
    'Configure cds.requires["anubhav-mongo"] in package.json / .cdsrc.json with either "url" + "credentials" (local) ' +
    'or "destination" (SAP BTP). See the README of @anubhav-cap-js/mongo.'
}

class MongoCapError extends Error {
  constructor(status, code, message, cause, details) {
    super(message, cause ? { cause } : undefined)
    this.status = status
    this.code = code
    // SECURITY: CAP copies all enumerable error properties into HTTP responses - only `target`
    // (used for field-level messages) is exposed, other details stay available to server code only
    for (const [k, v] of Object.entries(details || {})) {
      if (k === 'target') this.target = v
      else Object.defineProperty(this, k, { value: v, enumerable: false, writable: true, configurable: true })
    }
  }
}
Object.defineProperty(MongoCapError.prototype, 'name', { value: 'MongoCapError', enumerable: false, writable: true, configurable: true })

const error = (status, code, message, cause, details) => new MongoCapError(status, code, message, cause, details)

const configError = (message, cause) => error(500, 'MONGO_CONFIG_INVALID', `${message}\n${HINTS.config}`, cause)

const unsupported = (feature, details) =>
  error(501, 'MONGO_NOT_SUPPORTED', `${feature} is not supported by the MongoDB database service (@anubhav-cap-js/mongo).`, undefined, details)

const badInput = (message, details) => error(400, 'MONGO_INVALID_VALUE', message, undefined, details)

const destinationError = (name, message, cause) =>
  error(
    503,
    'MONGO_DESTINATION_FAILED',
    `Could not read connection details from SAP BTP destination "${name}": ${message}. ` +
      'Check that the destination exists in your subaccount, that a destination service instance is bound to the ' +
      'app, and that the destination has a URL plus BasicAuthentication user/password.',
    cause
  )

/**
 * Removes the password and all connection string options (which may carry tokens, e.g.
 * authMechanismProperties=AWS_SESSION_TOKEN:...) from connection strings, so they can be logged safely
 */
const maskUrl = url => (typeof url === 'string' ? url.replace(/\?.*$/s, '').replace(/(\/\/[^:/@]+:)[^@]*@/, '$1***@') : url)

const NETWORK_ERRORS = new Set([
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoTopologyClosedError'
])

const isAuthError = err => err?.code === 18 || err?.codeName === 'AuthenticationFailed' || /auth(entication)? failed/i.test(err?.message)
const isNetworkError = err => NETWORK_ERRORS.has(err?.name) || /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|querySrv/i.test(err?.message)

/**
 * Translates errors from the MongoDB node driver to errors CAP can handle.
 * @param {Error} err - the original error
 * @param {object} [ctx] - context, e.g. { url, entity, operation }
 */
function translate(err, ctx = {}) {
  if (!err || err instanceof MongoCapError || err.status) return err
  const where = ctx.entity ? ` (entity: ${ctx.entity})` : ''

  if (isAuthError(err))
    return error(503, 'MONGO_AUTHENTICATION_FAILED', `MongoDB authentication failed for ${maskUrl(ctx.url) || 'the configured cluster'}. ${HINTS.auth}`, err)

  if (isNetworkError(err))
    return error(503, 'MONGO_CONNECTION_FAILED', `Cannot reach MongoDB at ${maskUrl(ctx.url) || 'the configured cluster'}: ${err.message}. ${HINTS.network}`, err)

  if (err.code === 11000 || err.code === 11001) {
    // duplicate key: distinguish primary key (CAP: ENTITY_ALREADY_EXISTS) from other unique constraints
    const index = /index: (\S+)/.exec(err.message)?.[1] || err.errorResponse?.keyPattern
    const isPK = !index || /cap_pk/.test(String(index))
    const keyValue = err.keyValue || err.errorResponse?.keyValue
    return error(
      400,
      isPK ? 'ENTITY_ALREADY_EXISTS' : 'UNIQUE_CONSTRAINT_VIOLATION',
      isPK ? 'ENTITY_ALREADY_EXISTS' : 'UNIQUE_CONSTRAINT_VIOLATION',
      err,
      { target: ctx.entity, keyValue }
    )
  }

  if (err.code === 112 || err.errorLabels?.includes?.('TransientTransactionError') || err.hasErrorLabel?.('TransientTransactionError'))
    return error(409, 'MONGO_WRITE_CONFLICT', `The data was changed concurrently by another transaction${where}. Please retry.`, err)

  if (err.code === 13 || err.codeName === 'Unauthorized')
    return error(403, 'MONGO_NOT_AUTHORIZED', `The MongoDB user is not authorized for this operation${where}: ${err.message}`, err)

  if (/Transaction numbers are only allowed|does not support retryable writes|transactions are not supported/i.test(err.message))
    return error(
      500,
      'MONGO_TRANSACTIONS_UNSUPPORTED',
      'This MongoDB server does not support transactions (standalone server). Use a replica set / MongoDB Atlas, or set "transactions": false in cds.requires["anubhav-mongo"].',
      err
    )

  if (err.code === 121) return error(400, 'MONGO_VALIDATION_FAILED', `Document failed MongoDB schema validation${where}`, err)

  if (/Regular expression is invalid/i.test(err.message)) return error(400, 'MONGO_INVALID_VALUE', 'Invalid regular expression', err)

  if (err.code === 50 || err.codeName === 'MaxTimeMSExpired')
    return error(504, 'MONGO_TIMEOUT', `The MongoDB query exceeded the configured time limit (maxTimeMS)${where}`, err)

  if (err.name?.startsWith?.('Mongo') || err.name === 'BSONError')
    return error(500, 'MONGO_ERROR', `MongoDB ${ctx.operation || 'operation'} failed${where}: ${err.message}`, err)

  return err
}

module.exports = { MongoCapError, error, configError, unsupported, badInput, destinationError, translate, maskUrl, isAuthError, isNetworkError, HINTS, LOG: cds.log('mongo|db') }
