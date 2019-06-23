/**
* Model for working with the Zenkraft API
*
* @module cartridge/scripts/models/ZenkraftModel
*/

'use strict';

var dwsvc = require('dw/svc');
var Site = require('dw/system/Site');
var Logger = require('dw/system/Logger');
var Money = require('dw/value/Money');
var ShippingMgr = require('dw/order/ShippingMgr');
var LineItemCtnr = require('dw/order/LineItemCtnr');
var HashMap = require('dw/util/HashMap');
var Email = require('*/cartridge/scripts/models/EmailModel');

/**
* Retrieves object with preferences for Zenkraft. The data is retrieved from the 
* Advanced JSON Configuration Object
* 
* @param {String} Type of preference: SHIP/RETURN
* @param {String} Country Code for 'Ship to' Address
*
* @return {Object} JSON Object of Site Preference Values
*/
var getAdvancedJSONPreferences = function(type,countrycode) {
    return {
        IS_TEST: !(Site.getCurrent().getCustomPreferenceValue('zenkraftProdMode')),
        CARRIER: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnsCarrier'),
        SHIPPING_SERVICE: Site.getCurrent().getCustomPreferenceValue('zenkraftShippingService'),
        PACKAGING: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnsPackagingType'),
        DIM_UNITS: Site.getCurrent().getCustomPreferenceValue('zenkraftDimensionUnits'),
        WEIGHT_UNITS: Site.getCurrent().getCustomPreferenceValue('zenkraftWeightUnits'),
        DEFAULT_WEIGHT: Site.getCurrent().getCustomPreferenceValue('zenkraftDefaultProductWeight'),
        CURRENCY: Site.getCurrent().getCustomPreferenceValue('zenkraftCurrencyCode'),
        SHIP_ACCOUNT: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnsShippingAccount'),
        SENDER_EMAIL: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientEmail'),
        SENDER_NAME: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientName'),
        SENDER_COMPANY: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientCompany'),
        SENDER_STREET: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientStreet'),
        SENDER_CITY: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientCity'),
        SENDER_STATE: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientStateCode') || "",
        SENDER_POSTAL: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientPostalCode').replace(/\s+/g, ''),
        SENDER_COUNTRY: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientCountryCode'),
        SENDER_PHONE: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientPhone'),
        LABEL_TYPE: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnLabelFileType')
    };
}

/**
* Retrieves object with preferences for Zenkraft Shipping Methods/Rates
*
* @return {Object} JSON Object of Site Preference Values
*/
var getZenkraftShippingRatePreferences = function() {
    return {
        IS_TEST: !(Site.getCurrent().getCustomPreferenceValue('zenkraftProdMode')),
        CARRIER: Site.getCurrent().getCustomPreferenceValue('zenkraftCarrier'),
        SHIPPING_SERVICE: Site.getCurrent().getCustomPreferenceValue('zenkraftShippingService'),
        PACKAGING: Site.getCurrent().getCustomPreferenceValue('zenkraftPackagingType'),
        DIM_UNITS: Site.getCurrent().getCustomPreferenceValue('zenkraftDimensionUnits'),
        WEIGHT_UNITS: Site.getCurrent().getCustomPreferenceValue('zenkraftWeightUnits'),
        DEFAULT_WEIGHT: Site.getCurrent().getCustomPreferenceValue('zenkraftDefaultProductWeight'),
        CURRENCY: Site.getCurrent().getCustomPreferenceValue('zenkraftCurrencyCode'),
        SHIP_ACCOUNT: Site.getCurrent().getCustomPreferenceValue('zenkraftShippingAccount'),
        SENDER_EMAIL: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderEmail'),
        SENDER_NAME: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderName'),
        SENDER_COMPANY: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderCompany'),
        SENDER_STREET: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderStreet'),
        SENDER_CITY: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderCity'),
        SENDER_STATE: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderStateCode') || "",
        SENDER_POSTAL: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderPostalCode').replace(/\s+/g, ''),
        SENDER_COUNTRY: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderCountryCode'),
        SENDER_PHONE: Site.getCurrent().getCustomPreferenceValue('zenkraftSenderPhone'),
        LABEL_TYPE: Site.getCurrent().getCustomPreferenceValue('zenkraftShipLabelFileType')
    };
}

/**
* Retrieves object with preferences for Zenkraft Shipping Return Labels
*
* @return {Object} JSON Object of Site Preference Values
*/
var getZenkraftReturnLabelPreferences = function() {
    return {
        IS_TEST: !(Site.getCurrent().getCustomPreferenceValue('zenkraftProdMode')),
        CARRIER: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnsCarrier'),
        SHIPPING_SERVICE: Site.getCurrent().getCustomPreferenceValue('zenkraftShippingService'),
        PACKAGING: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnsPackagingType'),
        DIM_UNITS: Site.getCurrent().getCustomPreferenceValue('zenkraftDimensionUnits'),
        WEIGHT_UNITS: Site.getCurrent().getCustomPreferenceValue('zenkraftWeightUnits'),
        DEFAULT_WEIGHT: Site.getCurrent().getCustomPreferenceValue('zenkraftDefaultProductWeight'),
        CURRENCY: Site.getCurrent().getCustomPreferenceValue('zenkraftCurrencyCode'),
        SHIP_ACCOUNT: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnsShippingAccount'),
        SENDER_EMAIL: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientEmail'),
        SENDER_NAME: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientName'),
        SENDER_COMPANY: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientCompany'),
        SENDER_STREET: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientStreet'),
        SENDER_CITY: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientCity'),
        SENDER_STATE: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientStateCode') || "",
        SENDER_POSTAL: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientPostalCode').replace(/\s+/g, ''),
        SENDER_COUNTRY: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientCountryCode'),
        SENDER_PHONE: Site.getCurrent().getCustomPreferenceValue('zenkraftRecipientPhone'),
        LABEL_TYPE: Site.getCurrent().getCustomPreferenceValue('zenkraftReturnLabelFileType')
    };
}

/**
* Set or Clear the saved shipping rates that are stored in a session variable
*
* @param {Object} JSON Object of Shipping Methods and Rates. If empty, clear session variable 
*/
var updateSessionShippingRates = function(rates) {
	if( empty(rates) ) {
		if( !empty(session.custom.zenkraftCosts) ) {
			session.custom.zenkraftCosts.clear();
		}
	} else {
		session.custom.zenkraftCosts = rates;
	}
	
	return;
}

/**
* Create the object that will be passed in the /rates API call
*
* @return {Object} JSON Object of Request Data
*/
var getShippingRateRequest = function(address, basket : LineItemCtnr) {
	var req = {}, sender = {}, recipient = {}, packages = [];
	var prefs = getZenkraftShippingRatePreferences();
	
	// build shipment
	req.shipment = {};
	req.shipment.test = prefs.IS_TEST;
	req.shipment.carrier = prefs.CARRIER;
	req.shipment.type = "outbound";
	req.shipment.dim_units = prefs.DIM_UNITS.value;
	req.shipment.weight_units = prefs.WEIGHT_UNITS.value;
	req.shipment.currency = prefs.CURRENCY;
	req.shipment.packaging = prefs.PACKAGING;
	req.shipment.shipping_account = new dw.util.BigInteger(prefs.SHIP_ACCOUNT).valueOf();
	
	// build sender data
	sender.street1 = prefs.SENDER_STREET;
	sender.city = prefs.SENDER_CITY;
	sender.state = prefs.SENDER_STATE;
	sender.postal_code = prefs.SENDER_POSTAL;
	sender.country = prefs.SENDER_COUNTRY;
	req.shipment.sender = sender;
	
	// build recipient data from user address
	recipient.street1 = !empty(address.address1) ? address.address1 : "";
	recipient.city = !empty(address.city) ? address.city : "";
	recipient.state = !empty(address.stateCode) && address.stateCode != 'undefined' ? address.stateCode : "";
	recipient.postal_code = !empty(address.postalCode) ? address.postalCode : "";
	recipient.country = !empty(address.countryCode) ? address.countryCode.toUpperCase() : "";
	req.shipment.recipient = recipient;
	
	// build packages using current cart
	var productLineItems = basket.getAllProductLineItems().iterator();
	
	while (productLineItems.hasNext()) {
		let productLineItem = productLineItems.next();
		let product = productLineItem.product;
		
        let package = {
            "weight":!empty(product.custom.dimWeight) ? product.custom.dimWeight : 1,
            "value": 1,
            "length":!empty(product.custom.length) ? product.custom.length : 1,
            "width":!empty(product.custom.dimWidth) ? product.custom.dimWidth : 1,
            "height":!empty(product.custom.dimHeight) ? product.custom.dimHeight : 1
         };
		
        packages.push(package);
	}
	req.shipment.packages = packages;
	
	return req;
}

/**
* Create the object that will be passed in the /ship API call
*
* @return {Object} JSON Object of Request Data
*/
var getShippingLabelRequest = function(order, type, products) {
	var req = {}, sender = {}, recipient = {}, packages = [], references = [], prefs, shipservice;
	var defShipment = order.getDefaultShipment();
	var address = defShipment.shippingAddress;
	
	// Get appropriate preferences and shipping service for the situation
	if( type == 'outbound' ) {
		prefs = getZenkraftShippingRatePreferences();
		shipservice = defShipment.shippingMethod.custom.zenkraftID;
	} else {
		prefs = getZenkraftReturnLabelPreferences();
		shipservice = prefs.SHIPPING_SERVICE;
	}
	
	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth() + 1;
	var y = date.getFullYear();

	var dateString = y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	
	// build shipment
	req.shipment = {};
	req.shipment.test = prefs.IS_TEST;
	req.shipment.debug = prefs.IS_TEST;
	req.shipment.carrier = prefs.CARRIER;
	req.shipment.service = shipservice;
	req.shipment.ship_date = dateString;
	req.shipment.type = !empty(type) ? type : "return";
	req.shipment.packaging = prefs.PACKAGING;
	req.shipment.dim_units = prefs.DIM_UNITS.value;
	req.shipment.weight_units = prefs.WEIGHT_UNITS.value;
	req.shipment.currency = prefs.CURRENCY;
	req.shipment.shipping_account = new dw.util.BigInteger(prefs.SHIP_ACCOUNT).valueOf();
	req.shipment.label_type = prefs.LABEL_TYPE;
	
	// build recipient data
	recipient.email = prefs.SENDER_EMAIL;
	recipient.street1 = prefs.SENDER_STREET;
	recipient.company = !empty(prefs.SENDER_COMPANY) ? prefs.SENDER_COMPANY : "";
	recipient.phone = !empty(prefs.SENDER_PHONE) ? prefs.SENDER_PHONE : "";
	recipient.city = prefs.SENDER_CITY;
	recipient.state = prefs.SENDER_STATE;
	recipient.postal_code = prefs.SENDER_POSTAL;
	recipient.country = !empty(prefs.SENDER_COUNTRY) ? prefs.SENDER_COUNTRY.toUpperCase() : "US";
	recipient.name = !empty(prefs.SENDER_NAME) ? prefs.SENDER_NAME : "";
	
	// build sender data from order address
	sender.street1 = !empty(address.address1) ? address.address1 : "";
	sender.city = !empty(address.city) ? address.city : "";
	sender.state = !empty(address.stateCode) ? address.stateCode : "";
	sender.postal_code = !empty(address.postalCode) ? address.postalCode.replace(/\s+/g, '') : "";
	sender.country = !empty(address.countryCode) ? address.countryCode.value.toUpperCase() : "";
	sender.company = "";
	sender.name = !empty(address.fullName) ? address.fullName : "";
	sender.phone = !empty(address.phone) ? address.phone : "";
	sender.email = !empty(order.customerEmail) ? order.customerEmail : "";
	
	// If the type is a new outbound shipment, then the recipient is the customer and the sender is the site
	// However, if it's a return, then we are the recipient and the customer is the sender
	if( type == 'outbound' ) {
		req.shipment.recipient = sender;
		req.shipment.sender = recipient;
	} else {
		req.shipment.recipient = recipient;
		req.shipment.sender = sender;
	}
	
	// build packages using current cart
	var productLineItems = order.getAllProductLineItems().iterator();
	
	// If the type of request is a return, then use specific products.
	// If it's an outbound request, use all of the products on the order
	if( type == 'return' ) {
		while (productLineItems.hasNext()) {
			let productLineItem = productLineItems.next();
			let product = productLineItem.product;
			
			// only use the products that the user selected
			
			if(products.hasOwnProperty(product.ID)) {
				let quantity = products[product.ID];
				
				for(i = 0; i < quantity; i++) {
		    	    let package = {
		    	        "weight":!empty(product.custom.dimWeight) ? product.custom.dimWeight : 1,
		    	        "value": 1,
		    	        "length":!empty(product.custom.length) ? product.custom.length : 1,
		    	        "width":!empty(product.custom.dimWidth) ? product.custom.dimWidth : 1,
		    	        "height":!empty(product.custom.dimHeight) ? product.custom.dimHeight : 1
		    	        /*
		        		"carrier_specific": [
		                    {
		                       "product_id": product.ID
		                    }
		                 ]
		                 */
		    	     };
				
		    		packages.push(package);
				}
			}
		}
		req.shipment.packages = packages;
	} else {
		while (productLineItems.hasNext()) {
			let productLineItem = productLineItems.next();
			let product = productLineItem.product;
			let quantity = productLineItem.quantityValue;
			
			for(i = 0; i < quantity; i++) {
		        let package = {
		            "weight":!empty(product.custom.dimWeight) ? product.custom.dimWeight : 1,
		            "value": 1,
		            "length":!empty(product.custom.length) ? product.custom.length : 1,
		            "width":!empty(product.custom.dimWidth) ? product.custom.dimWidth : 1,
		            "height":!empty(product.custom.dimHeight) ? product.custom.dimHeight : 1
		        };
				
		    		packages.push(package);
				}
			
		}
		req.shipment.packages = packages;
	}
	
	let reference = {
		"type":"invoice_number",
		"value": order.orderNo
	};
	references.push(reference);
	
	req.shipment.references = references;
	
	return req;
}

/**
* Cleans up Zenkraft shipping rates response to make it easier to compare with SFCC Shipping Methods.
* Also sets session variable for shipping costs to be used during cart calculation.
*
* @return {HashMap} JSON Object of Sanitized Shipping Method Data
*/
var sanitizeShippingData = function(data, applicableMethods){
	var zendata, cleanMethods, zenkraftCosts;
	
	zendata = data.rates;
	cleanMethods = new HashMap();
	zenkraftCosts = new HashMap();
	
	// Create a new object with all of the Zenkraft carrier data
	zendata.forEach(function(meth,i) {
		let cleanmethod = {};
		cleanmethod.cost = !empty(meth.total_cost) && Site.getCurrent().getCustomPreferenceValue('enableZenkraftShippingRates') ? meth.total_cost : null;
		cleanmethod.deliveryday = !empty(meth.delivery_day) && Site.getCurrent().getCustomPreferenceValue('enableZenkraftShippingEstimatedDay') ? meth.delivery_day : "";
		
		cleanMethods.put(meth.service_type, cleanmethod);
		zenkraftCosts.put(meth.service_type, cleanmethod.cost);
	});
	
	// set the session variable for later use in cart calculation
	if( !zenkraftCosts.isEmpty() ) {
		updateSessionShippingRates(zenkraftCosts);
	} else if( !empty(session.custom.zenkraftCosts) ){
		updateSessionShippingRates();
	}
	
	return cleanMethods;
}


/**
* Get Shipping Data From Zenkraft Web Service
*
* @return {HashMap} JSON Object of Available Shipping Method Data
*/
var getShippingData = function(address, cart, methods){
	var svcConfig : dwsvc.Service = dwsvc.ServiceRegistry.get('http.zenkraft.rate');
	var resp = {}, cleanresp = new HashMap(), req = {};
	
	if( !empty(address.postalCode) ) {
		var reqdata = getShippingRateRequest(address, cart);

		resp = svcConfig.call(JSON.stringify(reqdata));
	
	
		// resp = svcConfig.call(JSON.stringify(mockreq));
		
		if(!empty(resp.object) && !empty(resp.object.rates)) {
			// successful rate response
			cleanresp = sanitizeShippingData(resp.object, methods);
		} else {
			// error returned from zenkfraft service. Reset costs in the session
			if( !empty(session.custom.zenkraftCosts) ) {
				updateSessionShippingRates();
			}
			if( !empty(resp.object) ) {
				Logger.error("Zenkraft Error: Response: " + resp.object.error.message);
			}
		}
		
		Logger.debug("Zenkraft: Get Rates call made with request: " + JSON.stringify(reqdata));
	} else {
		updateSessionShippingRates();
	}
	
	return cleanresp;
}

/**
* Calculate Shipping Cost Using Zenkraft Rates.
* This is used to calculate the cart in calculate.js and replaces the default
* method of calculating shipping cost.
*/
var calculateShippingCost = function calculateShippingCost(basket, shippingCostMap) {
		//apply shipping cost, this needs to be done for all shipping methods to reset the shipping surcharges for each shipping method.
		ShippingMgr.applyShippingCost(basket);

		//re-apply shipping cost for shipping methods with DeckIS rates
		var shipment : Shipment = basket.defaultShipment;
		var shippingMethod : ShippingMethod = shipment.shippingMethod;
		var shippingLineItems : Iterator = shipment.shippingLineItems.iterator();
		// Use actual shipping method id instead of checking for AB "parent" - for AB methods, pricing is determined by Demandware.

		if (shippingMethod != null && shippingCostMap.get(shippingMethod.custom.zenkraftID) != null && shippingCostMap.get(shippingMethod.custom.zenkraftID) != 0) {
			while(shippingLineItems.hasNext()) {
	      		var shippingLineItem : ShippingLineItem = shippingLineItems.next();
				var shippingCost : Money = new Money(shippingCostMap.get(shippingMethod.custom.zenkraftID), Site.current.currencyCode);
				
				var markupType : String = shippingMethod.custom.zenkraftRateMarkupType.value;
				var markup : Number = shippingMethod.custom.zenkraftRateMarkup;
			
				if( !empty(markupType) && !empty(markup) ) {
					if( markupType == 'Amount') {
						var amt : Money = new Money(markup, Site.current.currencyCode);
						shippingCost = shippingCost.add(amt);
					} else if (markupType == 'Percent') {
						shippingCost = shippingCost.addPercent(markup);
					}
				}
				shippingLineItem.setPriceValue(shippingCost.value);
			}
		}
}

/**
* Get Shipping Label From Zenkraft Web Service
*
* @return {HashMap} JSON Object of Available Shipping Method Data
*/
var getShippingLabel = function(order, products, emailaddress){
	var svcConfig : dwsvc.Service = dwsvc.ServiceRegistry.get('http.zenkraft.ship');
	var resp, cleanresp = new HashMap(), req = {};
	
	req = getShippingLabelRequest(order, 'return', products);
	
	resp = svcConfig.call(JSON.stringify(req));
	
	// Send the email if applicable
	if(!empty(emailaddress)) {
		if(!empty(resp.object)) {
			if(empty(resp.object.error)) {
	            Email.get('mail/printlabelemail', emailaddress).setSubject((dw.web.Resource.msg('labelemail.arrived','order',null))).send({
	                LabelURL: resp.object.shipment.packages[0].label
	            });
			}
		}
	}
	
	if(!empty(resp.error) && resp.error == 400) {
		Logger.error("Error creating shipping label with request: " + JSON.stringify(req));
	}
	
	return resp.object;
}

/**
* Create a new shipment using the Zenkraft Web Service
*
* @param {dw.order.Order} order
* @return {HashMap} JSON Object with the shipping information including tracking number and label URL
*/
var createShipment = function(order){
	var svcConfig : dwsvc.Service = dwsvc.ServiceRegistry.get('http.zenkraft.ship');
	var resp, req;
	
	req = getShippingLabelRequest(order, 'outbound');
	
	resp = svcConfig.call(JSON.stringify(req));
	
	if(!empty(resp.object)) {
		if(empty(resp.object.error)) {
			return resp.object;
		} else {
			Logger.error("Error with call to Zenkraft Ship during shipment creation with request: " + req);
			return resp.object;
		}
	} else {
		Logger.error("Error with call to Zenkraft Ship during shipment creation. endpoint with request: " + req);
		return {
			'error': 'Error Creating Zenkraft Shipment'
		}
	}
}

/**
* Get Tracking Information For a Shipment
*
* @param {String} trackingNo
* @return {HashMap} JSON Object with the shipping information including tracking number and label URL
*/
var getTrackingInfo = function(trackingNo){
	var svcConfig : dwsvc.Service = dwsvc.ServiceRegistry.get('http.zenkraft.track');
	var resp, req;
	var prefs = getZenkraftShippingRatePreferences();
	
	req = {
			  "track": {
				    "shipping_account": new dw.util.BigInteger(prefs.SHIP_ACCOUNT).valueOf(),
				    "carrier": "fedex",
				    "tracking_number": "788544597875"
				  }
				};
	
	//resp = svcConfig.call(JSON.stringify(req));
	
	resp = {"object": {
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
	
	if(!empty(resp.object)) {
		if(empty(resp.object.error)) {
			return resp.object;
		} else {
			Logger.error("Error with call to Zenkraft Track with request: " + req);
			return resp.object;
		}
	} else {
		Logger.error("Error with call to Zenkraft Tracking endpoint with request: " + req);
		return {
			'error': 'Error Getting Tracking Information'
		}
	}
}

/* Exports of the module */
///**
//* @see {@link module:cartridge/scripts/models/ZenkraftModel~MyFunction} */
exports.GetShippingData = getShippingData;
exports.GetShippingLabel = getShippingLabel;
exports.CalculateShippingCost = calculateShippingCost;
exports.CreateShipment = createShipment;
exports.GetTrackingInfo = getTrackingInfo;