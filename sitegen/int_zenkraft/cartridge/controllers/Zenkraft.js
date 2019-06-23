/**
* This controller provides integrations with the Zenkraft API.
*
* @module  controllers/Zenkraft
*/

'use strict';

var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var OrderMgr = require('dw/order/OrderMgr');
var Zenkraft = require('~/cartridge/scripts/models/ZenkraftModel');

/**
* Gets Shipping Rates from the Zenkraft API
*
* @return {Object} Object representing shipping rates
*/
 var getShippingData = function(){
	 var rates = Zenkraft.GetShippingData();
	 
	// set content to json
	response.setContentType('text/json');
	var output = response.getWriter();
	
	output.print(JSON.stringify(rates));
 }

 
 /**
 * Gets Shipping Label from the Zenkraft API
 *
 * @return {Object} Object representing the shipping label
 */
  var getShippingLabel = function(){
	var parameterMap = request.httpParameterMap,
		order;
	var products = JSON.parse(request.httpParameterMap.getRequestBodyAsString()).products;
	if(!empty(parameterMap.orderID)) {
		order = OrderMgr.getOrder(parameterMap.orderID);
	}
	
	if(!empty(order) && !empty(products)) {
	 	var label = Zenkraft.GetShippingLabel(order, products);
	 	 
	 	// set content to json
	 	response.setContentType('text/json');
	 	var output = response.getWriter();
	 	
	 	output.print(JSON.stringify(label));
	} else {
	 	response.setContentType('text/json');
	 	var output = response.getWriter();
	 	
	 	output.print("{error: 'No order found'}");
	}
  }
  
/**
* Sends a shipping label to a provided email address
*
* @return {Object} Object representing the shipping label
*/
var sendShippingLabel = function(){
  	var parameterMap = request.httpParameterMap,
  		order, email,
  		reqbody = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
  	
  	var products = reqbody.products;
  	var email = reqbody.emailaddress;
  	
  	if(!empty(parameterMap.orderID)) {
  		order = OrderMgr.getOrder(parameterMap.orderID);
  	}
  	
  	if(!empty(order) && !empty(email)) {
  	 	var label = Zenkraft.GetShippingLabel(order, products, email);
  	 	 
  	 	// set content to json
  	 	response.setContentType('text/json');
  	 	var output = response.getWriter();
  	 	
  	 	output.print(JSON.stringify(label));
  	} else {
  	 	response.setContentType('text/json');
  	 	var output = response.getWriter();
  	 	
  	 	output.print("{error: 'No order found'}");
  	}
}

/**
* Displays a page for a single shipment that allows users to
* request a shipping label for a return.
*/
var printLabel = function(){
	var orderForm = app.getForm('zenkraft');
	
	orderForm.handleAction({
        printlabel: function (formGroup, action) {
    		
    	    if (empty(formGroup.orderno.value) || empty(formGroup.orderno.value)) {
    	        app.getView().render('account/orderhistory/orderdetails');
    	        return response;
    	    }
    	    
            var orderuuid = formGroup.orderno.value;
            var shipuuid = formGroup.shipmentno.value;
    	    
    	    var orders = OrderMgr.searchOrders('orderNo={0} AND status!={1}', 'creationDate desc', orderuuid, dw.order.Order.ORDER_STATUS_REPLACED);
    	
    	    if (empty(orders)) {
    	        app.getView().render('account/orderhistory/orderdetails');
    	    }
    	
    	    var Order = orders.next();
    	    var shipment = Order.getShipment(shipuuid);
    	    app.getView({Order: Order, Shipment: shipment}).render('account/orderhistory/printlabel');
        }
    });
}
	
/**
* Displays a Business Manager Page that allows the user to see orders,
* create shipments, and print shipping labels.
*/
var showBMOrderAdmin = function(){
	var orders = OrderMgr.searchOrders('status!={0} AND shippingStatus!={1}', 'creationDate desc', dw.order.Order.ORDER_STATUS_REPLACED, dw.order.Order.SHIPPING_STATUS_SHIPPED);
	app.getView({Orders: orders}).render('bm/bmorderlist');
	
}

/**
* getDropOffLocations
* - gets drop off locations for a given address object. expects a postal code and country code
*/
var getDropOffLocations = function(address){
	
	var postalcode = !empty(address.postalcode) ? address.postalcode : "";
	var countrycode = !empty(address.countrycode) ? address.countrycode : "";
	
	var mockresp = {  
			   "search": [
				   	{	
				   	  "value" : "N1 2XN",
				   	  "country": "GB"
				   	}
				   ],
				   "locations":[  
				      {  
				         "name":"Angel Local",
				         "lat": 51.531408,
				         "lng": -0.105877,
				         "address":"424 St John Street EC1V 4NJ LONDON",
				         "phone":"08442480844",
				         "services": ["Shipment drop off & collection","International & domestic shipping","Account shippers welcome","Packaging available"],
				         "hours": ["Mon - Fri 6:00 AM - 11:59 PM","Sat - Sun 8:00 AM - 11:59 PM"]
				      },
				      {  
				         "name":"Access Self Storage Islington",
				         "lat": 51.534533,
				         "lng": -0.091014,
				         "address":"48/48A Eagle Wharf Road N1 7ED LONDON",
				         "phone":"08442480844",
				         "services": ["Shipment drop off & collection","International & domestic shipping","Account shippers welcome","Packaging available"],
				         "hours": ["Mon - Fri 5:00 AM - 11:59 PM","Sat - Sun 7:00 AM - 11:59 PM"]
				      },
				      {  
				         "name":"Safestore Pentonville Road",
				         "lat": 51.531294,
				         "lng": -0.112225,
				         "address":"79-89 Pentonville Rd N1 9LG LONDON",
				         "phone":"08442480844",
				         "services": ["Shipment drop off & collection","International & domestic shipping","Account shippers welcome","Packaging available"],
				         "hours": ["Mon - Fri 9:00 AM - 11:59 PM","Sat - Sun 9:00 AM - 11:59 PM"]
				      },
				       {  
				         "name":"Crossnet IT Solutions",
				         "lat": 51.540143,
				         "lng": -0.116676,
				         "address":"304 Caledonian Road N1 1BB LONDON",
				         "phone":"08442480844",
				         "services": ["Shipment drop off & collection","International & domestic shipping","Account shippers welcome","Packaging available"],
				         "hours": ["Mon - Fri 6:00 AM - 11:59 PM","Sat - Sun 8:00 AM - 11:59 PM"]
				      },
				            {  
				         "name":"Access Self Storage Kings Cross",
				         "lat": 51.529813,
				         "lng": -0.123028,
				         "address":"Belgrove House, Belgrove Street WC1H 8AA LONDON",
				         "phone":"08442480844",
				         "services": ["Shipment drop off & collection","International & domestic shipping","Account shippers welcome","Packaging available"],
				         "hours": ["Mon - Fri 6:00 AM - 11:59 PM","Sat - Sun 8:00 AM - 11:59 PM"]
				      }
				   ]
				};
		
	app.getView({Locations: mockresp}).render('checkout/shipping/dropoffresults');
	
}

/**
* showTracking
* - Renders a public page for shipment tracking
*/
var showTracking = function() {
	var parameterMap = request.httpParameterMap;
	var trackingNo = '';
	var orderNo = '';
	var trackingData = {};
	var shipments;
	var shipData;
	var carrier;
	
	// return if any parameters are missing in the query string
	if(!(parameterMap.isParameterSubmitted('tracknumber')) || !(parameterMap.isParameterSubmitted('order'))) {
		var output = response.getWriter();
  	 	output.print("Missing Tracking Number");
  	 	return;
	}
	
	// set local vars from query string parameters
	trackingNo = parameterMap.tracknumber || '';
	orderNo = parameterMap.order || '';
	carrier = parameterMap.carrier || '';
	
	// Get the tracking data from the web service
	trackingData = Zenkraft.GetTrackingInfo();
	
	// Get the SFCC shipments details
	if(!empty(orderNo)) {
		shipments = OrderMgr.getOrder(orderNo).getShipments();
		// Get the first shipment in the order
		shipData = shipments[0];
	}
	
	// render the tracking template
	app.getView({TrackingNo: trackingNo, TrackingData: trackingData, ShipData: shipData, OrderNo: orderNo}).render('account/tracking/tracking');
}


/* Exports of the controller */

exports.GetShippingData = guard.ensure(['get'], getShippingData);
exports.GetShippingLabel = guard.ensure(['post'], getShippingLabel);
/** Renders a page with details of a single shipment. Used for printing shipping labels **/
exports.PrintLabel = guard.ensure(['post', 'https'], printLabel);
exports.SendShippingLabel = guard.ensure(['post', 'https'], sendShippingLabel);
exports.OrderAdmin = guard.ensure(['get', 'https'], showBMOrderAdmin);
exports.Track = guard.ensure(['get', 'https'], showTracking);
exports.GetDropOffLocations = guard.ensure(['post', 'https'], getDropOffLocations);
