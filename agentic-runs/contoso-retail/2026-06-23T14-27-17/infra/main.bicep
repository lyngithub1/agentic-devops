param location string = resourceGroup().location
param namePrefix string = 'aisle'

// Assistant API on Azure Container Apps (scale-to-zero)
module api 'modules/containerapp.bicep' = {
  name: 'api'
  params: { name: '${namePrefix}-api', location: location, minReplicas: 0, maxReplicas: 30 }
}

// Azure OpenAI + AI Search for grounded RAG
module aoai 'modules/openai.bicep' = { name: 'aoai', params: { name: '${namePrefix}-aoai', location: location } }
module search 'modules/search.bicep' = { name: 'search', params: { name: '${namePrefix}-search', location: location } }

// Cosmos DB for session memory + consented features (TTL enabled)
module cosmos 'modules/cosmos.bicep' = { name: 'cosmos', params: { name: '${namePrefix}-cosmos', location: location } }

// Managed identity role assignments (no secrets in code)
module rbac 'modules/rbac.bicep' = {
  name: 'rbac'
  params: { principalId: api.outputs.principalId, aoaiName: aoai.outputs.name, searchName: search.outputs.name }
}