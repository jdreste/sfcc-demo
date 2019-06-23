/*
 * Service Name: http.zenkraft
 * Web service configuration for the Zenkraft API
 * Service is defined in Business Manger: Administration -> Operations -> Services
 */

var dwsvc = require('dw/svc');
var dwutil = require('dw/util');
var dwnet = require('dw/net');

/**
 * Zenkraft Rates Web Service Configuration
 */
dwsvc.ServiceRegistry.configure('http.zenkraft.rate', {
	createRequest: function (svc: dwsvc.HTTPService, request: Object) : Object {
		var site = dw.system.Site.current;
		
		// Get API key from site preference in the Zenkraft custom site preference group
		var zenkraftkey = site.getCustomPreferenceValue("zenkraftMasterAPIKey");

		svc.addHeader('zkkey', zenkraftkey);
		svc.addHeader('Accept', 'application/json');
		svc.addHeader('Content-Type', 'application/json');
			
		return !empty(request) ? request : {};
	},

	parseResponse: function(svc: dwsvc.HTTPService, client: dwnet.HTTPClient) {
		var data = client.text;

		data = JSON.parse(data);

		return data;
	}
});

/**
 * Zenkraft Shipping Label Web Service Configuration
 */
dwsvc.ServiceRegistry.configure('http.zenkraft.ship', {
	createRequest: function (svc: dwsvc.HTTPService, request: Object) : Object {
		var site = dw.system.Site.current;
		
		// Get API key from site preference in the Zenkraft custom site preference group
		var zenkraftkey = site.getCustomPreferenceValue("zenkraftMasterAPIKey");

		svc.addHeader('zkkey', zenkraftkey);
		svc.addHeader('Accept', 'application/json');
		svc.setRequestMethod('POST');
		svc.addHeader('Content-Type', 'application/json');
		
		return !empty(request) ? request : {};
	},

	parseResponse: function(svc: dwsvc.HTTPService, client: dwnet.HTTPClient) {
		var data = client.text;

		data = JSON.parse(data);

		return data;
	}
});

/**
 * Zenkraft Tracking Information Web Service Configuration
 */
dwsvc.ServiceRegistry.configure('http.zenkraft.track', {
	createRequest: function (svc: dwsvc.HTTPService, request: Object) : Object {
		var site = dw.system.Site.current;
		
		// Get API key from site preference in the Zenkraft custom site preference group
		var zenkraftkey = site.getCustomPreferenceValue("zenkraftMasterAPIKey");

		svc.addHeader('zkkey', zenkraftkey);
		svc.addHeader('Accept', 'application/json');
		svc.setRequestMethod('POST');
		svc.addHeader('Content-Type', 'application/json');
		
		return !empty(request) ? request : {};
	},

	parseResponse: function(svc: dwsvc.HTTPService, client: dwnet.HTTPClient) {
		var data = client.text;

		data = JSON.parse(data);

		return data;
	},
	
	mockCall: function(svc:Service, arg:Object) {
        return {"object": {
            "carrier": "USPS",
            "status": "Arrived at Post Office",
            "checkpoints": [
                {
                    "description": "Arrived at USPS Facility",
                    "location": {
                        "city": "TAMPA",
                        "country": null,
                        "postal_code": "33630",
                        "state": "FL"
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Departed USPS Regional Facility",
                    "location": {
                        "city": "TAMPA FL DISTRIBUTION CENTER",
                        "country": null,
                        "postal_code": null,
                        "state": null
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Arrived at USPS Regional Facility",
                    "location": {
                        "city": "TAMPA FL DISTRIBUTION CENTER",
                        "country": null,
                        "postal_code": null,
                        "state": null
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Return to Sender Processed",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Arrived at Post Office",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Out for Delivery",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Sorting Complete",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-15T00:00:00Z"
                },
                {
                    "description": "Unable to deliver item, problem with address",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-14T00:00:00Z"
                },
                {
                    "description": "Out for Delivery",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-14T00:00:00Z"
                },
                {
                    "description": "Sorting Complete",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-14T00:00:00Z"
                },
                {
                    "description": "Arrived at Post Office",
                    "location": {
                        "city": "BARTOW",
                        "country": null,
                        "postal_code": "33830",
                        "state": "FL"
                    },
                    "time": "2018-02-14T00:00:00Z"
                },
                {
                    "description": "Departed USPS Regional Facility",
                    "location": {
                        "city": "YBOR CITY FL DISTRIBUTION CENTER",
                        "country": null,
                        "postal_code": null,
                        "state": null
                    },
                    "time": "2018-02-13T00:00:00Z"
                },
                {
                    "description": "Arrived at USPS Regional Facility",
                    "location": {
                        "city": "YBOR CITY FL DISTRIBUTION CENTER",
                        "country": null,
                        "postal_code": null,
                        "state": null
                    },
                    "time": "2018-02-13T00:00:00Z"
                },
                {
                    "description": "Accepted at USPS Origin Facility",
                    "location": {
                        "city": "TAMPA",
                        "country": null,
                        "postal_code": "33634",
                        "state": "FL"
                    },
                    "time": "2018-02-13T00:00:00Z"
                },
                {
                    "description": "Shipment Received, Package Acceptance Pending",
                    "location": {
                        "city": "TAMPA",
                        "country": null,
                        "postal_code": "33630",
                        "state": "FL"
                    },
                    "time": "2018-02-13T00:00:00Z"
                },
                {
                    "description": "Shipping Label Created, USPS Awaiting Item",
                    "location": {
                        "city": "TAMPA",
                        "country": null,
                        "postal_code": "33634",
                        "state": "FL"
                    },
                    "time": "2018-02-13T00:00:00Z"
                },
                {
                    "description": "Pre-Shipment Info Sent to USPS, USPS Awaiting Item",
                    "location": {
                        "city": null,
                        "country": null,
                        "postal_code": null,
                        "state": null
                    },
                    "time": "2018-02-13T00:00:00Z"
                }
            ]
        }};
    }
});