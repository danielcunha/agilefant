(function($) {
	var backlogChooser = function(container, options) {
		var settings = {
				selectedProducts: [],
				selectedIterations: [],
				selectedProjects: []
		};
		$.extend(settings, options);

		//selected backlogs by type
		this.selectedProducts = settings.selectedProducts;
		this.selectedProjects = settings.selectedProjects;
		this.selectedIterations = settings.selectedIterations;
				
		//parent DOM element
		this.container = container;
		
		//DOM elements for comboboxes
		this.productContainer = null;
		this.projectContainer = null;
		this.iterationContainer = null;
		this.initialize();
	}
	backlogChooser.prototype = {
			initialize: function() {
				var me = this;
				this.productContainer = $('<select name="productIds"/>').appendTo(this.container).attr("multiple","multiple").change(function() {me.clickProduct(me)}).width("200px").height("200px");
				this.projectContainer = $('<select name="projectIds"/>').appendTo(this.container).hide().attr("multiple","multiple").change(function() {me.clickProject(me)}).width("200px").height("200px");
				this.iterationContainer = $('<select name="iterationIds"/>').appendTo(this.container).hide().attr("multiple","multiple").change(function() {me.clickIteration(me)}).width("200px").height("200px");
				

				$.post("getProductJSON.action", {}, function(data,retType) {
					if(data.length == 0) {
						$('<option/>').appendTo(me.productContainer).text("There are no Products in the system.");
					} else {
						$.each(data,function(key,element) {
							var opt = $('<option/>').appendTo(me.productContainer).text(element.name).attr("value",element.id);
							if($.inArray(element.id,me.selectedProducts) != -1) {
								opt.attr("selected","selected");
							}
						});
						if(me.selectedProducts.length != 0) {
							me.clickProduct();
							me.clickProject();
							//TODO: handle iteration selection
						}
					}
				},"json");
			},
			getSelected: function(container) {
				var ret = [];
				container.find("option:selected").each(function() {
					var val = parseInt(this.value);
					if(val > 0) {
						ret.push(val);
					}
				});
				return ret;
			},
			isSelectAll: function(container) {
				return container.find("option[value=-1]").is(":selected");
			},
			selectAll: function(container) {
				container.find("option").not("option[value=-1]").removeAttr("selected");
				if(container == this.projectContainer) this.iterationContainer.hide();
			},
			clickProduct: function() {
				this.projectContainer.empty();
				this.selectedProducts = this.getSelected(this.productContainer);
				this.renderBacklogSelector(this.projectContainer, this.selectedProducts, this.selectedProjects);
			},
			clickProject: function() {
				this.iterationContainer.empty();
				this.selectedProjects = this.getSelected(this.projectContainer);
				if(this.isSelectAll(this.projectContainer)) {
					this.selectAll(this.projectContainer);
					this.iterationContainer.hide();
				} else {
					this.renderBacklogSelector(this.iterationContainer, this.selectedProjects, this.selectedIterations);
				}
			},
			clickIteration: function() {
				this.selectedIterations = this.getSelected(this.iterationContainer);
				if(this.isSelectAll(this.iterationContainer)) {
					this.selectAll(this.iterationContainer);
				}
			},
			renderBacklogSelector: function(container, selectedItems, selectedInContainer) {
				container.empty();
				if(selectedItems.length > 0) {
					var selectAll = $('<option/>').appendTo(container).html("<b>Select all</b>").attr("value",-1);
				}
				var cnt = 0;
				var numSelected = 0;
				var me = this;
				$.each(selectedItems, function() { 
					var data = jsonDataCache.get("subBacklogs", {data: {backlogId: this}}, this);
					$.each(data, function() {
						var opt = $('<option/>').appendTo(container).text(this.name).attr("value",this.id);
						if($.inArray(this.id,selectedInContainer) != -1) {
							opt.attr("selected","selected");
							numSelected++;
						}
					});
					cnt++;
				});
				if(numSelected == 0) {
					selectAll.attr("selected","selected");
				}
				if(cnt == 0) {
					container.empty();
					$('<option/>').appendTo(container).html("No backlogs found").attr("value",-2);
				}
				((selectedItems.length > 0) ? container.show() : container.hide());
			}
	}
	jQuery.fn.extend({
		backlogChooser: function(options) {
			new backlogChooser(this, options);
		}
	});
})(jQuery);