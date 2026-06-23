targetScope = 'resourceGroup'

@description('Name of the Static Web App.')
param name string = 'agentic-devops-web'

@description('Location for the Static Web App. SWA is available in a limited set of regions.')
@allowed([
  'centralus'
  'eastus2'
  'westus2'
  'eastasia'
  'westeurope'
])
param location string = 'eastus2'

@description('SKU. Free includes preview/staging environments and is fine for demos.')
@allowed([
  'Free'
  'Standard'
])
param sku string = 'Free'

@description('Tags applied to all resources.')
param tags object = {
  workload: 'agentic-devops'
  managedBy: 'bicep'
}

resource staticSite 'Microsoft.Web/staticSites@2024-04-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    // Content is pushed by the GitHub Actions deploy workflow using a
    // short-lived deployment token obtained via OIDC — no repo-side build here.
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
    enterpriseGradeCdnStatus: 'Disabled'
  }
}

@description('The Static Web App resource name (set as the AZURE_SWA_NAME repo variable).')
output staticWebAppName string = staticSite.name

@description('Default public hostname for the deployed app.')
output defaultHostname string = staticSite.properties.defaultHostname
