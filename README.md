# ezDMP-Site

Data Management Plans (DMP) are an important component of enabling reproducibility and are now required for most federally funded grants. The National Science Foundation(NSF) in particular, has created guidelines for producing these plans. Until recently, most data management plans have been free text, and it can be difficult for investigators to know exactly what NSF requires or how it should be organized. Likewise, it can also be difficult for NSF to understand the disposition of data resulting from research efforts. ezDMP was developed to ensure that investigators provide everything that NSF wants to see in a clear, organized way and to allow NSF to collect meaningful analytics about data compliance.

ezDMP is based on the [Interdisciplinary Earth Data Alliance (IEDA)](https://www.iedadata.org/) Data Management Tool and free to all investigators. The user interface includes logic to that allows easy input and connection of proposed data products and provides suggestions and information specific to the NSF directorate and subdiscipline to ensure that users find the right solutions for long-term data management. Users can then download an NSF compliant data management plan PDF that can be submitted directly along with their proposal.

## ezDMP Site Installation

These files comprise the client-side logic for ezDMP, along with information about the server side formats sufficient to create a data management plan site.

In the `config/` directory, create a `config.development.json` and `config.production.json` file based on the generic `config.json` file located there. These files will contain a `base` value, which should be the base url for the server the site will be implemented on; an `api` path, which will either be a subpath of the base url corresponding to the API address (e.g. `/api/`) or a full url to the API (e.g. `https://www.ezdmp.org/api`); a Google public API key `apiKey`, a Google client ID `clientId`, and a `redirectUri` value for optional authentication.

Once this information has been correctly filled in, run `npm install` and use your preferred web server to set the home directory to `public/`.

### ezDMP data management plan json format
ezDMP stores its information in a json object. An example of this DMP object used by this interface is available [here](DMPExample.md).

All ezDMP dictionaries are available here:

[Subdisciplines](http://www.ezdmp.org/api/subdisciplines)

[Licenses](http://www.ezdmp.org/api/licenses)

[Repositories](http://www.ezdmp.org/api/repositories)

[Directorates](http://www.ezdmp.org/api/directorates)

[Divisions](http://www.ezdmp.org/api/divisions)

[Product Types](http://www.ezdmp.org/api/product_types)

[Product Relationship Types](http://www.ezdmp.org/api/relation_types)

&nbsp;

This project can either be implemented with the ezDMP API url or with a custom API, provided it manages DMP objects as documented in [the DMP Example](DMPExample.md) and provides links to the dictionary files downloaded from above. For security purposes, server side handling of user information is beyond the scope of this article. The ezDMP site uses JWT Authorization headers for this purpose with the Satellizer AngularJS library. Authentication in this interface is optional but provides an additional level of security.

## Credits

ezDMP is funded by an NSF EAGER grant to K. Lehnert and V. Ferrini 
                  (Columbia University, [1649703](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1649703)), H.M. Berman (Rutgers University, [1649545](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1649545)),
                  and V.C. Stodden (University of Illinois, Urbana-Campaign, [1649555](https://www.nsf.gov/awardsearch/showAward?AWD_ID=1649555)). 
                  
## License

MIT License

Copyright 2018 ezDMP

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
