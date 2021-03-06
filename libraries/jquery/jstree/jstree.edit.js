/* {[The file is published on the basis of YetiForce Public License that can be found in the following directory: licenses/License.html]} */
/*globals jQuery, define, exports, require, document */
(function (factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define('jstree.edit', ['jquery', 'jstree'], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'), require('jstree'));
	} else {
		factory(jQuery, jQuery.jstree);
	}
}(function ($, jstree, undefined) {
	"use strict";

	if ($.jstree.plugins.edit) {
		return;
	}
	$.jstree.defaults.edit = {
		createClass: ' glyphicon-plus-sign',
		deleteClass: ' glyphicon-remove-circle'
	};
	var _i = document.createElement('I');
	_i.className = 'jstree-edit glyphicon noAction';
	_i.setAttribute('role', 'presentation');
	$.jstree.plugins.edit = function (options, parent) {
		this.bind = function () {
			parent.bind.call(this);
			this.element.on('select_node.jstree', $.proxy(function (obj, data) {
				var modal = $(data.event.currentTarget).closest('#treePopupContainer');
				var module = modal.find('#relatedModule').val();
				if (data.event.target.className.indexOf("jstree-edit") !== -1) {
					var obj = data.node;
					if (obj.original.type == 'category') {
						app.hideModalWindow();
						var callbackFunction = function () {
							$('.showModal[data-module="OutsourcedProducts"]').trigger('click');
							Vtiger_Detail_Js.getInstance().loadWidgets();
						}
						var QuickCreateParams = {
							callbackFunction: callbackFunction,
							data: {
								productname: obj.original.text,
								parent_id: app.getRecordId(),
								pscategory: obj.original.record_id
							},
							noCache: true
						};
						Vtiger_Header_Js.getInstance().quickCreateModule(module, QuickCreateParams);
					} else {
						app.hideModalWindow();
						Vtiger_Helper_Js.showConfirmationBox({message: app.vtranslate('JS_LBL_ARE_YOU_SURE_YOU_WANT_TO_DELETE')}).then(function (e) {
							AppConnector.request({
								module: module,
								action: 'DeleteAjax',
								record: obj.original.record_id
							}).then(function (res) {
								$('.showModal[data-module="OutsourcedProducts"]').trigger('click');
								Vtiger_Detail_Js.getInstance().loadWidgets();
							})
						},
								function () {
									$('.showModal[data-module="OutsourcedProducts"]').trigger('click');
								}
						);
					}
				}
			}, this));
		};
		this.redraw_node = function (obj, deep, is_callback, force_render) {
			obj = parent.redraw_node.apply(this, arguments);
			if (obj) {
				var i, j, tmp = null, icon = null;
				for (i = 0, j = obj.childNodes.length; i < j; i++) {
					if (obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf("jstree-anchor") !== -1) {
						tmp = obj.childNodes[i];
						break;
					}
				}
				if (tmp && this._model.data[obj.id].original.type !== undefined) {
					icon = _i.cloneNode(false);
					if (this._model.data[obj.id].original.type == 'category') {
						icon.className += options.createClass;
					} else {
						icon.className += options.deleteClass;
					}
					tmp.appendChild(icon, tmp.childNodes[0]);
				}
			}
			return obj;
		};
	};
}));
