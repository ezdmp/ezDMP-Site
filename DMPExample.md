# DMP Example

Below is an example of a DMP product. A product in this format is what would be delivered by a dmp service and what would be posted to an update service.

```
{
  "id": "unique-dmp-id",
  "user_id": "unique-user-id",
  "dmp": {
    "proposal": {
      "leadPi": "John Smith",
      "coPis": "Jane Doe",
      "title": "The ezDMP Project",
      "fundingDivision": "OCE",
      "solicitationInfo": "(optional)",
      "leadPiInstitution": "LDEO",
      "dataManagementOverview": "A brief summary of data products and analysis, including information about metadata standards, backups, ethics and privacy restrictions."
    },
    "products": [
      {
        "id": "unique-product-id-1",
        "current": true,
        "license": null,
        "archived": true,
        "productId": "polar",
        "repository": "AMGRF",
        "description": "This is the description and acquisition plan",
        "productType": "specimen",
        "dependencies": "",
        "productFormat": null,
        "relationships": [
          {
            "id": "unique-product-id-2",
            "relationship": "specimenMetadata"
          },
          {
            "id": "unique-product-id-3",
            "relationship": "relatedTo"
          }
        ],
        "releaseTimeline": "When metadata will become available",
        "anticipatedVolume": "# of specimens",
        "creationDescription": "How specimens will be preserved",
        "sharedInstrumentation": null,
        "durationOfAvailability": "How long specimens will be available for use",
        "responsibleInvestigators": "Smith"
      },
      {
        "id": "unique-product-id-2",
        "current": true,
        "license": null,
        "archived": true,
        "productId": "specimenMetadata",
        "repository": "Repository Name",
        "description": "",
        "productType": "metadata",
        "dependencies": "",
        "productFormat": null,
        "relationships": [
          {
            "id": "unique-product-id-1",
            "relationship": "specimen"
          }
        ],
        "releaseTimeline": "When metadata will become available",
        "anticipatedVolume": "",
        "creationDescription": null,
        "sharedInstrumentation": null,
        "durationOfAvailability": "",
        "responsibleInvestigators": "Smith"
      },
      {
        "id": "unique-product-id-3",
        "current": true,
        "license": "Apache",
        "archived": true,
        "productId": "geologyGeophys",
        "repository": "Coursera",
        "description": "Description of curriculum material",
        "productType": "curriculum",
        "dependencies": null,
        "productFormat": "Format of products",
        "relationships": [
          {
            "id": "unique-product-id-1",
            "relationship": "relatedTo"
          }
        ],
        "releaseTimeline": "Timeline for curriculum release",
        "anticipatedVolume": null,
        "creationDescription": "How will curriculum be developed.",
        "sharedInstrumentation": "",
        "durationOfAvailability": "",
        "responsibleInvestigators": "Smith"
      }
    ],
    "deletedProducts": []
  },
  "created": "2018-04-02T11:44:44.744Z",
  "modified": "2018-12-03T10:48:12.922Z",
  "current": true
}
```
