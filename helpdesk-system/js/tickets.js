$(document).ready(function() {     
    $(document).on('submit','#ticketReply', function(event){
		event.preventDefault();
		$('#reply').attr('disabled','disabled');
		var formData = $(this).serialize();
		$.ajax({
			url:"ticket_action.php",
			method:"POST",
			data:formData,
			success:function(data){				
				$('#ticketReply')[0].reset();
				$('#reply').attr('disabled', false);
				location.reload();
			}
		})
	});		
	$('#createTicket').click(function(){
		$('#ticketModal').modal('show');
		$('#ticketForm')[0].reset();
		$('.modal-title').html("<i class='fa fa-plus'></i> Create Ticket");
		$('#action').val('createTicket');
		$('#save').val('Save Ticket');
	});	
	if($('#listTickets').length) {
		var ticketData = $('#listTickets').DataTable({
			"lengthChange": false,
			"processing":true,
			"serverSide":true,
			"order":[],
			"ajax":{
				url:"ticket_action.php",
				type:"POST",
				data:{action:'listTicket'},
				dataType:"json"
			},
			"columnDefs":[
				{
					"targets":[0, 6, 7, 8, 9],
					"orderable":false,
				},
			],
			"pageLength": 10
		});			
		$(document).on('submit','#ticketForm', function(event){
			event.preventDefault();
			$('#save').attr('disabled','disabled');
			var formData = $(this).serialize();
			$.ajax({
				url:"ticket_action.php",
				method:"POST",
				data:formData,
				success:function(data){				
					$('#ticketForm')[0].reset();
					$('#ticketModal').modal('hide');				
					$('#save').attr('disabled', false);
					ticketData.ajax.reload();
				},
				error:function(error){
					console.log(error);
				}
			})
		});			
		$(document).on('click', '.update', function(){
			var ticketId = $(this).attr("id");
			var action = 'getTicketDetails';
			$.ajax({
				url:'ticket_action.php',
				method:"POST",
				data:{ticketId:ticketId, action:action},
				dataType:"json",
				success:function(data){
					$('#ticketModal').modal('show');
					$('#ticketId').val(data.id);
					$('#subject').val(data.title);
					$('#message').val(data.init_msg);
					if(data.gender == '0') {
						$('#open').prop("checked", true);
					} else if(data.gender == '1') {
						$('#close').prop("checked", true);
					}
					$('.modal-title').html("<i class='fa fa-plus'></i> Edit Ticket");
					$('#action').val('updateTicket');
					$('#save').val('Save Ticket');
				}
			})
		});	
		$(document).on('click', '.sendtech', function(){
			var ticketId = $(this).attr("id");
			var action = 'fetchUsers';
			// var action = 'sendTicketDetails';
			// $.ajax({
			// 	url:'ticket_action.php',
			// 	method:"POST",
			// 	data:{ticketId:ticketId, action:action},
			// 	dataType:"json",
			// 	success:function(data){
			// 		// console.log(data);
			// 		alert("Ticket Sent to Techincal Team");
			// 		location.reload();
			// 	}
			// })
			$.ajax({
				url: 'ticket_action.php',
				method: "POST",
				data: { action: action },
				dataType: "json",
				success: function(response) {
					// Generate checkboxes for users
					console.log(response);
					var checkboxHtml = '';
					response.users.forEach(function(user) {
						checkboxHtml += `<label>
											<input type="checkbox" class="userCheckbox" value="${user.id}"> ${user.name_}
										</label><br>`;
					});

					// Show the SweetAlert with checkboxes
					Swal.fire({
						title: 'Select Techincal Users',
						html: `<form id="userSelectionForm">${checkboxHtml}</form>`,
						showCancelButton: true,
						confirmButtonText: 'Submit',
						preConfirm: () => {
							// Collect selected user IDs
							var selectedUserIds = [];
							$('.userCheckbox:checked').each(function() {
								selectedUserIds.push($(this).val());
							});

							if (selectedUserIds.length === 0) {
								Swal.showValidationMessage('Please select at least one user!');
								return false;
							}

							return selectedUserIds.join(',');
						}
					}).then((result) => {
						if (result.isConfirmed) {
							var userIds = result.value; // Comma-separated user IDs
							
							// Proceed with the main AJAX request
							$.ajax({
								url: 'ticket_action.php',
								method: "POST",
								data: { ticketId: ticketId, action: 'sendTicketDetails', userIds: userIds },
								dataType: "json",
								success: function(data) {
									alert("Ticket sent to Technical Team.")
									location.reload();
								}
							});
						}
					});
				},
				error: function(error){
					console.log(error);
				}
			});
		});		
		$(document).on('click', '.delete', function(){
			var ticketId = $(this).attr("id");		
			var action = "closeTicket";
			if(confirm("Are you sure you want to close this ticket?")) {
				$.ajax({
					url:"ticket_action.php",
					method:"POST",
					data:{ticketId:ticketId, action:action},
					success:function(data) {					
						ticketData.ajax.reload();
					}
				})
			} else {
				return false;
			}
		});	
    }
});

