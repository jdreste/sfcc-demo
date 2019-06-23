/**
* This module provides integrations with the Zenkraft API via SFCC Jobs.
*
* @module  modules/zenkraftJobs
*/

'use strict';

var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var Zenkraft = require('~/cartridge/scripts/models/ZenkraftModel');


 /**
 * Creates a shipment via Zenkraft API
 *
 * @return {Object} Object representing the shipping label and tracking ID for the order created
 */
  var createZenkraftShipment = function(){
	var orders;
	
	var orders = OrderMgr.searchOrders('status!={0} AND shippingStatus!={1}', 'creationDate desc', dw.order.Order.ORDER_STATUS_REPLACED, dw.order.Order.SHIPPING_STATUS_SHIPPED);
	if(!empty(orders)) {
		while(orders.hasNext()) {
			let order = orders.next();
			let shipment = order.getDefaultShipment();
			
			// If there is not a tracking number, let's get one from the API
			if(empty(shipment.trackingNumber)) {
				var shipmentdata = Zenkraft.CreateShipment(order);
				
				if(!empty(shipmentdata)) {
					try {
						Transaction.wrap(function(){
								shipment.trackingNumber = shipmentdata.shipment.tracking_number;
								shipment.custom.zenkraftLabelUrl = shipmentdata.shipment.packages[0].label;
								shipment.custom.zenkraftCarrier = shipmentdata.shipment.carrier;
						});
					} catch (e) {
						Logger.error("Error in Create Shipment Job when updating the order with orderNo: " + order.orderNo);
					}
				} else {
					Logger.error("Error creating the shipment in Zenkraft Job with orderNo: " + order.orderNo);
				}
			}	
		}
	} else {
	 	response.setContentType('text/json');
	 	var output = response.getWriter();
	 	
	 	output.print("{error: 'No orders found'}");
	}
  }
  
/* Exports of the controller */

exports.CreateShipment = createZenkraftShipment;