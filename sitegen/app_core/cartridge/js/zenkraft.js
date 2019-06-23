'use strict';

var dialog = require('./dialog'),
	util = require('./util'),
	shipping = require('./pages/checkout/shipping'),
	progress = require('./progress');

/**
 * @private
 * @function
 * @description Binds Zenkraft Events
 */
function initializeEvents() {
	
	/*
	 * Return Labels Events
	 */
	
	$('.zenkraft-checkbox').change(function() {
		var quantityshow = $(this).parents().eq(3).find('.line-item-quantity.display-only');
		var quantitysel = $(this).parents().eq(3).find('.line-item-quantity.selector');
		var quantityselect = quantitysel.find('select');
		var buttons = $('.btn-labelaction');
		var errorlabel = $('.label-error');
		
		var quantity = parseInt(quantityshow.data('quantity'));

		if(this.checked) {
			errorlabel.hide();
			quantityshow.hide();
			quantitysel.show();
			quantityselect.empty();
			
			for(quantity; quantity > 0; quantity--) {
				quantityselect.append($("<option>").attr('value',quantity).text(quantity.toFixed()));
			}
			
			buttons.removeAttr('disabled')
		} else {
			quantityshow.show();
			quantitysel.hide();
		}
	});
	
	$('.btn-printlabel').click(function() {
		progress.show($(this));
		
		var url = $(this).data('url'),
			items = {},
			itemselected = false;
		
		$('.line-item').each(function() {
			var lineitem = $(this);
			if(lineitem.find('.zenkraft-checkbox').prop('checked')) {
				var productid = lineitem.data('itemid').toString();
				items[productid] = lineitem.find('.line-item-quantity.selector select').val();
				itemselected = true;
			}
		});
		
		if( itemselected ) {
			var body = JSON.stringify({
				products: items
			});
			
	        $.ajax({
	        	type: 'POST',
	        	dataType: 'json',
	            url: url,
	            contentType: 'application/json',
	            data: body
	        })
	        .done(function (response) {
	        	progress.hide();
	            if (response.error) {
	                throw new Error('Unable to get label');
	            }
	            window.open(response.shipment.packages[0].label);
	        });
		} else {
			$('.label-error').show();
			progress.hide();
		}
   
	});
	
	$('.btn-emaillabel').click(function() {
		
		var url = $(this).data('url'),
			items = {},
			itemselected = false;
		
		$('.line-item').each(function() {
			var lineitem = $(this);
			if(lineitem.find('.zenkraft-checkbox').prop('checked')) {
				var productid = lineitem.data('itemid').toString();
				items[productid] = lineitem.find('.line-item-quantity.selector select').val();
				itemselected = true;
			}
		});
		
		// If items have been selected, open the dialog. If not, prompt the user to select an item
		if( itemselected ) {
			dialog.open({
			    html: '<h1>Enter Your Email Address</h1><input type="text" id="label_email_address"/><div class="print-label-error" style="display:none;color:red;padding-top:10px"></div><div class="print-label-success" style="display:none;color:green;padding-top:10px">Email successfully sent. Check your inbox for a link to your label.</div>',
				options: {
				    closeOnEscape: true,
					buttons: [{
					    text: "Send Label",
						click: function () {
						   progress.show($(this));
						   $('.print-label-error').hide();
						   
						   // Check for a valid email address
						   var useremail = $('#label_email_address').val();
						   var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
						   var validemail = regex.test(useremail);
						   
						   // We only want to make the ajax call if the email address is valid
					       if(useremail !== "" && validemail) {
					    	
					    	// prepare our request
					   		var body = JSON.stringify({
								products: items,
								emailaddress: useremail
							});
					   		
					   		// Make the ajax call to send the label via email
					           $.ajax({
					               type: 'POST',
					        	   dataType: 'json',
					        	   contentType: 'application/json',
					               url: util.appendParamToURL(url),
					               data: body
					           })
					           .done(function (response) {
					        	   progress.hide();
					               if (response.error) {
					            	   $('.print-label-error').html("There was an error sending your label.").show();
					                   throw new Error('Unable to get label');
					               }
					               $('.print-label-success').show();
					           });
					       } else {
					    	   $('.print-label-error').html("Please enter a valid email address").show();
					    	   progress.hide();
					       }
					    }
					}]
				}
			});
		} else {
			$('.label-error').show();
			progress.hide();
		}
	});
	
	/*
	 * Drop Off Locations Events
	 */
	
	// event fired when address is changed. shows/hides the drop off search based on selected method
	$('.primary-content').on('change','input[name="dwfrm_singleshipping_shippingAddress_shippingMethodID"]',function(){
		var $this = $(this);
		var $dropoffsearch = $('.drop-off-search');
		var $parent = $this.closest('.form-row');
		
		// if the shipping method is a drop-off method, show the form. hide if not
		if($parent.hasClass('drop-off-method')) {
			var $shipaddpostal = $('input[name="dwfrm_singleshipping_shippingAddress_addressFields_postal"]');
			
			// attempt to use postal code from above if one has been entered
			if($shipaddpostal.length > 0) {
				$('input[name="dwfrm_dropoff_search"]').val($shipaddpostal.val());
			}
			
			$dropoffsearch.show();
		} else {
			$dropoffsearch.hide();
		}
	});
	
	// triggered when drop off search is hit. makes ajax call to get drop off locations for query
	$('.primary-content').on('click','.btn-dropoffsearch',function(e){
		e.preventDefault();
		var $this = $(this);
		var $search = $this.prev();
		var url = $this.data('url');
		var strsearch = $search.val();
		
		progress.show($('.drop-off-search'));
		getDropOffLocations(strsearch, url);
	});
	
	// triggered when a search result is selected by the user
	$('.primary-content').on('click', '.drop-off-result', function() {
		var $this = $(this);
		var $info = $('.drop-off-result-info');
		var $container = $('.drop-off-result-container');
		var data = $this.data('json');
		
		// set the display values
		$info.find('.result-name').html(data.name);
		$info.find('.result-hours').html(data.hours.join('<br/>'));
		$info.find('.result-services').html(data.services.join('<br/>'));
		
		// set the full json so we have the full address data to use later
		$container.data('json', data);
		
		// show the location info to the user
		$container.show();
	});
	
	// triggered when the user selects an address by click the DELIVER HERE button. Sets the shipping address.
	$('.primary-content').on('click', '#deliverherebtn', function(e) {
		e.preventDefault();
		var $this = $(this);
		var jsondata = $this.parent().data('json');
		
		// if the json data exists, set the shipping address so
		// the form can be submitted
		if(jsondata !== "") {
			setShippingAddressToDropOff(jsondata);
		}
		
	});
	
}

/* Private Methods */

/*
 * getDropOffLocations
 * This method makes and ajax call to get Drop Off Locations for a given postal code
 * On success, the results and Google Map is displayed
 */
function getDropOffLocations(search, url) {
	
	var body = JSON.stringify({
		postalcode: search
	});
	
	// Make the ajax call to get the locations
    $.ajax({
        type: 'POST',
        dataType: 'html',
 	   contentType: 'application/json',
        url: url,
        data: body
    })
    .done(function (response) {
    	progress.hide();
  	   $('.drop-off-results-container').html(response);

    	var latlng = new google.maps.LatLng('51.540143','-0.116676');
    	var bounds = new google.maps.LatLngBounds();
    	
		var mapOptions = {
				zoom: 15,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
    	var locmap = new google.maps.Map($('.drop-off-map').get(0), mapOptions);
    	
    	var marker1 = new google.maps.Marker({position: {lat: 51.531408, lng: -0.105877}, map: locmap});
    	bounds.extend(marker1.position);
    	var marker2 = new google.maps.Marker({position: {lat: 51.534533, lng: -0.091014}, map: locmap});
    	bounds.extend(marker2.position);
    	var marker3 = new google.maps.Marker({position: {lat: 51.531294, lng: -0.112225}, map: locmap});
    	bounds.extend(marker3.position);
    	var marker4 = new google.maps.Marker({position: {lat: 51.540143, lng: -0.116676}, map: locmap});
    	bounds.extend(marker4.position);
    	var marker5 = new google.maps.Marker({position: {lat: 51.529813, lng: -0.123028}, map: locmap});
    	bounds.extend(marker5.position);
    	
    	locmap.fitBounds(bounds);
   
    });
}

/*
 * setShippingAddressToDropOff
 * This method sets the shipping address on the page to the values selected by
 * the user as a drop-off location. Accepts the address as JSON.
 */
function setShippingAddressToDropOff(locationjson) {
	var _address = locationjson.address;
	var $form = $('.checkout-shipping.address');
	
	// sanitize data for populating shipping form
	var _selected = {
		"address1": _address.street1,
		"postalCode": _address['postal_code'],
		"city": _address.city,
		"stateCode": _address.state,
		"countryCode": _address.country.toLowerCase()
	};
	
	util.fillAddressFields(_selected, $form);
	
}

/* Export Public Methods */
exports.init = function () {
    initializeEvents();
};
