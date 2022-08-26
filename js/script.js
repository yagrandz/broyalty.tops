class Top {
	constructor(u){
		this.u = u;
		this.season_id = 0;
		this.season_selector = $('#top_season_selector');
		var matches = window.location.search.match(/season=(\d+)/);
		if(matches&&parseInt(matches[1])>0){
			this.season_id = parseInt(matches[1]);
		}
		$.getScript(  this.u.replace('#season_id#', 'seasons_list') )
		  .done(this.onSeasonsLoad.bind(this))
		  .fail(function( jqxhr, settings, exception ) {
			alert('Data load Error');
		});
		$('.chart_init_btn').click(this.onChatInitBtnClick.bind(this));
	}
	
	onSeasonsLoad(){
		this.showSeasonSelector();
	}
	
	onSeasonSelectorChanged(){
		this.season_id = this.season_selector.val();
		$.getScript( this.u.replace('#season_id#', this.season_id) )
		  .done(this.onDataLoad.bind(this))
		  .fail(function( jqxhr, settings, exception ) {
			alert('Data load Error');
		});
	}
	
	onDataLoad(){
		$('.chart_init_btn').show();
		var chart = $('#top_'+$('.chart_init_btn').data('id')+'_chart');
		var chart_clone = chart.clone();
		chart.remove();
		chart_clone.html('');
		chart_clone.hide();
		$('#top_'+$('.chart_init_btn').data('id')+'_chart_container').append(chart_clone);
		this.createTable();
	}
	
	showSeasonSelector(){
		this.season_selector.html('');
		seasons_list.forEach(s=>{
			this.season_selector.append('<option value="'+s+'">'+s+' season</option>');
		});
		if(!seasons_list.indexOf(this.season_id)>-1){
			this.season_id = seasons_list[seasons_list.length-1];
		}
		this.season_selector.val(this.season_id);
		this.season_selector.parent().show();
		this.season_selector.change(this.onSeasonSelectorChanged.bind(this));
		this.season_selector.change();
	}
	
	createTable(){
		if(this.table){
			this.table.destroy();
		}
		this.table = $('#top_table').DataTable( {
			responsive: true,
			data: table_data,
			columns: table_header,
			order: [[ 0, "asc" ]],
			pageLength: 100,
			dom:'ft',
		} );
	}
	
	
	onChatInitBtnClick(e){
		var btn = $(e.currentTarget);
		btn.slideUp();
		$('#top_'+btn.data('id')+'_chart').show();
		this.createChart('top_'+btn.data('id')+'_chart', chart_data[btn.data('id')]);
	}
	
	createChart(id, data){
		var root = am5.Root.new(id);
		root.container.set({
			paddingBottom:0,
			paddingTop:0,
			paddingLeft:0,
			paddingRight:0,
		})
		root.setThemes([
		  am5themes_Animated.new(root)
		]);
		var chart = root.container.children.push(am5xy.XYChart.new(root, {
			layout: root.verticalLayout,
			panX: true,
			panY: false,
			wheelX: "panX",
			wheelY: "zoomX",
			maxTooltipDistance: 0,
			pinchZoomX:true
		}));

		var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
		  baseInterval: {
			timeUnit: "day",
			count: 1
		  },
		  renderer: am5xy.AxisRendererX.new(root, {}),
		  tooltip: am5.Tooltip.new(root, {}),
		  groupData: true,
		  groupCount: $(window).width()>500?500:20,
		}));

		var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
		  renderer: am5xy.AxisRendererY.new(root, {})
		}));
		
		data.forEach(u => {
		  var series = chart.series.push(am5xy.LineSeries.new(root, {
			name: u.name,
			xAxis: xAxis,
			yAxis: yAxis,
			valueYField: "value",
			valueXField: "date",
			legendValueText: "{valueY}",
			tooltip: am5.Tooltip.new(root, {
			  pointerOrientation: "horizontal",
			  labelText: u.name +": {valueY}"
			})
		  }));

		  series.data.setAll(u.data);
		  series.appear();
		});

		var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
		  behavior: "none"
		}));
		cursor.lineY.set("visible", false);


		chart.set("scrollbarX", am5.Scrollbar.new(root, {
		  orientation: "horizontal"
		}));



		var legend = chart.children.push(am5.Legend.new(root, {
			paddingTop: 15,
			centerX: am5.percent(50),
			  x: am5.percent(50),
			  layout: am5.GridLayout.new(root, {
				maxColumns: 6,
				fixedWidthGrid: true
			  }),
			  height: am5.percent(40),
			  width: am5.percent(100),
			  verticalScrollbar: am5.Scrollbar.new(root, {
				orientation: "vertical"
			  })
		}));
		legend.labels.template.setAll({
		  fontSize: 12,
		});

		legend.itemContainers.template.events.on("pointerover", function(e) {
		  var itemContainer = e.target;
		  var series = itemContainer.dataItem.dataContext;

		  chart.series.each(function(chartSeries) {
			if (chartSeries != series) {
			  chartSeries.strokes.template.setAll({
				strokeOpacity: 0.15,
				stroke: am5.color(0x000000)
			  });
			} else {
			  chartSeries.strokes.template.setAll({
				strokeWidth: 3
			  });
			}
		  })
		})

		legend.itemContainers.template.events.on("pointerout", function(e) {
		  var itemContainer = e.target;
		  var series = itemContainer.dataItem.dataContext;

		  chart.series.each(function(chartSeries) {
			chartSeries.strokes.template.setAll({
			  strokeOpacity: 1,
			  strokeWidth: 1,
			  stroke: chartSeries.get("fill")
			});
		  });
		})
		
		legend.data.setAll(chart.series.values);
		chart.appear(1000, 100);
	}
}