class Top {
	constructor(u){
		$.getScript( u )
		  .done(this.onDataLoad.bind(this))
		  .fail(function( jqxhr, settings, exception ) {
			alert('Data load Error');
		});
	}
	
	onDataLoad(){
		this.createTable();
	}
	
	createTable(){
		$('#top_table').DataTable( {
			responsive: true,
			data: table_data,
			columns: table_header,
			order: [[ 0, "asc" ]],
			pageLength: 100,
			dom:'ft',
		} );
	}
}