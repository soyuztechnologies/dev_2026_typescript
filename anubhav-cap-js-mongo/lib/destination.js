const cds = require('@sap/cds')
const { destinationError, LOG } = require('./errors')

/**
 * Reads a destination from the SAP BTP Destination service.
 *
 * Lookup order:
 *  1. SAP Cloud SDK (@sap-cloud-sdk/connectivity), if installed in the app - supports all binding types,
 *     caching and the `destinations` environment variable for local simulation.
 *  2. The `destinations` environment variable (JSON array, same format as used by the approuter / Cloud SDK).
 *  3. Direct REST call to the Destination service, using the bound destination service instance
 *     (VCAP_SERVICES, or cds.requires.destinations.credentials when running with `cds bind` / hybrid profile).
 *
 * @returns {Promise<{ url?: string, user?: string, password?: string, properties: object }>}
 */
async function readDestination(name, { useCache = true } = {}) {
  const sdk = _cloudSdk()
  if (sdk && (_vcapDestinationBinding() || process.env.destinations)) {
    let d
    try {
      d = await sdk.getDestination({ destinationName: name, useCache })
    } catch (e) {
      throw destinationError(name, e.message, e)
    }
    if (!d) throw destinationError(name, 'destination not found')
    const props = d.originalProperties?.destinationConfiguration || d.originalProperties || {}
    return { url: d.url ?? props.URL, user: d.username ?? props.User, password: d.password ?? props.Password, properties: props }
  }

  const fromEnv = _fromEnvVariable(name)
  if (fromEnv) return fromEnv

  const binding = _vcapDestinationBinding() || cds.env.requires.destinations?.credentials
  if (!binding && process.env.destinations) throw destinationError(name, 'destination not found in environment variable "destinations"')
  if (!binding) throw destinationError(name, 'no destination service instance is bound to the application')
  return _fromDestinationService(name, binding)
}

/** True if a destination can potentially be resolved in the current environment */
function canResolveDestinations() {
  return !!(_vcapDestinationBinding() || process.env.destinations || cds.env.requires.destinations?.credentials)
}

function _cloudSdk() {
  try {
    return require(require.resolve('@sap-cloud-sdk/connectivity', { paths: [cds.root, __dirname] }))
  } catch {
    return null
  }
}

function _vcapDestinationBinding() {
  let vcap
  try {
    vcap = JSON.parse(process.env.VCAP_SERVICES || '{}')
  } catch {
    return null
  }
  for (const type in vcap) {
    const found = vcap[type]?.find?.(b => b.label === 'destination' || b.tags?.includes('destination'))
    if (found?.credentials) return found.credentials
  }
  return null
}

function _fromEnvVariable(name) {
  if (!process.env.destinations) return null
  let list
  try {
    list = JSON.parse(process.env.destinations)
  } catch (e) {
    throw destinationError(name, 'environment variable "destinations" does not contain valid JSON', e)
  }
  const d = list.find?.(d => d.name === name)
  if (!d) return null
  LOG.debug?.(`Using destination "${name}" from environment variable "destinations"`)
  const { url, user, username, password, ...properties } = d
  return { url, user: user ?? username, password, properties }
}

async function _fromDestinationService(name, binding) {
  const { clientid, clientsecret, url: authUrl, uri } = binding
  if (!clientid || !clientsecret || !authUrl || !uri)
    throw destinationError(
      name,
      'the destination service binding does not contain clientid/clientsecret (certificate based bindings require @sap-cloud-sdk/connectivity: npm add @sap-cloud-sdk/connectivity)'
    )

  let token
  try {
    const res = await fetch(`${authUrl.replace(/\/$/, '')}/oauth/token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: 'Basic ' + Buffer.from(`${encodeURIComponent(clientid)}:${encodeURIComponent(clientsecret)}`).toString('base64')
      },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientid }).toString()
    })
    if (!res.ok) throw new Error(`token request failed with HTTP ${res.status}`)
    token = (await res.json()).access_token
  } catch (e) {
    throw destinationError(name, `cannot fetch an access token for the destination service (${e.message})`, e)
  }

  let body
  try {
    const res = await fetch(`${uri.replace(/\/$/, '')}/destination-configuration/v1/destinations/${encodeURIComponent(name)}`, {
      headers: { authorization: `Bearer ${token}` }
    })
    if (res.status === 404) throw destinationError(name, 'destination not found')
    if (!res.ok) throw new Error(`destination service returned HTTP ${res.status}`)
    body = await res.json()
  } catch (e) {
    if (e.code === 'MONGO_DESTINATION_FAILED') throw e
    throw destinationError(name, e.message, e)
  }

  const props = body.destinationConfiguration || {}
  return { url: props.URL, user: props.User, password: props.Password, properties: props }
}

module.exports = { readDestination, canResolveDestinations }
