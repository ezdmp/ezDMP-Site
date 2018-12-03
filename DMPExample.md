# DMP Format and Services

The DMP data format is described below. Services are as follows. All are accompanied with JWT headers for authentication on ezdmp.org, but may be designed without them.

**/api/dmps**

GET

Returns all dmp objects belonging to a user

&nbsp;

**/api/dmp**

POST: `{'id': dmp_unique_id}`

Returns a dmp object corresponding to the unique id in the POST request

&nbsp;

**/api/newDmp**

POST

Returns an empty dmp object with a unique identifier.

**/api/updateDmp**

POST: `{ dmp_id : unique_dmp_id, dmp: {dmp json object as below}}`

Updates a dmp object and returns the updated object

&nbsp;

**/api/deleteDmp**

POST: `{ dmp_id : unique_dmp_id }`

Removes a dmp object from a users dmps.

&nbsp;


**/api/pdf/[id]**

GET

Returns the data management plan in pdf format

&nbsp;

**/api/pageCount/[id]**

GET

Returns the number of pages in a data management plan for verification purposes

&nbsp;

**/api/newProduct**

POST: `{ product_type : type , dmp_id: unique_dmp_id }`

Creates a new product and returns the updated dmp object with the product included

&nbsp;

All other object manipulation is done client side

## Example

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
