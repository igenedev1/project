(function () {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    $('.week-row .weekday-cell').click(function(event){
        if($(event.target).data('issunday') && !$(event.target).data('weekday-hol')) return

        let isWeekend=$(event.target).data('weekend-hol')
        let isHoliday=$(event.target).data('weekday-hol')

        $('<input>').attr({
            type: 'hidden',
            id: 'hiddendate',
            name: 'date',
            'data-weekend-hol':isWeekend,
            'data-weekday-hol':isHoliday,
            value: $(event.target).data('date')
        }).appendTo('#confirm-modal .confirm-dlg-body');
        isWeekend||isHoliday?
        $('#confirm-modal .confirm-dlg-body').append('Are you sure you want to change the date to Workday')
        :
        $('#confirm-modal .confirm-dlg-body').append('Are you sure you want to change the date to Holiday')
        
        $('#confirm-modal').modal('show');
    })
   
    $('#confirmbutton').click(function (event){
        let ele=$('.confirm-dlg-body #hiddendate');
        if (!ele.data('weekend-hol') && !ele.data('weekday-hol')){
            let form_data = new FormData();
            form_data.append("leave_type","WEEKEND");
            form_data.append("date",ele.val());
            form_data.append("name","");
            console.log(...form_data.entries());
            postLeave(form_data, ()=>{
                $('#confirm-modal').modal('hide');
                toastr["success"]("Date was changed successfully.")
                setTimeout(()=>{window.location.reload();},4000)

            }); 
        }else{
            let data={};           
            data["date"]=ele.val();           
            if(ele.data('weekend-hol')||ele.data('weekday-hol')){
                deleteLeave(data, ()=>{
                    $('#confirm-modal').modal('hide');
                    toastr["success"]("Date was changed successfully.")
                    setTimeout(()=>{window.location.reload();},4000)
                }); 
            }
        }
    })
    
    $('#igene_hol_submit').click(function (event){
        event.preventDefault();
        let form_data=new FormData();
        $('#assignform :input').each(function(){
            if(this.value==null||this.value==undefined){
                toastr["error"]("Name and Date cannot be null");
            }
            form_data.append(this.name,this.value)
        })
        postLeave(form_data, ()=>{
            toastr["success"]("Date was changed successfully.")
            setTimeout(()=>{window.location.reload();},4000);
        }            
        );
    })

    $('#confirm-modal').on('shown.bs.modal', function (e) {
        $('#rejectbutton').focus();
    })
    $('#confirm-modal').on('hidden.bs.modal', function (e) {
        $('.confirm-dlg-body .hiddendate').remove();
        $('#confirm-modal .confirm-dlg-body').html('');       
    })

}());